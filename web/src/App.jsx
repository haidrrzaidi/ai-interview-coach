import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Interview from './pages/Interview';
import Summary from './pages/Summary';

const App = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-brand-500/30 selection:text-brand-100 relative">
      {/* Decorative background blurs */}
      <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-brand-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-accent-500/10 rounded-full blur-[120px] pointer-events-none" />

      <header className="px-6 py-4 border-b border-white/5 backdrop-blur-xl sticky top-0 z-50 bg-[#0b0f19]/60 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-all duration-300 transform group-hover:scale-105">
              <span className="text-xl">🎯</span>
            </div>
            <span className="font-bold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 group-hover:to-brand-200 transition-all duration-300">
              AI Interview Coach
            </span>
          </Link>
          <nav className="hidden sm:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link to="/" className="hover:text-white transition-all duration-200">
              Home
            </Link>
            <a
              href="https://ai.google.dev"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-brand-500/30 hover:text-white transition-all duration-300 shadow-sm"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-200 to-slate-400 hover:from-brand-200 hover:to-accent-200 transition-all duration-300">
                Powered by Gemini
              </span>
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-10 sm:py-16 relative z-10">
        <div className="max-w-6xl mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/interview/:sessionId" element={<Interview />} />
            <Route path="/summary/:sessionId" element={<Summary />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      <footer className="px-6 py-6 text-center text-sm font-medium text-slate-500 border-t border-white/5 bg-slate-900/20 backdrop-blur-sm relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>Built with React, Tailwind & Gemini 2.5 Flash</p>
          <p className="opacity-70">&copy; {new Date().getFullYear()} AI Interview Coach</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
