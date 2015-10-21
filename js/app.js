// The World object holds many of the variables and conditions outside the enemy, player, or loot objects.
// This contains elements that specify respawn rates, highscore, loot statistics, etc.

var World = function() {
    "use strict";
    this.height = 4;
    this.width = 4;
    this.gameactive = false;
    this.highscore = 0;
    this.lootstats = {
        total: 0,
        max: 3,
        respawntime: 0,
        removeidx: null
    };
};

//  Defines the play grid.
World.prototype.grid = {
    "x" : {
        1: 0,
        2: 100,
        3: 200,
        4: 400
    },
    "y" : {
        1: 65,
        2: 140,
        3: 230,
        4: 310,
        5: 435
    }
};

// When invoked, shows the player menu.
World.prototype.showMenu = function() {
    "use strict";
    if (!menu.fade) {
      menu.fade = true;
      menu.fade_d = 1;  
    }
  
    if (!menu.show) {
      // menu.show = true;
        menu.init();
        menu.refresh();
    }
    else {
        menu.init();
    }

};

//  This function is called after player selection.  The actual gameplay starts here.
World.prototype.gameStart = function(choice) {
    "use strict";
    if (choice === 1) {
        player.sprite = 'images/char-boy.png';
    }
    else {
        player.sprite = 'images/char-cat-girl.png';
    }
    
    ctx.globalAlpha = 1;
    player.x = 501 / 2 - (player.width / 2);
    player.y = 606 - player.height;
    player.lives = 3;
    player.score = 0;

    allLoot = [];
    this.lootstats = {
        total: 3,
        max: 3,
        respawntime: 0,
        removeidx: null
    };
    allEnemies = [];

    addEnemies(totalEnemies);

    this.addLoot(this.lootstats.total);

    document.addEventListener('keyup', keyPress);
    document.getElementById('scoretotal').style.display = "block";
    document.getElementById('toptotal').style.display = "block";
    document.getElementById('livestotal').style.display = "block";
    document.getElementById('game-over').style.display = "none";

    document.getElementById('score').innerHTML = player.score;
    document.getElementById('lives').innerHTML = player.lives;

    // This flags the game for start when the main method is called.
    world.gameactive = true;
};

// Game ends function.
World.prototype.gameEnd = function() {
    "use strict";
    world.gameactive = false;
    document.removeEventListener('keyup', keyPress);
    document.getElementById('game-over').style.display = "block";
};


//  This aligns the text for the Game Over and Restart text.
World.prototype.alignGameOver = function() {
    "use strict";

    var x = ctx.canvas.getBoundingClientRect().left;
    var width = ctx.canvas.getBoundingClientRect().width;
    
    // Centers the game-over message 
    document.getElementById('game-over').style.left = x + width / 3 + 'px';
    document.getElementById('toptotal').style.left = x + width / 2.5 + 'px';
    document.getElementById('scoretotal').style.left = x + width / 1.3 + 'px';
    document.getElementById('livestotal').style.left = x + width / 8 + 'px';
    document.getElementById('game-over').style.display = "block";


};


// This function adds the loot to the allLoot array.  It also verifies that no loot will exist
// in the same location.  this sets the individual effects of each loot type.  For instance, Rock
// provides negative points but grants a temporary armor (i.e. the player is sitting on top of the rock
// and therfore will not take damage while the rock still exists.)  Additionally, the heart item grants an additional life.

