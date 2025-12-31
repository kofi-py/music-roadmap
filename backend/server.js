const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

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

pool.query('SELECT NOW()', err => {
  if (err) console.error('❌ DB error:', err);
  else console.log('✅ Database connected');
});

/* ==================== GLOBAL MIDDLEWARE ==================== */

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: [
    'http://localhost:3001',
    'http://localhost:5173',
    'https://music-roadmap.vercel.app'
  ],
  credentials: true
}));

app.use(session({
  name: 'music_roadmap_session',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,        // REQUIRED for Render (HTTPS)
    sameSite: 'none'     // REQUIRED for cross-site OAuth
  }
}));

app.use(passport.initialize());
app.use(passport.session());

/* ==================== PASSPORT SETUP ==================== */

passport.serializeUser((user, done) => done(null, user.id));

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

/* ==================== AUTH ROUTES ==================== */

/* SIGN UP */
app.post('/auth/signup', async (req, res) => {
  const { email, username, password } = req.body;
  if (!email || !username || !password)
    return res.status(400).json({ error: 'Missing fields' });

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const result = await pool.query(
      `INSERT INTO users (email, username, password_hash)
       VALUES ($1,$2,$3) RETURNING id,email,username`,
      [email, username, passwordHash]
    );

    const token = createToken(result.rows[0]);

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ success: true, user: result.rows[0] });
  } catch {
    res.status(409).json({ error: 'User already exists' });
  }
});

/* LOGIN */
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query(
    'SELECT * FROM users WHERE email=$1',
    [email]
  );

  if (!result.rows.length)
    return res.status(401).json({ error: 'Invalid credentials' });

  const user = result.rows[0];
  const match = await bcrypt.compare(password, user.password_hash);

  if (!match)
    return res.status(401).json({ error: 'Invalid credentials' });

  const token = createToken(user);

  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.json({
    success: true,
    user: { id: user.id, email: user.email, username: user.username }
  });
});

/* LOGOUT */
app.post('/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

/* CURRENT USER */
app.get('/auth/me', authMiddleware, (req, res) => {
  res.json({ authenticated: true, user: req.user });
});

/* ==================== HEALTH ==================== */

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    authenticated: !!req.user,
    timestamp: new Date().toISOString()
  });
});

/* ==================== SERVER ==================== */

app.listen(PORT, () => {
  console.log(`🎵 Music Roadmap API running on port ${PORT}`);
});
