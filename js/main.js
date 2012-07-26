/* Author:  Alexander Herlan */
var chess_client = new chess_client();

function hasWhiteSpace(s) {
  return s.indexOf(' ') >= 0;
}

$(function () {
    "use strict";

    // for better performance - to avoid searching in DOM
    var content = $('#chesschat_buffer');
    var input = $('#chesschat_input');
    var status = $('#chesschat_status');
    var canvas = $('#chesscanvas')[0].getContext('2d');
    var stage = new Stage(document.getElementById("chesscanvas"));

    chess_client.draw_board(canvas, stage);

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
    var connection = new WebSocket('ws://www.snakebyte.net:1337');

    connection.onopen = function () {
        // first we want users to enter their names
        input.removeAttr('disabled');
        status.text('Initializing...');
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
            chess_client.draw_pieces(canvas, json.data);
        } else {
            console.log('Hmm..., I\'ve never seen JSON like this: ', json);
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
            // send the message as an ordinary text
            connection.send(msg);
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
            status.text('Error');
            input.attr('disabled', 'disabled').val('Unable to comminucate '
                                                 + 'with the WebSocket server.');
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




	$('#overlay').fadeIn('fast',function(){
        $('#welcome_box').animate({'top':'50%'},500);
    });

    $('#player_name').focus();

    $('#boxclose').click(function(){
        $('#welcome_box').animate({'top':'-200px'},500,function(){
            $('#overlay').fadeOut('fast');
        });
    });


    $('#continue_player').click(function(){
        $('#frm_player_details').submit();
    	return false;
    });	

    $('#frm_player_details').submit(function() {

        var player_name = $.trim($('#player_name').val());

        //Player Name validation
        if(player_name.length < 13 &&
           player_name.length > 2 && 
           hasWhiteSpace(player_name) == false &&
           /\d+/.test(player_name) == false &&      //check for numerals
           /^\w+$/.test(player_name) == true) {     //tests that the string is only a-z
        	connection.send(player_name);
        	// we know that the first message sent from a user their name
            if (myName === false) {
                myName = player_name;
            }
            $('#welcome_box').animate({'top':'-20%'},400,function(){
                $('#overlay').fadeOut('fast');
            });
        } else {
            if(player_name.length < 4) {
                $('#player_name_error').html(" (At least 3 characters long)");
                return false;
            }
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
        }
        return false;
	});
});