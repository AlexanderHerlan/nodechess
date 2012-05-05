/* Author:  Alexander Herlan */

window.addEvent('domready', function() {
	var canvas = document.getElementById('chesscanvas').getContext('2d');
	var img = new Image();   // Create new img element
	img.src = 'img/chessboard.png'; // Set source path
	img.onload = function(){
		canvas.drawImage(img,0,0,512,512);
	};
	
});