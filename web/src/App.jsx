import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Interview from './pages/Interview';
import Summary from './pages/Summary';

const App = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-4 border-b border-white/5 backdrop-blur-sm sticky top-0 z-10 bg-black/20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl">🎯</span>
            <span className="font-bold text-xl tracking-tight group-hover:text-brand-300 transition">
              AI Interview Coach
            </span>
          </Link>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-white/70">
            <Link to="/" className="hover:text-white transition">
              Home
            </Link>
            <a
              href="https://docs.anthropic.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition"
            >
              Powered by Claude
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/interview/:sessionId" element={<Interview />} />
            <Route path="/summary/:sessionId" element={<Summary />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      <footer className="px-6 py-4 text-center text-xs text-white/40 border-t border-white/5">
        Built with React, Tailwind & Claude Opus 4.7 · {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;
