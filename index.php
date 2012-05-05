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
	<title>SnakeByte Labs</title>
	<meta name="description" content="">
	<meta name="author" content="Alex Herlan">
	<meta name="viewport" content="width=device-width,initial-scale=1">
	<link rel="stylesheet" href="<?=$route->root?>css/style.css">
	<script src="<?=$route->root?>js/libs/modernizr-2.5.3.min.js"></script>
</head>

<body>
   <!--[if lt IE 7]><p class=chromeframe>Your browser is extremely <em>ancient!</em> <a href="http://browsehappy.com/">Upgrade to a different browser now</a> or <a href="http://www.google.com/chromeframe/?redirect=true">install Google Chrome Frame</a> to experience this site.</p><![endif]-->
	<div id="container">
		<header>
	
		</header>
		<div id="main" role="main">
			<div id="chessgame">
				<canvas id="chesscanvas" width="512" height="512">

				</canvas>
			</div>
		</div>
		<footer>
	
		</footer>
	</div>
	<script defer src="<?=$route->root?>js/libs/mootools-core-1.4.5-full-nocompat-yc.js"></script>
	<script defer src="<?=$route->root?>js/libs/mootools-more-1.4.0.1.js"></script>
	<script defer src="<?=$route->root?>js/main.js"></script>
	<script>
		window._gaq = [['_setAccount','UAXXXXXXXX1'],['_trackPageview'],['_trackPageLoadTime']];
		Modernizr.load({
			load: ('https:' == location.protocol ? '//ssl' : '//www') + '.google-analytics.com/ga.js'
		});
	</script>
</body>
</html>
