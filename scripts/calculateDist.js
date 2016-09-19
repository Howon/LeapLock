'use strict'

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

let getSimilarity = (path1, path2) => {
  return dotProduct(path1, path2);
}

const CORRECT_THRESHOLD = 65;

let isCorrect = (path1, path2) => {
  if (getSimilarity(path1, path2) > CORRECT_THRESHOLD) {
    return true
  } else {
    return false
  }
}

module.exports = {
  isValidPath: (combinations, target) => {
    let numCorrect = Object.keys(combinations).map(key => combinations[key]).filter(pattern => {
      let returnFlag = true;
      pattern.forEach((key, i) => {
        if (!isCorrect(key, target[i])) {
          returnFlag = false;
        }
      })
      return returnFlag;
    }).length;
    return numCorrect > 0;
  }
}
