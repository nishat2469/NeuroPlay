import { useCallback, useMemo, useState } from 'react';
import { DEFAULT_INPUTS, DEFAULT_SIZES, LIMITS, buildParams, forward } from '../nn.js';

const clamp = (v, [lo, hi]) => Math.max(lo, Math.min(hi, v));
const round2 = (v) => Math.round(v * 100) / 100 + 0;

function initial() {
  const sizes = DEFAULT_SIZES.slice();
  return { sizes, params: buildParams(sizes, 1), inputs: DEFAULT_INPUTS.slice(0, sizes[0]), seed: 1 };
}

// structure + parameters + inputs live in ONE state object so they can never disagree
function resized(n, sizes) {
  return {
    ...n,
    sizes,
    params: buildParams(sizes, n.seed, n.params),
    inputs: Array.from({ length: sizes[0] }, (_, i) => n.inputs[i] ?? DEFAULT_INPUTS[i]),
  };
}

export default function useNetwork() {
  const [net, setNet] = useState(initial);
  const [activation, setActivation] = useState('sigmoid');

  const result = useMemo(
    () => forward(net.params, net.inputs, activation),
    [net.params, net.inputs, activation]
  );

  const setLayerSize = useCallback((idx, size) => {
    setNet((n) => {
      const last = n.sizes.length - 1;
      const lim = idx === 0 ? LIMITS.inputs : idx === last ? LIMITS.outputs : LIMITS.hidden;
      const v = clamp(size, lim);
      if (v === n.sizes[idx]) return n;
      const sizes = n.sizes.slice();
      sizes[idx] = v;
      return resized(n, sizes);
    });
  }, []);

  const addHiddenLayer = useCallback(() => {
    setNet((n) => {
      if (n.sizes.length - 2 >= LIMITS.hiddenLayers[1]) return n;
      const sizes = [...n.sizes.slice(0, -1), 3, n.sizes[n.sizes.length - 1]];
      return resized(n, sizes);
    });
  }, []);

  const removeHiddenLayer = useCallback((idx) => {
    setNet((n) => {
      if (n.sizes.length - 2 <= LIMITS.hiddenLayers[0]) return n;
      if (idx < 1 || idx > n.sizes.length - 2) return n;
      const sizes = n.sizes.filter((_, i) => i !== idx);
      return resized(n, sizes);
    });
  }, []);

  const setWeight = useCallback((l, j, i, v) => {
    setNet((n) => {
      const weights = n.params.weights.map((W, a) =>
        a !== l ? W : W.map((row, b) => (b !== j ? row : row.map((w, c) => (c !== i ? w : round2(v)))))
      );
      return { ...n, params: { ...n.params, weights } };
    });
  }, []);

  const setBias = useCallback((l, j, v) => {
    setNet((n) => {
      const biases = n.params.biases.map((B, a) => (a !== l ? B : B.map((b, c) => (c !== j ? b : round2(v)))));
      return { ...n, params: { ...n.params, biases } };
    });
  }, []);

  const setInput = useCallback((i, v) => {
    setNet((n) => ({ ...n, inputs: n.inputs.map((x, k) => (k === i ? round2(v) : x)) }));
  }, []);

  const randomize = useCallback(() => {
    setNet((n) => ({ ...n, seed: n.seed + 1, params: buildParams(n.sizes, n.seed + 1) }));
  }, []);

  const reset = useCallback(() => {
    setNet(initial());
    setActivation('sigmoid');
  }, []);

  return {
    ...net,
    activation,
    setActivation,
    result,
    setLayerSize,
    addHiddenLayer,
    removeHiddenLayer,
    setWeight,
    setBias,
    setInput,
    randomize,
    reset,
  };
}
