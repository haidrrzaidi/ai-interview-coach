import React from 'react';

const ROLE_EMOJI = {
  frontend: '🎨',
  backend: '⚙️',
  fullstack: '🧩',
  mobile: '📱',
  devops: '🚀',
  data: '📊',
  ml: '🤖',
  android: '🤖',
  ios: '🍎',
};

const RoleSelector = ({ roles, selected, onSelect }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {roles.map((r) => {
        const isSelected = selected === r.id;
        return (
          <button
            key={r.id}
            type="button"
            onClick={() => onSelect(r.id)}
            className={[
              'text-left rounded-2xl p-5 border transition-all duration-300 transform',
              isSelected
                ? 'bg-gradient-to-br from-brand-900/50 to-brand-800/40 border-brand-400 ring-2 ring-brand-400/40 shadow-glow -translate-y-1'
                : 'bg-slate-800/40 border-white/5 hover:bg-slate-700/60 hover:border-white/20',
            ].join(' ')}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5 shadow-inner">
                <span className="text-xl">{ROLE_EMOJI[r.id] || '💼'}</span>
              </div>
              <span className="font-bold text-white text-lg">{r.label}</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">{r.focus}</p>
          </button>
        );
      })}
    </div>
  );
};

export default RoleSelector;
