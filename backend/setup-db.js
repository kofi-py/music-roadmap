const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
    ssl: process.env.DB_HOST && process.env.DB_HOST.includes('neon.tech')
        ? { rejectUnauthorized: false }
        : false
});

const setupDatabase = async () => {
    try {
        console.log('🔧 Setting up database...');

        // Create users table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        google_id VARCHAR(255) UNIQUE,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(255) NOT NULL,
        profile_picture TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log('✓ Users table created');

        // Create categories table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        icon VARCHAR(50),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log('✓ Categories table created');

        // Create forum_posts table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS forum_posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        title VARCHAR(500) NOT NULL,
        content TEXT NOT NULL,
        views INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log('✓ Forum posts table created');

        // Create forum_replies table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS forum_replies (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES forum_posts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        helpful_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log('✓ Forum replies table created');

        // Create user_progress table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        course_id INTEGER NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, course_id)
      )
    `);
        console.log('✓ User progress table created');

        // Create helpful_marks table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS helpful_marks (
        id SERIAL PRIMARY KEY,
        reply_id INTEGER REFERENCES forum_replies(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(reply_id, user_id)
      )
    `);
        console.log('✓ Helpful marks table created');

        // Insert default categories
        await pool.query(`
      INSERT INTO categories (name, icon, description) VALUES
      ('theory help', '🎼', 'Get help with music theory concepts'),
      ('instrument advice', '🎸', 'Discuss instruments and practice techniques'),
      ('composition', '✍️', 'Share and discuss compositions'),
      ('ear training', '👂', 'Tips for developing your musical ear'),
      ('performance', '🎭', 'Performance tips and stage presence'),
      ('gear & tech', '🎛️', 'Music production and equipment discussion'),
      ('success stories', '🌟', 'Share your musical achievements')
      ON CONFLICT DO NOTHING
    `);
        console.log('✓ Default categories inserted');

        // Create indexes
        await pool.query('CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_forum_posts_category ON forum_posts(category_id)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_forum_posts_created ON forum_posts(created_at DESC)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_forum_replies_post ON forum_replies(post_id)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id)');
        console.log('✓ Indexes created');

        console.log('\n✅ Database setup complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database setup failed:', error);
        process.exit(1);
    }
};

setupDatabase();
