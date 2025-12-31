'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '../lib/api';

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkAuth = async () => {
      try {
        const data = await authAPI.getCurrentUser();
        if (!data.authenticated) {
          router.push('/login');
        }
      } catch (err) {
        console.error('Landing page auth check failed');
      }
    };
    checkAuth();
  }, [router]);

  return (
    <div className="bg-warm-cream staff-lines">
      {/* Musical note decorations */}
      <div className="music-note" style={{top: '10%', left: '5%'}}>♪</div>
      <div className="music-note" style={{top: '30%', right: '8%', animationDelay: '1s'}}>♫</div>
      <div className="music-note" style={{bottom: '20%', left: '10%', animationDelay: '2s'}}>♬</div>
      <div className="music-note" style={{top: '60%', right: '15%', animationDelay: '1.5s'}}>♩</div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center page-transition">
          <div className="inline-block mb-6">
            <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border-2 border-royal-purple-200">
              <span className="text-2xl">🎵</span>
              <span className="text-sm font-semibold text-royal-purple-900 uppercase tracking-wide">
                85 Free Courses • K-12 to College
              </span>
            </div>
          </div>

          <h1 className="text-6xl md:text-7xl font-display font-bold mb-6 leading-tight">
            <span className="text-gradient-music">Master Music</span>
            <br />
            <span className="text-royal-purple-900">From First Notes to Symphony</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-10 leading-relaxed">
            A comprehensive journey through music theory, instruments, composition, and performance—
            curated from world-class musicians and institutions.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <Link href="/curriculum" className="btn-primary group">
              <span>Explore Courses</span>
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link href="/diagnostic" className="btn-secondary">
              Find Your Level
            </Link>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <span className="w-2 h-2 bg-passion-pink-500 rounded-full animate-pulse"></span>
            <span>100% Free • Browse as Guest • Sign in to Save Progress</span>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-6xl mx-auto mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 px-4">
          {[
            { number: '85+', label: 'Free Courses', icon: '🎼' },
            { number: '17', label: 'Learning Levels', icon: '📊' },
            { number: '∞', label: 'Instruments', icon: '🎸' },
            { number: '100%', label: 'Free Forever', icon: '🎁' }
          ].map((stat, idx) => (
            <div 
              key={idx}
              className="music-card p-6 text-center transform hover:scale-105 transition-all"
            >
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-gradient-music mb-1">{stat.number}</div>
              <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Guest vs Auth Explanation */}
      <section className="py-20 px-4 bg-gradient-to-br from-royal-purple-50 to-passion-pink-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-royal-purple-900 mb-4">
              Learn Your Way
            </h2>
            <p className="text-xl text-gray-600">Choose how you want to experience Music Roadmap</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Guest Mode */}
            <div className="music-card p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-music-gold-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
              <div className="relative z-10">
                <div className="text-5xl mb-4">🌍</div>
                <h3 className="text-2xl font-display font-bold text-royal-purple-900 mb-4">Browse as Guest</h3>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <span className="text-music-gold-500 mt-1">✓</span>
                    <span>Access all 85 courses instantly</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-music-gold-500 mt-1">✓</span>
                    <span>View community forum</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-music-gold-500 mt-1">✓</span>
                    <span>Take diagnostic test</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-gray-400 mt-1">✗</span>
                    <span className="text-gray-500">Progress not saved</span>
                  </li>
                </ul>
                <Link href="/curriculum" className="btn-secondary w-full text-center block">
                  Start Learning
                </Link>
              </div>
            </div>

            {/* Auth Mode */}
            <div className="music-card p-8 relative overflow-hidden border-2 border-royal-purple-400">
              <div className="absolute top-0 right-0 text-xs bg-royal-purple-600 text-white px-3 py-1 rounded-bl-lg font-semibold">
                RECOMMENDED
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-royal-purple-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
              <div className="relative z-10">
                <div className="text-5xl mb-4">🎯</div>
                <h3 className="text-2xl font-display font-bold text-royal-purple-900 mb-4">Create an Account</h3>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <span className="text-passion-pink-500 mt-1">✓</span>
                    <span className="font-semibold">Progress saved to database</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-passion-pink-500 mt-1">✓</span>
                    <span>Track completed courses</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-passion-pink-500 mt-1">✓</span>
                    <span>Create forum posts</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-passion-pink-500 mt-1">✓</span>
                    <span>Get personalized recommendations</span>
                  </li>
                </ul>
                <Link href="/signup" className="btn-primary w-full text-center block">
                  Create an Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-royal-purple-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">Three steps to musical mastery</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Find Your Level',
                description: 'Take our diagnostic test or browse courses starting from your current skill level.',
                icon: '🎯',
                color: 'from-music-gold-400 to-music-gold-600'
              },
              {
                step: '2',
                title: 'Learn & Practice',
                description: 'Follow structured lessons from theory to performance with free resources.',
                icon: '🎹',
                color: 'from-passion-pink-400 to-passion-pink-600'
              },
              {
                step: '3',
                title: 'Join Community',
                description: 'Share your progress, get feedback, and connect with fellow musicians.',
                icon: '👥',
                color: 'from-royal-purple-400 to-royal-purple-600'
              }
            ].map((item, idx) => (
              <div key={idx} className="music-card p-8 hover:shadow-2xl transition-all">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-3xl mb-6 shadow-lg`}>
                  {item.icon}
                </div>
                <div className="text-sm font-bold text-passion-pink-600 mb-2">STEP {item.step}</div>
                <h3 className="text-2xl font-display font-bold text-royal-purple-900 mb-4">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects Preview */}
      <section className="py-20 px-4 bg-gradient-music text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Explore Every Aspect of Music
            </h2>
            <p className="text-xl text-white/90">From basics to mastery</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🎼', title: 'Theory', courses: '20 courses', desc: 'Scales, chords, harmony' },
              { icon: '🎸', title: 'Instruments', courses: '25 courses', desc: 'Piano, guitar, drums' },
              { icon: '✍️', title: 'Composition', courses: '15 courses', desc: 'Songwriting, arranging' },
              { icon: '🎤', title: 'Performance', courses: '25 courses', desc: 'Stage, recording, mixing' }
            ].map((subject, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all cursor-pointer border border-white/20">
                <div className="text-5xl mb-4">{subject.icon}</div>
                <h3 className="text-2xl font-display font-bold mb-2">{subject.title}</h3>
                <div className="text-music-gold-300 text-sm font-semibold mb-2">{subject.courses}</div>
                <p className="text-white/80 text-sm">{subject.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-royal-purple-900 mb-6">
            Ready to Start Your Musical Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Join thousands discovering the joy of music
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/curriculum" className="btn-primary text-lg px-8 py-4">
              Browse All Courses
            </Link>
            <Link href="/login" className="btn-secondary text-lg px-8 py-4">
              Sign In Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
