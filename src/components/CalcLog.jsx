import React from 'react';
import { Card } from './ui.jsx';
import { ACT_INFO } from '../content.js';
import { fmt, layerTitle, neuronName } from '../nn.js';
import { stageFor } from '../hooks/useForwardAnimation.js';

const par = (n, d = 2) => (n < 0 ? `(${fmt(n, d)})` : fmt(n, d));

export default function CalcLog({ net, shown, selected }) {
  const { sizes, params, result, activation } = net;
  const info = ACT_INFO[activation];
  const L = sizes.length;
  const blocks = [];
  for (let l = 1; l < L; l++) {
    const st = stageFor(shown, l);
    if (st === 0) continue;
    const prev = result.layers[l - 1].a;
    const res = result.layers[l];
    blocks.push(
      <div key={l} className="log-layer">
        <h4>{layerTitle(sizes, l)}</h4>
        <div className="log-grid">
          {res.z.map((_, j) => {
            const isSel = selected && selected.layer === l && selected.idx === j;
            const expr = params.weights[l - 1][j].map((w, i) => `${par(w)}×${par(prev[i], 3)}`).join(' + ');
            return (
              <div key={j} className={`log-neuron ${isSel ? 'sel' : ''}`}>
                <div className="log-name">{neuronName(sizes, l, j)}</div>
                <div className="log-line mono">
                  <i>Σ</i> = {expr} = <b>{fmt(res.sums[j], 3)}</b>
                </div>
                {st >= 2 && (
                  <div className="log-line mono">
                    <i>z</i> = {fmt(res.sums[j], 3)} + {par(params.biases[l - 1][j])} = <b>{fmt(res.z[j], 3)}</b>
                  </div>
                )}
                {st >= 3 && (
                  <div className="log-line mono">
                    <i>a</i> = {info.symbol}({fmt(res.z[j], 3)}) = <b className="out">{fmt(res.a[j], 3)}</b>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <Card
      title="Step-by-Step Calculations"
      subtitle="Real arithmetic for every neuron. Each line is computed from the current weights, biases and inputs."
    >
      {blocks.length ? (
        <div className="log-scroll">{blocks}</div>
      ) : (
        <p className="muted">Calculations appear here as the signal moves through each layer.</p>
      )}
    </Card>
  );
}
