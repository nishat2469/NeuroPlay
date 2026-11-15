import React from 'react';
import { Card, Slider } from './ui.jsx';
import { ACT_INFO } from '../content.js';
import { fmt, layerTitle, neuronName } from '../nn.js';

export default function InspectorPanel({ net, selected }) {
  const { sizes, params, result, activation } = net;
  const { layer: l, idx: j } = selected;
  const name = neuronName(sizes, l, j);
  const info = ACT_INFO[activation];

  if (l === 0) {
    return (
      <Card title={`Neuron ${name}`} subtitle={`${layerTitle(sizes, l)} · input neuron`}>
        <p className="muted small">
          Input neurons just hold the numbers you feed in. Drag the slider to change this input and watch every
          calculation update.
        </p>
        <Slider
          id={`insp-input-${j}`}
          label={`${name} (input value)`}
          value={net.inputs[j]}
          min={-1}
          max={1}
          onChange={(v) => net.setInput(j, v)}
        />
      </Card>
    );
  }

  const prevSize = sizes[l - 1];
  const layerRes = result.layers[l];
  return (
    <Card
      title={`Neuron ${name}`}
      subtitle={`${layerTitle(sizes, l)} · ${prevSize} incoming weight${prevSize > 1 ? 's' : ''}`}
    >
      <div className="stack">
        {params.weights[l - 1][j].map((w, i) => (
          <Slider
            key={`${l}-${j}-${i}`}
            id={`w-${l}-${j}-${i}`}
            label={`Weight  ${neuronName(sizes, l - 1, i)} → ${name}`}
            value={w}
            onChange={(v) => net.setWeight(l - 1, j, i, v)}
          />
        ))}
        <Slider
          id={`b-${l}-${j}`}
          label={`Bias of ${name}`}
          value={params.biases[l - 1][j]}
          onChange={(v) => net.setBias(l - 1, j, v)}
        />
      </div>
      <div className="calc-box">
        <div className="calc-row">
          <span>Weighted sum Σ</span>
          <b className="mono">{fmt(layerRes.sums[j], 3)}</b>
        </div>
        <div className="calc-row">
          <span>+ bias → z</span>
          <b className="mono">{fmt(layerRes.z[j], 3)}</b>
        </div>
        <div className="calc-row hi">
          <span>{info.symbol}(z) → output a</span>
          <b className="mono">{fmt(layerRes.a[j], 3)}</b>
        </div>
      </div>
    </Card>
  );
}
