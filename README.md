Title: Frogger Clone
Author: Phillip Stafford and Udacity templates and graphics.
Description: A Frogger style clone using JS and html canvas.  This is Project 3 submission for FE Nanodegree at Udacity.

Breakdown of the files used:

index.html : starting point
app.js: Contains all the classes used for the engine.  This is the main JS file for the game elements.
engine.js : game engine that acts as the spine for the game.
menu.js: Character selection menu.
resources.js: function that handles the ingame resources (loading sprites, etc).
Style.css : CSS style for index.html
Frogger diagram.png: Very rough and slightly outdated diagram of program flow.  Needs to be updated with correct variables and additional methods that have been added.  The Menu flow is incomplete as well.

Notes:
This is a work in progress.  I originally wished to submit a fully working game with sounds and additional features but due to time constraints, and my continuing learning of code, I have submitted as is.

To do list for future additions:
Examine Actor.render function and determing if it would be more efficient to seperate all of its types into seperate methods versus the current included system.
Add sound to game and sprites.
Polish animations.
If rock is spawned, enemy should not be allowed to pass through it.
Add some sort of visual indication when you are sitting on the rock, thus gaining a temp armor boost.
Additional characters to choose from for playing game.
Add quick text on canvas whenever loot is picked up, life is lost, life is gained, points added, player in danger zone, high score reached, etc.
Add an input field for the player name if high score is reached.
High score page.
Implement a log file that keeps x amount of gameplay sessions recorded and replays them randomly between game sessions.
Implement a log file to hold high scores.
Streamline project much further (suspect redundancy in code and would like it more efficient, potential reworking of objects).
Larger game board.