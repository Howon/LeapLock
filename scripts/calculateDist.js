'use strict'

let getPathLength = (path) => {
  return path.map((p, i) => {
    if (i === 0) {
      return 0;
    } else {
      return distance(p, path[i - 1]);
    }
  }).filter(x => x >= 0).reduce((l, r) => l + r);
}

let distance = (p1, p2) => {
  if (p1 === undefined || p2 === undefined) {
    return -1;
  }
  return Math.sqrt(
    Object.keys(p1)
    .map((key) => Math.pow(p1[key] - p1[key], 2))
    .reduce((l, r) => l + r));
}

let getVectors = (path) => {
  return path.map((p, i) => {
    if (i === 0) {
      return p;
    } else {
      return {
        'x': p['x'] - path[i - 1]['x'],
        'y': p['y'] - path[i - 1]['y'],
        'z': p['z'] - path[i - 1]['z']
      }
    }
  });
}

let dotProduct = (vector1, vector2) => {
  let minLen = Math.min(vector1.length, vector2.length);

  let dot = (v1, v2) => {
    return Object.keys(v1)
      .map((key) => v1[key] * v2[key])
      .reduce((l, r) => l + r);
  }

  return vector1.filter((v, i) => i < minLen)
    .map((v, i) => dot(v, vector2[i]))
    .reduce((l, r) => l + r);
}

const SAMPLE_POINTS = 100;

let normalizeTime = (oldPath) => {
  let pathLength = getPathLength(oldPath);
  let step = pathLength * 1.0 / (SAMPLE_POINTS + 60);

  let oldPathIndex = 1;
  return oldPath.map((vec, index) => {
    if (index === 0) {
      return vec;
    }

    while (distance(oldPath[index], oldPath[oldPathIndex]) < step) {
      oldPathIndex++;
      if (oldPathIndex === oldPath.length) {
        break;
      }
    }

    if (oldPathIndex === oldPath.length) {
      return null;
    }

    return oldPath[oldPathIndex];
  }).filter(x => x !== null);
}

let toUnit = (vector) => {
  let length = Object.keys(vector)
      .map((key) => Math.pow(vector[key], 2))
      .reduce((l, r) => l + r);

  return {
    'x': vector['x'] / length,
    'y': vector['y'] / length,
    'z': vector['z'] / length,
  }
}

let normalizeVectors = (vectors) => {
  return vectors.map(vector => toUnit(vector));
}

let totalNormalize = (path) => {
  let normalized = normalizeTime(path);
  let vec = getVectors(normalized);
  return normalizeVectors(vec);
}

let getSimilarity = (path1, path2) => {
  let p1_norm = totalNormalize(path1);
  let p2_norm = totalNormalize(path2);
  return dotProduct(p1_norm, p2_norm);
}

const CORRECT_THRESHOLD = 45;

let isCorrect = (path1, path2) => {
  // # ser = serial.Serial('/dev/tty.usbmodem1411', 9600)
  // # ser.close()
  // # ser.open()

  if (getSimilarity(path1, path2) > CORRECT_THRESHOLD) {
    // # ser.write('1')
    return 1
  } else {
    // # ser.write('0')
    return 0
  }
}

let attempt = require('../data/attempt.json');
let wrongLock = require('../data/wrongLock.json');
let lock = require('../data/lock.json');

console.log(getSimilarity(attempt, lock));// + " " + isCorrect(attempt, lock));
// console.log(getSimilarity(wrongLock, lock) + " " + isCorrect(wrongLock, lock));
// console.log(getSimilarity(attempt, wrongLock) + " " + isCorrect(attempt, wrongLock));

// let attempt2 = require('../data/attempt2.json');
// let wrongLock2 = require('../data/wrongLock2.json');
// let lock2 = require('../data/lock2.json');

// console.log(getSimilarity(attempt2, lock2) + " " + isCorrect(attempt2, lock2));
// console.log(getSimilarity(wrongLock2, lock2) + " " + isCorrect(wrongLock2, lock2));
// console.log(getSimilarity(attempt2, wrongLock2) + " " + isCorrect(attempt2, wrongLock2));


// print 'attempt, lock', getSimilarity(attempt, lock), isCorrect(attempt, lock)
// print 'wrongLock, lock', getSimilarity(wrongLock, lock), isCorrect(wrongLock, lock)
// print 'lock, lock', getSimilarity(lock, lock), isCorrect(lock, lock)
// print 'attempt, attempt2', getSimilarity(attempt, attempt2), isCorrect(attempt, attempt2)
// print 'lock2, attempt2', getSimilarity(lock2, attempt2), isCorrect(lock2, attempt2)
// print 'wrongLock2, lock2', getSimilarity(wrongLock2, lock2), isCorrect(wrongLock2, lock2)
// print 'lock2, lock2', getSimilarity(lock2, lock2), isCorrect(lock2, lock2)