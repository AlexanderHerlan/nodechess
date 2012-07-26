


var chess_client = function () {
	var that = this;

	this.draw_board = function (canvas) {
		var chessboard = new Image();   // Create new img element
		chessboard.src = 'img/chessboard.png'; // Set source path
		chessboard.onload = function(){
			canvas.drawImage(chessboard,0,0,512,512);
		};
	}

	this.draw_pieces = function(canvas, board) {
		that.draw_board(canvas);
		var sprite = new Image();
		var piece_size = 64;
		sprite.src = 'img/pieces.png';

		sprite.onload = function() {
			for (var i = 0; i < board.length; i++) {

				piece = board[i];
				piece_hex = board[i];
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
					var sprite_piece = 64;
				}else if((piece_hex & 0x06) === 0x06){ // rook
					var sprite_piece = 256;
			    }else if((piece_hex & 0x05) === 0x05){ // bishop
			    	var sprite_piece = 128;
			    }else if((piece_hex & 0x03) === 0x03){ // king
			    	var sprite_piece = 0;
			    }else if((piece_hex & 0x02) === 0x02){ // knight
			    	var sprite_piece = 192;
			    }else if((piece_hex & 0x01) === 0x01){ // pawn
			    	var sprite_piece = 320; 
			    }

			    if(piece_hex != 0) {
			    	canvas.drawImage(sprite, sprite_piece, color, piece_size, piece_size, column, row, piece_size, piece_size); 
			    }
				
			}
		}

	}
}
