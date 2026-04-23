import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useInterview } from '../hooks/useInterview';

const VERDICT_COLOR = {
  'needs work': 'text-rose-400',
  promising: 'text-amber-300',
  'interview-ready': 'text-emerald-300',
};

const VERDICT_LABEL = {
  'needs work': 'Needs Work',
  promising: 'Promising',
  'interview-ready': 'Interview-Ready',
};

const ScoreRing = ({ score }) => {
  const s = Number(score) || 0;
  const pct = Math.max(0, Math.min(100, Math.round((s / 10) * 100)));
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color =
    s >= 8 ? '#4ade80' : s >= 6 ? '#60a5fa' : s >= 4 ? '#facc15' : '#f87171';

  return (
    <div className="relative inline-flex items-center justify-center w-36 h-36">
      <svg width="144" height="144" className="-rotate-90">
        <circle cx="72" cy="72" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <circle
          cx="72" cy="72" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-extrabold text-white">{s.toFixed(1)}</span>
        <span className="text-xs text-white/50">/ 10</span>
      </div>
    </div>
  );
};

const Summary = () => {
  const { sessionId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { loadSummary, loading, error } = useInterview();
  const [data, setData] = useState(null);

  useEffect(() => {
    loadSummary({ sessionId, role: state?.role }).then(setData).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-white/60">
          <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span>Generating your report…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="card p-6 text-center space-y-4">
          <p className="text-red-400">{error}</p>
          <button className="btn-secondary" onClick={() => navigate('/')}>Back to home</button>
        </div>
      </div>
    );
  }

  const { summary, results, role, difficulty, candidateName } = data;

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-8 animate-fade-in">
      <div className="card p-8 text-center space-y-4">
        <p className="text-white/50 text-sm">
          {candidateName || 'Candidate'} · {role} · {String(difficulty || '').toUpperCase()}
        </p>
        <h1 className="text-3xl font-extrabold">Interview Complete</h1>
        <ScoreRing score={summary?.overallScore ?? 0} />
        <p className={`text-2xl font-bold ${VERDICT_COLOR[summary?.overallVerdict] || 'text-white'}`}>
          {VERDICT_LABEL[summary?.overallVerdict] || summary?.overallVerdict || ''}
        </p>
      </div>

      {summary?.strongTopics?.length > 0 && (
        <div className="card p-6 space-y-3">
          <h2 className="font-semibold text-green-400">Strong Topics</h2>
          <ul className="space-y-2">
            {summary.strongTopics.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                <span className="text-green-400 mt-0.5 shrink-0">✓</span>{s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {summary?.weakTopics?.length > 0 && (
        <div className="card p-6 space-y-3">
          <h2 className="font-semibold text-yellow-400">Weak Topics</h2>
          <ul className="space-y-2">
            {summary.weakTopics.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                <span className="text-yellow-400 mt-0.5 shrink-0">!</span>{t}
              </li>
            ))}
          </ul>
        </div>
      )}

      {summary?.studyPlan?.length > 0 && (
        <div className="card p-6 space-y-3">
          <h2 className="font-semibold text-brand-300">Study Plan</h2>
          <ul className="space-y-2">
            {summary.studyPlan.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                <span className="text-brand-400 shrink-0">→</span>{r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {results?.length > 0 && (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-white/90">Question Review</h2>
          {results.map((h, i) => (
            <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="chip">Q{i + 1} · {h.topic}</span>
                <span className={`text-sm font-bold ${
                  h.score >= 8 ? 'text-green-400' : h.score >= 5 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {h.score}/10
                </span>
              </div>
              <p className="text-sm font-medium text-white/90">{h.question}</p>
              <p className="text-sm text-white/60 italic">&ldquo;{h.userAnswer || '(no answer)'}&rdquo;</p>
              {h.modelAnswer && (
                <details className="text-xs text-white/70">
                  <summary className="cursor-pointer text-brand-300 hover:text-brand-200">Show model answer</summary>
                  <p className="mt-2 leading-relaxed">{h.modelAnswer}</p>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-4">
        <button className="btn-primary flex-1" onClick={() => navigate('/')}>
          Start new interview
        </button>
      </div>
    </div>
  );
};

export default Summary;