World.prototype.addLoot = function(amount) {
    "use strict";

  var placed = 0,
      maxAttempts = amount * 10,
      x = 0,
      y = 0,
      available = false;
  while (placed < amount && maxAttempts > 0) {
        x = Math.floor((Math.random() * world.width) + 1);
        x = this.grid.x[x];
        y = this.grid.y[Math.floor((Math.random() * this.height) + 1)];
        available = true;
    for (var item in allLoot) {
        var idx = allLoot[item];
        if(Math.abs(idx.x - x) < 1 && Math.abs(idx.y - y) < 1) {
            available = false;
        break;
        }
    }
    if(available) {
            var intType = Math.floor((Math.random() * 7) + 1),
            loot = new Loot('loot');
            // default lo0t values
            loot.life = 0;
            loot.death = false;
            loot.deathanimate = 0.5;
            loot.animationend = 0;
            loot.respawntime = 0;

            switch(intType) {
                case 1:
                    loot.name = "gemblue";
                    loot.points = 5;
                    loot.sprite = 'images/Gem Blue.png';
                    loot.hitbox = new Hitbox(3, 58 ,93, 105);
                    break;
                case 2:
                    loot.name = "gemorange";
                    loot.points = 10;
                    loot.sprite = 'images/Gem Orange.png';
                    loot.hitbox = new Hitbox(3, 58 ,93, 105);
                    break;
                case 3:
                    loot.name = "gemgreen";
                    loot.points = 15;
                    loot.sprite = 'images/Gem Green.png';
                    loot.hitbox = new Hitbox(3, 58 ,93, 105);
                    break;
                case 4:
                    loot.name = "heart";
                    loot.points = 0;
                    loot.life = 1;
                    loot.sprite = 'images/Heart.png';
                    loot.hitbox = new Hitbox(7, 48, 88, 89);
                    break;
                case 5:
                    loot.name = "rock";
                    loot.points = -10;
                    loot.sprite = 'images/Rock.png';
                    loot.hitbox = new Hitbox(8, 67 , 85, 87);
                    break;
                case 6:
                    loot.name= "key";
                    loot.points = 20;
                    loot.sprite = 'images/Key.png';
                    loot.hitbox = new Hitbox(30, 50, 43, 91);
                    break;
                case 7:
                    loot.name = "star";
                    loot.points = 50;
                    loot.sprite = 'images/Star.png';
                    loot.hitbox = new Hitbox(15, 67, 70, 66);
                    break;
                default: 
                    break;
                    }

            loot.x = x;
            loot.y = y;
            loot.height = 171;
            loot.width = 101;
            placed += 1;
            allLoot.push(loot);
            world.lootstats.total += 1;    
            
    }
    maxAttempts -= 1;
  }

};

// This function is called when the loot fade timer expires, thus erasing the from the array.
World.prototype.clearLoot = function(time) {
    "use strict";
    
    var idx = world.lootstats.removeidx,
    type = allLoot[idx].name,
    points = allLoot[idx].points,
    life = allLoot[idx].life;

    allLoot.splice(idx,1);

    world.lootstats.removeidx = null;
    world.lootstats.total -= 1;
    world.lootstats.respawntime = Math.floor((Math.random() * 5) + 1);
    player.lives += life;
    player.score += points;
    UpdateScore();

    //Turn off the armor if the rock disappears.
    if (type === 'rock' && player.armor) {
        player.armor = false;
    }

};

//  This function maintains that the  amount of loot on the game board is kept to what the minimum should be.
World.prototype.cycleloot = function(time) {
    "use strict";

        if (allLoot.length < 3) {
            world.addLoot(1);
            if (world.lootstats.respawntime === 0) {
                var ct = null;
                for (var item in allLoot) {
                var currentItem = allLoot[item];
                if (currentItem.animate) {
                    if (ct === null || ct < currentItem.respawntime) {
                        ct = currentItem.respawntime;
                         }    
                    }
                }
            }
        }
};

// This is called when the player collides with loot.
World.prototype.loseLoot = function(entity, time) {
    "use strict";

    var idx = allLoot.indexOf(entity);
    var item = allLoot[idx];

    if (item.name === 'rock') {
 
        player.armor = true;
        player.armor_x = player.x;
        player.armor_y = player.y;

}

    world.lootstats.removeidx = allLoot.indexOf(item);
    item.respawntime = time + (item.deathanimate * 1000);
    item.death = true;
    UpdateScore();

};

// Function to start game after it has already been played at least once.
World.prototype.startOver = function() {
    "use strict";
    player = new Player();

    var gameTime = 0;
};

