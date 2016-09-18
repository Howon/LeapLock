'use strict'

let sendSignal = false;

module.exports = {
  listen: (port) => {
    port.on('open', function() {
      port.write('main screen turn on', function(err) {
        if (err) {
          return console.log('Error on write: ', err.message);
        }
        console.log('message written');
      });
    });

    setInterval(() => {
      if (sendSignal) {
        port.write('1', function(err) {
          if (err) {
            return console.log('Error on write: ', err.message);
          }
          sendSignal = false;
          console.log('message written');
        });
      }
    }, 1)
  },

  setSignal: (signal) => sendSignal = signal
}
