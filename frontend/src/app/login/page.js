'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/curriculum');
      } else {
        setError(data.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Connection failed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-music flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white shadow-glow-gold mb-4">
            <span className="text-4xl">🎵</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-white/90">Sign in to your Music Roadmap</p>
        </div>

        <div className="music-card p-8 bg-white space-y-6">
          {/* Traditional Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-royal-purple-900 mb-1">Username or Email</label>
              <input
                type="text"
                name="identifier"
                required
                value={formData.identifier}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-royal-purple-500 outline-none transition-all"
                placeholder="kofi or kofi@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-royal-purple-900 mb-1">Password</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-royal-purple-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border-2 border-red-100 text-red-600 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Sign In 🎹'}
            </button>
          </form>

          <div className="pt-4 text-center space-y-3">
            <p className="text-gray-500 text-sm">
              New here? {' '}
              <Link href="/signup" className="text-royal-purple-600 font-bold hover:underline">
                Create an account
              </Link>
            </p>
            <Link href="/curriculum" className="block text-gray-400 font-semibold text-xs hover:text-royal-purple-400 transition-colors">
              Browse as Guest →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
