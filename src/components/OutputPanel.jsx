import React from 'react';
import { Card } from './ui.jsx';
import { ACT_INFO } from '../content.js';
import { fmt, neuronName } from '../nn.js';
import { stageFor } from '../hooks/useForwardAnimation.js';

export default function OutputPanel({ net, shown }) {
  const { sizes, result, activation } = net;
  const L = sizes.length;
  const ready = stageFor(shown, L - 1) === 3;
  const res = result.layers[L - 1];
  const maxAbs = Math.max(1e-9, ...res.a.map(Math.abs), activation === 'relu' ? 1 : 0);
  const best = res.a.indexOf(Math.max(...res.a));
  const bounded = activation !== 'relu';

  return (
    <Card title="Final Output" subtitle={`Output layer after ${ACT_INFO[activation].name} activation`}>
      {!ready ? (
        <p className="muted">Waiting for the signal to reach the output layer…</p>
      ) : (
        <>
          <div className="out-list">
            {res.a.map((v, j) => (
              <div key={j} className={`out-row ${res.a.length > 1 && j === best ? 'best' : ''}`}>
                <div className="out-name mono">{neuronName(sizes, L - 1, j)}</div>
                <div className="out-bar">
                  {bounded && activation === 'tanh' ? (
                    <>
                      <span className="out-zero" />
                      <span
                        className={`out-fill ${v < 0 ? 'neg' : ''}`}
                        style={{
                          left: v >= 0 ? '50%' : `${50 + (v / 1) * 50}%`,
                          width: `${Math.min(50, Math.abs(v) * 50)}%`,
                        }}
                      />
                    </>
                  ) : (
                    <span
                      className="out-fill"
                      style={{ left: 0, width: `${Math.min(100, (Math.abs(v) / (bounded ? 1 : maxAbs)) * 100)}%` }}
                    />
                  )}
                </div>
                <div className="out-val mono">{fmt(v, 4)}</div>
              </div>
            ))}
          </div>
          <p className="muted small">
            {res.a.length === 1
              ? `The network outputs ${fmt(res.a[0], 4)} (z = ${fmt(res.z[0], 4)} before activation).`
              : `Largest output: ${neuronName(sizes, L - 1, best)} = ${fmt(res.a[best], 4)}.`}
          </p>
        </>
      )}
    </Card>
  );
}
