import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleSelector from '../components/RoleSelector';
import { useInterview, useInterviewOptions } from '../hooks/useInterview';

const DIFFICULTY_META = {
  junior: { emoji: '🌱', desc: 'Entry-level · Core fundamentals' },
  mid: { emoji: '⚡', desc: '2–4 yrs · Applied concepts' },
  senior: { emoji: '🔥', desc: '4+ yrs · Senior depth' },
};

const Home = () => {
  const navigate = useNavigate();
  const { options, loading: optLoading, error: optError } = useInterviewOptions();
  const { start, loading: startLoading, error: startError } = useInterview();

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [difficulty, setDifficulty] = useState('mid');

  const handleStart = async (e) => {
    e.preventDefault();
    if (!role) return;
    try {
      const data = await start({
        role,
        difficulty,
        candidateName: name.trim() || 'Candidate',
      });
      navigate(`/interview/${data.sessionId}`, { state: { session: data } });
    } catch (_) {
      /* error shown below */
    }
  };

  const canStart = role && difficulty && !startLoading;

  if (optLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-4 text-brand-300 font-medium">
          <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Loading your experience…
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-6 animate-fade-in">
      <div className="text-center space-y-5 relative">
        <div className="inline-block mb-3 px-4 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-300 text-sm font-semibold tracking-wide shadow-glow">
          ✨ Powered by Gemini 2.5 Flash
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          Ace Your Next <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-accent-400 to-brand-300">
            Technical Interview
          </span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
          Practice with a world-class AI coach. Get real-time, actionable feedback to land your dream tech role.
        </p>
      </div>

      <form onSubmit={handleStart} className="space-y-8 max-w-3xl mx-auto">
        <div className="card p-8 space-y-5 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-300 border border-brand-500/30">1</div>
            <h2 className="text-xl font-bold text-white">Your Profile</h2>
          </div>
          <div className="pl-11">
            <input
              className="input text-lg"
              type="text"
              placeholder="What's your name? (e.g. Alex)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
            />
          </div>
        </div>

        <div className="card p-8 space-y-5 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-300 border border-brand-500/30">2</div>
            <h2 className="text-xl font-bold text-white">Select Your Role</h2>
          </div>
          <div className="pl-11">
            {optError ? (
              <p className="text-red-400 text-sm p-4 bg-red-400/10 rounded-xl">{optError}</p>
            ) : (
              <RoleSelector roles={options.roles} selected={role} onSelect={setRole} />
            )}
          </div>
        </div>

        <div className="card p-8 space-y-5 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-300 border border-brand-500/30">3</div>
            <h2 className="text-xl font-bold text-white">Choose Difficulty</h2>
          </div>
          <div className="pl-11 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {options.difficulties.map((d) => {
              const meta = DIFFICULTY_META[d.id] || {};
              const isSelected = difficulty === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDifficulty(d.id)}
                  className={[
                    'rounded-2xl p-5 border text-left transition-all duration-300 transform',
                    isSelected
                      ? 'bg-gradient-to-br from-brand-900/50 to-brand-800/40 border-brand-400 ring-2 ring-brand-400/40 shadow-glow -translate-y-1'
                      : 'bg-slate-800/40 border-white/5 hover:bg-slate-700/60 hover:border-white/20',
                  ].join(' ')}
                >
                  <div className="text-3xl mb-3 bg-white/5 w-12 h-12 rounded-full flex items-center justify-center border border-white/5">{meta.emoji}</div>
                  <div className="font-bold text-white text-lg">{d.label}</div>
                  <div className="text-sm text-slate-400 mt-1 mb-3">{meta.desc}</div>
                  <div className="inline-flex py-1 px-2.5 rounded-full bg-white/5 text-xs font-semibold text-brand-200 border border-white/5">
                    {options.maxQuestions || 5} questions
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {startError && (
          <div className="animate-slide-up rounded-2xl bg-red-500/10 border border-red-500/30 p-5 text-red-200 flex items-center gap-3 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
            <span className="text-xl">⚠️</span>
            <p className="font-medium">{startError}</p>
          </div>
        )}

        <div className="pt-4 pb-10 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <button
            type="submit"
            className={`btn-primary w-full py-5 text-lg ${!canStart && 'opacity-50 grayscale cursor-not-allowed'}`}
            disabled={!canStart}
          >
            {startLoading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Initializing interview engine…
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Start Mock Interview <span className="text-2xl ml-1">🚀</span>
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Home;
