/* Author:  Alexander Herlan */
var chess_client = new chess_client();
var canvas = document.getElementById("chesscanvas");
var stage = new Stage(canvas);
var connection;

var chess_board;
var stage;


function hasWhiteSpace(s) {
  return s.indexOf(' ') >= 0;
}

$(function () {
    "use strict";

    // for better performance - to avoid searching in DOM
    var content = $('#chesschat_buffer');
    var input = $('#chesschat_input');
    var status = $('#current_player_status');
    
    //chess_client.draw_board(canvas, stage);

    // my color assigned by the server
    var myColor = false;
    // my name sent to the server
    var myName = false;

    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    // if browser doesn't support WebSocket, just show some notification and exit
    if (!window.WebSocket) {
        content.html($('<p>', { text: 'Sorry, but your browser doesn\'t '
                                    + 'support WebSockets.'} ));
        input.hide();
        $('span').hide();
        return;
    }


    // open connection
    connection = new WebSocket('ws://www.snakebyte.net:1337');

    connection.onopen = function () {
        // first we want users to enter their names
        input.removeAttr('disabled');
        status.text('Initializing...');
        //load old player profile if one exists
        if(!$.cookie("player_name")) {
            $('#overlay').fadeIn('fast',function(){
                $('#msg_box').animate({'top':'50%'},500);
            });

            $('#player_name').focus();

            $('#continue_player').click(function(){
                $('#frm_player_details').submit();
                return false;
            }); 
        } else {
            myName = $.cookie("player_name");
            //connection.send(myName);
            var user_config_obj = {
                type: 'userconfig',
                player_name: myName
            }

            user_config_obj = JSON.stringify(user_config_obj);

            setTimeout(function() { connection.send(user_config_obj); }, 200);
        }
    };

    connection.onerror = function (error) {
        // just in there were some problems with conenction...
        content.html($('<p>', { text: 'Sorry, but there\'s some problem with your '
                                    + 'connection or the server is down.</p>' } ));
    };

    // most important part - incoming messages
    connection.onmessage = function (message) {
        // try to parse JSON message. Because we know that the server always returns
        // JSON this should work without any problem but we should make sure that
        // the massage is not chunked or otherwise damaged.
        try {
            var json = JSON.parse(message.data);
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', message.data);
            return;
        }

        // NOTE: if you're not sure about the JSON structure
        // check the server source code above
        if (json.type === 'color') { // first response from the server with user's color
            myColor = json.data;
            status.html('Playing as: <span style="color:' + myColor + '">' + myName + "</span>");
            input.removeAttr('disabled').focus();
            // from now user can start sending messages
        } else if (json.type === 'history') { // entire message history
            // insert every single message to the chat window
            for (var i=0; i < json.data.length; i++) {
                addMessage(json.data[i].author, json.data[i].text,
                           json.data[i].color, new Date(json.data[i].time));
            }
        } else if (json.type === 'message') { // it's a single message
            input.removeAttr('disabled'); // let the user write another message
            addMessage(json.data.author, json.data.text,
                       json.data.color, new Date(json.data.time));
        } else if (json.type === 'boardstate') {
            chess_client.draw_pieces(stage, json.data);
        } else {
            console.log('Unknown server response: ', json);
        }
    };

    /**
     * Send mesage when user presses Enter key
     */
    input.keydown(function(e) {
        if (e.keyCode === 13) {
            var msg = $(this).val();
            if (!msg) {
                return;
            }

            var msg_obj = {
                type: 'message',
                message: msg
            }

            msg_obj = JSON.stringify(msg_obj);
            // send the message as an ordinary text

            connection.send(msg_obj);
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

    /**
     * This method is optional. If the server wasn't able to respond to the
     * in 3 seconds then show some error message to notify the user that
     * something is wrong.
     */
    setInterval(function() {
        if (connection.readyState !== 1) {
            input.attr('disabled', 'disabled');

            $('#msg_box').removeClass("welcome_box");
            $('#msg_box').addClass("error_box");
            $('#msg_box_title').html("Error");
            $('#msg_box_body').html('<p>The server appears to be down.<p><p><button id="reconnect">Reconnect</button>');
            $('#reconnect').click(function(){
                window.location = '.';
            }); 
            $('#msg_box').animate({'top':'50%'},400,function(){
                $('#overlay').fadeIn('fast');
            });
        }
    }, 3000);

    /**
     * Add message to the chat window
     */

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
                 + '</span> <span style="color:' + color + '">' + author + ' ' + message.substring(4) + '</span></p>');
        } else {
            api.getContentPane().append('<p><span class="chat_time">' +
                 + (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
                 + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
                 + '</span> <span style="color:' + color + '">' + author + ':</span> ' + message + '</p>');
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
        	

            var user_config_obj = {
                type: 'userconfig',
                player_name: player_name
            }

            user_config_obj = JSON.stringify(user_config_obj);

            connection.send(user_config_obj);

        	// we know that the first message sent from a user their name
            if (myName === false) {
                myName = player_name;
                $.cookie("player_name", player_name, { expires: 1 });
            }
            $('#msg_box').animate({'top':'-20%'},400,function(){
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



// Initialize EaselJS stuff
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

var socket = io.connect('http://localhost:8080');
    socket.on('news', function (data) {
        console.log(data);
        socket.emit('my other event', { my: 'data' 
    });
});