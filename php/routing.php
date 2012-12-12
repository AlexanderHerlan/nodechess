<?php

class routing {
	public $root;
	public $uri;
	public $get;
	
	public $page;
	public $commands;
	
	public function __construct() {
		$this->root = "https://" . $_SERVER['SERVER_NAME'] . "/nodechess/";
		$this->uri = trim($_SERVER['REQUEST_URI'], "/");
		$this->get = $_GET;
		
		//check for uri
		if(strlen($this->uri) > 1) {
			//if GET values found, seperate them
			if(strpos($this->uri, "?")) {
				$temp_uri = explode("?", $this->uri);
				$this->uri = $temp_uri[0];
			}
			$split = explode("/", $this->uri);
			$this->page = strtolower($split[0]);
			unset($split[0]);
			$this->commands = $split;
		} else { // set defaults
			$this->page = 'home';
		}
	}
}