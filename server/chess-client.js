


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

		var sprite = new Image();
		sprite.src = 'img/pieces.png';
		sprite.onload=function() {
			
		    var pieces = new Bitmap(sprite);

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

				color = Number(color) * piece_size;
				row = Number(row) * piece_size;
				column = Number(column) * piece_size;

				if((piece_hex & 0x07) === 0x07){ // queen
					var sprite_x = 64;
				}else if((piece_hex & 0x06) === 0x06){ // rook
					var sprite_x = 256;
			    }else if((piece_hex & 0x05) === 0x05){ // bishop
			    	var sprite_x = 128;
			    }else if((piece_hex & 0x03) === 0x03){ // king
			    	var sprite_x = 0;
			    }else if((piece_hex & 0x02) === 0x02){ // knight
			    	var sprite_x = 192;
			    }else if((piece_hex & 0x01) === 0x01){ // pawn
			    	var sprite_x = 320; 
			    }

			    if(piece_hex != 0) {
			    	var pieces_crop = new Rectangle ( sprite_x , color , piece_size , piece_size );
			    	pieces.x = column;
				    pieces.y = row;
				    pieces.sourceRect = pieces_crop;
				    stage.addChild(pieces);
			    	//canvas.drawImage(sprite, sprite_piece, color, piece_size, piece_size, column, row, piece_size, piece_size); 
			    }
			    stage.update();
				
			}
			
		}
		

	}
}


function tick() {
	stage.update();
}