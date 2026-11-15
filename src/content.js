import { sigmoid, relu, tanh, fmt } from './nn.js';

export const ACT_INFO = {
  sigmoid: {
    id: 'sigmoid',
    name: 'Sigmoid',
    symbol: 'σ',
    formula: 'σ(x) = 1 / (1 + e^(−x))',
    range: '(0, 1)',
    tagline: 'Squashes any number into a value between 0 and 1.',
    explain:
      'Very large positive inputs give an answer close to 1, very large negative inputs give an answer close to 0, and an input of 0 gives exactly 0.5. Think of it as a smooth dial that turns any score into something like a probability.',
    pros: ['Smooth and easy to understand', 'Output looks like a probability (0 to 1)'],
    cons: ['Flattens out at both ends, so learning slows down', 'Never produces negative numbers'],
    usedFor: 'Output layers that answer yes/no questions.',
  },
  relu: {
    id: 'relu',
    name: 'ReLU',
    symbol: 'ReLU',
    formula: 'ReLU(x) = max(0, x)',
    range: '[0, ∞)',
    tagline: 'Blocks negative numbers and lets positive numbers pass through unchanged.',
    explain:
      'If the input is negative, the neuron stays silent (outputs 0). If it is positive, the neuron passes the number straight through. It works like a one-way valve, and it is wonderfully cheap to compute.',
    pros: ['Extremely fast and simple', 'Does not flatten out for positive inputs'],
    cons: ['A neuron stuck at negative inputs outputs 0 forever ("dead neuron")', 'Output can grow very large'],
    usedFor: 'Hidden layers in most modern neural networks.',
  },
  tanh: {
    id: 'tanh',
    name: 'Tanh',
    symbol: 'tanh',
    formula: 'tanh(x) = (e^x − e^(−x)) / (e^x + e^(−x))',
    range: '(−1, 1)',
    tagline: 'Squashes any number into a value between −1 and 1.',
    explain:
      'Tanh is like sigmoid but centred on zero. Negative inputs give negative outputs, positive inputs give positive outputs, and 0 gives exactly 0. That balance around zero often helps hidden layers.',
    pros: ['Centred around zero', 'Smooth, with a clear "negative vs positive" signal'],
    cons: ['Flattens out at both ends, so learning slows down'],
    usedFor: 'Hidden layers, especially in smaller or older networks.',
  },
};
export const ACT_ORDER = ['sigmoid', 'relu', 'tanh'];

export const GRAPH_CFG = {
  sigmoid: { x: [-6, 6], y: [-0.25, 1.25], xt: [-6, -3, 0, 3, 6], yt: [0, 0.5, 1] },
  relu: { x: [-4, 4], y: [-1, 4], xt: [-4, -2, 0, 2, 4], yt: [0, 1, 2, 3, 4] },
  tanh: { x: [-4, 4], y: [-1.5, 1.5], xt: [-4, -2, 0, 2, 4], yt: [-1, 0, 1] },
};

const act = { sigmoid, relu, tanh };

// Worked examples are computed with the real functions, never typed in by hand.
const x1 = 2, x2 = 3, w1 = 0.5, w2 = -0.4, b = 0.1;
const sum = w1 * x1 + w2 * x2;
const z = sum + b;

export const CONCEPTS = [
  {
    key: 'neuron',
    icon: 'neuron',
    title: 'What is a neuron?',
    short: 'A tiny calculator that takes in numbers, mixes them, and passes one number on.',
    analogy:
      'Imagine a judge on a talent show. Several things come in (singing, dancing, stage presence), the judge cares about some more than others, adds a personal mood, and then gives one final score.',
    points: [
      'It receives one or more input numbers.',
      'It multiplies each input by a weight and adds them up.',
      'It adds a bias, then applies an activation function.',
      'The result is sent to every neuron in the next layer.',
    ],
    example: () =>
      `Inputs ${x1} and ${x2} go in. After weights, bias and activation, one number comes out: sigmoid(${fmt(z, 2)}) = ${fmt(sigmoid(z), 3)}.`,
  },
  {
    key: 'weights',
    icon: 'weight',
    title: 'What are weights?',
    short: 'Weights decide how much each input matters.',
    analogy:
      'Deciding whether to go to the beach: sunshine matters a lot (big weight), but a slightly late bus matters less (small weight). A negative weight means "this makes me less likely to go".',
    points: [
      'A big positive weight means "this input pushes the neuron to fire".',
      'A negative weight means "this input pushes the neuron to stay quiet".',
      'A weight near 0 means "ignore this input".',
      'Learning a network means finding good weights (this playground lets you set them by hand).',
    ],
    example: () =>
      `With weights ${w1} and ${w2}: ${x1} × ${w1} = ${fmt(x1 * w1, 2)} and ${x2} × (${w2}) = ${fmt(x2 * w2, 2)}. Weighted sum = ${fmt(sum, 2)}.`,
  },
  {
    key: 'bias',
    icon: 'bias',
    title: 'What are biases?',
    short: 'A bias is an extra number added to shift how easily a neuron fires.',
    analogy:
      'A bias is like a head start in a race. A positive bias makes the neuron easier to activate even when the inputs are small; a negative bias makes it harder.',
    points: [
      'It is added after the weighted sum.',
      'It lets a neuron produce a non-zero output even when every input is 0.',
      'Every neuron has its own bias.',
    ],
    example: () =>
      `Weighted sum ${fmt(sum, 2)} + bias ${b} = ${fmt(z, 2)}. This value is called z, the pre-activation.`,
  },
  {
    key: 'activation',
    icon: 'wave',
    title: 'What is an activation function?',
    short: 'A rule that turns the neuron’s raw score z into its final output.',
    analogy:
      'Think of a volume knob with limits. Whatever the raw score is, the activation function decides how loud the neuron actually speaks: it might squash it into a fixed range or switch it off completely.',
    points: [
      'Sigmoid squashes the score into 0 – 1.',
      'ReLU keeps positive scores and turns negative ones into 0.',
      'Tanh squashes the score into −1 – 1.',
      'Without activation functions, many layers would collapse into one simple straight-line formula. They give the network its power.',
    ],
    example: () =>
      `For z = ${fmt(z, 2)}: sigmoid → ${fmt(sigmoid(z), 3)}, ReLU → ${fmt(relu(z), 3)}, tanh → ${fmt(tanh(z), 3)}.`,
  },
  {
    key: 'forward',
    icon: 'flow',
    title: 'What is forward propagation?',
    short: 'Sending the input through the network, layer by layer, to get an answer.',
    analogy:
      'Like an assembly line: raw material enters at one end, each station (layer) transforms it, and a finished product comes out at the other end.',
    points: [
      'Start with the input values.',
      'For each neuron in the next layer: weighted sum, add bias, apply activation.',
      'Repeat for every layer until you reach the output layer.',
      'The numbers in the output layer are the network’s answer.',
    ],
    example: () =>
      'Press "Run Forward Propagation" in the Network Playground to watch the numbers move through every layer.',
  },
];

export const FORWARD_STEPS = [
  ['Take the inputs', 'The input layer simply holds your input numbers x₁, x₂, x₃…'],
  ['Weighted sum', 'Every neuron multiplies each incoming value by the weight on its connection and adds the results: Σ = w₁·a₁ + w₂·a₂ + …'],
  ['Add the bias', 'Each neuron adds its own bias: z = Σ + b.'],
  ['Apply the activation', 'The activation function turns z into the neuron’s output: a = f(z).'],
  ['Repeat until the output', 'The outputs of one layer become the inputs of the next. The last layer’s outputs are the final answer.'],
];

export { act };
