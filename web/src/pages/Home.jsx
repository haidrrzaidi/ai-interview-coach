import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleSelector from '../components/RoleSelector';
import { useInterviewOptions, useInterview } from '../hooks/useInterview';

const DIFFICULTY_META = {
  easy: { emoji: '🌱', desc: '0–2 years · fundamentals' },
  medium: { emoji: '⚡', desc: '2–4 years · applied concepts' },
  hard: { emoji: '🔥', desc: '4+ years · senior depth' },
};

const Home = () => {
  const navigate = useNavigate();
  const { options, loading: optLoading, error: optError } = useInterviewOptions();
  const { start, loading: startLoading, error: startError } = useInterview();

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [difficulty, setDifficulty] = useState('medium');

  const handleStart = async (e) => {
    e.preventDefault();
    if (!role) return;
    try {
      const data = await start({ role, difficulty, candidateName: name.trim() || 'Candidate' });
      navigate(`/interview/${data.sessionId}`, { state: { session: data } });
    } catch (_) {}
  };

  const canStart = role && difficulty && !startLoading;

  if (optLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-white/60">
          <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-10 py-8 animate-fade-in">
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          AI Interview Coach
        </h1>
        <p className="text-white/60 text-lg max-w-xl mx-auto">
          Practice technical interviews with real-time feedback powered by Claude Opus 4.7.
        </p>
      </div>

      <form onSubmit={handleStart} className="space-y-8">
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-white/90">Your name (optional)</h2>
          <input
            className="input"
            type="text"
            placeholder="e.g. Alex"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
          />
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-white/90">Select a role</h2>
          {optError ? (
            <p className="text-red-400 text-sm">{optError}</p>
          ) : (
            <RoleSelector roles={options.roles} selected={role} onSelect={setRole} />
          )}
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-white/90">Difficulty</h2>
          <div className="grid grid-cols-3 gap-3">
            {options.difficulties.map((d) => {
              const meta = DIFFICULTY_META[d.id] || {};
              const isSelected = difficulty === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDifficulty(d.id)}
                  className={[
                    'rounded-xl p-4 border text-left transition-all',
                    isSelected
                      ? 'bg-brand-500/20 border-brand-400 ring-2 ring-brand-400/40'
                      : 'bg-white/5 border-white/10 hover:bg-white/10',
                  ].join(' ')}
                >
                  <div className="text-2xl mb-1">{meta.emoji}</div>
                  <div className="font-semibold text-white">{d.label}</div>
                  <div className="text-xs text-white/50 mt-1">{meta.desc}</div>
                  <div className="text-xs text-white/40 mt-1">{d.questionCount} questions</div>
                </button>
              );
            })}
          </div>
        </div>

        {startError && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-300 text-sm">
            {startError}
          </div>
        )}

        <button
          type="submit"
          className="btn-primary w-full py-4 text-base"
          disabled={!canStart}
        >
          {startLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Generating first question...
            </span>
          ) : (
            'Start Interview'
          )}
        </button>
      </form>
    </div>
  );
};

export default Home;
