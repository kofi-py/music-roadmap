# 🎵 Music Roadmap - Complete Learning Platform

A comprehensive music education platform with Next.js, Tailwind CSS, JavaScript, Google OAuth, Express.js, and PostgreSQL.

## 🎨 Features

- **85 Free Music Courses** from kindergarten through college
- **Google OAuth Login** - Sign in with Google
- **Guest Mode** - Browse all courses without account (no progress saved)
- **Progress Tracking** - Only for authenticated users
- **Forum with Database** - Ask questions, get help
- **Beautiful Musical Design** - Purple, gold, pink, indigo theme
- **HTTP-Only Cookies** - Secure session management

## 🎹 Musical Color Palette

- **Royal Purple** (#6B21A8) - Musical sophistication
- **Music Gold** (#F59E0B) - Brass instruments, warmth
- **Passion Pink** (#EC4899) - Emotion in music
- **Melody Indigo** (#4F46E5) - Deep expression
- **Warm Cream** (#FFF9F0) - Background warmth

## 📁 Project Structure

```
music-roadmap/
├── backend/              # Express.js + PostgreSQL + Google OAuth
│   ├── server.js        # Main API with Passport.js
│   ├── schema.sql       # Database schema
│   ├── package.json
│   └── .env.example
├── frontend/            # Next.js 14 + Tailwind (JavaScript)
│   ├── src/
│   │   ├── app/        # Pages
│   │   ├── components/ # React components
│   │   ├── lib/        # Utilities
│   │   └── data/       # 85 courses data
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Google Cloud Console account (for OAuth)

### 1. Get Google OAuth Credentials

1. Go to https://console.cloud.google.com/
2. Create new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Add authorized JavaScript origins:
   - `http://localhost:3000`
6. Add authorized redirect URIs:
   - `http://localhost:5000/auth/google/callback`
7. Copy **Client ID** and **Client Secret**

### 2. Backend Setup

```bash
# Create database
createdb music_roadmap

# Navigate to backend
cd backend
npm install

# Setup environment
cp .env.example .env
# Edit .env with your credentials:
# - PostgreSQL password
# - Google Client ID
# - Google Client Secret

# Initialize database
npm run init-db

# Start server
npm run dev
```

Backend runs on **http://localhost:5000**

### 3. Frontend Setup

```bash
# Navigate to frontend
cd frontend
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local

# Start Next.js
npm run dev
```

Frontend runs on **http://localhost:3000**

## 🎯 How It Works

### Guest Users (Not Logged In)
✅ Can view all 85 courses
✅ Can browse forum posts
✅ Can take diagnostic test
❌ **Cannot save progress**
❌ Cannot create forum posts
❌ Cannot mark courses complete

### Authenticated Users (Google Login)
✅ Everything guests can do
✅ **Progress saved to database**
✅ Create forum posts and replies
✅ Mark courses as complete
✅ Track learning journey

## 🔐 Google OAuth Flow

1. User clicks "Sign in with Google"
2. Redirected to Google login page
3. User authorizes app
4. Google redirects back to `/auth/google/callback`
5. Server creates/updates user in database
6. Session cookie set (HTTP-only)
7. User cookie set (readable by frontend)
8. Redirected to homepage (logged in)

## 🗄️ Database Tables

- `users` - User accounts (Google OAuth)
- `forum_posts` - Forum discussions
- `forum_replies` - Replies to posts
- `categories` - Forum categories
- `user_progress` - Course completion (auth only)
- `helpful_marks` - Helpful reply votes

## 🎵 Music Courses Included

**K-2:** Music basics, rhythm, singing (9 courses)
**3-5:** Elementary instruments, reading notes (12 courses)
**6-8:** Music theory, composition basics (12 courses)
**9-12:** Advanced theory, multiple instruments (18 courses)
**College:** Music history, composition, production (34 courses)

**Free Resources Used:**
- musictheory.net
- Khan Academy Music
- teoria.com
- IMSLP (sheet music)
- Coursera/edX (audit mode)
- Open Music Theory
- Berklee Online free courses
- YouTube educators

## 🔧 API Endpoints

**Auth:**
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - OAuth callback
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user

**Forum:**
- `GET /api/forum/posts` - Get posts (guests OK)
- `GET /api/forum/posts/:id` - Get single post (guests OK)
- `POST /api/forum/posts` - Create post (auth required)
- `POST /api/forum/posts/:id/replies` - Create reply (auth required)

**Progress:**
- `GET /api/progress` - Get user progress (auth required)
- `POST /api/progress` - Update progress (auth required)

## 🎨 Frontend Pages

1. **Homepage** - Hero, stats, how it works, testimonials
2. **Curriculum** - All 85 courses with search, progress for auth users
3. **Login** - Google OAuth button
4. **Forum** - Community discussions
5. **Diagnostic** - Find your level

## 💡 Development Tips

**Testing Google OAuth locally:**
- Use `http://localhost` URLs (not `127.0.0.1`)
- Cookies require exact domain match
- Check browser doesn't block third-party cookies

**Database migrations:**
```bash
# Reset database
dropdb music_roadmap
createdb music_roadmap
npm run init-db
```

**View session cookies:**
- Open DevTools (F12)
- Application → Cookies
- Should see `music_roadmap_session` (HTTP-only)
- Should see `user_info` (readable)

## 🚀 Production Deployment

**Backend (Heroku/Railway):**
1. Set environment variables (Google OAuth, DB, etc.)
2. Use production database URL
3. Set `NODE_ENV=production`
4. Update Google OAuth redirect URLs

**Frontend (Vercel):**
1. Set `NEXT_PUBLIC_API_URL` to production backend
2. Deploy via Vercel CLI or GitHub integration

**Important:** Update Google Console with production URLs!

## 🔒 Security Features

✅ HTTP-only session cookies (XSS protection)
✅ SameSite cookies (CSRF protection)
✅ Google OAuth (no password management)
✅ Passport.js (battle-tested auth)
✅ SQL injection prevention (parameterized queries)
✅ CORS configured for specific origins

## 📚 Learn More

- [Google OAuth Setup Guide](https://developers.google.com/identity/protocols/oauth2)
- [Passport.js Documentation](http://www.passportjs.org/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🤝 Contributing

Contributions welcome! Please:
1. Fork repository
2. Create feature branch
3. Commit changes
4. Open Pull Request

## 📄 License

MIT License

---

**Made with 🎵 for music lovers everywhere**
