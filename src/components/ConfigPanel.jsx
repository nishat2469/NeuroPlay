import React from 'react';
import { Button, Card, Icon, Segmented, Slider, Stepper } from './ui.jsx';
import ActivationGraph from './ActivationGraph.jsx';
import { ACT_INFO, ACT_ORDER } from '../content.js';
import { LIMITS, layerTitle } from '../nn.js';

export default function ConfigPanel({ net }) {
  const { sizes, activation } = net;
  const L = sizes.length;
  const hiddenCount = L - 2;
  const info = ACT_INFO[activation];

  return (
    <>
      <Card title="Network Architecture" subtitle="Add layers and neurons. The diagram updates instantly.">
        <div className="stack">
          <Stepper
            label="Input neurons"
            value={sizes[0]}
            min={LIMITS.inputs[0]}
            max={LIMITS.inputs[1]}
            onChange={(v) => net.setLayerSize(0, v)}
          />
          {sizes.slice(1, -1).map((n, k) => {
            const idx = k + 1;
            return (
              <Stepper
                key={idx}
                label={layerTitle(sizes, idx)}
                value={n}
                min={LIMITS.hidden[0]}
                max={LIMITS.hidden[1]}
                onChange={(v) => net.setLayerSize(idx, v)}
                right={
                  <button
                    className="icon-btn"
                    aria-label={`Remove hidden layer ${idx}`}
                    title="Remove this hidden layer"
                    disabled={hiddenCount <= LIMITS.hiddenLayers[0]}
                    onClick={() => net.removeHiddenLayer(idx)}
                  >
                    <Icon name="trash" size={15} />
                  </button>
                }
              />
            );
          })}
          <Stepper
            label="Output neurons"
            value={sizes[L - 1]}
            min={LIMITS.outputs[0]}
            max={LIMITS.outputs[1]}
            onChange={(v) => net.setLayerSize(L - 1, v)}
          />
          <Button
            variant="soft"
            icon="plus"
            onClick={net.addHiddenLayer}
            disabled={hiddenCount >= LIMITS.hiddenLayers[1]}
          >
            Add hidden layer {hiddenCount >= LIMITS.hiddenLayers[1] ? '(max reached)' : ''}
          </Button>
        </div>
      </Card>

      <Card title="Activation Function" subtitle="Applied by every hidden and output neuron.">
        <Segmented
          label="Activation function"
          value={activation}
          onChange={net.setActivation}
          options={ACT_ORDER.map((id) => ({ value: id, label: ACT_INFO[id].name }))}
        />
        <div className="act-mini">
          <div className="act-mini-graph">
            <ActivationGraph id={activation} width={260} height={150} compact />
          </div>
          <div>
            <code className="formula">{info.formula}</code>
            <p className="muted small">{info.tagline}</p>
          </div>
        </div>
      </Card>

      <Card title="Input Values" subtitle="The numbers fed into the input layer.">
        <div className="stack">
          {net.inputs.map((v, i) => (
            <Slider
              key={i}
              id={`input-${i}`}
              label={`x${i + 1}`}
              value={v}
              min={-1}
              max={1}
              step={0.05}
              onChange={(nv) => net.setInput(i, nv)}
            />
          ))}
        </div>
        <div className="btn-row">
          <Button variant="soft" icon="shuffle" onClick={net.randomize}>
            New weights
          </Button>
          <Button variant="soft" icon="reset" onClick={net.reset}>
            Reset all
          </Button>
        </div>
      </Card>
    </>
  );
}
