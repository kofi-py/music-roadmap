const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
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

/* ==================== GOOGLE OAUTH ==================== */

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (_, __, profile, done) => {
  try {
    let result = await pool.query(
      'SELECT * FROM users WHERE google_id = $1',
      [profile.id]
    );

    let user;
    if (!result.rows.length) {
      user = (await pool.query(
        `INSERT INTO users (google_id, email, username, profile_picture, last_login)
         VALUES ($1,$2,$3,$4,NOW()) RETURNING *`,
        [
          profile.id,
          profile.emails[0].value,
          profile.displayName,
          profile.photos[0]?.value
        ]
      )).rows[0];
    } else {
      user = result.rows[0];
      await pool.query(
        'UPDATE users SET last_login = NOW() WHERE id = $1',
        [user.id]
      );
    }

    done(null, user);
  } catch (err) {
    done(err);
  }
}));

/* ==================== MICROSOFT OAUTH ==================== */

passport.use(new MicrosoftStrategy({
  clientID: process.env.MICROSOFT_CLIENT_ID,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  callbackURL: process.env.MICROSOFT_CALLBACK_URL,
  scope: ['user.read']
}, async (_, __, profile, done) => {
  try {
    let result = await pool.query(
      'SELECT * FROM users WHERE microsoft_id = $1',
      [profile.id]
    );

    let user;
    if (!result.rows.length) {
      user = (await pool.query(
        `INSERT INTO users (microsoft_id, email, username, last_login)
         VALUES ($1,$2,$3,NOW()) RETURNING *`,
        [profile.id, profile.emails[0].value, profile.displayName]
      )).rows[0];
    } else {
      user = result.rows[0];
      await pool.query(
        'UPDATE users SET last_login = NOW() WHERE id = $1',
        [user.id]
      );
    }

    done(null, user);
  } catch (err) {
    done(err);
  }
}));

/* ==================== AUTH ROUTES ==================== */

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: true
  }),
  (req, res) => {
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:3001');
  }
);

app.get('/auth/microsoft',
  passport.authenticate('microsoft')
);

app.get(
  '/auth/microsoft/callback',
  passport.authenticate('microsoft', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:3001');
  }
);

app.post('/auth/logout', (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie('music_roadmap_session');
      res.json({ success: true });
    });
  });
});

app.get('/auth/me', (req, res) => {
  res.json({
    authenticated: !!req.user,
    user: req.user || null
  });
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
