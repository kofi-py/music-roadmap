const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for secure cookies on Render/proxies
app.set('trust proxy', 1);

/* ==================== DATABASE ==================== */

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: process.env.DB_HOST?.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false
});

pool.query('SELECT NOW()', (err) => {
  if (err) console.error('❌ Database connection error:', err);
  else console.log('✅ Connected to PostgreSQL (Neon)');
});

/* ==================== GLOBAL MIDDLEWARE ==================== */

app.use(express.json());
app.use(cookieParser());
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://music-roadmap.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean).map(url => url.replace(/\/$/, "")); // Remove trailing slashes

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null); // Deny the origin by not sending it back
    }
  },
  credentials: true
}));

app.use(session({
  name: 'music_roadmap_session',
  secret: process.env.SESSION_SECRET || 'musical_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  }
}));

app.use(passport.initialize());
app.use(passport.session());

/* ==================== AUTH HELPERS ==================== */

const setUserInfoCookie = (res, user) => {
  res.cookie('user_info', JSON.stringify({
    id: user.id,
    username: user.username,
    email: user.email,
    profilePicture: user.profile_picture
  }), {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    httpOnly: false, // Must be accessible for client UI logic
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
};

/* ==================== PASSPORT CONFIG ==================== */

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query(
      'SELECT id, email, username, profile_picture FROM users WHERE id = $1',
      [id]
    );
    done(null, result.rows[0]);
  } catch (err) {
    done(err);
  }
});

// Local Strategy
passport.use(new LocalStrategy({
    usernameField: 'identifier',
    passwordField: 'password'
  },
  async (identifier, password, done) => {
    try {
      // Check for both email or username
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1 OR username = $2', 
        [identifier, identifier]
      );
      
      if (result.rows.length === 0) {
        return done(null, false, { message: 'Incorrect username/email or password.' });
      }
      
      const user = result.rows[0];
      if (!user.password_hash) {
        return done(null, false, { 
          message: 'Account exists but lacks a password (former Social account). Please Sign Up with this email/username to set a password.' 
        });
      }
      
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect username/email or password.' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

/* ==================== AUTH ROUTES ==================== */

// Signup
app.post('/auth/signup', async (req, res) => {
  const { email, username, password } = req.body;
  if (!email || !username || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const checkEmail = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (checkEmail.rows.length > 0) {
      const existingUser = checkEmail.rows[0];
      
      // If the user exists but has no password (former social login), allow them to "signup" by setting one
      if (!existingUser.password_hash) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        
        const updated = await pool.query(
          'UPDATE users SET password_hash = $1, username = $2 WHERE id = $3 RETURNING id, email, username',
          [passwordHash, username, existingUser.id]
        );
        
        const user = updated.rows[0];
        return req.login(user, (err) => {
          if (err) return res.status(500).json({ error: 'Error logging in after conversion.' });
          setUserInfoCookie(res, user);
          return res.json({ success: true, user, message: 'Account converted to password login.' });
        });
      }
      
      return res.status(400).json({ error: 'Email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      'INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id, email, username',
      [email, username, passwordHash]
    );

    const user = result.rows[0];
    req.login(user, (err) => {
      if (err) return res.status(500).json({ error: 'Error logging in after signup.' });
      setUserInfoCookie(res, user);
      return res.json({ success: true, user });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error during signup.' });
  }
});

// Login (Local)
app.post('/auth/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info.message || 'Login failed.' });
    
    req.logIn(user, (err) => {
      if (err) return next(err);
      setUserInfoCookie(res, user);
      return res.json({ success: true, user: { id: user.id, username: user.username, email: user.email } });
    });
  })(req, res, next);
});

// Me
app.get('/auth/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ authenticated: true, user: req.user });
  } else {
    res.json({ authenticated: false });
  }
});

// Logout
app.post('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed.' });
    res.clearCookie('music_roadmap_session');
    res.clearCookie('user_info');
    res.json({ success: true });
  });
});

/* ==================== CONTACT API ==================== */