// Prototype for the player, enemy and loot objects.
var Actor = function(type) {
    "use strict";
    this.type = type;
    this.x;
    this.y;
    this.height = 171; // all sprites currently have this height.
    this.width = 101; // all sprites currently have this width;
    this.sprite;
    this.life;
    this.death;
    this.deathanimate;
    this.animationend;
    this.rotate = 0;
    this.animate = false;
    this.animation = null;
    this.death = false;
    this.scale = 1;
    this.scalechange = 0;
    this.scaleup = null;
    this.alpha = 1;
};

// Render for loot, player and enemy objects.
Actor.prototype.render = function() {
    "use strict";

    ctx.save();
    if (this.type === 'loot') {
                        
        if (world.lootstats.removeidx !== null) {

            if (allLoot.indexOf(this) === world.lootstats.removeidx) {            
                ctx.globalAlpha = this.alpha;
                ctx.drawImage(Resources.get(this.sprite), this.x, this.y, this.width, this.height);
            }        
        }
    } else if (this.type === 'player')  {
            if (this.animate) {
                switch (this.animation) {
                    case 'death': 
                        ctx.globalAlpha = player.alpha;
                        ctx.translate(player.x + player.hitbox.x, player.y + player.hitbox.y);
                        ctx.rotate(player.rotate * Math.PI / 180);
                        ctx.scale(player.alpha, player.alpha);
                        ctx.drawImage(Resources.get(this.sprite), -player.hitbox.x, -player.hitbox.y, this.width, this.height);
                        break;
                     case 'jump':                        
                         var scale_width = this.width / this.scale;
                         var scale_height = this.height / this.scale;
                         var scale_x = (this.x * this.scale) - this.x; 
                         var scale_y = (this.y * this.scale) - this.y; 
                         ctx.translate(this.x, this.y);
                         ctx.translate(scale_width, scale_height);
                         ctx.scale(this.scale, this.scale);
                         ctx.drawImage(Resources.get(this.sprite), -scale_width , -scale_height, this.width, this.height);
                         break;
                    default: 

                        break;

                }
             }
    }     
    
    if (this.animation != 'death' && this.animation != 'jump') {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y, this.width, this.height);
    }    


    if (hitboxEnabled) {
        this.renderHitbox();
    }

    ctx.restore();

};

// If hitbox is enabled, renders it.  Hitbox is used primarily for debug purposes and can be turned
// on or off depending on the variable.
Actor.prototype.renderHitbox = function() {
    "use strict";
    ctx.strokeStyle = "red";
    ctx.strokeRect(this.x + this.hitbox.x, this.y + this.hitbox.y, this.hitbox.width, this.hitbox.height);
    ctx.strokeStyle = "black";
};

