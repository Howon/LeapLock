var express = require('express');
var path = require('path');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var config = require('./config/config')
var exec = require('child_process').execFile;

io.on('connection', function(socket){
  console.log('a user connected');
  exec('./script.sh', function(err, data) {
    console.log(err);
    console.log(data.toString());
  });
});

server.listen(config.port);
app.set('views', path.join(__dirname, 'public/views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public/static')));

require('./routes/routes')(app)

console.log("*****************************");
console.log("* App running at port: " + config.port + " *");
console.log("*****************************");