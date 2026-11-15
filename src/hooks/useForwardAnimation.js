import { useCallback, useEffect, useRef, useState } from 'react';

// shown = { layer, stage }. Layers below `layer` are fully revealed; `layer` is revealed up to `stage`:
// 0 = hidden, 1 = weighted sums, 2 = + bias (z), 3 = activated (a). Infinity = everything shown.
export const SHOW_ALL = { layer: Infinity, stage: 3 };

export function stageFor(shown, l) {
  if (l === 0) return 3;
  if (l < shown.layer) return 3;
  if (l > shown.layer) return 0;
  return shown.stage;
}

export const STAGE_LABELS = [
  'Signals flowing in…',
  'Calculating weighted sums  Σ w·a',
  'Adding biases  z = Σ + b',
  'Applying activation  a = f(z)',
];

const tween = (ms, onFrame, alive) =>
  new Promise((resolve) => {
    const t0 = performance.now();
    const tick = (t) => {
      if (!alive()) return resolve(false);
      const p = Math.min(1, (t - t0) / ms);
      onFrame(p);
      if (p < 1) requestAnimationFrame(tick);
      else resolve(true);
    };
    requestAnimationFrame(tick);
  });

const sleep = (ms, alive) => new Promise((resolve) => setTimeout(() => resolve(alive()), ms));

export default function useForwardAnimation() {
  const [shown, setShown] = useState(SHOW_ALL);
  const [flow, setFlow] = useState(null); // { layer, p } while signals travel into `layer`
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const token = useRef(0);
  const speedRef = useRef(1);
  speedRef.current = speed;

  const stop = useCallback(() => {
    token.current += 1;
    setRunning(false);
    setFlow(null);
    setShown(SHOW_ALL);
  }, []);

  const run = useCallback(async (layerCount) => {
    const id = ++token.current;
    const alive = () => token.current === id;
    const s = () => 1 / speedRef.current;
    setRunning(true);
    setShown({ layer: 1, stage: 0 });
    await sleep(250 * s(), alive);
    for (let l = 1; l < layerCount; l++) {
      if (!alive()) return;
      setShown({ layer: l, stage: 0 });
      if (!(await tween(1000 * s(), (p) => setFlow({ layer: l, p }), alive))) return;
      setFlow(null);
      setShown({ layer: l, stage: 1 });
      if (!(await sleep(650 * s(), alive))) return;
      setShown({ layer: l, stage: 2 });
      if (!(await sleep(650 * s(), alive))) return;
      setShown({ layer: l, stage: 3 });
      if (!(await sleep(550 * s(), alive))) return;
    }
    if (!alive()) return;
    setShown(SHOW_ALL);
    setFlow(null);
    setRunning(false);
  }, []);

  useEffect(
    () => () => {
      token.current += 1;
    },
    []
  );

  return { shown, flow, running, speed, setSpeed, run, stop };
}
