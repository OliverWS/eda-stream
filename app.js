
/**
 * Module dependencies.
 */
var fs = require('fs');
var request = require('request');

// file is included here:
eval(fs.readFileSync('lib/numjs.js')+'');
var express = require('express');
var sys = require('sys');
var logging = require('node-logging');
logging.setLevel('error');
var app = express.createServer();
console.log("ENV.PORT=" + process.env.PORT);
var MemJS = require("memjs").Client
memjs = MemJS.create();

app.listen(process.env.PORT || 3001);
app.use(logging.requestLogger);
app.use(express.compress());
app.use(express.bodyParser());
app.use(express.errorHandler({
  dumpExceptions: true, 
  showStack: true
}));

var io = require('socket.io').listen(app, { log: false });

var eda_cache = {};
var NUM_SAMPLES_TO_STORE = 8*10;
var DEFAULT_ENDPOINT = "https://physio-glass.appspot.com/physio/";



app.use(express.static(__dirname + '/public'));

app.get("/stream/:id", function(req, res) {
    console.log(req.params.id);
    res.sendfile(__dirname + '/public/' + "index.html");
});


app.post("/register/:sensorid", function(req,res) {
	console.log("Got a registration request!");
	console.log(req.params);
	console.log(req.body);
	console.log(req.body.userid);
	var error = memjs.set(req.params.sensorid, req.body.userid);
	console.log(error);
	res.send("{'status':'registered'}");		
});
app.post("/unregister/:sensorid", function(req,res) {
	console.log(req.params);
	memjs.set(req.params.sensorid, null);
	res.send("{'status':'unregistered'}");		
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
			memjs.get(packet.id, function(err, userid) {
				if (err) {
					console.log("Error!!!");
				}
				console.log("Stored data for " + packet.id + " is " + userid);
				var endpoint = DEFAULT_ENDPOINT;
				request.post(endpoint).form({EDA:eda_cache[packet.id], userid:userid});
				eda_cache[packet.id] = [];
				
			});
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
