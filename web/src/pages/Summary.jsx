import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useInterview } from '../hooks/useInterview';

const PERFORMANCE_COLOR = {
  Excellent: 'text-green-400',
  Strong: 'text-emerald-400',
  Solid: 'text-blue-400',
  Developing: 'text-yellow-400',
  'Needs Work': 'text-red-400',
};

const ScoreRing = ({ score }) => {
  const pct = Math.round((score / 10) * 100);
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = score >= 8 ? '#4ade80' : score >= 6 ? '#60a5fa' : score >= 4 ? '#facc15' : '#f87171';

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
        <span className="text-3xl font-extrabold text-white">{score.toFixed(1)}</span>
        <span className="text-xs text-white/50">/ 10</span>
      </div>
    </div>
  );
};

const Summary = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { loadSummary, loading, error } = useInterview();
  const [data, setData] = useState(null);

  useEffect(() => {
    loadSummary(sessionId).then(setData).catch(() => {});
  }, [sessionId]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-white/60">
          <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span>Generating your report...</span>
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

  const { summary, history, roleLabel, difficultyLabel, candidateName } = data;

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-8 animate-fade-in">
      <div className="card p-8 text-center space-y-4">
        <p className="text-white/50 text-sm">
          {candidateName} · {roleLabel} · {difficultyLabel}
        </p>
        <h1 className="text-3xl font-extrabold">Interview Complete</h1>
        <ScoreRing score={summary.overallScore ?? 0} />
        <p className={`text-2xl font-bold ${PERFORMANCE_COLOR[summary.performance] || 'text-white'}`}>
          {summary.performance}
        </p>
        <p className="text-white/70 leading-relaxed max-w-xl mx-auto">{summary.overallFeedback}</p>
      </div>

      {summary.strengths?.length > 0 && (
        <div className="card p-6 space-y-3">
          <h2 className="font-semibold text-green-400">Key Strengths</h2>
          <ul className="space-y-2">
            {summary.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                <span className="text-green-400 mt-0.5 shrink-0">✓</span>{s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {summary.weakAreas?.length > 0 && (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-yellow-400">Areas to Improve</h2>
          {summary.weakAreas.map((w, i) => (
            <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-2">
              <p className="font-medium text-white">{w.topic}</p>
              <p className="text-sm text-white/70">{w.reason}</p>
              <p className="text-sm text-brand-300">Suggestion: {w.improvement}</p>
            </div>
          ))}
        </div>
      )}

      {summary.recommendedResources?.length > 0 && (
        <div className="card p-6 space-y-3">
          <h2 className="font-semibold text-brand-300">Recommended Resources</h2>
          <ul className="space-y-2">
            {summary.recommendedResources.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                <span className="text-brand-400 shrink-0">→</span>{r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {summary.nextSteps && (
        <div className="card p-6 space-y-2">
          <h2 className="font-semibold text-white/90">Next Steps</h2>
          <p className="text-sm text-white/70 leading-relaxed">{summary.nextSteps}</p>
        </div>
      )}

      {history?.length > 0 && (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-white/90">Question Review</h2>
          {history.map((h) => (
            <div key={h.questionNumber} className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="chip">Q{h.questionNumber} · {h.topic}</span>
                <span className={`text-sm font-bold ${
                  h.score >= 8 ? 'text-green-400' : h.score >= 5 ? 'text-yellow-400' : 'text-red-400'
                }`}>{h.score}/10</span>
              </div>
              <p className="text-sm font-medium text-white/90">{h.question}</p>
              <p className="text-sm text-white/60 italic">&ldquo;{h.answer}&rdquo;</p>
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
