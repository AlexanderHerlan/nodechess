//////////////////////////////////////////////////////////////////////////////////////////////
//
//  Node Chess server by Alexander Herlan.
//
//////////////////////////////////////////////////////////////////////////////////////////////

// http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
"use strict";

// Process name that shows up in Linux. You will see this name in eg. 'ps' or 'top' command
process.title = 'node-chess'; 

//////////////////////////////////////////////////////////////////////////////////////////////
// Required Modules
//////////////////////////////////////////////////////////////////////////////////////////////
var http = require('http'), 
    chess = require('./chess-server.js'),
    express = require('express'),
    webSocketServer = require('websocket').server;

//////////////////////////////////////////////////////////////////////////////////////////////
// Global variables
//////////////////////////////////////////////////////////////////////////////////////////////

// Port where we'll run the websocket server
var port = 6969;
// latest 100 messages
var history = [ ];
// list of currently connected clients (users)
var clients = [ ];
//websockets connection
var connection;
// http webserver to facilitate the websockets connection
var webserver;
// WebSocket handle
var socket;
// Available player colors
var colors = [ 'red', 'green', 'blue', 'magenta', 'purple', 'orange', 'black', 'white' ];

//////////////////////////////////////////////////////////////////////////////////////////////
// Helper functions
//////////////////////////////////////////////////////////////////////////////////////////////

//Helper function for escaping input strings
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

//Helper function for shuffling an array
function shuffle(arr) {
    for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
    return arr;
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Socket.io stuff
//////////////////////////////////////////////////////////////////////////////////////////////
// randomize available colors
colors.sort(function(a,b) { return Math.random() > 0.5; } );

var io = require('socket.io').listen(port, function(){
    console.log((new Date()) + " Socket.io Server is listening on port " + port);
});


io.configure(function(){
    io.set('log level', 1);
    io.set('transports', [
        'websocket',
        'flashsocket'
    ]);
});

io.sockets.on('connection', function (socket) {
    console.log((new Date()) + ' Socket.io user connected.');
    // we need to know client index to remove them on 'close' event
    var index = clients.push(socket) - 1;
    var userName = false;
    var userColor = false;

    // send back chat history
    if (history.length > 0) {
        socket.emit('chathistory', {data: history});
    }

    //send the user the current board layout.
    socket.emit('boardstate', {data: chess.board});

    socket.on('userconfig', function(message) {
        // remember user name
        userName = message.player_name;
        // get random color and send it back to the user
        userColor = colors.shift();
        socket.emit('userinfo', {color: userColor, name: userName});
        console.log((new Date()) + ' User is known as: ' + userName + ' with ' + userColor + ' color.');

    });
    socket.on('chatmessage', function(message) {
        console.log((new Date()) + ' Received Message from ' + userName + ': ' + message.text);

        // we want to keep history of all sent messages
        var obj = {
            time: (new Date()).getTime(),
            text: message.text,
            author: userName,
            color: userColor
        };
        history.push(obj);
        history = history.slice(-100);  

        // broadcast message to all connected clients
        for (var i=0; i < clients.length; i++) {
            clients[i].emit('chatmessage', {data: obj});
        }
    });
    socket.on('disconnect', function () {
        if (userName !== false && userColor !== false) {
            console.log((new Date()) + " Peer disconnected.");
            // remove user from the list of connected clients
            clients.splice(index, 1);
            // push back user's color to be reused by another user
            colors.push(userColor);
        }
    });
});



//////////////////////////////////////////////////////////////////////////////////////////////
// App Entry Point:
//////////////////////////////////////////////////////////////////////////////////////////////

