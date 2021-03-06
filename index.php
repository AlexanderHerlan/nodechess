<?php
// Web App Template by Alexander Wesley Herlan
require_once("php/routing.php");
$route = new routing();
?>
<!doctype html>
<!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en"> <![endif]-->
<!--[if IE 7]>    <html class="no-js ie7 oldie" lang="en"> <![endif]-->
<!--[if IE 8]>    <html class="no-js ie8 oldie" lang="en"> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js" lang="en"> <!--<![endif]-->
<head>
	<meta charset="utf-8">
	<title>Multiplayer Chess</title>
	<meta name="description" content="">
	<meta name="author" content="Alex Herlan">
	<meta name="viewport" content="width=device-width,initial-scale=1">
	<link rel="stylesheet" href="<?=$route->root?>css/style.css">
	<link rel="stylesheet" href="<?=$route->root?>js/mylibs/css/uniform.default.css" type="text/css" media="screen" charset="utf-8" />
	<script src="<?=$route->root?>js/libs/modernizr-2.5.3.min.js"></script>
	<script src="<?=$route->root?>js/libs/PxLoader.js"></script>
	<script src="<?=$route->root?>js/libs/PxLoaderImage.js"></script>
</head>

<body onload="init()">
   <!--[if lt IE 7]><p class=chromeframe>Your browser is extremely <em>ancient!</em> <a href="http://browsehappy.com/">Upgrade to a different browser now</a> or <a href="http://www.google.com/chromeframe/?redirect=true">install Google Chrome Frame</a> to experience this site.</p><![endif]-->
    <div class="overlay" id="overlay" style="display:none;"></div>
    <div class="quick_overlay" id="quick_overlay" style="display:none;"></div>
    <div class="welcome_box" id="msg_box">
		<h1 id="msg_box_title">Welcome to Chess!</h1>
		<div id="msg_box_body">
			<form id="frm_player_details" >
				<p>Please choose a name: </p>
				<input type="text" id="player_name"><div id="player_name_error"></div>
				<div id="color_select">
				<label for="player_w"><input type="radio" name="player_select" id="player_w" value="white"><span class="white_king player_select_piece">White</span></label>
				<label for="player_b"><input type="radio" name="player_select" id="player_b" value="black"><span class="black_king player_select_piece">Black</span></label>
				<label for="player_s"><input type="radio" name="player_select" id="player_s" value="spectator"><span class="spectator player_select_piece">Spectator</span></label>
				</div>
				<div id="msg_box_submit">
					<button type="button" id="continue_player">Continue</button>
				</div>
			</form>
		</div>
	</div>


	<div id="container">
		<header>
			<div id="turn_reminder"></div>
		</header>
		<div id="main" role="main">
			<div id="chessgame">
				<div id="legend">
					<div id="horizontal_legend">
						<ul>
							<li>A</li>
							<li>B</li>
							<li>C</li>
							<li>D</li>
							<li>E</li>
							<li>F</li>
							<li>G</li>
							<li>H</li>
						</ul>
					</div>
					<div id="vertical_legend">
						<ul>
							<li>8</li>
							<li>7</li>
							<li>6</li>
							<li>5</li>
							<li>4</li>
							<li>3</li>
							<li>2</li>
							<li>1</li>
						</ul>
					</div>
				</div>
				<canvas id="chessboard_canvas" width="512" height="512"></canvas>
				<canvas id="chesspiece_canvas" width="512" height="512"></canvas>
				<div id="chesssidebar">
					<div id="chessinfo">
						<h2>Game Info</h2>
						<div id="chessinfo_pane">
							<div id="current_player_status">Initializing</div>
							<div id="players_list">
								<div id="player_black">
									<h3>Black:</h3>
									<div class="name_black"></div>
								</div>
								<div id="player_white">
									<h3>White:</h3>
									<div class="name_white"></div>
								</div>
							</div>
							<div id="spectators_list"><h3>Spectators:</h3></div>
						</div>
					</div>
					<div id="chesshistory">
						<h2>History</h2>
						<div id="chesshistory_buffer">

						</div>
					</div>
					<div id="chesschat">
						<h2>Chat</h2>
						<div id="chesschat_buffer" class="scroll-pane">

						</div>
						<input type="text" value="" id="chesschat_input" name="chesschat_input">
					</div>
				</div>

			</div>
		</div>
		<footer>
	
		</footer>
	</div>
	<script defer src="<?=$route->root?>js/libs/jquery-1.7.2.min.js"></script>
	<script defer src="<?=$route->root?>js/mylibs/jquery.mousewheel.js"></script>
	<script defer src="<?=$route->root?>js/mylibs/jquery.jscrollpane.min.js"></script>
	<script defer src="<?=$route->root?>js/mylibs/jquery.cookie.js"></script>
	<script defer src="<?=$route->root?>js/mylibs/jquery.uniform.js"></script>
	<script defer src="<?=$route->root?>js/libs/easeljs-0.4.2.min.js"></script>
	<script defer src="<?=$route->root?>js/libs/tweenjs-0.2.0.min.js"></script>
	<script defer src="<?=$route->root?>js/libs/socket.io.min.js"></script>
	<script defer src="<?=$route->root?>js/libs/angular-1.0.1.js"></script>
	<script defer src="<?=$route->root?>server/chess-client.js"></script>
	<script defer src="<?=$route->root?>js/main.js"></script>
	<script>
		window._gaq = [['_setAccount','UAXXXXXXXX1'],['_trackPageview'],['_trackPageLoadTime']];
		Modernizr.load({
			load: ('https:' == location.protocol ? '//ssl' : '//www') + '.google-analytics.com/ga.js'
		});
	</script>
</body>
</html>
