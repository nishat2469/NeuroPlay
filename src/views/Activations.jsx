import React, { useState } from 'react';
import { Card, Slider } from '../components/ui.jsx';
import ActivationGraph from '../components/ActivationGraph.jsx';
import { ACT_INFO, ACT_ORDER } from '../content.js';
import { ACT_DERIV, ACT_FN, fmt } from '../nn.js';

export default function Activations({ net }) {
  const id = net.activation;
  const info = ACT_INFO[id];
  const [x, setX] = useState(1);
  const y = ACT_FN[id](x);
  const dy = ACT_DERIV[id](x);

  return (
    <div className="view">
      <header className="page-head">
        <h1>Activation Functions</h1>
        <p>
          After a neuron adds up its inputs, an activation function decides what number it actually sends on. Pick one
          here and it is used everywhere in the playground.
        </p>
      </header>

      <div className="act-cards">
        {ACT_ORDER.map((a) => (
          <button
            key={a}
            className={`act-card ${a === id ? 'on' : ''}`}
            onClick={() => net.setActivation(a)}
            aria-pressed={a === id}
          >
            <div className="act-card-head">
              <b>{ACT_INFO[a].name}</b>
              <span className="chip">{a === id ? 'Selected' : 'Use this'}</span>
            </div>
            <ActivationGraph id={a} width={300} height={150} compact />
            <code className="formula small">{ACT_INFO[a].formula}</code>
          </button>
        ))}
      </div>

      <div className="two-col wide-left">
        <Card title={`${info.name} in detail`} subtitle="Drag the slider to probe the function.">
          <ActivationGraph id={id} width={560} height={320} marker={x} />
          <Slider
            id="probe"
            label="Input value x (the neuron’s z)"
            value={x}
            min={id === 'sigmoid' ? -6 : -4}
            max={id === 'sigmoid' ? 6 : 4}
            step={0.1}
            onChange={setX}
          />
          <div className="probe">
            <div>
              <span className="muted small">Input x</span>
              <b className="mono">{fmt(x, 2)}</b>
            </div>
            <div>
              <span className="muted small">Output f(x)</span>
              <b className="mono out">{fmt(y, 4)}</b>
            </div>
            <div>
              <span className="muted small">Slope f′(x)</span>
              <b className="mono">{fmt(dy, 4)}</b>
            </div>
          </div>
        </Card>

        <Card title="What it does">
          <code className="formula big">{info.formula}</code>
          <p className="lead">{info.tagline}</p>
          <p>{info.explain}</p>
          <dl className="facts">
            <dt>Output range</dt>
            <dd className="mono">{info.range}</dd>
            <dt>Often used for</dt>
            <dd>{info.usedFor}</dd>
          </dl>
          <div className="proscons">
            <div>
              <h5 className="good">Strengths</h5>
              <ul>
                {info.pros.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="bad">Watch out for</h5>
              <ul>
                {info.cons.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
