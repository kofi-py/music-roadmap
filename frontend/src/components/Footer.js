import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-royal-purple-900 via-melody-indigo-900 to-royal-purple-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">🎵</span>
              Music Roadmap
            </h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Making world-class music education accessible to everyone. 100% free, forever.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/curriculum" className="text-white/70 hover:text-music-gold-400 transition-colors text-sm">Courses</Link></li>
              <li><Link href="/diagnostic" className="text-white/70 hover:text-music-gold-400 transition-colors text-sm">Diagnostic</Link></li>
              <li><Link href="/forum" className="text-white/70 hover:text-music-gold-400 transition-colors text-sm">Forum</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><a href="https://www.musictheory.net" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-music-gold-400 transition-colors text-sm">Music Theory</a></li>
              <li><a href="https://www.teoria.com" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-music-gold-400 transition-colors text-sm">Teoria</a></li>
              <li><a href="https://imslp.org" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-music-gold-400 transition-colors text-sm">IMSLP</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Connect</h4>
            <div className="space-y-3">
              <div className="text-white/70 text-sm">📧 hello@musicroadmap.org</div>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">🐦</a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">📘</a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">📸</a>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-white/60 text-sm">
              © 2025 Music Roadmap. Made with 💜 for music lovers everywhere.
            </div>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-white/60 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
