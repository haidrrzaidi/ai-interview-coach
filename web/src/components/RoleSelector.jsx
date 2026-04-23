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
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {roles.map((r) => {
        const isSelected = selected === r.id;
        return (
          <button
            key={r.id}
            type="button"
            onClick={() => onSelect(r.id)}
            className={[
              'text-left rounded-xl p-4 border transition-all',
              isSelected
                ? 'bg-brand-500/20 border-brand-400 ring-2 ring-brand-400/40'
                : 'bg-white/5 border-white/10 hover:bg-white/10',
            ].join(' ')}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{ROLE_EMOJI[r.id] || '💼'}</span>
              <span className="font-semibold text-white">{r.label}</span>
            </div>
            <p className="text-xs text-white/60 line-clamp-2">{r.focus}</p>
          </button>
        );
      })}
    </div>
  );
};

export default RoleSelector;
