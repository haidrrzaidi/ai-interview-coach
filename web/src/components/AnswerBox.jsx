import React, { useEffect, useRef, useState } from 'react';

const AnswerBox = ({ onSubmit, loading, disabled }) => {
  const [text, setText] = useState('');
  const taRef = useRef(null);

  useEffect(() => {
    if (!loading && taRef.current) taRef.current.focus();
  }, [loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || loading || disabled) return;
    onSubmit(trimmed);
    setText('');
  };

  const handleKey = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit(e);
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <form onSubmit={handleSubmit} className="card p-5 space-y-3">
      <label className="text-sm font-medium text-white/80">Your answer</label>
      <textarea
        ref={taRef}
        className="input resize-y min-h-[180px] leading-relaxed"
        placeholder="Type your answer here. Be specific and concise. (Ctrl/Cmd + Enter to submit)"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKey}
        disabled={loading || disabled}
        maxLength={4000}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/40">
          {wordCount} words · {text.length}/4000 chars
        </span>
        <button type="submit" className="btn-primary" disabled={loading || disabled || !text.trim()}>
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Evaluating…
            </>
          ) : (
            'Submit answer'
          )}
        </button>
      </div>
    </form>
  );
};

export default AnswerBox;
