'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { cookieUtils } from '../../lib/api';
import { coursesData, categories, levels } from '../../data/coursesData';

export default function CurriculumPage() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');

  useEffect(() => {
    const userInfo = cookieUtils.getUserInfo();
    setUser(userInfo);
  }, []);

  // Filter courses
  const filteredCourses = coursesData.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

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
                  Sign in to track completed courses and get personalized recommendations.
                </p>
                <div className="flex gap-3">
                  <Link href="/login" className="btn-primary inline-block">
                    Sign In
                  </Link>
                  <Link href="/signup" className="btn-secondary inline-block">
                    Create Account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <input
          type="text"
          placeholder="🔍 Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-6 py-4 border-2 border-royal-purple-200 rounded-xl mb-8 focus:border-royal-purple-500 focus:ring-2 focus:ring-royal-purple-200 outline-none"
        />

        {/* Filters */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Category Filter */}
          <div className="music-card p-6">
            <h3 className="font-bold text-royal-purple-900 mb-4">Filter by Category</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedCategory === 'All'
                    ? 'bg-royal-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                All ({coursesData.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${selectedCategory === cat.name
                      ? 'bg-royal-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <span>{cat.icon}</span>
                  {cat.name} ({cat.count})
                </button>
              ))}
            </div>
          </div>

          {/* Level Filter */}
          <div className="music-card p-6">
            <h3 className="font-bold text-royal-purple-900 mb-4">Filter by Level</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedLevel('All')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedLevel === 'All'
                    ? 'bg-royal-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                All Levels
              </button>
              {levels.map((level) => (
                <button
                  key={level.name}
                  onClick={() => setSelectedLevel(level.name)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedLevel === level.name
                      ? 'bg-royal-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {level.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600 font-medium">
            Showing {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Course Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <a
              key={course.id}
              href={course.url}
              target="_blank"
              rel="noopener noreferrer"
              className="music-card p-6 hover:shadow-glow-purple group transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">{course.icon}</span>
                <span className={`level-badge ${levels.find(l => l.name === course.level)?.badge} text-xs px-3 py-1`}>
                  {course.level}
                </span>
              </div>

              <h3 className="text-xl font-display font-bold text-royal-purple-900 mb-2 group-hover:text-royal-purple-600 transition-colors">
                {course.title}
              </h3>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {course.description}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span className="flex items-center gap-1">
                  <span>⏱️</span> {course.duration}
                </span>
                <span className="px-2 py-1 bg-gray-100 rounded-md font-medium">
                  {course.category}
                </span>
              </div>

              <div className="text-xs text-passion-pink-600 font-semibold">
                Source: {course.source}
              </div>

              <div className="mt-4 flex items-center text-royal-purple-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                Start Course <span className="ml-1">→</span>
              </div>
            </a>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-20 bg-white/50 rounded-3xl backdrop-blur-sm border-2 border-dashed border-royal-purple-200">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-display font-bold text-royal-purple-900 mb-2">No courses found</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Try adjusting your filters or search query.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
