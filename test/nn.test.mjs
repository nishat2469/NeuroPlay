import assert from 'node:assert/strict';
import { forward, sigmoid, relu, tanh, buildParams, countParams, countConnections, fmt } from '../src/nn.js';

const close = (a, b, eps = 1e-12) => assert.ok(Math.abs(a - b) < eps, `${a} !~ ${b}`);

// activations
close(sigmoid(0), 0.5);
close(sigmoid(2), 1 / (1 + Math.exp(-2)));
assert.equal(relu(-3), 0);
assert.equal(relu(2.5), 2.5);
close(tanh(0.5), (Math.exp(0.5) - Math.exp(-0.5)) / (Math.exp(0.5) + Math.exp(-0.5)));

// hand-calculated 2-2-1 network, ReLU
// h1 = relu(1*0.5 + 2*(-1) + 0.5) = relu(-1.0) = 0
// h2 = relu(0.5*0.5 + 1*(-1)... ) defined below
const params = {
  weights: [
    [[1, 2], [0.5, -1]], // layer0 -> layer1
    [[2, 3]],            // layer1 -> layer2
  ],
  biases: [[-0.5, 0.25], [0.1]],
};
const inputs = [0.5, 0.25];
// z1 = 1*0.5+2*0.25-0.5 = 0.5 ; z2 = 0.5*0.5-1*0.25+0.25 = 0.25
// relu: 0.5, 0.25 ; out z = 2*0.5+3*0.25+0.1 = 1.85
let r = forward(params, inputs, 'relu');
close(r.layers[1].sums[0], 1.0);
close(r.layers[1].z[0], 0.5);
close(r.layers[1].z[1], 0.25);
close(r.output[0], 1.85);

// sigmoid
r = forward(params, inputs, 'sigmoid');
const h1 = sigmoid(0.5), h2 = sigmoid(0.25);
close(r.output[0], sigmoid(2 * h1 + 3 * h2 + 0.1));

// tanh
r = forward(params, inputs, 'tanh');
close(r.output[0], Math.tanh(2 * Math.tanh(0.5) + 3 * Math.tanh(0.25) + 0.1));

// structure / determinism
const p1 = buildParams([3, 4, 2], 1);
const p2 = buildParams([3, 4, 2], 1);
assert.deepEqual(p1, p2);
assert.equal(countConnections([3, 4, 2]), 20);
assert.equal(countParams([3, 4, 2]), 26);
// resizing keeps existing values
const p3 = buildParams([3, 5, 2], 1, p1);
assert.equal(p3.weights[0][0][0], p1.weights[0][0][0]);
assert.equal(p3.weights[0].length, 5);
assert.equal(p3.weights[1][0].length, 5);
assert.equal(fmt(-0.0001), '0.00');
// negative pre-activation through ReLU gives 0
r = forward({ weights: [[[-1]]], biases: [[0]] }, [2], 'relu');
assert.equal(r.output[0], 0);
console.log('nn.js: all math tests passed');
