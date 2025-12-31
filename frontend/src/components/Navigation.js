'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authAPI, cookieUtils } from '../lib/api';

export default function Navigation() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkAuth = async () => {
      try {
        const data = await authAPI.getCurrentUser();
        if (data.authenticated) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Auth check error:', err);
      }
    };
    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navLinks = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/curriculum', label: 'Courses', icon: '🎵' },
    { href: '/diagnostic', label: 'Diagnostic', icon: '🎯' },
    { href: '/forum', label: 'Forum', icon: '💬' },
    { href: '/contact', label: 'Contact', icon: '📧' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b-2 border-royal-purple-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-music flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform shadow-glow-purple">
              🎵
            </div>
            <span className="text-xl font-display font-bold text-gradient-music hidden sm:inline">
              Music Roadmap
            </span>
          </Link>

          <div className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all ${pathname === link.href
                    ? 'bg-royal-purple-100 text-royal-purple-700 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <span className="text-lg">{link.icon}</span>
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            ))}

            {mounted && (
              <div className="ml-4 pl-4 border-l-2 border-gray-300">
                {user ? (
                  <div className="flex items-center gap-3">
                    {user.profilePicture && (
                      <img
                        src={user.profilePicture}
                        alt={user.username}
                        className="w-8 h-8 rounded-full border-2 border-royal-purple-400"
                      />
                    )}
                    <div className="hidden md:block text-right">
                      <div className="text-sm font-semibold text-royal-purple-900">
                        {user.username}
                      </div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link
                      href="/login"
                      className="px-4 py-2 text-royal-purple-600 hover:bg-royal-purple-50 rounded-lg transition-all font-medium"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="px-4 py-2 bg-gradient-music text-white rounded-lg hover:shadow-glow-purple transition-all font-medium"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
