"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [currentCrypto, setCurrentCrypto] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cryptos = ['BTC', 'ETH', 'USD'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCrypto((prev) => (prev + 1) % cryptos.length);
    }, 2000); // Change every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover"
        >
          <source src="/ocean.mp4" type="video/mp4" />
          {/* Fallback for browsers that don't support video */}
          <div className="h-full w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 animate-gradient" />
        </video>
        {/* Professional overlay for better text readability */}
        <div className="absolute inset-0 bg-slate-900/80" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-6">
        <div className="flex items-center space-x-4">
          <div className="text-2xl font-bold text-slate-100">
            saven
          </div>
          <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-slate-800/20 text-slate-100 border-slate-700/30">
            Beta
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="bg-slate-800/20 border border-slate-700/30 text-slate-100 hover:bg-slate-800/40 hover:backdrop-blur-md hover:border-slate-600/50 hover:shadow-lg hover:shadow-slate-900/20 p-2 rounded-md transition-all duration-300 transform hover:scale-105"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <a
            href="http://localhost:3000"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 transform hover:scale-105 bg-slate-800/20 border border-slate-700/30 text-slate-100 hover:bg-slate-800/40 hover:backdrop-blur-md hover:border-slate-600/50 hover:shadow-lg hover:shadow-slate-900/20 px-4 py-2"
          >
            Open App
          </a>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-xl">
          <div className="flex flex-col items-center justify-center h-full space-y-8">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-6 right-6 text-slate-100 hover:text-slate-300 transition-colors"
            >
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <a
              href="#"
              className="text-slate-100 hover:text-slate-300 transition-all duration-300 text-2xl font-medium px-6 py-3 rounded-lg hover:bg-slate-800/30 hover:backdrop-blur-sm hover:border hover:border-slate-600/30"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </a>
            <a
              href="#"
              className="text-slate-100 hover:text-slate-300 transition-all duration-300 text-2xl font-medium px-6 py-3 rounded-lg hover:bg-slate-800/30 hover:backdrop-blur-sm hover:border hover:border-slate-600/30"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </a>
            <a
              href="#"
              className="text-slate-100 hover:text-slate-300 transition-all duration-300 text-2xl font-medium px-6 py-3 rounded-lg hover:bg-slate-800/30 hover:backdrop-blur-sm hover:border hover:border-slate-600/30"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Services
            </a>
            <a
              href="#"
              className="text-slate-100 hover:text-slate-300 transition-all duration-300 text-2xl font-medium px-6 py-3 rounded-lg hover:bg-slate-800/30 hover:backdrop-blur-sm hover:border hover:border-slate-600/30"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </a>
            <a
              href="http://localhost:3000"
              className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white px-8 py-4 text-xl font-bold rounded-lg shadow-lg hover:shadow-xl hover:shadow-amber-900/30 hover:backdrop-blur-sm transition-all duration-300 transform hover:scale-105 border border-amber-500/20 hover:border-amber-400/40"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Open App
            </a>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-start justify-start h-full px-6 pt-20">
        <div className="max-w-xl w-full pl-16">
          {/* Hero Container */}
          <div className="bg-slate-800/10 backdrop-blur-xs border border-slate-700/20 rounded-lg mb-12">
            <div className="text-left px-6 py-6">
              <h1 className="text-5xl font-bold text-slate-100 mb-12">
                Save in{" "}
                <span className="text-5xl font-black transition-all duration-500 ease-in-out text-amber-400">
                  {cryptos[currentCrypto]}
                </span>
              </h1>
              <h2 className="text-5xl font-bold text-slate-100">
                Win up to{" "}
                <span className="text-5xl font-black text-amber-400">
                  $233,152
                </span>
              </h2>
            </div>
          </div>
        </div>

        {/* Subtitle */}
        <div className="max-w-4xl pl-16">
          <div className="bg-slate-800/15 border border-slate-700/20 rounded-lg mb-8 hover:backdrop-blur-sm transition-all duration-300">
            <div className="text-left px-6 py-4">
              <div className="text-xl text-slate-200 mb-1 font-bold">
                <p className="mb-4">
                  Keep exposure to your asset. Give up yield for a chance to win prizes.
                </p>
                <p className="mb-4">
                  Prizes are funded by pooled yield, generated via curated strategies.
                </p>
                <div className="relative inline-block group">
                  <span className="cursor-help hover:text-slate-300 transition-colors">
                    Savings are not at risk.
                  </span>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-3 bg-slate-800/90 backdrop-blur-xl border border-slate-700/30 text-slate-100 text-sm rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none w-80 z-50">
                    <p className="leading-relaxed">
                      Prizes are funded from pooled yield, your principal should never be at risk, but does inherit strategy-specific risks. Refer to the curator for further information.
                    </p>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800/90"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="pl-24">
          <a
            href="http://localhost:3000"
            className="inline-block bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white px-16 py-6 text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-amber-500/30 rounded-lg"
          >
            DEPOSIT
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 z-10 p-6">
        <div className="flex flex-col md:flex-row items-center justify-between text-slate-100">
          <div className="text-sm text-slate-300 mb-4 md:mb-0">
            © 2025 saven. All rights reserved.
          </div>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-slate-300 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-slate-300 transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

