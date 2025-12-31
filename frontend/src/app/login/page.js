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
