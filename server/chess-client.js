


var chess_client = function () {
	var that = this;
	var chess_board;

	this.draw_board = function (stage) {
		var chessboard = new Image();   // Create new img element
		chessboard.src = 'img/chessboard.png'; // Set source path
		chessboard.onload = function(){
			var board = new Bitmap(chessboard);
		    stage.addChild(board);
		    stage.update();
			//chessboard = new Bitmap(chessboard);
			//stage.addChild(chessboard);
			//stage.update();
			//canvas.drawImage(chessboard,0,0,512,512);
		};

	}

	this.drag_handler = function(mouseEvent) {
		// this is where onClick before drag code goes
		
		var piece = chesspiece_stage.getChildIndex(mouseEvent.target);
		console.log("Target piece: " + piece);
		mouseEvent.onMouseMove = function(mouseEvent) { 
			this.target.x = mouseEvent.stageX - 32;
			this.target.y = mouseEvent.stageY - 32;
			that.socket.emit('userdrag', {p: piece, x: mouseEvent.stageX, y: mouseEvent.stageY});
			chesspiece_stage.update();
		}
	}

	this.draw_pieces = function(chesspiece_stage, chessboard) {
		that.chess_board = chessboard;
		//reset the board behind the chess pieces. 
		//that.draw_board(stage);
		//set the size of each square on the board
		var piece_size = 64;

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

	    var framenumber;

	    chesspiece_stage.removeAllChildren();

	    var data = {
			images: ["img/pieces.png"],
			frames: frames
		}
		var frame;
		var bitmap;
		var spritesheet = new SpriteSheet(data);
		var black_pieces = new Container();
		var white_pieces = new Container();
		var piece_id = 0;
		for (var i = 0; i < chessboard.length; i++) {
			framenumber = 0;
			piece = chessboard[i];
			piece_hex = chessboard[i];
			if(piece < 10) {
				piece = "0" + piece; 
			}
			//piece = piece.toString(16);
			tile = i.toString(16);
			if(i < 16) {
				tile = "0" + tile;
			}

			row = tile.substring(0, 1);
			column = tile.substring(1,2);

			piece = piece.toString();
			color = piece.substring(0, 1);
			piece = piece.substring(1,2);
			if(piece == "9") {
				color = "1";
			}

			//color = Number(color) * piece_size;
			row = Number(row) * piece_size;
			column = parseInt(column,16) * piece_size;

			if(piece_hex !== 0) {
				if(color == 0) {                           // WHITE
					if((piece_hex & 0x07) === 0x07){       // queen
						framenumber = 1; 
					}else if((piece_hex & 0x06) === 0x06){ // rook
						framenumber = 4;
				    }else if((piece_hex & 0x05) === 0x05){ // bishop
				    	framenumber = 2;
				    }else if((piece_hex & 0x03) === 0x03){ // king
				    	framenumber = 0;
				    }else if((piece_hex & 0x02) === 0x02){ // knight
				    	framenumber = 3;
				    }else if((piece_hex & 0x01) === 0x01){ // pawn
				    	framenumber = 5; 
				    }
				    frame = SpriteSheetUtils.extractFrame(spritesheet,framenumber);
				    bitmap = new Bitmap(frame);
				    bitmap.onPress = this.drag_handler;
		    		bitmap.x = column;
		    		bitmap.y = row;
		    		//bitmap.regX = 32;
		    		//bitmap.regX = 32;
		    		chesspiece_stage.addChildAt(bitmap, piece_id);
				    //white_pieces.addChildAt(bitmap, i);

				} else {                                   // BLACK
					if((piece_hex & 0x07) === 0x07){       // queen
						framenumber = 7;
					}else if((piece_hex & 0x06) === 0x06){ // rook
						framenumber = 10;
				    }else if((piece_hex & 0x05) === 0x05){ // bishop
				    	framenumber = 8;
				    }else if((piece_hex & 0x03) === 0x03){ // king
				    	framenumber = 6;
				    }else if((piece_hex & 0x02) === 0x02){ // knight
				    	framenumber = 9;
				    }else if((piece_hex & 0x01) === 0x01){ // pawn
				    	framenumber = 11; 
				    }
				    frame = SpriteSheetUtils.extractFrame(spritesheet,framenumber);
				    bitmap = new Bitmap(frame);
				    bitmap.onPress = this.drag_handler;
		    		bitmap.x = column;
		    		bitmap.y = row;
		    		//bitmap.regX = 32;
		    		//bitmap.regX = 32;
		    		chesspiece_stage.addChildAt(bitmap, piece_id);
				    //black_pieces.addChildAt(bitmap, i);
				}
				/*
				for(var i; i < white_pieces.children.length; i++) {
					white_pieces.children[i].onPress = function(mouseEvent) {
					  console.log("pressed white: " + mouseEvent.target.id);
					  mouseEvent.onMouseMove = function(mouseEvent) { 
					  	console.log("mouse moved: "+mouseEvent.stageX+","+mouseEvent.stageY); 
					  	white_pieces.children[i].x = mouseEvent.stageX;
					  	white_pieces.children[i].y = mouseEvent.stageY;
					  	chesspiece_stage.update();
					  }
					}
				}
				*/
				piece_id++;
		    	//chesspiece_stage.addChildAt(white_pieces, piece_id);
		    	//chesspiece_stage.addChildAt(black_pieces, piece_id);
		    }
		    
		}
        chesspiece_stage.update();
		return true;
	}
}