app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `[Music Roadmap Contact] ${subject || 'New Message'}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #6d28d9;">New Contact Message from Music Roadmap</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject || 'No Subject'}</p>
          <hr />
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

/* ==================== FORUM API ==================== */

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get posts (with filtering)
app.get('/api/forum/posts', async (req, res) => {
  const { category, page = 1 } = req.query;
  const limit = 20;
  const offset = (page - 1) * limit;
  
  try {
    let query = `
      SELECT p.*, c.name as category_name, c.icon as category_icon, u.username as author, u.profile_picture as author_picture,
      (SELECT COUNT(*) FROM forum_replies r WHERE r.post_id = p.id) as reply_count
      FROM forum_posts p
      JOIN categories c ON p.category_id = c.id
      JOIN users u ON p.user_id = u.id
    `;
    const params = [];

    if (category && category !== 'all') {
      query += ` WHERE c.name = $1`;
      params.push(category);
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Create post
app.post('/api/forum/posts', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Auth required' });
  const { title, content, categoryId } = req.body;
  
  try {
    const result = await pool.query(
      'INSERT INTO forum_posts (user_id, category_id, title, content) VALUES ($1, $2, $3, $4) RETURNING id',
      [req.user.id, categoryId, title, content]
    );
    res.json({ success: true, postId: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Get post detail with replies
app.get('/api/forum/posts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Increment views
    await pool.query('UPDATE forum_posts SET views = views + 1 WHERE id = $1', [id]);
    
    // Get post
    const postResult = await pool.query(`
      SELECT p.*, c.name as category_name, c.icon as category_icon, u.username as author, u.profile_picture as author_picture
      FROM forum_posts p
      JOIN categories c ON p.category_id = c.id
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1
    `, [id]);

    if (postResult.rows.length === 0) return res.status(404).json({ error: 'Post not found' });

    // Get replies
    const repliesResult = await pool.query(`
      SELECT r.*, u.username as author, u.profile_picture as author_picture,
      EXISTS(SELECT 1 FROM helpful_marks h WHERE h.reply_id = r.id AND h.user_id = $2) as marked_helpful_by_user
      FROM forum_replies r
      JOIN users u ON r.user_id = u.id
      WHERE r.post_id = $1
      ORDER BY r.created_at ASC
    `, [id, req.user?.id || -1]);

    res.json({ post: postResult.rows[0], replies: repliesResult.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Add reply
app.post('/api/forum/posts/:id/replies', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Auth required' });
  const { id } = req.params;
  const { content } = req.body;
  
  try {
    await pool.query(
      'INSERT INTO forum_replies (post_id, user_id, content) VALUES ($1, $2, $3)',
      [id, req.user.id, content]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to post reply' });
  }
});

// Mark helpful
app.post('/api/forum/replies/:id/helpful', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Auth required' });
  const { id } = req.params;
  
  try {
    const checkResult = await pool.query(
      'SELECT * FROM helpful_marks WHERE reply_id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (checkResult.rows.length > 0) {
      await pool.query('DELETE FROM helpful_marks WHERE id = $1', [checkResult.rows[0].id]);
      await pool.query('UPDATE forum_replies SET helpful_count = helpful_count - 1 WHERE id = $1', [id]);
    } else {
      await pool.query('INSERT INTO helpful_marks (reply_id, user_id) VALUES ($1, $2)', [id, req.user.id]);
      await pool.query('UPDATE forum_replies SET helpful_count = helpful_count + 1 WHERE id = $1', [id]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle helpful' });
  }
});

/* ==================== PROGRESS API ==================== */

app.get('/api/progress', async (req, res) => {
  if (!req.isAuthenticated()) return res.json([]);
  try {
    const result = await pool.query('SELECT course_id, completed FROM user_progress WHERE user_id = $1', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

app.post('/api/progress', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Auth required' });
  const { courseId, completed } = req.body;
  
  try {
    await pool.query(
      `INSERT INTO user_progress (user_id, course_id, completed, completed_at) 
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, course_id) 
       DO UPDATE SET completed = $3, completed_at = $4`,
      [req.user.id, courseId, completed, completed ? new Date() : null]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

/* ==================== HEALTH ==================== */

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    authenticated: req.isAuthenticated(),
    user: req.user ? { id: req.user.id, email: req.user.email } : null,
    timestamp: new Date().toISOString()
  });
});

/* ==================== START SERVER ==================== */

app.listen(PORT, () => {
  console.log(`🎵 Music Roadmap API running on port ${PORT}`);
});
