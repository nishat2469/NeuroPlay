import React from 'react';
import { Icon } from './ui.jsx';

export const NAV = [
  { id: 'overview', label: 'Overview', icon: 'overview' },
  { id: 'playground', label: 'Network Playground', short: 'Playground', icon: 'playground' },
  { id: 'activations', label: 'Activation Functions', short: 'Activations', icon: 'activation' },
  { id: 'learn', label: 'Learn Neural Networks', short: 'Learn', icon: 'learn' },
];

export function Brand() {
  return (
    <div className="brand">
      <div className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" width="32" height="32">
          <defs>
            <linearGradient id="bm" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#8b5cf6" />
              <stop offset="1" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          <rect width="32" height="32" rx="9" fill="url(#bm)" />
          <g stroke="#fff" strokeOpacity=".85" strokeWidth="1.6" strokeLinecap="round">
            <path d="M9 10l7 6M9 22l7-6M16 16h7" />
          </g>
          <g fill="#fff">
            <circle cx="9" cy="10" r="2.4" />
            <circle cx="9" cy="22" r="2.4" />
            <circle cx="16" cy="16" r="2.4" />
            <circle cx="23" cy="16" r="2.4" />
          </g>
        </svg>
      </div>
      <div>
        <div className="brand-name">NeuroPlay</div>
        <div className="brand-tag">Neural networks, hands-on</div>
      </div>
    </div>
  );
}

export default function Sidebar({ view, onNavigate }) {
  return (
    <aside className="sidebar">
      <Brand />
      <nav className="nav" aria-label="Main navigation">
        {NAV.map((n) => (
          <button
            key={n.id}
            className={`nav-item ${view === n.id ? 'on' : ''}`}
            onClick={() => onNavigate(n.id)}
            aria-current={view === n.id ? 'page' : undefined}
          >
            <Icon name={n.icon} size={19} />
            <span className="nav-long">{n.label}</span>
            <span className="nav-short">{n.short || n.label}</span>
          </button>
        ))}
      </nav>
      <div className="side-foot">
        <div className="side-card">
          <div className="side-card-title">
            <Icon name="bolt" size={14} /> Real math, no tricks
          </div>
          <p>Every number you see is calculated live in JavaScript from your weights, biases and inputs.</p>
        </div>
      </div>
    </aside>
  );
}
