'use strict'

let totalNormalize = (path) => {
  let vec = getVectors(path);
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