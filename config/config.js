module.exports = {
  port: process.env.PORT || 3000,
  firebase : {
    apiKey: "AIzaSyD6X9k5sDq87I0-N06kQ0p9kQrGzf8p0D0",
    authDomain: "leaplock-c39f3.firebaseapp.com",
    databaseURL: "https://leaplock-c39f3.firebaseio.com",
    storageBucket: "leaplock-c39f3.appspot.com",
    messagingSenderId: "491550473452"
  },
  arduino: {
    port: "/dev/tty.usbmodem1421"
  }
};
