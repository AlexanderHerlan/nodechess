// http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
"use strict";

// Process name that shows up in Linux. You will see this name in eg. 'ps' or 'top' command
process.title = 'node-chess'; 

//////////////////////////////////////////////////////////////////////////////////////////////
// Required Modules
//////////////////////////////////////////////////////////////////////////////////////////////
var http = require('http');
var chess = require('./chess-server.js');
var webSocketServer = require('websocket').server;
var io = require('socket.io');

//////////////////////////////////////////////////////////////////////////////////////////////
// Global variables
//////////////////////////////////////////////////////////////////////////////////////////////

// Port where we'll run the websocket server
var webSocketsServerPort = 1337;
// latest 100 messages
var history = [ ];
// list of currently connected clients (users)
var clients = [ ];
//websockets connection
var connection;
// http webserver to facilitate the websockets connection
var webserver;
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

//start HTTP server
webserver = http.createServer(webserver_handler);
webserver.listen(8080);

//handle HTTP server requests
function webserver_handler(req, res) { 
    // Send HTML headers and message
    res.writeHead(200,{ 'Content-Type': 'text/html' }); 
    res.end('<h1>Hello Socket Lover!</h1>');
}

io.sockets.on('connection', function (socket) {
    socket.emit('news', { hello: 'world' });

    socket.on('my other event', function (data) {
    console.log(data);
    });
});









//////////////////////////////////////////////////////////////////////////////////////////////
// App Entry Point:
//////////////////////////////////////////////////////////////////////////////////////////////





// ... in random order
colors.sort(function(a,b) { return Math.random() > 0.5; } );

/**
 * HTTP server
 */
var server = http.createServer(function(request, response) {
    // Not important for us. We're writing WebSocket server, not HTTP server
});
server.listen(webSocketsServerPort, function() {
    console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});

/**
 * WebSocket server
 */
var wsServer = new webSocketServer({
    // WebSocket server is tied to a HTTP server. To be honest I don't understand why.
    httpServer: server
});

// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('request', function(request) {
    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

    // accept connection - you should check 'request.origin' to make sure that
    // client is connecting from your website
    // (http://en.wikipedia.org/wiki/Same_origin_policy)
    var connection = request.accept(null, request.origin); 
    // we need to know client index to remove them on 'close' event
    var index = clients.push(connection) - 1;
    var userName = false;
    var userColor = false;

    console.log((new Date()) + ' Connection accepted.');

    // send back chat history
    if (history.length > 0) {
        connection.sendUTF(JSON.stringify( { type: 'history', data: history} ));
    }

    connection.sendUTF(JSON.stringify({type: 'boardstate', data: chess.board}));
 
    // user sent some message
    connection.on('message', function(message) {
        if (message.type === 'utf8') { // accept only text

            //msg convert
            var json = JSON.parse(message.utf8Data);

            if (userName === false) { // first message sent by user is their name
                // remember user name
                
                userName = json.player_name;
                // get random color and send it back to the user
                userColor = colors.shift();
                connection.sendUTF(JSON.stringify({ type:'color', data: userColor }));
                console.log((new Date()) + ' User is known as: ' + userName
                            + ' with ' + userColor + ' color.');

            } else if (json.type == "message") {
                console.log((new Date()) + ' Received Message from '
                            + userName + ': ' + json.message);

                // we want to keep history of all sent messages
                var obj = {
                    time: (new Date()).getTime(),
                    text: json.message,
                    author: userName,
                    color: userColor
                };
                history.push(obj);
                history = history.slice(-100);

                // broadcast message to all connected clients
                var json = JSON.stringify({ type:'message', data: obj });
                for (var i=0; i < clients.length; i++) {
                    clients[i].sendUTF(json);
                }
            } else { // log and broadcast the message
                console.log("Unrecognized client message.");
            }
        }
    });

    // user disconnected
    connection.on('close', function(connection) {
        if (userName !== false && userColor !== false) {
            console.log((new Date()) + " Peer "
                + connection.remoteAddress + " disconnected.");

            
            // remove user from the list of connected clients
            clients.splice(index, 1);
            // push back user's color to be reused by another user
            colors.push(userColor);
        }
    });

}); 



/*
setInterval(function(){
    var testboard = shuffle(chess.board);
    for (var i=0; i < clients.length; i++) {
        clients[i].sendUTF(JSON.stringify({type: 'boardstate', data: chess.board}));
    }
}, 1000);
*/