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
  if (oldPath.length < SAMPLE_POINTS) {
    return oldPath;
  }

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
