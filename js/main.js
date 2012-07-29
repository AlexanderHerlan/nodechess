///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  Node Chess client by Alexander Herlan.
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var chess_client = new chess_client();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Global variables
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var canvas = document.getElementById("chesscanvas");
var stage = new Stage(canvas);
var connection;
var chess_board;
var stage;

//socket.io
var socket;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Helper functions
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function hasWhiteSpace(s) {
  return s.indexOf(' ') >= 0;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// App Entry Point:
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
WEB_SOCKET_SWF_LOCATION='server/WebSocketMain.swf';
$(function () {
    "use strict";

    // for better performance - to avoid searching in DOM
    var content = $('#chesschat_buffer');
    var input = $('#chesschat_input');
    var status = $('#current_player_status');
    
    // my color assigned by the server
    var myColor = false;
    // my name sent to the server
    var myName = false;

    // connect to socket.io server
    socket = io.connect('http://snakebyte.net:6969');

    socket.on('connect', function () {
        
        // first we want users to establish the user's name
        status.text('Initializing...');

        if(!$.cookie("player_name")) {
            $('#overlay').fadeIn('fast',function(){
                $('#msg_box').animate({'top':'50%'},500);
            });

            // put the mouse cursor into the player_name box for convenience 
            $('#player_name').focus();

            $('#continue_player').click(function(){
                $('#frm_player_details').submit();
                return false;
            }); 
        } else {
            myName = $.cookie("player_name");
            socket.emit('userconfig', { player_name: myName });
            input.removeAttr('disabled');
        }

        console.log("Connected to Chess server.");
    });
    socket.on('boardstate', function (board) {
        chess_client.draw_pieces(stage, board.data);
    });
    socket.on('userinfo', function(data){
        status.html('Playing as: <span style="color:' + data.color + ';font-weight:bold">' 
                                                      + data.name + '</span>');
        input.removeAttr('disabled').focus();
    });
    socket.on('chathistory', function (history) {
        // insert every single message to the chat window
        for (var i=0; i < history.data.length; i++) {
            addMessage(history.data[i].author, history.data[i].text,
                       history.data[i].color, new Date(history.data[i].time));
        }
    });
    socket.on('chatmessage', function (message) {
        var msg = message.msg;
        input.removeAttr('disabled'); // let the user write another message
        addMessage(msg.author, msg.text,msg.color, new Date(msg.time));
    });
    socket.on('error', function () {
        console.log("Error: Unable to connect to chess server");
        $('#msg_box').removeClass("welcome_box");
        $('#msg_box').addClass("error_box");
        $('#msg_box_title').html("Error");
        $('#msg_box_body').html('<p>Unable to connect to server.</p>'
                              + '<p><button id="reconnect">Retry</button></p>');
        $('#reconnect').click(function(){
            window.location = '.';
        }); 
        $('#msg_box').animate({'top':'50%'},400,function(){
            $('#overlay').fadeIn('fast');
        });
    });
    socket.on('disconnect', function () {
        console.log("Error: disconnected to server");
        input.attr('disabled', 'disabled');

        $('#msg_box').removeClass("welcome_box");
        $('#msg_box').addClass("error_box");
        $('#msg_box_title').html("Error");
        $('#msg_box_body').html('<p>The server appears to be down.</p>'
                              + '<p>...</p>');
        $('#reconnect').click(function(){
            window.location = '.';
        }); 
        $('#msg_box').animate({'top':'50%'},400,function(){
            $('#overlay').fadeIn('fast');
        });
    });

    var retry_count = 0;
    socket.on('reconnecting', function () {
        retry_count++;
        if(retry_count < 5) {
            $('#msg_box_body').html('<p>The server appears to be offline. Retrying...</p>'
                                  + '<p>Retry Count: ' + retry_count + '</p>');
        } else {
            $('#msg_box_body').html('<p>Unable to connect to server.</p>'
                                  + '<p><button id="reconnect">Retry</button></p>');
            $('#reconnect').click(function(){ window.location = '.'; }); 
        }
        
        console.log("retrying...")
    });
    socket.on('reconnect', function () {
        $('#msg_box').animate({'top':'-20%'},400,function(){
            $('#overlay').fadeOut('fast');
        });
    });

    // if browser doesn't support WebSocket, just show some notification and exit
    if (!window.WebSocket) {
        content.html($('<p>', { text: 'Sorry, but your browser doesn\'t '
                                    + 'support WebSockets.'} ));
        input.hide();
        return;
    }

    //Send mesage when user presses Enter key
    input.keydown(function(e) {
        if (e.keyCode === 13) {
            var msg = $(this).val();
            if (!msg) {
                return;
            }

            socket.emit('chatmessage', {text: msg});

            $(this).val('');


            $('.scroll-pane').data('jsp').reinitialise();


            // disable the input field to make the user wait until server
            // sends back response
            input.attr('disabled', 'disabled');

            // we know that the first message sent from a user their name
            if (myName === false) {
                myName = msg;
            }
        }
    });

	var settings = {
		stickToBottom: true,
		showArrows: false,
		hideFocus: true
	};
	var pane = $('.scroll-pane');
	pane.jScrollPane(settings);
	var api = pane.data('jsp');


    function addMessage(author, message, color, dt) {
        if(message.substring(0,4) == "/me ") {
            api.getContentPane().append('<p><span class="chat_time">' +
                 + (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
                 + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
                 + '</span> <span style="color:' + color + '">' 
                 + author + ' ' + message.substring(4) + '</span></p>');
        } else {
            api.getContentPane().append('<p><span class="chat_time">' +
                 + (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
                 + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
                 + '</span> <span style="color:' + color + '">'
                 + author + ':</span> ' + message + '</p>');
        }


        api.reinitialise();
        api.scrollToBottom(false);
        api.reinitialise();
    }


    $('#frm_player_details').submit(function() {

        var player_name = $.trim($('#player_name').val());

        //Player Name validation
        if(player_name.length < 13 &&
           player_name.length > 2 && 
           hasWhiteSpace(player_name) == false &&
           /\d+/.test(player_name) == false &&      //check for numerals
           /^\w+$/.test(player_name) == true) {     //tests that the string is only a-z
        	
            socket.emit('userconfig', {player_name: player_name})

            if (myName === false) {
                myName = player_name;
                $.cookie("player_name", player_name, { expires: 1 });
            }
            $('#msg_box').animate({'top':'-20%'},400,function(){
                input.removeAttr('disabled');
                $('#overlay').fadeOut('fast');
            });
        } else {
            if(player_name.length > 12) {
                $('#player_name_error').html(" (Shorter than 12 characters)");
                return false;
            }
            if(hasWhiteSpace(player_name) == true) {
                $('#player_name_error').html(" (With no white spaces)");
                return false;
            }
            if(/\d+/.test(player_name) == true || /^\w+$/.test(player_name) == false) {
                $('#player_name_error').html(" (That contains only a-z)");
                return false;
            }
            if(player_name.length < 4) {
                $('#player_name_error').html(" (At least 3 characters long)");
                return false;
            }
        }
        return false; // keep the page from refreshing on submit()

	});

});


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialize EaselJS stuff
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var board_img;

function init() {
    Ticker.setFPS(30);
    Ticker.addListener(this);

    chess_client.draw_board(stage);
}

function tick() {
    //re-render the stage
    stage.update();
}

