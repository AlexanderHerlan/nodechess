/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  Node Chess client by Alexander Herlan.
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var chess_client;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Global variables
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var chessboard_canvas = document.getElementById("chessboard_canvas");
var chessboard_stage  = new Stage(chessboard_canvas);

var chesspiece_canvas = document.getElementById("chesspiece_canvas");
var chesspiece_stage  = new Stage(chesspiece_canvas);
var connection;
var chess_board;

//socket.io
var socket;

var userColor;
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

chesspiece_stage.mouseEventsEnabled = true;

function init() {
    "use strict";
    // for better performance - to avoid searching in DOM
    var content = $('#chesschat_buffer');
    var input = $('#chesschat_input');
    var status = $('#current_player_status');
    // my color assigned by the server
    var myColor = false;
    // my name sent to the server
    var myName = false;

    // make form elements pretty w/ uniformjs
    $("select, input:checkbox, input:radio, input:file, button, input:text").uniform();

    // setup ueaseljs stuff.
    Ticker.setFPS(30);
    Ticker.addListener(this);
    // draw the chessboard

    chess_client = new chess_client();
    chess_client.set_state();
    chess_client.draw_board(chessboard_stage);

    // connect to socket.io server
    socket = io.connect('https://snakebyte.net:6969');
    // give the chess client the socket.
    chess_client.socket = socket;

    socket.on('connect', function () {
        // first we want users to establish the user's name
        player_select_screen();
        status.text('Initializing...');
    });

    socket.on('namecheck', function(data) {
        if(!data.error) {
            if (myName === false) {
                myName = data.player_name;
            }
            $.cookie("player_name", data.player_name, { expires: 1 });
            $('#msg_box').animate({'top':'-50%'},400,function(){
                input.removeAttr('disabled');
                $('#overlay').fadeOut('fast');
                socket.emit('userconfig', {player_name: data.player_name, player_select: data.player_select});
            });
        } else {
            $('#player_name_error').html('(' + data.error + ')');
            $("input[name=player_select]").attr("checked", false);
        }
    });

    socket.on('userdrag', function (mouse) {
        if(chesspiece_stage.children[mouse.p] != undefined) {
            chesspiece_stage.children[mouse.p].x = mouse.x - 32;
            chesspiece_stage.children[mouse.p].y = mouse.y - 32;
        }
        chesspiece_stage.update();
    });

    socket.on('clientlist', function (clientlist) {
        console.log('ClientList recieved');
        if($('.name_white')) {
            if(clientlist.white) { 
                 $('.name_white').html(clientlist.white);
                 $('#player_w').attr('disabled',true);
            } else {
                 $('.name_white').text("<empty>");
                 $('#player_w').attr('disabled',false);
            }
        }

        if($('.name_black')) {
            if(clientlist.black) { 
                $('.name_black').html(clientlist.black);
                $('#player_b').attr('disabled',true);
            } else {
                $('.name_black').text("<empty>");
                $('#player_b').attr('disabled',false);
            }
        }

        var buddy_list = '<h3>Spectators:</h3> ';
        if(clientlist.user_list.length != undefined) {
            for(var i = 0; i < clientlist.user_list.length; i++) {
                if(clientlist.user_list[i] != clientlist.white && clientlist.user_list[i] != clientlist.black) {
                    buddy_list = buddy_list + "<div>" + clientlist.user_list[i] + "</div>";
                }
            }
        }

        $('#spectators_list').html(buddy_list);
        if(clientlist.white == undefined) { clientlist.white = '&lt;empty&gt;'; }
        if(clientlist.black == undefined) { clientlist.black = '&lt;empty&gt;'; }
        $('.name_black').html(clientlist.black);
        $('.name_black').html(clientlist.black);

        console.log("Connected to Chess server.");
    });

    socket.on('boardstate', function (board) {
        console.log("Recieved board state");
        console.log(board);
        console.log(userColor);
        console.log(isEven(board.turn));
        chess_client.draw_pieces(chesspiece_stage, board.data, userColor, board.turn);
        if(isEven(board.turn)) {
            if(userColor == 'white') {
               $('#turn_reminder').html('Your turn white!'); 
            } else { $('#turn_reminder').html(''); }
        }

        if(isOdd(board.turn)) {
            if(userColor == 'black') {
                $('#turn_reminder').html('Your turn black!');
            } else { $('#turn_reminder').html(''); }
        }

        
        //chess_board = board.data;
    });

    socket.on('userinfo', function(data){
        console.log('Recieved user validation info');
        if(!data.error) {
            status.html('Playing as: <span style="color:' + data.color + ';font-weight:bold">' 
                                                          + data.name + '</span>');
            input.removeAttr('disabled').focus();
            userColor = data.color;
        } else {
            $('#player_name_error').html("(" + data.error + ")");
        }

        //player_start();
    });

    socket.on('chathistory', function (history) {
        console.log("Received existing chat history");
        // insert every single message to the chat window
        for (var i=0; i < history.data.length; i++) {
            addMessage(history.data[i].author, history.data[i].text,
                       history.data[i].color, new Date(history.data[i].time));
        }
    });

    socket.on('chatmessage', function (message) {
        var msg = message.msg;
        console.log("Chat message recieved from " + msg.author);
        input.removeAttr('disabled'); // let the user write another message
        addMessage(msg.author, msg.text,msg.color, new Date(msg.time));
    });

    socket.on('error', function () {
        console.log("Error: Unable to connect to chess server");
        $('#msg_box').removeClass();
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

        $('#msg_box').removeClass();
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
        //$('#msg_box').animate({'top':'-20%'},400,function(){
        //    $('#overlay').fadeOut('fast');
        //});
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


    function msg_box_hide() {
        $('#msg_box').animate({'top':'-50%'},400,function(){
            input.removeAttr('disabled');
            $('#overlay').fadeOut('fast');
        });
    }

    function player_select_screen() {
        $('#msg_box').removeClass();
        $('#msg_box').addClass("welcome_box");
        $('#msg_box_title').html("Welcome to Chess!");
        $('#msg_box_body').html('<form id="frm_player_details"> <p>Choose a name:</p>' +
                '<input type="text" id="player_name"><div id="player_name_error"></div>' +
                '<div id="color_select">' +
                '<label for="player_w"><input type="radio" name="player_select" id="player_w" value="white"><span class="name_white white_king player_select_piece">&lt;empty&gt;</span></label>' +
                '<label for="player_b"><input type="radio" name="player_select" id="player_b" value="black"><span class="name_black black_king player_select_piece">&lt;empty&gt;</span></label>' +
                '<label for="player_s"><input type="radio" name="player_select" id="player_s" value="spectator"><span class="spectator player_select_piece">Spectator</span></label>' +
                '</div></form>');


        myName = $.cookie("player_name");
        $('#overlay').fadeIn('fast',function(){
            $('#msg_box').animate({'top':'50%'},500);
        });

        // put the mouse cursor into the player_name box for convenience 
        $('#player_name').val(myName);
        $('#player_name').focus();

        $("select, input:checkbox, input:radio, input:file, button, input:text").uniform();

        $('#frm_player_details').submit(function() {

            var player_name = $.trim($('#player_name').val());
            var player_select = $('input:radio[name=player_select]:checked').val();


            //Player Name validation
            if(player_name.length < 13 &&
               player_name.length > 2 && 
               hasWhiteSpace(player_name) == false &&
               /\d+/.test(player_name) == false &&      //check for numerals
               /^\w+$/.test(player_name) == true &&
               player_select != undefined) {     //tests that the string is only a-z
                
                socket.emit('namecheck', {player_name: player_name, player_select: player_select});
                /*
                if (myName === false) {
                    myName = player_name;
                }
                $.cookie("player_name", player_name, { expires: 1 });
                $('#msg_box').animate({'top':'-50%'},400,function(){
                    input.removeAttr('disabled');
                    $('#overlay').fadeOut('fast');
                    socket.emit('userconfig', {player_name: player_name, player_select: player_select});
                });
                */
                return false;
            } else {
                if(player_select == undefined) {
                    $('#player_name_error').html(" Please select an option below:");
                }
                if(player_name.length > 12) {
                    $('#player_name_error').html(" (Shorter than 12 characters)");
                    return false;
                }
                if(hasWhiteSpace(player_name) == true) {
                    $('#player_name_error').html(" (With no white spaces)");
                    return false;
                }
                if(/\d+/.test(player_name) == true || /^\w+$/.test(player_name) == false && player_name != '') {
                    $('#player_name_error').html(" (That contains only a-z)");
                    return false;
                }
                if(player_name.length < 3) {
                    $('#player_name_error').html(" (At least 3 characters long)");
                    return false;
                }
            }
            return false; // keep the page from refreshing on submit()

        });

        $("input[name=player_select]").change(function () {
            $('#frm_player_details').submit();
        });


    }

};


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EaselJS loop
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function tick() {
    //re-render the stage
    chesspiece_stage.update();
    chessboard_stage.update();
}