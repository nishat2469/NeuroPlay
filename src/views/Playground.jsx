import React, { useEffect } from 'react';
import { Button, Card, Segmented } from '../components/ui.jsx';
import NetworkViz from '../components/NetworkViz.jsx';
import ConfigPanel from '../components/ConfigPanel.jsx';
import InspectorPanel from '../components/InspectorPanel.jsx';
import CalcLog from '../components/CalcLog.jsx';
import OutputPanel from '../components/OutputPanel.jsx';
import { STAGE_LABELS } from '../hooks/useForwardAnimation.js';

export default function Playground({ net, anim, selected, onSelect, pendingRun, clearPendingRun }) {
  const L = net.sizes.length;

  useEffect(() => {
    if (pendingRun) {
      anim.run(L);
      clearPendingRun();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingRun]);

  const status = anim.running
    ? `Layer ${Math.min(anim.shown.layer, L - 1)} of ${L - 1} · ${STAGE_LABELS[anim.shown.stage] || ''}`
    : 'Ready · adjust anything and the numbers update live';

  return (
    <div className="view">
      <header className="page-head">
        <h1>Network Playground</h1>
        <p>
          Build a network, tune its weights and biases, then run forward propagation to see how the numbers flow.
          Click any neuron or connection to inspect it.
        </p>
      </header>

      <div className="pg-grid">
        <Card
          className="area-viz"
          title="Neural Network Visualizer"
          subtitle={status}
          actions={
            <>
              <Segmented
                label="Animation speed"
                value={anim.speed}
                onChange={anim.setSpeed}
                options={[
                  { value: 0.5, label: '0.5×' },
                  { value: 1, label: '1×' },
                  { value: 2, label: '2×' },
                ]}
              />
              <Button
                variant="primary"
                icon={anim.running ? 'stop' : 'play'}
                className={anim.running ? 'is-running' : 'pulse'}
                onClick={() => (anim.running ? anim.stop() : anim.run(L))}
              >
                {anim.running ? 'Stop' : 'Run Forward Propagation'}
              </Button>
            </>
          }
        >
          <NetworkViz
            sizes={net.sizes}
            params={net.params}
            result={net.result}
            selected={selected}
            onSelect={onSelect}
            shown={anim.shown}
            flow={anim.flow}
            running={anim.running}
            prefix="pg"
          />
          <div className="legend">
            <span><i className="dot" style={{ background: '#22d3ee' }} /> Positive weight</span>
            <span><i className="dot" style={{ background: '#f472b6' }} /> Negative weight</span>
            <span><i className="bar" /> Thicker line = larger |weight|</span>
            <span><i className="ring" style={{ borderColor: '#60a5fa' }} /> Input</span>
            <span><i className="ring" style={{ borderColor: '#a78bfa' }} /> Hidden</span>
            <span><i className="ring" style={{ borderColor: '#22d3ee' }} /> Output</span>
          </div>
        </Card>

        <div className="area-side">
          <InspectorPanel net={net} selected={selected} />
          <ConfigPanel net={net} />
        </div>

        <div className="area-out">
          <OutputPanel net={net} shown={anim.shown} />
        </div>
        <div className="area-log">
          <CalcLog net={net} shown={anim.shown} selected={selected} />
        </div>
      </div>
    </div>
  );
}
