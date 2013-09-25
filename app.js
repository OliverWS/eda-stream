
/**
 * Module dependencies.
 */

var express = require('express');
var sys = require('sys');
var logging = require('node-logging');
logging.setLevel('error');

var app = express.createServer();
console.log("ENV.PORT=" + process.env.PORT);
app.listen(process.env.PORT || 3001);
app.use(logging.requestLogger);
app.use(express.compress());
app.use(express.errorHandler({
  dumpExceptions: true, 
  showStack: true
}));

var io = require('socket.io').listen(app, { log: false });

var eda_cache = {};
var NUM_SAMPLES_TO_STORE = 8*10;

app.use(express.static(__dirname + '/public'));

app.get("/stream/:id", function(req, res) {
    console.log(req.params.id);
    res.sendfile(__dirname + '/public/' + "index.html");
});






io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});


io.sockets.on('connection', function (socket) { 
    console.log("Socket connected! ");
    socket.on('packet', function (data) {
      try {
		console.log("Recieved Packet: " + data);
		var packet = JSON.parse(data);
      	if (!eda_cache.hasOwnProperty(packet.id)) {
      		eda_cache[packet.id] = new Array();
      	}
      	if (eda_cache[packet.id].length >= NUM_SAMPLES_TO_STORE) {
      		console.log("Latest Max EDA for " + packet.id + " is : " + eda_cache[packet.id].max());
      		eda_cache[packet.id] = new Array();
      	}
      	var eda = parseFloat(packet.payload.split(",")[packet.payload.split(",").length-1])
      	console.log("EDA value is: " + eda +" | Sample Number: " + eda_cache[packet.id].length);
      	eda_cache[packet.id].push(eda);
        console.log("ID: " +packet.id + " | Payload: " + packet.payload);
        io.sockets.emit(packet.id,packet.payload);
      }
      catch(err) {
        console.log(err);
      }
    });
    socket.on('disconnect', function () {
      console.log("Socket disconnected!");

    });
});


console.log("Express server listening on port " + process.env.PORT);
