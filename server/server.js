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
    chess_server = require('./chess-server.js'),
    fs = require('fs');

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Global variables
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Port where we'll run the socket.io server
var port = 6969;
// list of sockets belonging to ALL currently connected clients (users) 
var clients = [ ];
// list of all usernames currently in use
var user_names = [ ];
// only 1 person can be the white, or the black player, everyone else is a spectator.
var client_white = false;  // handle to white client
var client_black = false;  // handle to black client
// latest 100 chat messages
var chat_history = [ ];
// list of available player colors
var colors = [ 'green', 'blue', 'darkred', 'purple', 'yellowgreen', 'darkblue', 'firebrick' ];
// SSL Certs
var ssl_options = { 
    key:  fs.readFileSync('/etc/ssl/private/snakebyte.net.key'), 
    cert: fs.readFileSync('/etc/ssl/certs/www.snakebyte.net.crt'),
    ca:   fs.readFileSync('/etc/ssl/certs/www.snakebyte.net.ca-bundle')
}; 

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

 Array.prototype.removeByValue = function (val) {
    for (var i = 0; i < this.length; i++) {
       var c = this[i];
       if (c == val || (val.equals && val.equals(c))) {
          this.splice(i, 1);
          break;
       }
    }
 };


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Socket.io initialization and configuration
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// setup a secure express webserver
var webapp = express.createServer(ssl_options);

webapp.get('/', function (req, res) {
    res.send('So you like probing my sockets eh? Hmmm...');
});

webapp.listen(port, function () {
    console.log(fromat_time(new Date()) + ' - Server is listening on port ' + port);
});

var io = socketio.listen(webapp);

io.configure(function() {
    io.set('log level', 2);
    io.set('transports', [
        'websocket'
    ]);
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// App Entry Point:
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* function for testing latency of websocket transport
setInterval(function(){
    var testboard = shuffle(chess_server.board);
    for(var i = 0; i < clients.length; i++) {
        clients[i].emit('gamestate', {board: testboard});
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

    socket.emit('clientlist', {white: client_white.player_name, black: client_black.player_name, user_list: user_names });

    socket.on('uservalidation', function(data) {
        for(var i = 0; i < user_names.length; i++) {
            if(user_names[i] == data.player_name) {
                socket.emit('namecheck', {error: 'Username already in use.'});
                return false;
            }
        }
        socket.emit('uservalidation', {player_name: data.player_name, player_select: data.player_select});

    });

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

        // add username to global list of users for checking availability
        user_names.push(userName);

        // send the user their asigned userinfo
        socket.set('userName', userName, function () { socket.emit('userinfo', {color: userColor, name: userName, user_list: user_names}); });

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
        socket.emit('gamestate', {board: chess_server.board, turn: chess_server.moveCount});
        /*
        setTimeout(function(){
            socket.emit('gamestate', {board: chess_server.board, turn: chess_server.moveCount});
            setTimeout(function(){
                socket.emit('gamestate', {board: chess_server.board, turn: chess_server.moveCount});
                setTimeout(function(){
                    socket.emit('gamestate', {board: chess_server.board, turn: chess_server.moveCount});
                    setTimeout(function(){
                        socket.emit('gamestate', {board: chess_server.board, turn: chess_server.moveCount});
                    }, 750);
                }, 500);
            }, 250);
        }, 250);
        */

        socket.emit('clientlist', {white: client_white.player_name, black: client_black.player_name, user_list: user_names  });
        socket.broadcast.emit('clientlist', {white: client_white.player_name, black: client_black.player_name, user_list: user_names  });

        // log new user to server console
        console.log(fromat_time(new Date()) + ' - User is known as "' + userName + '" with ' + userColor + ' color');
    });

    socket.on('userdrag', function(mouse) {
        socket.broadcast.emit('userdrag', {p: mouse.p, x: mouse.x, y: mouse.y})
    });

    socket.on('chessmove', function(move) {
        console.log(fromat_time(new Date()) + ' - ' + socket.player_name + " moved from " + move.f + " to " + move.t);

        if(chess_server.validateMove(move.f, move.t)) {
            console.log("Valid Move");

            socket.emit('gamestate', {board: chess_server.board, turn: chess_server.moveCount});
            socket.broadcast.emit('gamestate', {board: chess_server.board, turn: chess_server.moveCount});

        } else {
            if(chess_server.isKingInCheck()) {
                socket.emit('gamestate', {board: chess_server.board, turn: chess_server.moveCount, error: 'Your king is in check!'});
                socket.broadcast.emit('gamestate', {board: chess_server.board, turn: chess_server.moveCount});
                console.log("Your king is in check!");
            } else {
                socket.emit('gamestate', {board: chess_server.board, turn: chess_server.moveCount, error: 'Invalid Move'});
                socket.broadcast.emit('gamestate', {board: chess_server.board, turn: chess_server.moveCount});
                console.log("Invalid Move");
            }
        }
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
                if(userColor != 'white' && userColor != 'black') {
                   colors.push(userColor); 
                }
            }

            if(client_black) {
                if(client_black.player_name == userName) {
                    client_black.player_name = false;
                    client_black = false;
                    console.log(fromat_time(new Date()) + ' - Black player ' + userName + ' has left the game!');
                    
                    if(chess_server.restart()) {
                        socket.broadcast.emit('gamestate', {board: chess_server.board, turn: chess_server.moveCount});
                    }
                }
            }

            if(client_white) {
                if(client_white.player_name == userName) {
                    console.log(fromat_time(new Date()) + ' - White player ' + userName + ' has left the game!');
                    client_white.player_name = false;
                    client_white = false;
                    if(chess_server.restart()) {
                        socket.broadcast.emit('gamestate', {board: chess_server.board, turn: chess_server.moveCount});
                    }
                }
            }

  

            // remove user from the list of connected clients
            clients.splice(index, 1);
            // remove the username from the list of availible usernames
            user_names.removeByValue(userName);


            
            // create a message to alert other users of the disconnecting player
            var msg = {
                time: (new Date()).getTime(),
                text: '/me has disconnected.',
                author: userName,
                color: userColor
            };
            chat_history.push(msg);
            chat_history = chat_history.slice(-100);  


            socket.broadcast.emit('clientlist', {white: client_white.player_name, black: client_black.player_name, user_list: user_names });

            // broadcast the message to all users
            socket.broadcast.emit('chatmessage', {msg: msg});
            
        }
    });
});