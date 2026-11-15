import React from 'react';
import { fmt } from '../nn.js';

const PATHS = {
  overview: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </>
  ),
  playground: (
    <>
      <circle cx="5" cy="6" r="2" />
      <circle cx="5" cy="18" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
      <path d="M7 6.6l3.2 4.2M7 17.4l3.2-4.2M14 12h3" />
    </>
  ),
  activation: <path d="M2 18c5 0 5-12 10-12s5 12 10 12" />,
  learn: (
    <>
      <path d="M2 9l10-5 10 5-10 5z" />
      <path d="M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5" />
    </>
  ),
  play: <path d="M7 4.5l12 7.5-12 7.5z" fill="currentColor" />,
  stop: <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  trash: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />,
  shuffle: <path d="M3 7h4l10 10h4M3 17h4l3-3M14 10l3-3h4M18 4l3 3-3 3M18 14l3 3-3 3" />,
  reset: <path d="M4 12a8 8 0 1 0 2.6-5.9M4 4v5h5" />,
  bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />,
  chevron: <path d="M6 9l6 6 6-6" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  neuron: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M2 6l6 4M2 18l6-4M16 12h6" />
    </>
  ),
  weight: <path d="M12 3v3M5 21h14M7 21l2-13h6l2 13M9 8h6" />,
  bias: <path d="M4 18h4V11h4V6h4V3M4 21h16" />,
  wave: <path d="M2 18c5 0 5-12 10-12s5 12 10 12" />,
  flow: <path d="M3 12h14M12 6l6 6-6 6M21 5v14" />,
};

export function Icon({ name, size = 18, className = '' }) {
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}

export function Card({ title, subtitle, actions, children, className = '', style }) {
  return (
    <section className={`card ${className}`} style={style}>
      {(title || actions) && (
        <header className="card-head">
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-sub">{subtitle}</p>}
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

export function Button({ children, variant = 'ghost', icon, className = '', ...rest }) {
  return (
    <button className={`btn btn-${variant} ${className}`} {...rest}>
      {icon && <Icon name={icon} size={16} />}
      {children}
    </button>
  );
}

export function Stepper({ label, value, min, max, onChange, suffix = '', right }) {
  return (
    <div className="stepper-row">
      <span className="stepper-label">{label}</span>
      <div className="stepper">
        <button
          className="step-btn"
          aria-label={`Decrease ${label}`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
        >
          <Icon name="minus" size={14} />
        </button>
        <span className="step-val mono">
          {value}
          {suffix}
        </span>
        <button
          className="step-btn"
          aria-label={`Increase ${label}`}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
        >
          <Icon name="plus" size={14} />
        </button>
      </div>
      {right}
    </div>
  );
}

export function Segmented({ options, value, onChange, label }) {
  return (
    <div className="segmented" role="tablist" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          className={`seg ${value === o.value ? 'on' : ''}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// Slider with a fill that grows from zero (cyan for positive, pink for negative)
export function Slider({ id, label, value, min = -2, max = 2, step = 0.05, onChange, tone }) {
  const span = max - min;
  const pct = ((value - min) / span) * 100;
  const zero = ((0 - min) / span) * 100;
  const left = Math.min(pct, zero);
  const width = Math.abs(pct - zero);
  const neg = value < 0;
  return (
    <div className="slider">
      <div className="slider-head">
        <label htmlFor={id}>{label}</label>
        <span className={`slider-val mono ${neg ? 'neg' : 'pos'}`}>{fmt(value, 2)}</span>
      </div>
      <div className="slider-track">
        <div className="slider-rail" />
        <div
          className={`slider-fill ${neg ? 'neg' : 'pos'} ${tone || ''}`}
          style={{ left: `${left}%`, width: `${width}%` }}
        />
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
}

export function Stat({ label, value, hint, accent }) {
  return (
    <div className={`stat ${accent || ''}`}>
      <div className="stat-value mono">{value}</div>
      <div className="stat-label">{label}</div>
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  );
}
