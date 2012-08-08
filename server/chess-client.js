function chess_client () {
	this.piece_size;

    this.moveCount = 0;

    this.currentPlayer = 0x0;
    this.castleRights = 0xF; // 4 bits to track castling on each side for both players

    this.WHITE = 0x0;
    this.BLACK = 0x8;

    this.PAWN = 0x01;
    this.KNIGHT = 0x02;
    this.KING = 0x03;
    this.BISHOP = 0x05;
    this.ROOK = 0x06;
    this.QUEEN = 0x07;

    this.WHITE_PAWN = 0x01;
    this.WHITE_KNIGHT = 0x02;
    this.WHITE_KING = 0x03;
    this.WHITE_BISHOP = 0x05;
    this.WHITE_ROOK = 0x06;
    this.WHITE_QUEEN = 0x07;

    this.BLACK_PAWN = 0x09;
    this.BLACK_KNIGHT = 0x0A;
    this.BLACK_KING = 0x0B;
    this.BLACK_BISHOP = 0x0D;
    this.BLACK_ROOK = 0x0E;
    this.BLACK_QUEEN = 0x0F;

    this.board =[this.BLACK_ROOK, this.BLACK_KNIGHT, this.BLACK_BISHOP, this.BLACK_QUEEN, this.BLACK_KING, this.BLACK_BISHOP, this.BLACK_KNIGHT, this.BLACK_ROOK, 0, 0, 0, 0, 0, 0, 0, 0,
                 this.BLACK_PAWN, this.BLACK_PAWN, this.BLACK_PAWN, this.BLACK_PAWN, this.BLACK_PAWN, this.BLACK_PAWN, this.BLACK_PAWN, this.BLACK_PAWN, 0, 0, 0, 0, 0, 0, 0, 0,
                 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                 this.WHITE_PAWN, this.WHITE_PAWN, this.WHITE_PAWN, this.WHITE_PAWN, this.WHITE_PAWN, this.WHITE_PAWN, this.WHITE_PAWN, this.WHITE_PAWN, 0, 0, 0, 0, 0, 0, 0, 0,
                 this.WHITE_ROOK, this.WHITE_KNIGHT, this.WHITE_BISHOP, this.WHITE_QUEEN, this.WHITE_KING, this.WHITE_BISHOP, this.WHITE_KNIGHT, this.WHITE_ROOK, 0, 0, 0, 0, 0, 0, 0, 0];


    this.pieces_sprite;
}

chess_client.prototype.draw_board = function (stage) {
	var self = this;

	var chessboard = new Image();   // Create new img element
	chessboard.src = 'img/chessboard.png'; // Set source path
	chessboard.onload = function(){
		var board = new Bitmap(chessboard);
	    stage.addChild(board);
	    stage.update();
	};

}

chess_client.prototype.init_pieces = function() {
	var self = this;

    var frames = [ ];

    // x, y, width, height, image index, regX, regY
    frames[0]  = [  0, 0,64,64,0,0,0]; // white king
    frames[1]  = [ 64, 0,64,64,0,0,0]; // white queen
    frames[2]  = [128, 0,64,64,0,0,0]; // white bishop
    frames[3]  = [192, 0,64,64,0,0,0]; // white knight
    frames[4]  = [256, 0,64,64,0,0,0]; // white rook
    frames[5]  = [320, 0,64,64,0,0,0]; // white pawn

    frames[6]  = [  0,64,64,64,0,0,0]; // black king
    frames[7]  = [ 64,64,64,64,0,0,0]; // black queen
    frames[8]  = [128,64,64,64,0,0,0]; // black bishop
    frames[9]  = [192,64,64,64,0,0,0]; // black knight
    frames[10] = [256,64,64,64,0,0,0]; // black rook
    frames[11] = [320,64,64,64,0,0,0]; // black pawn

    var data = {
		images: ["img/pieces.png"],
		frames: frames
	}

	self.spritesheet = new SpriteSheet(data);

}



