'use strict'

let sampleJson = require('../data/samplePath');
let exec = require('child_process').execFile;
let fs = require('fs');


module.exports = (io, ref, openLock) => {
  // ref.on("child_added", (snapshot) => {
  //   fs.writeFile('samplePath2.json', JSON.stringify(snapshot.val()), (err) => {
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

  io.on('connection', function(socket) {
    socket.on('verifyPatterns', function(data) {
      // openLock.controlOpening(true);
        socket.emit('returnVerification', {
          isValid: true
        })
    });
  });
}