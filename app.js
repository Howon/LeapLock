'use strict'
let express = require('express');
let path = require('path');
let app = express();
let http = require('http');
let server = http.createServer(app);
let io = require('socket.io').listen(server);
let config = require('./config/config')
let firebase = require('firebase');

firebase.initializeApp(config.firebaseConfig);

server.listen(config.port);
app.set('views', path.join(__dirname, 'public/views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public/static')));

require('./scripts/socket')(io, firebase);
require('./routes/routes')(app);

console.log("*****************************");
console.log("* App running at port: " + config.port + " *");
console.log("*****************************");