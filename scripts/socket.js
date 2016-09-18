'use strict'

let sampleJson = require('../data/samplePath');

module.exports = function(io, firebase) {
  io.on('connection', function(socket) {
    socket.on('verifyPatterns', function(data) {
      console.log(data);
    });
  });
}