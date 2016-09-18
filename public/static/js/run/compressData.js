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
    return dot(v, vector2[i]);
  }).reduce((l, r) => l + r);
}

const SAMPLE_POINTS = 100;

let normalizeTime = (oldPath) => {
  let samplePoints = Math.min(oldPath.length, SAMPLE_POINTS);
  let pathLength = getPathLength(oldPath);
  let step = pathLength * 1.0 / (samplePoints + 60);

  let oldPathIndex = 1;
  let newPath = [];
  newPath[0] = oldPath[0];

  for (let i = 0; i < samplePoints - 1; i++) {
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

let normalizeVectors = (vectors) => vectors.map(vec => toUnit(vec));

let getSimilarity = (path1, path2) => {
  return dotProduct(path1, path2);
}

const CORRECT_THRESHOLD = 45;

let isCorrect = (path1, path2) => {
  if (getSimilarity(path1, path2) > CORRECT_THRESHOLD) {
    return true
  } else {
    return false
  }
}