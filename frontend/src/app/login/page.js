'use client';

import { authAPI, cookieUtils } from '../../lib/api';

export default function LoginPage() {
  const handleGoogleLogin = () => {
    authAPI.loginWithGoogle();
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

        <div className="music-card p-8 bg-white">
          <button onClick={handleGoogleLogin} className="btn-google w-full justify-center">
            <span className="text-2xl">G</span>
            <span>Continue with Google</span>
          </button>

          <div className="mt-6 text-center">
            <a href="/curriculum" className="text-royal-purple-600 font-semibold text-sm">
              Browse as Guest →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
