/* Author:  Alexander Herlan */
var pieces = new Image();
pieces.src = 'img/pieces.png';
var canvas = document.getElementById('chesscanvas').getContext('2d');

window.addEvent('domready', function() {
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