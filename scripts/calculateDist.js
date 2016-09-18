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

const CORRECT_THRESHOLD = 45;

let isCorrect = (path1, path2) => {
  if (getSimilarity(path1, path2) > CORRECT_THRESHOLD) {
    return true
  } else {
    return false
  }
}

let isValidPath = (combinations, target) => {
  let numCorrect = combinations.filter(pattern => {
    let returnFlag = true;
    Object.keys(pattern).forEach(key => {
      if (!target.hasOwnProperty(key) ||
            !isCorrect(pattern[key], target[key])) {
        returnFlag = false;
      }
    })
    return returnFlag;
  }).length;

  return numCorrect === registrationPatterns.length
}


// let attempt = require('../data/attempt.json');
// let wrongLock = require('../data/wrongLock.json');
// let lock = require('../data/lock.json');

// console.log(getSimilarity(attempt, lock) + " " + isCorrect(attempt, lock));
// console.log(getSimilarity(wrongLock, lock) + " " + isCorrect(wrongLock, lock));
// console.log(getSimilarity(attempt, wrongLock) + " " + isCorrect(attempt, wrongLock));
// console.log(getSimilarity(lock, lock) + " " + isCorrect(lock, lock));

// let attempt2 = require('../data/attempt2.json');
// let wrongLock2 = require('../data/wrongLock2.json');
// let lock2 = require('../data/lock2.json');

// console.log(getSimilarity(attempt2, lock2) + " " + isCorrect(attempt2, lock2));
// console.log(getSimilarity(wrongLock2, lock2) + " " + isCorrect(wrongLock2, lock2));
// console.log(getSimilarity(attempt2, wrongLock2) + " " + isCorrect(attempt2, wrongLock2));
// console.log(getSimilarity(lock, lock) + " " + isCorrect(lock, lock));
