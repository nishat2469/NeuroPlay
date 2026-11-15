import React from 'react';
import { Button, Card, Icon, Stat } from '../components/ui.jsx';
import NetworkViz from '../components/NetworkViz.jsx';
import { ACT_INFO } from '../content.js';
import { countConnections, countNeurons, countParams, fmt, neuronName } from '../nn.js';

const STEPS = [
  ['01', 'Build', 'Add hidden layers and neurons to design your own network.'],
  ['02', 'Tune', 'Drag sliders to set weights, biases and input values.'],
  ['03', 'Run', 'Press a button and watch numbers flow through every layer.'],
  ['04', 'Understand', 'Read the real arithmetic behind each neuron, step by step.'],
];

const FEATURES = [
  ['playground', 'Live visualizer', 'SVG network with colour-coded positive and negative weights.'],
  ['bolt', 'Real calculations', 'Weighted sums, biases and activations computed in JavaScript. Nothing is faked.'],
  ['activation', 'Activation lab', 'Sigmoid, ReLU and Tanh with formulas, graphs and an interactive probe.'],
  ['learn', 'Beginner friendly', 'Plain-English explanations with worked examples.'],
];

export default function Overview({ net, onNavigate }) {
  const { sizes, result, activation } = net;
  const L = sizes.length;
  const out = result.layers[L - 1].a;
  return (
    <div className="view">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Interactive neural network playground</span>
          <h1 className="hero-title">
            Neuro<span className="grad">Play</span>
          </h1>
          <p className="hero-tag">Understand Neural Networks by Building Them Yourself.</p>
          <p className="hero-text">
            Design a network, move the weights and biases, and watch real forward propagation happen, neuron by neuron.
            No setup, no jargon walls, just numbers you can see and change.
          </p>
          <div className="hero-cta">
            <Button variant="primary" icon="play" onClick={() => onNavigate('playground', { run: true })}>
              Run Forward Propagation
            </Button>
            <Button variant="soft" onClick={() => onNavigate('learn')}>
              Learn the basics <Icon name="arrow" size={15} />
            </Button>
          </div>
        </div>
        <div className="hero-viz">
          <NetworkViz
            sizes={sizes}
            params={net.params}
            result={result}
            height={330}
            prefix="ov"
            interactive={false}
            headers={false}
          />
        </div>
      </section>

      <section className="stats">
        <Stat label="Layers" value={L} hint={`${L - 2} hidden`} accent="blue" />
        <Stat label="Neurons" value={countNeurons(sizes)} hint={sizes.join(' · ')} accent="purple" />
        <Stat label="Connections" value={countConnections(sizes)} hint="weights" accent="cyan" />
        <Stat label="Parameters" value={countParams(sizes)} hint="weights + biases" accent="pink" />
      </section>

      <div className="two-col">
        <Card title="Your network right now" subtitle={`Live output using ${ACT_INFO[activation].name} activation`}>
          <div className="out-list">
            {out.map((v, j) => (
              <div key={j} className="out-row">
                <div className="out-name mono">{neuronName(sizes, L - 1, j)}</div>
                <div className="out-val mono wide">{fmt(v, 4)}</div>
              </div>
            ))}
          </div>
          <p className="muted small">
            Inputs: {net.inputs.map((x, i) => `x${i + 1} = ${fmt(x, 2)}`).join(', ')}. Change anything in the
            playground and this updates.
          </p>
          <Button variant="soft" onClick={() => onNavigate('playground')}>
            Open playground <Icon name="arrow" size={15} />
          </Button>
        </Card>
        <Card title="How it works">
          <ol className="steps">
            {STEPS.map(([n, t, d]) => (
              <li key={n}>
                <span className="step-n mono">{n}</span>
                <div>
                  <b>{t}</b>
                  <p>{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <section className="features">
        {FEATURES.map(([icon, t, d]) => (
          <div key={t} className="feature">
            <div className="feature-icon">
              <Icon name={icon} size={20} />
            </div>
            <h4>{t}</h4>
            <p>{d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
