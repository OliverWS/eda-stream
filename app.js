
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http');

var app = express();
var io = require('socket.io').listen(8080);
var n = 0;
var clients = new Array();

app.use(express.methodOverride());

// ## CORS middleware
// 
// see: http://stackoverflow.com/questions/7067966/how-to-allow-cors-in-express-nodejs
var allowCrossDomain = function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', (req.headers.origin || "*"));
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.static(__dirname + '/public'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(allowCrossDomain);
  
});



io.configure('production', function(){
  io.enable('browser client etag');
  io.set('log level', 1);

  io.enable('browser client minification');  // send minified client
  io.enable('browser client etag');          // apply etag caching logic based on version number
  io.enable('browser client gzip');          // gzip the file
  io.set('log level', 1);                    // reduce logging
  io.set('transports', [                     // enable all transports (optional if you want flashsocket)
      'websocket'
    , 'flashsocket'
    , 'htmlfile'
    , 'xhr-polling'
    , 'jsonp-polling'
  ]);
});




io.sockets.on('connection', function (socket) {
  clients.push(socket);
  console.log("Clients: " + clients.toString());
  socket.emit('start', { message: 'Starting...' });
  socket.on('disconnect', function (socket) {
  	console.log("Received disconnect");
  });
  
});


app.get('/', routes.index);
app.post('/', function(req, res){
  console.log(req.body);
  res.send(req.body);
  socket.broadcast.emit(req.body);
});

http.createServer(app).listen(80);

console.log("Express server listening on port 80");
