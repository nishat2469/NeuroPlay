import React, { useId } from 'react';
import { ACT_FN } from '../nn.js';
import { GRAPH_CFG } from '../content.js';

export default function ActivationGraph({ id, width = 460, height = 280, marker = null, compact = false }) {
  const uid = useId().replace(/:/g, '');
  const cfg = GRAPH_CFG[id];
  const f = ACT_FN[id];
  const pad = compact ? { l: 26, r: 8, t: 8, b: 20 } : { l: 40, r: 16, t: 14, b: 30 };
  const [x0, x1] = cfg.x;
  const [y0, y1] = cfg.y;
  const sx = (x) => pad.l + ((x - x0) / (x1 - x0)) * (width - pad.l - pad.r);
  const sy = (y) => pad.t + (1 - (y - y0) / (y1 - y0)) * (height - pad.t - pad.b);

  const N = 200;
  let d = '';
  for (let k = 0; k <= N; k++) {
    const x = x0 + ((x1 - x0) * k) / N;
    d += `${k === 0 ? 'M' : 'L'}${sx(x).toFixed(2)},${sy(f(x)).toFixed(2)} `;
  }

  const mx = marker === null ? null : Math.max(x0, Math.min(x1, marker));
  const fs = compact ? 9 : 11;

  return (
    <svg
      className="act-graph"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Graph of the ${id} activation function`}
    >
      <defs>
        <linearGradient id={`${uid}-line`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      {cfg.xt.map((t) => (
        <g key={`x${t}`}>
          <line x1={sx(t)} x2={sx(t)} y1={pad.t} y2={height - pad.b} className="g-grid" />
          <text x={sx(t)} y={height - pad.b + (compact ? 12 : 18)} textAnchor="middle" fontSize={fs} className="g-tick">
            {t}
          </text>
        </g>
      ))}
      {cfg.yt.map((t) => (
        <g key={`y${t}`}>
          <line x1={pad.l} x2={width - pad.r} y1={sy(t)} y2={sy(t)} className="g-grid" />
          <text x={pad.l - 6} y={sy(t) + 3.5} textAnchor="end" fontSize={fs} className="g-tick">
            {t}
          </text>
        </g>
      ))}
      <line x1={sx(0)} x2={sx(0)} y1={pad.t} y2={height - pad.b} className="g-axis" />
      <line x1={pad.l} x2={width - pad.r} y1={sy(0)} y2={sy(0)} className="g-axis" />
      <path d={d} fill="none" stroke={`url(#${uid}-line)`} strokeWidth={compact ? 2.4 : 3.2} strokeLinecap="round" />
      {mx !== null && (
        <g>
          <line x1={sx(mx)} x2={sx(mx)} y1={sy(0)} y2={sy(f(mx))} className="g-marker" />
          <line x1={pad.l} x2={sx(mx)} y1={sy(f(mx))} y2={sy(f(mx))} className="g-marker" />
          <circle cx={sx(mx)} cy={sy(f(mx))} r="6" fill="#0a0f24" stroke="#22d3ee" strokeWidth="2.5" />
        </g>
      )}
    </svg>
  );
}
