
/**
 * Module dependencies.
 */

var express = require('express');
var sys = require('sys');
var logging = require('node-logging');
logging.setLevel('error');

var app = express.createServer();
app.listen(process.env.PORT || 3001);
var io = require('socket.io').listen(app);
var clients = new Array();
app.use(express.static(__dirname + '/public'));




io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});


io.sockets.on('connection', function (socket) { 
    console.log("Socket connected! ");
    socket.on('packet', function (data) {io.sockets.emit("packet",data); });
    socket.on('disconnect', function () {
      console.log("Socket disconnected!");

    });
});


console.log("Express server listening on port 80");
