import React, { useMemo, useState } from 'react';
import { Card, Segmented, Slider } from './ui.jsx';
import NetworkViz from './NetworkViz.jsx';
import { ACT_INFO, ACT_ORDER } from '../content.js';
import { fmt, forward } from '../nn.js';

const par = (n, d = 2) => (n < 0 ? `(${fmt(n, d)})` : fmt(n, d));

// A single neuron with two inputs, built with the same forward() used by the full network.
export default function MiniNeuron({ activation, setActivation }) {
  const [v, setV] = useState({ x1: 0.8, x2: 0.4, w1: 0.9, w2: -0.6, b: 0.1 });
  const set = (k) => (val) => setV((s) => ({ ...s, [k]: Math.round(val * 100) / 100 + 0 }));
  const params = useMemo(() => ({ weights: [[[v.w1, v.w2]]], biases: [[v.b]] }), [v]);
  const result = useMemo(() => forward(params, [v.x1, v.x2], activation), [params, v.x1, v.x2, activation]);
  const info = ACT_INFO[activation];
  const res = result.layers[1];

  return (
    <Card
      title="Try one neuron"
      subtitle="Move the sliders and watch a single neuron compute its output."
      actions={
        <Segmented
          label="Activation function"
          value={activation}
          onChange={setActivation}
          options={ACT_ORDER.map((id) => ({ value: id, label: ACT_INFO[id].name }))}
        />
      }
    >
      <div className="mini-grid">
        <div>
          <NetworkViz
            sizes={[2, 1]}
            params={params}
            result={result}
            height={250}
            prefix="mini"
            interactive={false}
            headers={false}
          />
          <div className="calc-box">
            <div className="calc-row mono">
              Σ = {par(v.w1)}×{par(v.x1)} + {par(v.w2)}×{par(v.x2)} = <b>{fmt(res.sums[0], 3)}</b>
            </div>
            <div className="calc-row mono">
              z = {fmt(res.sums[0], 3)} + {par(v.b)} = <b>{fmt(res.z[0], 3)}</b>
            </div>
            <div className="calc-row hi mono">
              a = {info.symbol}({fmt(res.z[0], 3)}) = <b>{fmt(res.a[0], 3)}</b>
            </div>
          </div>
        </div>
        <div className="stack">
          <Slider id="mn-x1" label="Input x1" value={v.x1} min={-1} max={1} onChange={set('x1')} />
          <Slider id="mn-x2" label="Input x2" value={v.x2} min={-1} max={1} onChange={set('x2')} />
          <Slider id="mn-w1" label="Weight w1" value={v.w1} onChange={set('w1')} />
          <Slider id="mn-w2" label="Weight w2" value={v.w2} onChange={set('w2')} />
          <Slider id="mn-b" label="Bias b" value={v.b} onChange={set('b')} />
        </div>
      </div>
    </Card>
  );
}