//  Applies any updates to the objects following their render phase.  This includes movement,
//  animation and everything else. There is also a bonus points area in the game, where if your player
//  is in a highly traficked area of enemies, receives bonus points based on time spent there.
Actor.prototype.update = function(dt, time) {
    "use strict";
    switch (this.type) {
        case 'enemy':
            for (var item in allEnemies) {
                var currentItem = allEnemies[item];
                currentItem.x += currentItem.speed * dt;

                 if (currentItem.x > 500)  {// Check if enemy has reached end of board. 
                    currentItem.clear = true;
                     }          
            }
            break;
        case 'loot':
            var idx = allLoot.indexOf(this);
            if (this.animate && this.animation === 'death') {
                    this.alpha -= dt;
                    if (this.alpha < 0) {                                         
                        world.lootstats.removeidx = idx;
                        world.clearLoot(time);
                    }
            } 
            break; 
        case 'player':    
             if (player.animate) {
                    if (player.animation === 'death') {
                            player.rotate += (550* dt);
                            player.offset.x += (550* dt); 
                            player.offset.y += (550* dt);
                            player.alpha -= dt;
                            player.death = true;
                        if (player.alpha <= 0) {
                            player.rotate = 0;
                            player.animationend = 0;
                            player.animation = null;
                            player.animate = false;
                            player.death = false;
                            if (player.lives === 0) {
                                player.reset();
                                world.gameEnd();
                            } else {
                                player.reset();
                            }
                        }
                    } else if (player.animation === 'jump') {
                        if (player.scaleup) {
                            player.scalechange = (player.scale * 1.05 - player.scale);
                            player.scale *= 1.05;                            
                            if (player.scale >= 1.5) {
                                player.scaleup = false;
                                }    
                            } else {
                                player.scalechange = (player.scale * 0.95 - player.scale);
                                player.scale *= 0.95;                            
                                if (player.scale <= 1) {
                                    this.score += 100;
                                    UpdateScore();
                                    player.reset();
                                    } 
                                }

                    } else if (player.animation === 'move') {
                        switch (player.animation_d) {
                            case 'left' :
                                if (player.anime_dest < player.x){
                                    player.x -= (dt * 800);
                                } else {
                                    player.x = player.anime_dest;
                                    player.animation = null;
                                    player.animation_d = null;
                                    player.animationend = 0;
                                }
                                break;
                            case 'right':
                                if (player.anime_dest > player.x){
                                    player.x += (dt * 800);
                                } else {
                                    player.x = player.anime_dest;
                                    player.animation = null;
                                    player.animation_d = null;
                                    player.animationend = 0;
                                }
                                break;
                            case 'up':
                                if (player.anime_dest < player.y){
                                    player.y -= (dt * 800);
                                }
                                else {
                                    player.y = player.anime_dest;
                                    player.animation = null;
                                    player.animation_d = null;
                                    player.animationend = 0;
                                }
                                break;
                            case 'down': 
                                if (player.anime_dest > player.y){
                                    player.y += (dt * 800);
                                } else {
                                    player.y = player.anime_dest;
                                    player.animation = null;
                                    player.animation_d = null;
                                    player.animationend = 0;
                                }
                                break;
                           default: 
                                break;
                             }
                         }
                        }
                     if (player.y <= 0 && player.animation != 'jump') {
                    player.score += 100;
                    player.animate = true;
                    player.animation = 'jump';
                    player.scaleup = true;
                    player.animationend = time + (player.deathanimate * 1000);
                    UpdateScore();
                    }
                 if (player.y > 73 && player.y < 256) { // Check if player is in danger zone

                    if (player.bonus === false) {  // Checks to see if they had already been in zone.
                        player.bonus = true;
                        player.bonustime = time + (player.bonuswait * 1000);  
                        } else if (player.bonustime <= time) {
                            player.score += player.bonusscore;
                            UpdateScore();
                            player.bonustime = time + (player.bonuswait * 1000);
                          } 
                        UpdateScore(); 
                    }        
                 else {
                    player.bonus = false;
                        }
                    if (player.armor) {
                    if (player.x != player.armor_x || player.y != player.armor_y) {
                        player.armor = false;
                        player.armor_x = null;
                        player.armor_y = null;
                    }
             } 
        break;
        default:
          break;
    }

};

// This Hitbox object.
var Hitbox = function(x,y,w,h) {

    "use strict";
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h; 
};

// Loot object that uses the Actor as a prototype.
function Loot(type) {
    "use strict";
    Actor.call(this, type);
}

// Enemy object that uses the Actor as a prototype.
function Enemy(type) {
    "use strict";
    Actor.call(this, type);
    this.sprite = 'images/enemy-bug.png';
    this.speed = Math.floor(Math.random()*201);
    //  Uncomment below line to slow enemies down for testing purposes.  Additionally, comment line above.
    //this.speed = 1;
    this.clear = false;
    this.hitbox = new Hitbox(1,77,98,66);
    
}
// Player object that uses the Actor as a prototype.
function Player(type) {
    "use strict";
    Actor.call(this, type);
    this.sprite = 'images/char-boy.png';
    this.speed = 100;
    this.startingx = 501 / 2 - (this.width / 2);
    this.startingy = 606 - this.height;
    this.score = 0;
    this.hitbox = new Hitbox(17,63,67,76);
    this.deathanimate = 1;
    this.animationend = 0;
    this.rotate = 0;
    this.alpha = 1;
    this.offset = {
        x: 0,
        y: 0
    };
    this.armor = false;
    this.armor_x = null;
    this.armor_y = null;
    this.reset();
}
// These statements set the Loot, Player, and Enenmy objects to use the Actor prototype.
Loot.prototype = Object.create(Actor.prototype);
Loot.prototype.constructor = Loot;
Enemy.prototype = Object.create(Actor.prototype);
Enemy.prototype.constructor = Enemy;
Player.prototype = Object.create(Actor.prototype);
Player.prototype.constructor = Player;

