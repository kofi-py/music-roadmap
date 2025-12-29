const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'music_roadmap',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
  ssl: process.env.DB_HOST && process.env.DB_HOST.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration
app.use(session({
  name: 'music_roadmap_session',
  secret: process.env.SESSION_SECRET || 'music-is-life-change-this-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: 'lax'
  }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// ==================== GOOGLE OAUTH SETUP ====================

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/auth/google/callback'
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists
      let userResult = await pool.query(
        'SELECT * FROM users WHERE google_id = $1',
        [profile.id]
      );

      let user;
      if (userResult.rows.length === 0) {
        // Create new user
        const newUserResult = await pool.query(
          `INSERT INTO users (google_id, email, username, profile_picture, last_login)
           VALUES ($1, $2, $3, $4, NOW())
           RETURNING *`,
          [
            profile.id,
            profile.emails[0].value,
            profile.displayName || 'Music Enthusiast',
            profile.photos[0]?.value || null
          ]
        );
        user = newUserResult.rows[0];
        console.log('Created new user:', user.email);
      } else {
        // Update last login
        user = userResult.rows[0];
        await pool.query(
          'UPDATE users SET last_login = NOW() WHERE id = $1',
          [user.id]
        );
        console.log('User logged in:', user.email);
      }

      return done(null, user);
    } catch (error) {
      console.error('OAuth error:', error);
      return done(error, null);
    }
  }
));

// ==================== MICROSOFT OAUTH SETUP ====================

