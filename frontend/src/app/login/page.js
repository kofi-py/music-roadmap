'use client';

import { authAPI, cookieUtils } from '../../lib/api';

export default function LoginPage() {
  const handleGoogleLogin = () => {
    authAPI.loginWithGoogle();
  };

  const handleMicrosoftLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/auth/microsoft`;
  };

  return (
    <div className="min-h-screen bg-gradient-music flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white shadow-glow-gold mb-4">
            <span className="text-4xl">🎵</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-white mb-2">Welcome</h1>
          <p className="text-white/90">Sign in to save your progress</p>
        </div>

        <div className="music-card p-8 bg-white space-y-4">
          {/* Google Login */}
          <button onClick={handleGoogleLogin} className="btn-google w-full justify-center">
            <span className="text-2xl">G</span>
            <span>Continue with Google</span>
          </button>

          {/* Microsoft Login */}
          <button
            onClick={handleMicrosoftLogin}
            className="w-full px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-300 hover:border-royal-purple-400 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0h10.931v10.931H0z" fill="#F25022" />
              <path d="M12.069 0H23v10.931H12.069z" fill="#7FBA00" />
              <path d="M0 12.069h10.931V23H0z" fill="#00A4EF" />
              <path d="M12.069 12.069H23V23H12.069z" fill="#FFB900" />
            </svg>
            <span>Continue with Microsoft</span>
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <div className="text-center">
            <a href="/curriculum" className="text-royal-purple-600 font-semibold text-sm hover:underline">
              Browse as Guest →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
