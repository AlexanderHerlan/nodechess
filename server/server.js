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
    express = require('express'),
    socketio = require('socket.io'),
    chess = require('./chess-server.js');

//////////////////////////////////////////////////////////////////////////////////////////////
// Global variables
//////////////////////////////////////////////////////////////////////////////////////////////

// Port where we'll run the socket.io server
var port = 6969;
// list of currently connected clients (users)
var clients = [ ];
// latest 100 chat messages
var chat_history = [ ];
// list of available player colors
var colors = [ 'white', 'black', 'green', 'blue', 'red', 'purple', 'yellowgreen', 'darkblue', 'firebrick' ];

//////////////////////////////////////////////////////////////////////////////////////////////
// Helper functions
//////////////////////////////////////////////////////////////////////////////////////////////

// Helper function for escaping input strings
function html_escape(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Helper function for shuffling an array
function shuffle(arr) {
    for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
    return arr;
}

// format time for server console
function fromat_time(dt) {
    var ap = "AM";
    var hour = dt.getHours();
    if (hour   > 11) { ap = "PM";        }
    if (hour   > 12) { hour = hour - 12; }
    if (hour   == 0) { hour = 12;        }
    return (dt.getHours() < 10 ? '0' + hour : hour) + ':' + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() + " " + ap : dt.getMinutes() + " " + ap);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Socket.io initialization and configuration
//////////////////////////////////////////////////////////////////////////////////////////////

var io = socketio.listen(port, function() {
    //if the socket.io server starts correctly, display a message that we have connected.
    console.log(fromat_time(new Date()) + ' - Server is listening on port ' + port);
});

io.configure(function() {
    io.set('log level', 1);
    io.set('transports', [
        'websocket',
        'flashsocket'
    ]);
});

//////////////////////////////////////////////////////////////////////////////////////////////
// App Entry Point:
//////////////////////////////////////////////////////////////////////////////////////////////

// when a user connects
io.sockets.on('connection', function (socket) {
    // log the event to the server console
    console.log(fromat_time(new Date()) + ' - User connected');

    // we need to know the connecting user's index in the 'clients' array
    // to remove them later when they disconnect
    var index = clients.push(socket) - 1;

    var userName = false;
    var userColor = false;

    // send the chat_history to the connecting user (if one exists)
    if (chat_history.length > 0) {
        socket.emit('chathistory', {data: chat_history});
    }

    // also send the board layout
    socket.emit('boardstate', {data: chess.board});

    // when the user sends a user configuration request
    socket.on('userconfig', function(userconfig) {
        // update their user name
        userName = userconfig.player_name;

        // get random color
        userColor = colors.shift();

        // send the user their asigned userinfo
        socket.emit('userinfo', {color: userColor, name: userName});

        // create a message to alert all other users of the newly connected player
        var msg = {
            time: (new Date()).getTime(),
            text: '/me has connected.',
            author: userName,
            color: userColor
        };

        // broadcast the "<username> has connectred" message to all users
        for (var i=0; i < clients.length; i++) {
            clients[i].emit('chatmessage', {msg: msg});
        }

        // log new user to server console
        console.log(fromat_time(new Date()) + ' - User is known as "' + userName + '" with ' + userColor + ' color');
    });

    // when recieving a chat message from a user
    socket.on('chatmessage', function(message) {
        // log the message to the server console
        console.log(fromat_time(new Date()) + ' - ' + userName + ' says: ' + message.text);

        // keep a history of all sent messages
        var msg = {
            time: (new Date()).getTime(),
            text: html_escape(message.text),
            author: userName,
            color: userColor
        };
        chat_history.push(msg);
        chat_history = chat_history.slice(-100);  

        // broadcast message to all connected clients
        for (var i=0; i < clients.length; i++) {
            clients[i].emit('chatmessage', {msg: msg});
        }

    });

    // when a user disconnects
    socket.on('disconnect', function () {
        if (userName !== false && userColor !== false) {
            // Log the event to the server console
            console.log(fromat_time(new Date()) + ' - Peer disconnected');

            // remove user from the list of connected clients
            clients.splice(index, 1);

            // push back user's color to be reused by another user
            colors.push(userColor);
            
            // create a message to alert other users of the disconnecting player
            var msg = {
                time: (new Date()).getTime(),
                text: '/me has disconnected.',
                author: userName,
                color: userColor
            };

            // broadcast the message to all users
            for (var i=0; i < clients.length; i++) {
                clients[i].emit('chatmessage', {msg: msg});
            }
        }
    });
});