passport.use(new MicrosoftStrategy({
  clientID: process.env.MICROSOFT_CLIENT_ID,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  callbackURL: process.env.MICROSOFT_CALLBACK_URL || 'http://localhost:5000/auth/microsoft/callback',
  scope: ['user.read']
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists by Microsoft ID
      let userResult = await pool.query(
        'SELECT * FROM users WHERE microsoft_id = $1',
        [profile.id]
      );

      let user;
      if (userResult.rows.length === 0) {
        // Check if email already exists (user might have signed up with Google)
        const emailCheck = await pool.query(
          'SELECT * FROM users WHERE email = $1',
          [profile.emails[0].value]
        );

        if (emailCheck.rows.length > 0) {
          // Link Microsoft account to existing user
          user = await pool.query(
            'UPDATE users SET microsoft_id = $1, last_login = NOW() WHERE email = $2 RETURNING *',
            [profile.id, profile.emails[0].value]
          );
          user = user.rows[0];
          console.log('Linked Microsoft account to existing user:', user.email);
        } else {
          // Create new user
          const newUserResult = await pool.query(
            `INSERT INTO users (microsoft_id, email, username, profile_picture, last_login)
             VALUES ($1, $2, $3, $4, NOW())
             RETURNING *`,
            [
              profile.id,
              profile.emails[0].value,
              profile.displayName || 'Music Enthusiast',
              null // Microsoft doesn't provide profile picture in basic scope
            ]
          );
          user = newUserResult.rows[0];
          console.log('Created new user via Microsoft:', user.email);
        }
      } else {
        // Update last login
        user = userResult.rows[0];
        await pool.query(
          'UPDATE users SET last_login = NOW() WHERE id = $1',
          [user.id]
        );
        console.log('User logged in via Microsoft:', user.email);
      }

      return done(null, user);
    } catch (error) {
      console.error('Microsoft OAuth error:', error);
      return done(error, null);
    }
  }
));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query(
      'SELECT id, google_id, email, username, profile_picture FROM users WHERE id = $1',
      [id]
    );
    done(null, result.rows[0]);
  } catch (error) {
    done(error, null);
  }
});

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - User: ${req.user?.email || 'guest'}`);
  next();
});

// ==================== AUTH ROUTES ====================

// Initiate Google OAuth
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Set user info cookie (non-httpOnly for frontend access)
    res.cookie('user_info', JSON.stringify({
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      profilePicture: req.user.profile_picture
    }), {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: false,
      sameSite: 'lax'
    });

    // Redirect to frontend
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
  }
);

// Initiate Microsoft OAuth
app.get('/auth/microsoft',
  passport.authenticate('microsoft', { scope: ['user.read'] })
);

// Microsoft OAuth callback
app.get('/auth/microsoft/callback',
  passport.authenticate('microsoft', { failureRedirect: '/login' }),
  (req, res) => {
    // Set user info cookie (non-httpOnly for frontend access)
    res.cookie('user_info', JSON.stringify({
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      profilePicture: req.user.profile_picture
    }), {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: false,
      sameSite: 'lax'
    });

    // Redirect to frontend
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
  }
);

// Logout
app.post('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Session destroy failed' });
      }
      res.clearCookie('music_roadmap_session');
      res.clearCookie('user_info');
      res.json({ success: true, message: 'Logged out successfully' });
    });
  });
});

// Get current user
app.get('/auth/me', (req, res) => {
  if (req.user) {
    res.json({
      authenticated: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        profilePicture: req.user.profile_picture
      }
    });
  } else {
    res.json({ authenticated: false, user: null });
  }
});

// ==================== MIDDLEWARE ====================

// Require authentication for certain routes
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Optional auth (allows guests)
const optionalAuth = (req, res, next) => {
  // Just continue, req.user will be null for guests
  next();
};

// ==================== FORUM ROUTES ====================

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get all forum posts (guests can view)
app.get('/api/forum/posts', optionalAuth, async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        fp.id, fp.title, fp.content, fp.views, fp.created_at, fp.updated_at,
        u.username as author, u.id as author_id, u.profile_picture as author_picture,
        c.name as category_name, c.icon as category_icon,
        COUNT(DISTINCT fr.id) as reply_count
      FROM forum_posts fp
      LEFT JOIN users u ON fp.user_id = u.id
      LEFT JOIN categories c ON fp.category_id = c.id
      LEFT JOIN forum_replies fr ON fp.id = fr.post_id
    `;

    const params = [];
    if (category && category !== 'all') {
      query += ' WHERE c.name = $1';
      params.push(category);
    }

    query += ' GROUP BY fp.id, u.username, u.id, u.profile_picture, c.name, c.icon';
    query += ' ORDER BY fp.created_at DESC';
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM forum_posts fp';
    const countParams = [];
    if (category && category !== 'all') {
      countQuery += ' LEFT JOIN categories c ON fp.category_id = c.id WHERE c.name = $1';
      countParams.push(category);
    }
    const countResult = await pool.query(countQuery, countParams);

    res.json({
      posts: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get single post (guests can view)
app.get('/api/forum/posts/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Increment view count
    await pool.query('UPDATE forum_posts SET views = views + 1 WHERE id = $1', [id]);

    // Get post
    const postResult = await pool.query(
      `SELECT 
        fp.id, fp.title, fp.content, fp.views, fp.created_at, fp.updated_at,
        u.username as author, u.id as author_id, u.profile_picture as author_picture,
        c.name as category_name, c.icon as category_icon
      FROM forum_posts fp
      LEFT JOIN users u ON fp.user_id = u.id
      LEFT JOIN categories c ON fp.category_id = c.id
      WHERE fp.id = $1`,
      [id]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Get replies
    const repliesResult = await pool.query(
      `SELECT 
        fr.id, fr.content, fr.helpful_count, fr.created_at,
        u.username as author, u.id as author_id, u.profile_picture as author_picture,
        CASE WHEN hm.id IS NOT NULL THEN true ELSE false END as marked_helpful_by_user
      FROM forum_replies fr
      LEFT JOIN users u ON fr.user_id = u.id
      LEFT JOIN helpful_marks hm ON fr.id = hm.reply_id AND hm.user_id = $2
      WHERE fr.post_id = $1
      ORDER BY fr.created_at ASC`,
      [id, req.user?.id || null]
    );

    res.json({
      post: postResult.rows[0],
      replies: repliesResult.rows
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Create post (requires auth)
app.post('/api/forum/posts', requireAuth, async (req, res) => {
  try {
    const { title, content, categoryId } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content required' });
    }

    const result = await pool.query(
      `INSERT INTO forum_posts (user_id, category_id, title, content)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [req.user.id, categoryId, title, content]
    );

    res.status(201).json({
      success: true,
      postId: result.rows[0].id,
      message: 'Post created successfully'
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Create reply (requires auth)
app.post('/api/forum/posts/:id/replies', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content required' });
    }

    const result = await pool.query(
      `INSERT INTO forum_replies (post_id, user_id, content)
       VALUES ($1, $2, $3) RETURNING id`,
      [id, req.user.id, content]
    );

    res.status(201).json({
      success: true,
      replyId: result.rows[0].id,
      message: 'Reply created successfully'
    });
  } catch (error) {
    console.error('Error creating reply:', error);
    res.status(500).json({ error: 'Failed to create reply' });
  }
});

// Mark helpful (requires auth)
app.post('/api/forum/replies/:id/helpful', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existingMark = await pool.query(
      'SELECT id FROM helpful_marks WHERE reply_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingMark.rows.length > 0) {
      await pool.query(
        'DELETE FROM helpful_marks WHERE reply_id = $1 AND user_id = $2',
        [id, userId]
      );
      await pool.query(
        'UPDATE forum_replies SET helpful_count = helpful_count - 1 WHERE id = $1',
        [id]
      );
      res.json({ success: true, action: 'removed' });
    } else {
      await pool.query(
        'INSERT INTO helpful_marks (reply_id, user_id) VALUES ($1, $2)',
        [id, userId]
      );
      await pool.query(
        'UPDATE forum_replies SET helpful_count = helpful_count + 1 WHERE id = $1',
        [id]
      );
      res.json({ success: true, action: 'added' });
    }
  } catch (error) {
    console.error('Error marking helpful:', error);
    res.status(500).json({ error: 'Failed to mark helpful' });
  }
});

// ==================== PROGRESS ROUTES (AUTH REQUIRED) ====================

// Get progress (requires auth)
app.get('/api/progress', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT course_id, completed, completed_at FROM user_progress WHERE user_id = $1',
      [req.user.id]
    );
    res.json({ progress: result.rows });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Update progress (requires auth)
app.post('/api/progress', requireAuth, async (req, res) => {
  try {
    const { courseId, completed } = req.body;

    if (!courseId) {
      return res.status(400).json({ error: 'courseId required' });
    }

    await pool.query(
      `INSERT INTO user_progress (user_id, course_id, completed, completed_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, course_id)
       DO UPDATE SET completed = $3, completed_at = $4`,
      [req.user.id, courseId, completed, completed ? new Date() : null]
    );

    res.json({ success: true, message: 'Progress updated' });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// ==================== CONTACT ROUTE ====================

// Contact form submission
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'pastorkofi101@gmail.com',
      subject: `Music Roadmap Contact: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6B21A8;">New Contact Form Submission</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          <div style="background-color: #fff; padding: 20px; border-left: 4px solid #6B21A8;">
            <h3 style="color: #6B21A8; margin-top: 0;">Message:</h3>
            <p style="line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
          </div>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">
            This message was sent from the Music Roadmap contact form.<br>
            Reply directly to this email to respond to ${name}.
          </p>
        </div>
      `,
      replyTo: email
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Message sent successfully! We\'ll get back to you soon.'
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      error: 'Failed to send message. Please try again later.'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    authenticated: !!req.user,
    googleOAuth: !!process.env.GOOGLE_CLIENT_ID
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎵 Music Roadmap API running on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log(`Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? '✓ Configured' : '✗ Not configured'}`);
});

module.exports = app;
