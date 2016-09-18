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
    .map((key) => Math.pow(p1[key] - p2[key], 2))
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
      };
    }
  });
}

let dotProduct = (vector1, vector2) => {
  let dot = (v1, v2) => {
    return Object.keys(v1)
      .map((key) => v1[key] * v2[key])
      .reduce((l, r) => l + r);
  }

  return vector1.map((v, i) => {
      let temp = dot(v, vector2[i]);
      return temp;
    }).reduce((l, r) => l + r);
}

const SAMPLE_POINTS = 100;

let normalizeTime = (oldPath) => {
  let pathLength = getPathLength(oldPath);
  let step = pathLength * 1.0 / (SAMPLE_POINTS + 60);

  let oldPathIndex = 1;
  let newPath = [];
  newPath[0] = oldPath[0];

  for (let i = 0; i < SAMPLE_POINTS - 1; i++) {
    while (distance(newPath[i], oldPath[oldPathIndex]) < step) {
      oldPathIndex++;
      if (oldPathIndex === oldPath.length) {
        break;
      }
    }

    if (oldPathIndex === oldPath.length) {
      break
    }

    newPath.push(oldPath[oldPathIndex])
  }

  return newPath;
}

let toUnit = (vector) => {
  let length = Math.sqrt(Object.keys(vector)
      .map((key) => Math.pow(vector[key], 2))
      .reduce((l, r) => l + r));

  return {
    'x': vector['x'] * 1.0 / length,
    'y': vector['y'] * 1.0 / length,
    'z': vector['z'] * 1.0 / length,
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

  let dotProducts = dotProduct(p1_norm, p2_norm);

  return dotProducts
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

console.log(getSimilarity(attempt, lock) + " " + isCorrect(attempt, lock));
console.log(getSimilarity(wrongLock, lock) + " " + isCorrect(wrongLock, lock));
console.log(getSimilarity(attempt, wrongLock) + " " + isCorrect(attempt, wrongLock));
console.log(getSimilarity(lock, lock) + " " + isCorrect(lock, lock));

let attempt2 = require('../data/attempt2.json');
let wrongLock2 = require('../data/wrongLock2.json');
let lock2 = require('../data/lock2.json');

console.log(getSimilarity(attempt2, lock2) + " " + isCorrect(attempt2, lock2));
console.log(getSimilarity(wrongLock2, lock2) + " " + isCorrect(wrongLock2, lock2));
console.log(getSimilarity(attempt2, wrongLock2) + " " + isCorrect(attempt2, wrongLock2));
console.log(getSimilarity(lock, lock) + " " + isCorrect(lock, lock));


// print 'attempt, lock', getSimilarity(attempt, lock), isCorrect(attempt, lock)
// print 'wrongLock, lock', getSimilarity(wrongLock, lock), isCorrect(wrongLock, lock)
// print 'lock, lock', getSimilarity(lock, lock), isCorrect(lock, lock)
// print 'attempt, attempt2', getSimilarity(attempt, attempt2), isCorrect(attempt, attempt2)
// print 'lock2, attempt2', getSimilarity(lock2, attempt2), isCorrect(lock2, attempt2)
// print 'wrongLock2, lock2', getSimilarity(wrongLock2, lock2), isCorrect(wrongLock2, lock2)
// print 'lock2, lock2', getSimilarity(lock2, lock2), isCorrect(lock2, lock2)