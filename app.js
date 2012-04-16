
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


app.all('/*', function(req, res, next) {
 res.writeHead({"Access-Control-Allow-Origin": "*",
 	"Access-Control-Allow-Headers":"X-Requested-With",
    "Access-Control-Allow-Methods":"GET, PUT, POST, DELETE"}
 );
 next();
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
