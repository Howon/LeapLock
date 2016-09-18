'use strict'

let exec = require('child_process').execFile;
let fs = require('fs');
let distCalc = require('./calculateDist');

let patterns = null;
let validAttempts = [];
let invalidAttempts = [];
let patternsAdded = false;
let path = require('path');

let saveToJson = (lockName, json, cb) => {
  fs.stat(lockName, function(err, stat) {
    if (err === null) {
      console.log('File exists');
    } else if (err.code === 'ENOENT') {
      fs.writeFile(path.join(__dirname, lockName), JSON.stringify(json), (err) => {
        if (err) {
          return console.log(err);
        }
      });
    }
  });
}

const DATA_DIR = "../data/";
const LOCK_JSON_NAME = DATA_DIR + "lock.json";
const VALID_ATTEMPT_NAME = DATA_DIR + "validAttempts.json"
const INVALID_ATTEMPT_NAME = DATA_DIR + "invalidAttempts.json"

module.exports = (io, patternRef, openLock) => {
  if (!patterns) {
    patternRef.on("value", (snapShot) => {
      let tempPatterns = snapShot.val();
      if (tempPatterns) {
        patterns = tempPatterns;
        saveToJson(LOCK_JSON_NAME, patterns);
      }
    }, (err) => {
      console.log("The read failed: " + err.code);
    });
  }

  io.on('connection', (socket) => {
    patternRef.on("child_added", (snapShot) => {
      if (patternsAdded) {
        patterns = snapShot.val();
        saveToJson(LOCK_JSON_NAME, patterns);
      }
    });

    socket.on('verifyPatterns', (data) => {
      if (distCalc.isValidPath(patterns, data)) {
        openLock.controlOpening(true);
        validAttempts.push(data);
        saveToJson(VALID_ATTEMPT_NAME, validAttempts);
        socket.emit('returnVerification', {
          isValid: true
        });
      } else {
        invalidAttempts.push(data);
        saveToJson(INVALID_ATTEMPT_NAME, invalidAttempts);
        socket.emit('returnVerification', {
          isValid: false
        });
      }
    });

    socket.on('registerPatterns', (data) => {
      let patternSavePromises = data.map(pattern => {
        return new Promise((resolved, rejected) => {
          patternRef.push().set(pattern, (err) => {
            if (err)
              return rejected(err);
            resolved("success");
          });
        }).then(resolved => {
          patternsAdded = true;
          console.log("pattern saved");
        }).catch(error => {
          console.log("pattern save failed");
        })
      })

      Promise.all(patternSavePromises)
        .then(resolved => {
          console.log("all pattern saved");
          console.log(patternsAdded);
        }).catch(error => {
          console.log("some patterns did not save");
        })
    });
  });
}