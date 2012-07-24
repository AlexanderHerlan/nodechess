/* Author:  Alexander Herlan */
var pieces = new Image();
pieces.src = 'img/pieces.png';
var canvas = document.getElementById('chesscanvas').getContext('2d');



$(function () {
    "use strict";

    // for better performance - to avoid searching in DOM
    var content = $('#chesschat_buffer');
    var input = $('#chesschat_input');
    var status = $('#chesschat_status');

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
        status.text('Choose a name in the chat box.');
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
            status.text('Playing as: ' + myName).css('color', myColor);
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
	var pane = $('.scroll-pane')
	pane.jScrollPane(settings);
	var api = pane.data('jsp');


    function addMessage(author, message, color, dt) {
        api.getContentPane().append('<p>' +
             + (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
             + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
             + ' <span style="color:' + color + '">' + author + ':</span> ' + message + '</p>');
        api.reinitialise();
        api.scrollToBottom(false);
    }




	$('#overlay').fadeIn('fast',function(){
        $('#box').animate({'top':'160px'},500);
    });

    $('#boxclose').click(function(){
        $('#box').animate({'top':'-200px'},500,function(){
            $('#overlay').fadeOut('fast');
        });
    });


    $('#continue_player').click(function(){
        $('#frm_player_details').submit();
    	return false;
    });	

    $('#frm_player_details').submit(function() {

        var player_name = $.trim($('#player_name').val());
        if(player_name != "") {
        	connection.send(player_name);
        	// we know that the first message sent from a user their name
            if (myName === false) {
                myName = player_name;
            }
            $('#box').animate({'top':'-200px'},500,function(){
                $('#overlay').fadeOut('fast');
            });
        }

		return false;
	});

});




$(function() {
	//var canvas = document.getElementById('chesscanvas').getContext('2d');
	var chessboard = new Image();   // Create new img element
	chessboard.src = 'img/chessboard.png'; // Set source path
	chessboard.onload = function(){
		canvas.drawImage(chessboard,0,0,512,512);
		init_pawns('black');
		init_pawns('white');
		init_king('black');
		init_king('white');
		init_queen('black');
		init_queen('white');
		init_bishops('white');
		init_bishops('black');
		init_knights('white');
		init_knights('black');
		init_rooks('white');
		init_rooks('black');
	};
});

function init_pawns(color) {
	if(color=="black") {
		for (var i=0;i<8;i++){ 
			canvas.drawImage(pieces, 320, 64, 64, 64, 64*i, 64, 64, 64);
		}
	} 
	if(color=="white") {
		for (var i=0;i<8;i++){ 
			canvas.drawImage(pieces, 320, 0, 64, 64, 64*i, 384, 64, 64)
		}
	}

}

function init_king(color) {
	if(color=="black") {
		canvas.drawImage(pieces, 0, 64, 64, 64, 192, 0, 64, 64);
	} 
	if(color=="white") {
		canvas.drawImage(pieces, 0, 0, 64, 64, 192, 448, 64, 64);
	}
}

function init_queen(color) {
	if(color=="black") {
		canvas.drawImage(pieces, 64, 64, 64, 64, 256, 0, 64, 64);
	} 
	if(color=="white") {
		canvas.drawImage(pieces, 64, 0, 64, 64, 256, 448, 64, 64);
	}
}

function init_bishops(color) {
	if(color=="black") {
		canvas.drawImage(pieces, 128, 64, 64, 64, 320, 0, 64, 64);
		canvas.drawImage(pieces, 128, 64, 64, 64, 128, 0, 64, 64);
	} 
	if(color=="white") {
		canvas.drawImage(pieces, 128, 0, 64, 64, 320, 448, 64, 64);
		canvas.drawImage(pieces, 128, 0, 64, 64, 128, 448, 64, 64);
	}
}

function init_knights(color) {
	if(color=="black") {
		canvas.drawImage(pieces, 192, 64, 64, 64, 384, 0, 64, 64);
		canvas.drawImage(pieces, 192, 64, 64, 64, 64, 0, 64, 64);
	} 
	if(color=="white") {
		canvas.drawImage(pieces, 192, 0, 64, 64, 384, 448, 64, 64);
		canvas.drawImage(pieces, 192, 0, 64, 64, 64, 448, 64, 64);
	}
}

function init_rooks(color) {
	if(color=="black") {
		canvas.drawImage(pieces, 256, 64, 64, 64, 448, 0, 64, 64);
		canvas.drawImage(pieces, 256, 64, 64, 64, 0, 0, 64, 64);
	} 
	if(color=="white") {
		canvas.drawImage(pieces, 256, 0, 64, 64, 448, 448, 64, 64);
		canvas.drawImage(pieces, 256, 0, 64, 64, 0, 448, 64, 64);
	}
}