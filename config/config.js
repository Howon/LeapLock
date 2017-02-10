module.exports = {
  port: process.env.PORT || 3000,
  firebase : {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    storageBucket: "",
    messagingSenderId: ""
  },
  arduino: {
    port: "/dev/tty.usbmodem1421"
  }
};
