import React, { useState } from 'react';
import { fmt, layerKind, layerTitle, neuronName } from '../nn.js';
import { SHOW_ALL, stageFor } from '../hooks/useForwardAnimation.js';

export const POS = '#22d3ee';
export const NEG = '#f472b6';
const KIND_COLOR = { input: '#60a5fa', hidden: '#a78bfa', output: '#22d3ee' };

const ease = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);

/**
 * SVG neural network. Everything drawn comes from `params` / `result`:
 * line colour + thickness = weight sign + size, node text = real computed values.
 */
export default function NetworkViz({
  sizes,
  params,
  result,
  selected = null,
  onSelect,
  shown = SHOW_ALL,
  flow = null,
  running = false,
  height = 400,
  prefix = 'nv',
  interactive = true,
  headers = true,
}) {
  const [hover, setHover] = useState(null);
  const L = sizes.length;
  const W = 780;
  const H = height;
  const padX = 104;
  const top = headers ? 80 : 36;
  const bottom = 30;
  const maxN = Math.max(...sizes);
  const avail = H - top - bottom;
  const gap = Math.min(78, avail / maxN);
  const r = maxN >= 6 ? 19 : maxN >= 5 ? 21 : 23;

  const lx = (l) => padX + (l * (W - 2 * padX)) / (L - 1);
  const pos = (l, i) => ({ x: lx(l), y: top + avail / 2 + (i - (sizes[l] - 1) / 2) * gap });

  const edges = [];
  const particles = [];
  for (let l = 0; l < L - 1; l++) {
    for (let j = 0; j < sizes[l + 1]; j++) {
      for (let i = 0; i < sizes[l]; i++) {
        const w = params.weights[l][j][i];
        const a = pos(l, i);
        const b = pos(l + 1, j);
        const x1 = a.x + r;
        const x2 = b.x - r;
        const mag = Math.min(Math.abs(w), 2);
        const isIn = selected && selected.layer === l + 1 && selected.idx === j;
        const isOut = selected && selected.layer === l && selected.idx === i;
        const base = 0.16 + mag * 0.3;
        const op = isIn ? 1 : isOut ? 0.85 : selected ? base * 0.75 : base;
        const color = w >= 0 ? POS : NEG;
        const sw = 0.8 + mag * 1.7 + (isIn ? 1 : 0);
        const key = `${l}-${j}-${i}`;
        edges.push(
          <g key={key}>
            <line x1={x1} y1={a.y} x2={x2} y2={b.y} stroke={color} strokeWidth={sw} strokeOpacity={op * 0.55} />
            <line
              className="edge-flow"
              x1={x1}
              y1={a.y}
              x2={x2}
              y2={b.y}
              stroke={color}
              strokeWidth={sw}
              strokeOpacity={op}
              strokeDasharray="4 10"
              strokeLinecap="round"
            />
            {interactive && (
              <line
                x1={x1}
                y1={a.y}
                x2={x2}
                y2={b.y}
                stroke="transparent"
                strokeWidth="12"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHover({ l, j, i, w, x: (x1 + x2) / 2, y: (a.y + b.y) / 2 })}
                onMouseLeave={() => setHover(null)}
                onClick={() => onSelect && onSelect({ layer: l + 1, idx: j })}
              />
            )}
          </g>
        );
        if (flow && flow.layer === l + 1) {
          const contrib = result.layers[l + 1].terms[j][i];
          const e = ease(flow.p);
          const px = x1 + (x2 - x1) * e;
          const py = a.y + (b.y - a.y) * e;
          particles.push(
            <circle
              key={`p-${key}`}
              cx={px}
              cy={py}
              r={2.4 + Math.min(3, Math.abs(contrib) * 3)}
              fill={contrib >= 0 ? POS : NEG}
              filter={`url(#${prefix}-glow)`}
            />
          );
        }
      }
    }
  }

  const layers = sizes.map((n, l) => {
    const kind = layerKind(sizes, l);
    const color = KIND_COLOR[kind];
    const st = stageFor(shown, l);
    const active = running && l === shown.layer;
    const cx = lx(l);
    return (
      <g key={l}>
        <rect
          x={cx - 42}
          y={top - 18}
          width={84}
          height={avail + 36}
          rx={22}
          className={`layer-band ${active ? 'active' : ''}`}
          style={active ? { stroke: color } : undefined}
        />
        {headers && (
          <>
            <text x={cx} y={32} textAnchor="middle" className="layer-title" fill={color}>
              {layerTitle(sizes, l)}
            </text>
            <text x={cx} y={50} textAnchor="middle" className="layer-sub">
              {n} neuron{n > 1 ? 's' : ''}
            </text>
          </>
        )}
        {Array.from({ length: n }, (_, i) => {
          const { x, y } = pos(l, i);
          const isSel = selected && selected.layer === l && selected.idx === i;
          let val = null;
          if (l === 0) val = result.layers[0].a[i];
          else if (st === 1) val = result.layers[l].sums[i];
          else if (st === 2) val = result.layers[l].z[i];
          else if (st === 3) val = result.layers[l].a[i];
          const txt = val === null ? '' : fmt(val, 2);
          const name = neuronName(sizes, l, i);
          return (
            <g
              key={i}
              className={`node ${interactive ? 'clickable' : ''}`}
              role={interactive ? 'button' : undefined}
              tabIndex={interactive ? 0 : undefined}
              aria-label={`${layerTitle(sizes, l)} neuron ${i + 1}`}
              onClick={() => interactive && onSelect && onSelect({ layer: l, idx: i })}
              onKeyDown={(e) => {
                if (interactive && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onSelect && onSelect({ layer: l, idx: i });
                }
              }}
            >
              {isSel && <circle className="sel-ring" cx={x} cy={y} r={r + 7} stroke={color} />}
              <circle
                cx={x}
                cy={y}
                r={r}
                fill={`url(#${prefix}-g-${kind})`}
                stroke={color}
                strokeWidth={active ? 3 : 2}
                filter={active ? `url(#${prefix}-glow)` : undefined}
                opacity={val === null ? 0.5 : 1}
              />
              <text x={x} y={y + 4} textAnchor="middle" className="node-val" fontSize={txt.length > 5 ? 9.5 : 11.5}>
                {txt}
              </text>
              {l === 0 && (
                <text x={x - r - 12} y={y + 4} textAnchor="end" className="node-name">
                  {name}
                </text>
              )}
              {l === L - 1 && (
                <text x={x + r + 12} y={y + 4} textAnchor="start" className="node-name">
                  {name}
                </text>
              )}
            </g>
          );
        })}
      </g>
    );
  });

  return (
    <div className="viz-scroll">
      <svg
        className="viz"
        viewBox={`0 0 ${W} ${H}`}
        style={{ minWidth: 560 }}
        role="img"
        aria-label="Neural network diagram"
      >
        <defs>
          {Object.entries(KIND_COLOR).map(([k, c]) => (
            <radialGradient key={k} id={`${prefix}-g-${k}`} cx="35%" cy="30%" r="80%">
              <stop offset="0%" stopColor={c} stopOpacity="0.55" />
              <stop offset="100%" stopColor="#0b1230" stopOpacity="0.95" />
            </radialGradient>
          ))}
          <filter id={`${prefix}-glow`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g>{edges}</g>
        <g style={{ pointerEvents: 'none' }}>{particles}</g>
        {layers}
        {hover && (
          <g style={{ pointerEvents: 'none' }}>
            <rect x={hover.x - 54} y={hover.y - 30} width="108" height="24" rx="7" className="tip-bg" />
            <text x={hover.x} y={hover.y - 14} textAnchor="middle" className="tip-txt">
              w = {fmt(hover.w, 2)}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
