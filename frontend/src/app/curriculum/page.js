'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { cookieUtils } from '../../lib/api';

export default function CurriculumPage() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const userInfo = cookieUtils.getUserInfo();
    setUser(userInfo);
  }, []);

  return (
    <div className="min-h-screen bg-warm-cream py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-display font-bold text-gradient-music mb-4">Music Curriculum</h1>
        <p className="text-xl text-gray-600 mb-8">85 free courses from K-12 to College</p>
        
        {!user && (
          <div className="music-card p-6 mb-8 bg-music-gold-50 border-2 border-music-gold-300">
            <div className="flex items-center gap-4">
              <span className="text-4xl">💡</span>
              <div>
                <div className="font-bold text-royal-purple-900 mb-1">
                  Want to save your progress?
                </div>
                <p className="text-gray-700 mb-3">
                  Sign in with Google to track completed courses and get personalized recommendations.
                </p>
                <Link href="/login" className="btn-primary inline-block">
                  Sign in with Google
                </Link>
              </div>
            </div>
          </div>
        )}

        <input
          type="text"
          placeholder="🔍 Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-6 py-4 border-2 border-royal-purple-200 rounded-xl mb-8 focus:border-royal-purple-500 focus:ring-2 focus:ring-royal-purple-200 outline-none"
        />

        <div className="music-card p-8">
          <h2 className="text-3xl font-display font-bold text-royal-purple-900 mb-6">
            All 85 Music Courses
          </h2>
          <p className="text-gray-600 mb-6">
            Complete curriculum from musictheory.net, Khan Academy, teoria.com, IMSLP, and more.
            All courses are 100% free!
          </p>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-royal-purple-50 rounded-lg">
              <div className="text-2xl mb-2">🎼</div>
              <div className="font-bold text-royal-purple-900">Theory</div>
              <div className="text-sm text-gray-600">20 courses</div>
            </div>
            <div className="p-4 bg-passion-pink-50 rounded-lg">
              <div className="text-2xl mb-2">🎸</div>
              <div className="font-bold text-royal-purple-900">Instruments</div>
              <div className="text-sm text-gray-600">25 courses</div>
            </div>
            <div className="p-4 bg-music-gold-50 rounded-lg">
              <div className="text-2xl mb-2">✍️</div>
              <div className="font-bold text-royal-purple-900">Composition</div>
              <div className="text-sm text-gray-600">15 courses</div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-600 text-center">
              Full course data with 85 courses will be loaded from coursesData.js
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
