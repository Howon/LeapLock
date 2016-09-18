'use strict'

let express = require('express');
let path = require('path');
let app = express();
let http = require('http');
let server = http.createServer(app);
let io = require('socket.io').listen(server);
let config = require('./config/config')

// let serialPort = require("serialport");
// let arduinoPort = new serialPort(config.arduino.port, {
//   baudRate: 9600
// });
let openLock = require('./scripts/openLock');
// openLock.start(arduinoPort);

let firebase = require('firebase');
firebase.initializeApp(config.firebase);

let db = firebase.database();
let ref = db.ref("/patterns");

server.listen(config.port);
app.set('views', path.join(__dirname, 'public/views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public/static')));

require('./scripts/socket')(io, ref, openLock);
require('./routes/routes')(app);

console.log("*****************************");
console.log("* App running at port: " + config.port + " *");
console.log("*****************************");