chess_client.prototype.draw_pieces = function(stage, board, clientcolor, turn) {
	var self = this;
	self.board = board;
	//reset the board behind the chess pieces. 
	//self.draw_board(stage);
	//set the size of each square on the board

    stage.removeAllChildren();

    var piece_size = 64;
	var frame;
	var framenumber;
	var bitmap;

	var black_pieces = new Container();
	var white_pieces = new Container();
	var piece_id = 0;
	for (var i = 0; i < board.length; i++) {
		framenumber = 0;

		piece_hex = board[i];

		//piece = piece.toString(16);
		tile = i.toString(16);
		if(i < 16) {
			tile = "0" + tile;
		}

		row = tile.substring(0, 1);
		column = tile.substring(1,2);

		row = Number(row) * piece_size;
		column = parseInt(column,16) * piece_size;

		if(piece_hex !== 0) {
			if(piece_hex === self.WHITE_QUEEN) {
				framenumber = 1; 
			} else if(piece_hex === self.WHITE_ROOK) {
				framenumber = 4;
			} else if(piece_hex === self.WHITE_BISHOP) {
				framenumber = 2;
			} else if(piece_hex === self.WHITE_KING) {
				framenumber = 0;
			} else if(piece_hex === self.WHITE_KNIGHT) {
				framenumber = 3;
			} else if(piece_hex === self.WHITE_PAWN) {
				framenumber = 5; 
			} else if(piece_hex === self.BLACK_QUEEN) {
				framenumber = 7;
			} else if(piece_hex === self.BLACK_ROOK) {
				framenumber = 10;
			} else if(piece_hex === self.BLACK_BISHOP) {
				framenumber = 8;
			} else if(piece_hex === self.BLACK_KING) {
				framenumber = 6;
			} else if(piece_hex === self.BLACK_KNIGHT) {
				framenumber = 9;
			} else if(piece_hex === self.BLACK_PAWN) {
				framenumber = 11; 
			}

			frame = SpriteSheetUtils.extractFrame(self.spritesheet,framenumber);
			bitmap = new Bitmap(frame);
    		bitmap.x = column + 32;
    		bitmap.y = row + 32;
    		bitmap.regX = 32;
    		bitmap.regY = 32;
    		//
			if(isEven(turn) && clientcolor == 'white' && framenumber < 6) {
				bitmap.onPress = this.drag_handler;
			//
			} else if(isOdd(turn) && clientcolor == 'black' && framenumber > 5) {
				bitmap.onPress = this.drag_handler;
			}

    		stage.addChildAt(bitmap, piece_id);

			piece_id++;
	    }
	    
	}
    stage.update();
	return true;
}


chess_client.prototype.drag_handler = function(mouseEvent) {

	// disable text selection to truly hide mouse cursor in chrome
	document.onselectstart = function(){ return false; }

	var piece_size = 64;
	// this is where onClick before drag code goes
	mouseEvent.target.rotation = -22;
	var piece = chesspiece_stage.getChildIndex(mouseEvent.target);
	var fx = (mouseEvent.stageX / piece_size) | 0;
	var fy = (mouseEvent.stageY / piece_size) | 0;
	mouseEvent.onMouseMove = function(mouseEvent) { 
		document.onselectstart = function(){ return false; }
		this.target.x = mouseEvent.stageX;
		this.target.y = mouseEvent.stageY;
		self.socket.emit('userdrag', {p: piece, x: mouseEvent.stageX, y: mouseEvent.stageY});
		//chesspiece_stage.update();
	}
	mouseEvent.onMouseUp = function(mouseEvent) {
		var tx = (mouseEvent.stageX / piece_size) | 0;
		var ty = (mouseEvent.stageY / piece_size) | 0;
		var from = fy.toString() + fx.toString();
		var to = + ty.toString() + tx.toString();

		if(from != to) {
			console.log("Move " + piece + " from " + from + " to " + to);
			self.socket.emit('chessmove', {p: piece, f: from, t: to});
		} else {
			console.log("Move " + piece + " from " + from + " to " + to);
			console.log("Invalid Move");
			this.target.rotation = 0;
		}

		// re enable text selection
		
		document.onselectstart = function(){ return true; }
		//chesspiece_stage.update();
	}
}