import React, { useState } from 'react';
import { Button, Card, Icon } from '../components/ui.jsx';
import MiniNeuron from '../components/MiniNeuron.jsx';
import { CONCEPTS, FORWARD_STEPS } from '../content.js';

export default function Learn({ net, onNavigate }) {
  const [open, setOpen] = useState('neuron');
  return (
    <div className="view">
      <header className="page-head">
        <h1>Learn Neural Networks</h1>
        <p>Five ideas explain almost everything a simple neural network does. Start with the interactive neuron, then read on.</p>
      </header>

      <MiniNeuron activation={net.activation} setActivation={net.setActivation} />

      <h2 className="section-title">The five big ideas</h2>
      <div className="concepts">
        {CONCEPTS.map((c) => {
          const isOpen = open === c.key;
          return (
            <article key={c.key} className={`concept ${isOpen ? 'open' : ''}`}>
              <button
                className="concept-head"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : c.key)}
              >
                <span className="concept-icon">
                  <Icon name={c.icon} size={20} />
                </span>
                <span className="concept-titles">
                  <b>{c.title}</b>
                  <small>{c.short}</small>
                </span>
                <Icon name="chevron" size={18} className="chev" />
              </button>
              {isOpen && (
                <div className="concept-body">
                  <p className="analogy">
                    <b>Everyday picture:</b> {c.analogy}
                  </p>
                  <ul>
                    {c.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                  <div className="example">
                    <span className="chip">Worked example</span>
                    <p className="mono">{c.example()}</p>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <Card
        title="Forward propagation in five steps"
        subtitle="This is exactly what the “Run Forward Propagation” button animates."
        actions={
          <Button variant="primary" icon="play" onClick={() => onNavigate('playground', { run: true })}>
            Watch it happen
          </Button>
        }
      >
        <ol className="timeline">
          {FORWARD_STEPS.map(([t, d], i) => (
            <li key={t}>
              <span className="tl-n mono">{i + 1}</span>
              <div>
                <b>{t}</b>
                <p>{d}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="formula-strip mono">
          z = (w₁·a₁ + w₂·a₂ + … ) + b &nbsp;&nbsp;→&nbsp;&nbsp; a = f(z)
        </div>
      </Card>
    </div>
  );
}
