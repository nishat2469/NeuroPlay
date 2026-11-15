import React, { useCallback, useEffect, useState } from 'react';
import Sidebar, { Brand } from './components/Sidebar.jsx';
import Overview from './views/Overview.jsx';
import Playground from './views/Playground.jsx';
import Activations from './views/Activations.jsx';
import Learn from './views/Learn.jsx';
import useNetwork from './hooks/useNetwork.js';
import useForwardAnimation from './hooks/useForwardAnimation.js';

const VIEWS = ['overview', 'playground', 'activations', 'learn'];
const fromHash = () => {
  try {
    const h = window.location.hash.replace('#', '');
    return VIEWS.includes(h) ? h : 'overview';
  } catch {
    return 'overview';
  }
};

export default function App() {
  const net = useNetwork();
  const anim = useForwardAnimation();
  const [view, setView] = useState(fromHash);
  const [selected, setSelected] = useState({ layer: 1, idx: 0 });
  const [pendingRun, setPendingRun] = useState(false);

  const navigate = useCallback((id, opts = {}) => {
    setView(id);
    if (opts.run) setPendingRun(true);
    try {
      window.location.hash = id;
    } catch {
      /* hash routing is optional */
    }
  }, []);

  useEffect(() => {
    const onHash = () => setView(fromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    try {
      window.scrollTo(0, 0);
    } catch {
      /* ignore */
    }
  }, [view]);

  // a structural change invalidates any running animation: show live values instead
  const shape = net.sizes.join('-');
  useEffect(() => {
    anim.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shape]);

  // keep the selected neuron valid after the network is resized
  const L = net.sizes.length;
  const sel = {
    layer: Math.min(selected.layer, L - 1),
    idx: Math.min(selected.idx, net.sizes[Math.min(selected.layer, L - 1)] - 1),
  };

  return (
    <div className="app">
      <Sidebar view={view} onNavigate={navigate} />
      <main className="main">
        <div className="mobile-brand">
          <Brand />
        </div>
        {view === 'overview' && <Overview net={net} onNavigate={navigate} />}
        {view === 'playground' && (
          <Playground
            net={net}
            anim={anim}
            selected={sel}
            onSelect={setSelected}
            pendingRun={pendingRun}
            clearPendingRun={() => setPendingRun(false)}
          />
        )}
        {view === 'activations' && <Activations net={net} />}
        {view === 'learn' && <Learn net={net} onNavigate={navigate} />}
      </main>
    </div>
  );
}
