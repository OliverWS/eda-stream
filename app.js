
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http');

var app = express();
var io = require('socket.io').listen(app);

var clients = [];

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.static(__dirname + '/public'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
});

io.configure('production', function(){
  io.enable('browser client etag');
  io.set('log level', 1);

  io.set('transports', [
    'websocket'
  , 'flashsocket'
  , 'htmlfile'
  , 'xhr-polling'
  , 'jsonp-polling'
  ]);
});

io.sockets.on('connection', function (socket) {
  clients.push(socket);
  socket.emit('start', { message: 'Starting...' });
  socket.on('message', function (data) {
    console.log(data);
  });
});

app.get('/', routes.index);
app.post('/', function(req, res){
  console.log(req.body);
  res.send(req.body);
  for(var i=0; i < clients.length; i++){
      clients[i].emit('packet', req.body);
  }
});

http.createServer(app).listen(80);

console.log("Express server listening on port 80");
