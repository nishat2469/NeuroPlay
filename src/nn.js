// Pure neural-network math for NeuroPlay. No React, no randomness at calculation time.

export const LIMITS = {
  inputs: [1, 5],
  hidden: [1, 6],
  outputs: [1, 4],
  hiddenLayers: [1, 4],
};
export const DEFAULT_SIZES = [3, 4, 2];
export const DEFAULT_INPUTS = [0.5, 0.8, -0.3, 0.2, 0.9];

/* ---------- activation functions ---------- */
export const sigmoid = (x) => 1 / (1 + Math.exp(-x));
export const relu = (x) => (x > 0 ? x : 0);
export const tanh = (x) => Math.tanh(x);

export const ACT_FN = { sigmoid, relu, tanh };
export const ACT_DERIV = {
  sigmoid: (x) => {
    const s = sigmoid(x);
    return s * (1 - s);
  },
  relu: (x) => (x > 0 ? 1 : 0),
  tanh: (x) => {
    const t = Math.tanh(x);
    return 1 - t * t;
  },
};
export const activate = (id, x) => ACT_FN[id](x);

/* ---------- deterministic starting parameters ---------- */
// A seeded hash gives repeatable starting weights ("Randomize" just changes the seed).
function hash(a, b, c, seed) {
  const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7 + seed * 53.3 + 1.234) * 43758.5453;
  return (s - Math.floor(s)) * 2 - 1; // [-1, 1)
}
const quant = (v) => Math.round(v * 20) / 20 + 0; // multiples of 0.05, no -0
export const initWeight = (l, j, i, seed) => quant(hash(l + 1, j + 1, i + 1, seed));
export const initBias = (l, j, seed) => quant(hash(l + 7, j + 1, 0.5, seed) * 0.5);

/**
 * params.weights[l][j][i] = weight from neuron i of layer l to neuron j of layer l+1
 * params.biases[l][j]     = bias of neuron j in layer l+1
 * Existing values are kept when the network is resized.
 */
export function buildParams(sizes, seed, old = null) {
  const weights = [];
  const biases = [];
  for (let l = 0; l < sizes.length - 1; l++) {
    const W = [];
    const B = [];
    for (let j = 0; j < sizes[l + 1]; j++) {
      const row = [];
      for (let i = 0; i < sizes[l]; i++) {
        const prev = old?.weights?.[l]?.[j]?.[i];
        row.push(prev !== undefined ? prev : initWeight(l, j, i, seed));
      }
      W.push(row);
      const pb = old?.biases?.[l]?.[j];
      B.push(pb !== undefined ? pb : initBias(l, j, seed));
    }
    weights.push(W);
    biases.push(B);
  }
  return { weights, biases };
}

/* ---------- forward propagation ---------- */
/**
 * layers[0].a = inputs
 * layers[l] (l >= 1): terms[j][i] = w*a_prev, sums[j] = Σ terms, z[j] = sums + bias, a[j] = f(z)
 */
export function forward(params, inputs, actId) {
  const f = ACT_FN[actId];
  const layers = [{ a: inputs.slice() }];
  for (let l = 0; l < params.weights.length; l++) {
    const prev = layers[l].a;
    const W = params.weights[l];
    const B = params.biases[l];
    const terms = [];
    const sums = [];
    const z = [];
    const a = [];
    for (let j = 0; j < W.length; j++) {
      const t = W[j].map((w, i) => w * prev[i]);
      const s = t.reduce((acc, v) => acc + v, 0);
      const zj = s + B[j];
      terms.push(t);
      sums.push(s);
      z.push(zj);
      a.push(f(zj));
    }
    layers.push({ terms, sums, z, a });
  }
  return { layers, output: layers[layers.length - 1].a };
}

/* ---------- helpers ---------- */
export const countNeurons = (sizes) => sizes.reduce((a, b) => a + b, 0);
export const countConnections = (sizes) =>
  sizes.slice(0, -1).reduce((acc, n, l) => acc + n * sizes[l + 1], 0);
export const countParams = (sizes) =>
  countConnections(sizes) + sizes.slice(1).reduce((a, b) => a + b, 0);

export function fmt(n, d = 2) {
  if (!Number.isFinite(n)) return '—';
  const v = Number(n.toFixed(d));
  return (Object.is(v, -0) ? 0 : v).toFixed(d);
}

export const layerTitle = (sizes, l) =>
  l === 0 ? 'Input Layer' : l === sizes.length - 1 ? 'Output Layer' : `Hidden Layer ${l}`;

export const neuronName = (sizes, l, i) =>
  l === 0 ? `x${i + 1}` : l === sizes.length - 1 ? `y${i + 1}` : `h${l}.${i + 1}`;

export const layerKind = (sizes, l) =>
  l === 0 ? 'input' : l === sizes.length - 1 ? 'output' : 'hidden';
