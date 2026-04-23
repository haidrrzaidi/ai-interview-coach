import React from 'react';

const ProgressBar = ({ current, total }) => {
  const pct = total > 0 ? Math.min(100, (current / total) * 100) : 0;
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-white/60 mb-1">
        <span>Progress</span>
        <span>
          {current} / {total}
        </span>
      </div>
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