// Called to reset the player (beginning of game, player respawn, etc.)
Player.prototype.reset = function() {
    "use strict";
    this.height = 171;
    this.width = 101;
    this.x = this.startingx;
    this.y = this.startingy;
    this.bonus = false;
    this.bonustime = 0;
    this.bonusscore = 5;
    this.bonuswait = 2;
    this.hitbox = null;
    this.hitbox = new Hitbox(17,63,67,76);
    this.offset = {
        x: 0,
        y: 0
    };
    this.alpha = 1;
    this.scale = 1;
    this.animate = false;
    this.animation = null;
    this.scalechange = 0;
    this.scaleup = null;
};

// Called when a player loses a life by being collided with an enemy.
Player.prototype.loseLife = function(time) {
    "use strict";
    player.lives -= 1;
    player.death = true;
    player.animation = 'death';
    UpdateScore();
};

// Keypress function.
function keyPress(event) {
    "use strict";

    var allowedKeys = {
 //       32: 'space',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
   player.handleInput(allowedKeys[event.keyCode]);
}


Player.prototype.handleInput = function(key) {
    "use strict";
    if (player.animation === null) {
        switch(key) {
            case "left": {
                this.animate = true;
                this.animation = 'move';
                this.animation_d = 'left';
                this.anime_dest = this.x - this.speed;
                if (this.anime_dest < world.grid.x[1]) {
                    this.anime_dest = world.grid.x[1];
                }
                break; 
            }
            case "up": {
                this.animate = true;
                this.animation = 'move';
                this.animation_d = 'up';
                this.anime_dest = this.y - this.speed;
                break;
            }
            case "down": {
                this.animate = true;
                this.animation = 'move';
                this.animation_d = 'down';
                this.anime_dest = this.y + this.speed;
                if (this.anime_dest > world.grid.y[5]) {
                    this.anime_dest = world.grid.y[5];
                }
                break;
            }
            case "right": {
                this.animate = true;
                this.animation = 'move';
                this.animation_d = 'right';
                this.anime_dest = this.x + this.speed;
                if (this.anime_dest > world.grid.x[4]) {
                    this.anime_dest = world.grid.x[4];
                }
                break;
            }
            // Uncomment the below code to add some keyboard break point.
             // case "space": {
             //    world.gameactive = false;
             //    throw new Error("Game is being paused.");
             //    break;
             // }
            default: 
                break;
       }
    }
};

// Should be called every time the score or lives change.  This handles the text on the screen
// to reflect the current lives, score, etc.
function UpdateScore() {
    "use strict";
    document.getElementById('score').innerHTML = player.score;
        if (player.score > world.highscore) {
            world.highscore = player.score;
            document.getElementById('topscore').innerHTML = world.highscore;
        }    
    document.getElementById('lives').innerHTML = player.lives;
}

// Populate enemy array function.
function addEnemies(total) {
    "use strict";
    for (var idx = 1; idx <= total; idx++) {
            
            var enemy = new Enemy('enemy');
            enemy.x = 0;
            enemy.y =  Math.floor((Math.random() * 250) + 51); 
            allEnemies.push(enemy);
        }
}

// Instantiating all variables.

player = new Player('player');
world = new World();
menu = new Menu(["Choose Player", "Jack", "Jill"]);

var gameTime = 0,
    playerSpeed = 10,
    gameOver = true,
    hitboxEnabled = false,
    allEnemies = [],
    totalEnemies = 3,
    allLoot = [];

addEnemies(totalEnemies);