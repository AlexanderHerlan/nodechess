/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//  Node Chess server by Alexander Herlan.
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
"use strict";

// Process name that shows up in Linux. You will see this name in eg. 'ps' or 'top' command
process.title = 'node-chess'; 

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Required Modules
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var http = require('http'), 
    express = require('express'),
    socketio = require('socket.io'),
    chess = require('./chess-server.js');

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Global variables
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Port where we'll run the socket.io server
var port = 6969;
// list of ALL currently connected clients (users)
var clients = [ ];
// only 1 person can be the white, or the black player, everyone else is a spectator.
var client_white = false;  // handle to white client
var client_black = false;  // handle to black client
// latest 100 chat messages
var chat_history = [ ];
// list of available player colors
var colors = [ 'green', 'blue', 'red', 'purple', 'yellowgreen', 'darkblue', 'firebrick' ];

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Helper functions
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Socket.io initialization and configuration
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// App Entry Point:
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* function for testing latency of websocket transport
setInterval(function(){
    var testboard = shuffle(chess.board);
    for(var i = 0; i < clients.length; i++) {
        clients[i].emit('boardstate', {data: testboard});
    }
}, 100);
*/


// when a user connects
io.sockets.on('connection', function (socket) {
    // log the event to the server console
    console.log(fromat_time(new Date()) + ' - User connected');

    // we need to know the connecting user's index in the 'clients' array
    // to remove them later when they disconnect
    var index = clients.push(socket) - 1;

    var userName = false;
    var userColor = false;
    var userSelect = false;

    socket.emit('clientlist', {white: client_white.player_name, black: client_black.player_name });
        
    // when the user sends a user configuration request
    socket.on('userconfig', function(userconfig) {
        // update their user name
        userName = userconfig.player_name;
        userSelect = userconfig.player_select;
        // get random color
        userColor = colors.shift();

        if(userSelect == 'white') {
            if(client_white == false) {
                client_white = socket;
                client_white.player_name = userName;
                userColor = 'white';
            } else { userSelect = 'spectator'; }
        }
        if(userSelect == 'black') {
            if(client_black == false) {
                client_black = socket;
                client_black.player_name = userName;
                userColor = 'black';
            } else { userSelect = 'spectator'; }
        }

        // send the user their asigned userinfo
        socket.emit('userinfo', {color: userColor, name: userName});

        // create a message to alert all other users of the newly connected player
        var msg = {
            time: (new Date()).getTime(),
            text: '/me has connected as ' + userSelect,
            author: userName,
            color: userColor
        };

        chat_history.push(msg);
        chat_history = chat_history.slice(-100);  
        // broadcast the "<username> has connectred" message to all users
        socket.broadcast.emit('chatmessage', {msg: msg});

        // send the chat_history to the connecting user (if one exists)
        if (chat_history.length > 0) {
            socket.emit('chathistory', {data: chat_history});
        }

        // send board state w/ a delay because EaselJS is a piece of shit
        // (moral of the story, dont try to load remote data into <canvas>
        // using easeljs immediately at page-load, it will fail sometimes, not others...)
        setTimeout(function(){
            socket.emit('boardstate', {data: chess.board});
            setTimeout(function(){
                socket.emit('boardstate', {data: chess.board});
            }, 5000);
        }, 750);

        socket.emit('clientlist', {white: client_white.player_name, black: client_black.player_name });
        socket.broadcast.emit('clientlist', {white: client_white.player_name, black: client_black.player_name });

        // log new user to server console
        console.log(fromat_time(new Date()) + ' - User is known as "' + userName + '" with ' + userColor + ' color');
    });

    socket.on('userdrag', function(mouse) {
        socket.broadcast.emit('userdrag', {p: mouse.p, x: mouse.x, y: mouse.y})
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
        socket.emit('chatmessage', {msg: msg});
        socket.broadcast.emit('chatmessage', {msg: msg});
    });

    // when a user disconnects
    socket.on('disconnect', function () {
        if (userName !== false && userColor !== false) {
            // Log the event to the server console
            console.log(fromat_time(new Date()) + ' - Peer disconnected');
            
            // if the user isnt the black or white player
            if((clients[index] != client_white) && (clients[index] != client_black)) {
                // push back user's color to be reused by another user
                colors.push(userColor);
            }

            if(client_black) {
                if(client_black.player_name == userName) {
                    client_black.player_name = false;
                    client_black = false;
                    console.log(fromat_time(new Date()) + ' - Black player ' + userName + ' has left the game!');
                }
            }

            if(client_white) {
                if(client_white.player_name == userName) {
                    console.log(fromat_time(new Date()) + ' - White player ' + userName + ' has left the game!');
                    client_white.player_name = false;
                    client_white = false;
                }
            }

  

            // remove user from the list of connected clients
            clients.splice(index, 1);


            
            // create a message to alert other users of the disconnecting player
            var msg = {
                time: (new Date()).getTime(),
                text: '/me has disconnected.',
                author: userName,
                color: userColor
            };
            chat_history.push(msg);
            chat_history = chat_history.slice(-100);  


            socket.broadcast.emit('clientlist', {white: client_white.player_name, black: client_black.player_name });
            // broadcast the message to all users
            socket.broadcast.emit('chatmessage', {msg: msg});
            
        }
    });
});