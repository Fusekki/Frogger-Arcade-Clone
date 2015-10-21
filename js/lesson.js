// ----------------------------------------
// Actual game code goes here.

// Global vars
fps = null; 
canvas = null;
ctx = null;

// ----------------------------------------

var MainGame = null;
var MainMenu = null;

function StartGame()
{
	GameLoopManager.stop();
	MainMenu = null;
	MainGame = new Game();
	// Async load audio and images, start gameplay when loaded
	MultiStepLoader( [
		[ "audio", function(cb, i) {
			AudioManager.load({
				'ping'   : 'sound/guitar',
				'jump'   : 'sound/jump',
				'bounce' : 'sound/bounce1'
			}, function() {
				cb(i); } ) } ],
		[ "images", function(cb, i) {
			LoadImages(MainGame.images, {
				sun: "images/sun.png"
			}, function() {
				cb(i); } ) } ],
	], function() {
		// All done, go!
		InputManager.reset();
		GameLoopManager.run(function(elapsed) { MainGame.Tick(elapsed); });
	} );
}

function StartMainMenu()
{
	GameLoopManager.stop();
	MainGame = null;
	// Async load audio and start menu when loaded
	MultiStepLoader( [
		[ "audio", function(cb, i) {
			AudioManager.load({
				'blip'   : 'sound/blip',
				'select' : 'sound/select'
			}, function() {
				cb(i); } ) } ],
	], function() {
		// All done, go!
		InputManager.reset();
		MainMenu = new Menu("Lesson 4",
				[ "Play", "Settings", "Help", "Credits" ],
				"(C) Copyright 2011 by Javier Arevalo",
				70, 50, 400,
				function(numItem) { if (numItem == 0) StartGame(); },
				null);
		GameLoopManager.run(function(elapsed) { MainMenu.Tick(elapsed); });
	} );
}

//$(document).ready(function () {
document.addEventListener("DOMContentLoaded", function(event) { 
  //do work

	canvas = document.getElementById("screen");
	ctx = canvas.getContext("2d");
	fps = new FPSMeter("fpsmeter", document.getElementById("fpscontainer"));
	InputManager.connect(document, canvas);

	StartMainMenu();
});
