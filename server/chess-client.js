


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

	this.draw_pieces = function(stage, chessboard) {
		//reset the board behind the chess pieces. 
		//that.draw_board(canvas);

		//set the size of each square on the board
		var piece_size = 64;

	    var frames = [ ];
	    var framenumber;
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
		var spritesheet = new SpriteSheet(data);
	
		for (var i = 0; i < chessboard.length; i++) {

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
			column = Number(column) * piece_size;

			if(piece_hex !== 0) {
				if(color == 0) {
					if((piece_hex & 0x07) === 0x07){ // queen
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
				} else {
					if((piece_hex & 0x07) === 0x07){ // queen
						var framenumber = 7;
					}else if((piece_hex & 0x06) === 0x06){ // rook
						var framenumber = 10;
				    }else if((piece_hex & 0x05) === 0x05){ // bishop 
				    	var framenumber = 8;
				    }else if((piece_hex & 0x03) === 0x03){ // king
				    	var framenumber = 6;
				    }else if((piece_hex & 0x02) === 0x02){ // knight
				    	var framenumber = 9;
				    }else if((piece_hex & 0x01) === 0x01){ // pawn
				    	var framenumber = 11; 
				    }
				}

		    	var frame = SpriteSheetUtils.extractFrame(spritesheet,framenumber);

				var unit = new Bitmap(frame);
				unit.x = column;
				unit.y = row;
				stage.addChild(unit);
				stage.update();
		    	/*
		    	//console.log('column: ' + column + ' row: ' + row);
		    	var pieces_crop = new Rectangle ( color ,  sprite_x, piece_size , piece_size );
		    	pieces.x = 0;
			    pieces.y = 0;
			    pieces.regX = column;
			    pieces.regY = row;
			    pieces.sourceRect = pieces_crop;
			    stage.addChild(pieces);
			    */
		    	//canvas.drawImage(sprite, sprite_piece, color, piece_size, piece_size, column, row, piece_size, piece_size); 
		    	stage.update();
		    }
		    
		}		

	}
}