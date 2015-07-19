var express = require('express');
var path = require('path');
var app = express();
var http = require('http');
var server = http.createServer(app);
var config = require('./scripts/config')

server.listen(config.port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));

require('./scripts/routes/routes')(app)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

console.log("*****************************");
console.log("* App running at port: " + config.port + " *");
console.log("*****************************");