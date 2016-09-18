'use strict'

let sampleJson = require('../data/samplePath');
let exec = require('child_process').execFile;
let fs = require('fs');

let patterns = null;

module.exports = (io, patternRef, openLock) => {
  if (!patterns) {
      patternRef.on("value", function(snapShot) {
      let tempPatterns = snapShot.val();
      if (tempPatterns) {
        patterns = tempPatterns;
      }
    }, function(err) {
      console.log("The read failed: " + err.code);
    });
  }

  io.on('connection', function(socket) {
    patternRef.on("child_added", (snapShot) => {
      patterns = snapShot;
      fs.writeFile('samplePath2.json', JSON.stringify(snapShot.val()), (err) => {
        if (err) {
          return console.log(err);
        }

        exec('./script.sh', (err, data) => {
          console.log("The file samplePath2 was saved!");
        });
      });
    });

    socket.on('verifyPatterns', function(data) {
      // openLock.controlOpening(true);
      socket.emit('returnVerification', {
        isValid: true
      })
    });

    socket.on('registerPatterns', function(data) {
      let patternSavePromises = data.map(pattern => {
        return new Promise((resolved, rejected) => {
          patternRef.push().set(pattern, (err) => {
            if (err)
              return rejected(err);
            resolved("success");
          });
        }).then(resolved => {
          console.log("pattern saved!");
        }).catch(error => {
          console.log("pattern save failed");
        })
      })

      Promise.all(patternSavePromises)
      .then(resolved => {
          console.log("all pattern saved");
      }).catch(error => {
          console.log("some patterns did not save");

      })
    });
  });
}

// ref.on("child_added", (snapShot) => {
//   fs.writeFile('samplePath2.json', JSON.stringify(snapShot.val()), (err) => {
//     if (err) {
//       return console.log(err);
//     }

//     exec('./script.sh', (err, data) => {
//       console.log(err);
//       console.log(data.toString());
//     console.log("The file samplePath2 was saved!");
//     });
//   });
// });