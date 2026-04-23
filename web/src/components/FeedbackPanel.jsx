import React from 'react';

const scoreColor = (s) => {
  if (s >= 8) return 'text-emerald-300 bg-emerald-500/10 border-emerald-400/30';
  if (s >= 6) return 'text-amber-200 bg-amber-500/10 border-amber-400/30';
  if (s >= 4) return 'text-orange-200 bg-orange-500/10 border-orange-400/30';
  return 'text-rose-200 bg-rose-500/10 border-rose-400/30';
};

const FeedbackPanel = ({ feedback }) => {
  if (!feedback) return null;
  const { score = 0, strengths = [], weaknesses = [], correctAnswer, summary } = feedback;

  return (
    <div className="card p-6 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Feedback</h3>
        <div className={`rounded-xl border px-4 py-2 font-bold ${scoreColor(score)}`}>
          Score: {score}/10
        </div>
      </div>

      {summary && (
        <p className="text-white/80 text-sm leading-relaxed">{summary}</p>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl bg-emerald-500/5 border border-emerald-400/20 p-4">
          <h4 className="font-semibold text-emerald-300 text-sm mb-2 flex items-center gap-2">
            <span>✓</span> Strengths
          </h4>
          {strengths.length ? (
            <ul className="list-disc list-inside space-y-1 text-sm text-white/80">
              {strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-white/40 italic">None highlighted</p>
          )}
        </div>

        <div className="rounded-xl bg-rose-500/5 border border-rose-400/20 p-4">
          <h4 className="font-semibold text-rose-300 text-sm mb-2 flex items-center gap-2">
            <span>!</span> Weaknesses
          </h4>
          {weaknesses.length ? (
            <ul className="list-disc list-inside space-y-1 text-sm text-white/80">
              {weaknesses.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-white/40 italic">None highlighted</p>
          )}
        </div>
      </div>

      {correctAnswer && (
        <div className="rounded-xl bg-brand-500/10 border border-brand-400/30 p-4">
          <h4 className="font-semibold text-brand-200 text-sm mb-2">Model answer</h4>
          <p className="text-sm text-white/85 leading-relaxed">{correctAnswer}</p>
        </div>
      )}
    </div>
  );
};

export default FeedbackPanel;
