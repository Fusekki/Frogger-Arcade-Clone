;(function(exports) {
	'use strict';
	// console.log('line 3');
	var PI2 = Math.PI * 2;

	var requestAnimationFrame, cancelAnimationFrame;
	var __hasProp = {}.hasOwnProperty;
	var __extends = function(child, parent) {
		for (var key in parent) {
			if (__hasProp.call(parent, key)) child[key] = parent[key];
		}

		function Ctor() { this.constructor = child; }
		Ctor.prototype = parent.prototype;
		child.prototype = new Ctor();
		child.__super__ = parent.prototype;
		return child;
	};

	/* $.extend functionality */
	function extend( target, src ) {
		// console.log('21');
		// console.log(src);
		var name, copy, copyIsArray, clone,
			options = src,
			i = 1,
			deep = true;
		// Handle a deep copy situation
		if( typeof target === 'boolean' ) {
			deep = target;
			// skip the boolean and the target
			i = 2;
		}
		// Handle case when target is a string or something( possible in deep copy )
		if( typeof target !== 'object' && typeof target !== 'function' ){
			target = {};
		}
		// Only deal with non-null/undefined values
		if (! options) return target;

			// Extend the base object
		for( name in options ) {
			src = target[name];
			copy = options[name];
			// Prevent never-ending loop
			if( target === copy ) continue;
			// Recurse if we're merging plain objects or arrays
			copyIsArray = Array.isArray(copy);
			if( deep && (typeof copy === 'object' || copyIsArray)) {
				if( copyIsArray ) {
					clone = src && Array.isArray(src) ? src : [];
				} else clone = src && typeof src === 'object' ? src : {};
				// Never move original objects, clone them
				target[name] = extend(clone, copy);
				// Don't bring in undefined values
			} else if( typeof copy !== 'undefined' ) target[name] = copy;
		}

		return target;
	}

	// Make available to window
	var GameController = exports.GameController = {
		options: {
			right: {
				type: 'buttons',
				// position: { right: '17%', bottom: '28%' },
				position: { right: '56%', bottom: '89%' },
				buttons: [{
					offset: { x: '-13%', y: 0 },
					label: 'X',
					radius: '7%',
					stroke: 2,
					backgroundColor: 'blue',
					fontColor: '#fff',
					centerX : 0,
					centerY : 0,
					touchStart: function() {
						console.log('blue touched');
						player.handleInput("left");
						// Blue is currently mapped to up button
						// GameController.simulateKeyEvent( 'press', 88); // x key
						// GameController.simulateKeyEvent( 'down', 88);
					},
					touchEnd: function() {
						// GameController.simulateKeyEvent( 'up', 88);
					},

				}, {
					offset: { x: 0, y: '-11%' },
					label: 'Y',
					radius: '7%',
					stroke: 2,
					backgroundColor: 'yellow',
					fontColor: '#fff',
					centerX : 0,
					centerY : 0,
					touchStart: function() {
						console.log('yellow touched');
						player.handleInput("up");
						// GameController.simulateKeyEvent( 'press', 70); // f key
						// GameController.simulateKeyEvent( 'down', 70);
					},
					touchEnd: function() {
						// GameController.simulateKeyEvent( 'up', 70);
					},
				}, {
					offset: { x: '13%', y: 0 },
					label: 'B',
					radius: '7%',
					stroke: 2,
					backgroundColor: 'red',
					fontColor: '#fff',
					centerX : 0,
					centerY : 0,
					touchStart: function() {
						console.log('red touched');
						player.handleInput("right");
						// GameController.simulateKeyEvent( 'press', 90); // z key
						// GameController.simulateKeyEvent( 'down', 90);
					},
					touchEnd: function() {
						// GameController.simulateKeyEvent( 'up', 90);
					},
				}, {
					offset: { x: 0, y: '11%' },
					label: 'A',
					radius: '7%',
					stroke: 2,
					backgroundColor: 'green',
					fontColor: '#fff',
					centerX : 0,
					centerY : 0,
					touchStart: function() {
						console.log('green touched');
						player.handleInput("down");
						// GameController.simulateKeyEvent( 'press', 67); // a key
						// GameController.simulateKeyEvent( 'down', 67);
					},
					touchEnd: function() {
						// GameController.simulateKeyEvent( 'up', 67);
					},

				}],

			},
			touchRadius: 1
			// touchRadius: 45
		},
		// Areas (objects) on the screen that can be touched
		touchableAreas: [],
		touchableAreasCount: 0,
		// Multi-touch
		touches: [],
		// Canvas offset on page (for coverting touch coordinates)
		offsetX: 0,
		offsetY: 0,
		// Bounding box - used for clearRect -
		// first we determine which areas of the canvas are actually drawn to
		bound: {
			left: false,
			right: false,
			top: false,
			bottom: false
		},
		cachedSprites: {},
		paused: false,
		triggerRender: false,
		offsetCanvasTop: null,
		show: false,
		that: this,


		init: function( options ) {
			// console.log('in init');
			// if( ! document.documentElement.ontouchstart ) return;
			options = options || {};
			extend( this.options, options);
			var userAgent = navigator.userAgent.toLowerCase();
			var isUserAgent = function(s){ return userAgent.indexOf(s) !== -1; };
			// See if we should run the performanceFriendly version (for slower CPUs)
			this.performanceFriendly = ['iphone', 'android'].filter(isUserAgent)[0] ||
				this.options.forcePerformanceFriendly;

			// Grab the canvas if one wasn't passed


			var ele = document.getElementById(this.options.canvas);

			if( !this.options.canvas || !ele) {
				this.options.canvas = document.getElementsByTagName('canvas')[0];
			} else if( ele ) this.options.canvas = ele;

			// Create a canvas that goes directly on top of the game canvas
			this.createOverlayCanvas();
		},

		/**
		 * Finds the actual 4 corners of canvas that are being used
		 * (so we don't have to clear the entire canvas each render)
		 * Called when each new touchableArea is added in
		 * @param {object} options - x, y, width, height
		 */
		boundingSet: function(options) {
			var width, height, left, top;
			// Square - pivot is top left
			if( options.width ) {
				width = this.getPixels( options.width);
				height = this.getPixels( options.height);
				left = this.getPixels( options.x);
				top = this.getPixels( options.y);

				// Circle - pivot is center
			} else {
				var radius = ! this.options.touchRadius ? options.radius :
					// size of the box the joystick can go to
					this.getPixels(options.radius) * 2 +
					this.getPixels(this.options.touchRadius) / 2;
				width = height = (radius + this.getPixels(options.stroke)) * 2;
				left = this.getPixels(options.x) - width / 2;
				top = this.getPixels(options.y) - height / 2;

			}
			var right = left + width;
			var bottom = top + height;

			if( !this.bound.left || left < this.bound.left ) this.bound.left = left;
			if( !this.bound.right || right > this.bound.right ){
				this.bound.right = right;
			}
			if( !this.bound.top || top < this.bound.top ) this.bound.top = top;
			if( !this.bound.bottom || bottom > this.bound.bottom ){
				this.bound.bottom = bottom;
			}
		},

			createOverlayCanvas: function() {
			var _this = this;

			this.canvas = document.createElement('canvas');

			this.canvas.width = window.innerWidth;
			this.canvas.height = window.innerHeight;
			// Scale to same size as original canvas
			this.resize(true);
			document.body.appendChild(this.canvas);
			this.ctx = this.canvas.getContext( '2d');
			window.addEventListener( 'resize', function() {
				setTimeout(function(){ GameController.resize.call(_this); }, 10);
			});

			// Set the touch events for this new canvas
			this.setTouchEvents();

			// Load in the initial UI elements
			this.loadSide('right');

			// Starts up the rendering / drawing
			if (!this.triggerRender) {
				this.triggerRender = true;
				// console.log(this);
				// console.log(GameController);
			}
			// console.log(this);
			 // this.render();

			// pause until a touch event
			if( !this.touches || !this.touches.length ) this.paused = true;
		},

		pixelRatio: 1,
		resize: function( firstTime ) {
			// Scale to same size as original canvas
			var gameCanvas = GameController.options.canvas;
			var canvas = this.options.canvas;

			this.canvas.width = canvas.width;


			this.offsetCanvasTop = engine.actualCanvasHeight - 40;



			// Calculate out what the device heght is for this value below
			this.canvas.height = canvas.height;
			this.offsetX = gameCanvas.offsetLeft + document.body.scrollLeft;
			this.offsetY = gameCanvas.offsetTop + document.body.scrollTop;

			// Get in on this retina action
			if( canvas.style.width &&
				canvas.style.height &&
				canvas.style.height.indexOf('px') !== -1) {
				// console.log('retina here.');
				this.canvas.style.width = canvas.style.width;
				this.canvas.style.height = canvas.style.height;
				this.pixelRatio =
					this.canvas.width / parseInt(this.canvas.style.width, 10);
			}

			this.canvas.style.position = 'absolute';
			this.canvas.style.zIndex = '1';
			this.canvas.style.left = canvas.offsetLeft + 'px';
			// this.canvas.style.top = canvas.offsetTop + 'px';
			this.canvas.style.top = canvas.offsetTop + this.offsetCanvasTop + 'px';
			var style = this.canvas.getAttribute('style') +' -ms-touch-action: none;';
			this.canvas.setAttribute('style', style);

			if( !firstTime ) {
				// Remove all current buttons
				this.touchableAreas = [];
				// Clear out the cached sprites
				this.cachedSprites = [];
				// Reload in the initial UI elements
				this.reloadSide( 'right');
			}
		},

		/**
		 * Returns the scaled pixels. Given the value passed
		 * @param {int/string} value - either an integer for # of pixels,
		 * or 'x%' for relative
		 * @param {char} axis - x, y
		 */
		getPixels: function( value, axis ){

			if( !value ) return 0;
			if( typeof value === 'number' ) return value;
			// a percentage
			return parseInt(value, 10) / 100 *
				(axis === 'x' ? this.canvas.width : this.canvas.height);
		},


		setTouchEvents: function() {
			var _this = this;

			var setTouches = function(e){
				var y = e.touches[0].clientY;
				var x = e.touches[0].clientX;
				// console.log(_this.touches);
				// Microsoft always has to have their own stuff...
				// console.log(window.navigator.msPointerEnabled);
				// console.log(e);
				if( window.navigator.msPointerEnabled &&
					!! e.clientX &&
					e.pointerType === e.MSPOINTER_TYPE_TOUCH
					){
					_this.touches[ e.pointerId ] = {
						clientX: e.clientX,
						clientY: e.clientY
						// clientY: e.clientY - _this.offsetCanvasTop
					};

				} else {

				 _this.touches = e.touches || [];
				 // _this.touches[0] = {
				 // 	clientX: x,
				 // 	clientY: y -= _this.offsetCanvasTop
				 };
				 // console.log(_this.touches);
				 // _this.touches[0].clientY -= _this.offsetCanvasTop;


				// console.log(_this.touches);
				// console.log(_this.touches);
				// console.log(e.touches);
				displaytouches(e.touches[0].clientX, e.touches[0].clientY - _this.offsetCanvasTop);
			};

			var touchStart = function( e ) {
				if( _this.paused ) _this.paused = false;
				e.preventDefault();
				// console.log(e);
				setTouches(e);
			};

			var touchEnd = function( e ) {
				e.preventDefault();



				if( window.navigator.msPointerEnabled &&
					e.pointerType === e.MSPOINTER_TYPE_TOUCH ) {
					delete _this.touches[ e.pointerId ];
				} else _this.touches = e.touches || [];

				if( !e.touches || ! e.touches.length ) {
					// Draw once more to remove the touch area
					if (!_this.triggerRender) {
						// console.log('here at 370');
						_this.triggerRender = true;
					}

					 // _this.render();
					_this.paused = true;
				}
			};

			var touchMove = function( e ) {
				e.preventDefault();
				// setTouches(e);
			};

			var displaytouches= function(x,y) {
				console.log('touch: (' + x + ', ' + y + ')');

			};

			this.canvas.addEventListener('touchstart', touchStart, false);
			this.canvas.addEventListener('touchend', touchEnd);
			this.canvas.addEventListener('touchmove', touchMove);

			if( window.navigator.msPointerEnabled ) {
				this.canvas.addEventListener('MSPointerDown', touchStart);
				this.canvas.addEventListener('MSPointerUp', touchEnd);
				this.canvas.addEventListener('MSPointerMove', touchMove);
			}
		},

		/**
		 * Adds the circular area to a list of touchable areas, draws
		 * @param {object} options with properties:
		 * x, y, width, height, touchStart, touchEnd, touchMove
		 */
		addButton: function( options ) {

			var button = new TouchableButton(options);
			button.id = this.touchableAreas.push( button);
			this.touchableAreasCount++;
			this.boundingSet( options);
			// console.log(this);

		},

		addTouchableArea: function() {},

		loadButtons: function( side ) {
			// console.log('load buttons');
			var buttons = this.options[ side ].buttons;
			for( var i = 0, j = buttons.length; i < j; i++ ) {
				if( !buttons[i] || typeof buttons[i].offset === 'undefined' ) continue;
				var posX = this.getPositionX( side);
				var posY = this.getPositionY( side);

				// This code defines the supposed X and Y values
				buttons[i].x = posX + this.getPixels( buttons[i].offset.x, 'y');
				buttons[i].y = posY + this.getPixels( buttons[i].offset.y, 'y');
				this.addButton( buttons[i]);
			}
		},

		/**
		 * Used for resizing. Currently is just an alias for loadSide
		 */
		reloadSide: function( side ) { this.loadSide( side); },

		loadSide: function( side ) {
			// console.log(side);
			var o = this.options[ side ];
			if( o.type === 'dpad' ) this.loadDPad( side);
			else if( o.type === 'joystick' ) this.loadJoystick( side);
			else if( o.type === 'buttons' ) this.loadButtons( side);
		},

		/**
		 * Normalize touch positions by the left and top offsets
		 * @param {int} x
		 */
		normalizeTouchPositionX: function( x ) {
			return ( x - this.offsetX ) * this.pixelRatio;
		},

		/**
		 * Normalize touch positions by the left and top offsets
		 * @param {int} y
		 */
		normalizeTouchPositionY: function( y ) {
			// console.log(this.offsetCanvasTop);
			// console.log(y - this.offsetY - this.offsetCanvasTop * this.pixelRatio);

			return ( y - this.offsetY - this.offsetCanvasTop ) * this.pixelRatio;
		},

		/**
		 * Returns the x position when given # of pixels from right
		 * (based on canvas size)
		 * @param {int} right
		 */
		getXFromRight: function( right ) { return this.canvas.width - right; },

		/**
		 * Returns the y position when given # of pixels from bottom
		 * (based on canvas size)
		 * @param {int} right
		 */
		getYFromBottom: function( bottom ) { return this.canvas.height - bottom; },

		/**
		 * Grabs the x position of either the left or right side/controls
		 * @param {string} side - 'left', 'right'
		 */
		getPositionX: function( side ) {
			var position = this.options[side].position;
			return typeof position.left !== 'undefined' ?
				this.getPixels(position.left, 'x') :
				this.getXFromRight(this.getPixels(position.right, 'x'));
		},

		/**
		 * Grabs the y position of either the left or right side/controls
		 * @param {string} side - 'left', 'right'
		 */
		getPositionY: function( side ) {
			var position = this.options[side].position;

			return typeof position.top !== 'undefined' ?
				this.getPixels(position.top, 'y') :
				this.getYFromBottom(this.getPixels(position.bottom, 'y'));
		},

		/**
		 * Processes the info for each touchableArea
		 */
		renderAreas: function() {
			// console.log('in renderAreas');
			// if (this.triggerRender) {
			// 	console.log('disable triggerRender.');
			// 	// this.triggerRender = false;
			// }
			for( var i = 0, j = this.touchableAreasCount; i < j; i++ ) {
				var area = this.touchableAreas[ i ];
				if( typeof area === 'undefined' ) continue;
				area.draw();
				// this.triggerRender = false;
				// console.log('disable triggerRender.');
				// Go through all touches to see if any hit this area
				var touched = false;
				//console.log(this.touches.length);
				for( var k = 0, l = this.touches.length; k < l; k++ ) {
					// console.log('TOUCH CHECK');
					var touch = this.touches[ k ];
					if( typeof touch === 'undefined' ) continue;
					var x = this.normalizeTouchPositionX(touch.clientX),
						y = this.normalizeTouchPositionY(touch.clientY);
					// Check that it's in the bounding box/circle
					if( area.check(x, y) && !touched) touched = this.touches[k];
				}
				if( touched ) {
					// console.log('touched');
					// this.triggerRender = true;
					if( !area.active ) area.touchStartWrapper(touched);
					area.touchMoveWrapper(touched);
				} else if( area.active ) area.touchEndWrapper(touched);
			}

		},

		render: function() {
			// console.log(this);
			// throw new Error("Something went badly wrong!");
			// console.log('in render');
			var bound = this.bound;
			if( ! this.paused || ! this.performanceFriendly ){
				// console.log(_this);
				this.ctx.clearRect(
					bound.left,
					bound.top,
					bound.right - bound.left,
					bound.bottom - bound.top
				);
			}

			// Draw feedback for when screen is being touched
			// When no touch events are happening,
			// this enables 'paused' mode, which skips running this.
			// This isn't run at all in performanceFriendly mode
			if( ! this.paused && ! this.performanceFriendly ) {
				var cacheId = 'touch-circle';
				var cached = this.cachedSprites[ cacheId ];
				var radius = this.options.touchRadius;
				if( ! cached && radius ) {
					var subCanvas = document.createElement('canvas');
					var ctx = subCanvas.getContext('2d');
					subCanvas.width = 2 * radius;
					subCanvas.height = 2 * radius;

					var center = radius;
					var gradient = ctx.createRadialGradient(
						center,
						center,
						1,
						center,
						center,
						center
					);

					gradient.addColorStop(0, 'rgba( 200, 200, 200, 1 )');
					gradient.addColorStop(1, 'rgba( 200, 200, 200, 0 )');
					ctx.beginPath();
					ctx.fillStyle = gradient;
					ctx.arc(center, center, center, 0, PI2, false);
					ctx.fill();

					cached = GameController.cachedSprites[ cacheId ] = subCanvas;
				}
				// Draw the current touch positions if any
				for( var i = 0, j = this.touches.length; i < j; i++ ) {
					var touch = this.touches[ i ];
					if( typeof touch === 'undefined' ) continue;
					var x = this.normalizeTouchPositionX(touch.clientX),
						y = this.normalizeTouchPositionY(touch.clientY);
					if( x - radius > this.bound.left &&
						x + radius < this.bound.right &&
						y - radius > this.bound.top &&
						y + radius < this.bound.bottom
						){
						console.log('in draw image');
						this.ctx.drawImage(cached, x - radius, y - radius);
					}
				}
			}

			// console.log('in render 582');

			// Render if the game isn't paused, or we're not in  performanceFriendly
			// mode (running when not paused keeps the semi-transparent gradients
			// looking better for some reason)
			// Process all the info for each touchable area
			// console.log(this.paused);
			// console.log(this.performanceFriendly);
			// console.log(this.triggerRender);
			if( !this.paused || !this.performanceFriendly ) this.renderAreas();
			// requestAnimationFrame(this.renderWrapper);
		},
		/**
		 * So we can keep scope, and don't have to create a new obj every
		 * requestAnimationFrame (bad for garbage collection)
		 */
		renderWrapper: function() {
			// console.log('in renderWrapper 596');

			GameController.render();
			GameController.renderAreas();
			// if (this.triggerRender)
			// {
			// 	console.log('trigger render from renderWrapper');
			// 	GameController.renderAreas();
			// }

		},
	};

	/**
	 * Superclass for touchable stuff
	 */
	var TouchableArea = ( function() {
		function TouchableArea(){ }
		// Called when this direction is being touched
		TouchableArea.prototype.touchStart = null;
		// Called when this direction is being moved
		TouchableArea.prototype.touchMove = null;
		// Called when this direction is no longer being touched
		TouchableArea.prototype.touchEnd = null;
		TouchableArea.prototype.type = 'area';
		TouchableArea.prototype.id = false;
		TouchableArea.prototype.active = false;

		/**
		 * Sets the user-specified callback for this direction being touched
		 * @param {function} callback
		 */
		TouchableArea.prototype.setTouchStart = function( callback ) {
			this.touchStart = callback;
		};

		/**
		 * Called when this direction is no longer touched
		 */
		TouchableArea.prototype.touchStartWrapper = function() {
			// console.log('touchstartwrapper');
			// console.log(this);
			// console.log(this.touchStart);
			// Fire the user specified callback
			if( this.touchStart ) this.touchStart();
			// Mark this direction as active
			this.active = true;
		};

		/**
		 * Sets the user-specified callback for this direction
		 * no longer being touched
		 * @param {function} callback
		 */
		TouchableArea.prototype.setTouchMove = function( callback ) {
			this.touchMove = callback;
		};

		/**
		 * Called when this direction is moved. Make sure it's actually changed
		 * before passing to developer
		 */
		TouchableArea.prototype.lastPosX = 0;
		TouchableArea.prototype.lastPosY = 0;
		TouchableArea.prototype.touchMoveWrapper = function( e ) {
			// Fire the user specified callback
			if( this.touchMove && (
				e.clientX !== TouchableArea.prototype.lastPosX ||
				e.clientY !== TouchableArea.prototype.lastPosY)
				){
				this.touchMove();
				this.lastPosX = e.clientX;
				this.lastPosY = e.clientY;
			}
			// Mark this direction as active
			this.active = true;
		};

		/**
		 * Sets the user-specified callback for this direction
		 * no longer being touched
		 * @param {function} callback
		 */
		TouchableArea.prototype.setTouchEnd = function( callback ) {
			this.touchEnd = callback;
		};

		/**
		 * Called when this direction is first touched
		 */
		TouchableArea.prototype.touchEndWrapper = function() {
			// Fire the user specified callback
			if( this.touchEnd ) this.touchEnd();
			// Mark this direction as inactive
			this.active = false;
			GameController.render();
		};

		return TouchableArea;
	} )();

	var TouchableButton = ( function( __super ) {


		function TouchableButton( options ) {
			// console.log(options);
			for( var i in options ) {
				if( i === 'x' ) this[i] = GameController.getPixels( options[i], 'x');
				else if( i === 'y' || i === 'radius' ){
					this[i] = GameController.getPixels(options[i], 'y');
				} else this[i] = options[i];
			}
			// console.log(this);
			this.draw();
			this.centerX = this.x + this.radius;
			this.centerY = this.y + this.radius;
		}
		__extends( TouchableButton, __super);

		TouchableButton.prototype.type = 'button';

		/**
		 * Checks if the touch is within the bounds of this direction
		 */
		TouchableButton.prototype.check = function( touchX, touchY ) {

			// touchY -= _this.offsetCanvasTop;


			 // It looks like this calculation for the touch logic needs to be adjusted.
			 // the this.x and possibly this.y need to be multiplied by engine.multiplier.
			 // this.radius might need to be adjusted as well.
			var radius = this.radius + GameController.options.touchRadius / 2;
			// console.log(this.backgroundColor);


			//  console.log('touch : ' + touchX + ', ' + touchY);
			//  console.log('this.x: ' + this.x);
			//  console.log('this.centerX: ' + this.centerX);
			//  console.log('this.centerY: ' + this.centerY);

			//  console.log('Math.abs-X: (if less than radius equals touch)' + Math.abs(touchX - this.centerX));
			//  console.log('Math.abs-Y: (if less than radius equals touch)' + Math.abs(touchY - this.centerY));
			//  console.log('radius: ' + this.radius + GameController.options.touchRadius / 2 * 1.578125);
			//  console.log(GameController.options.touchRadius);

			//  console.log(radius);

			//  var xabs = Math.abs(touchX - this.centerX);
			//  var yabs = Math.abs(touchY - this.centerY);

			//  if (xabs < radius) {
			//  	console.log('x true.')
			//  } else {
			//  	console.log('x false')
			//  }

			//  if (yabs < radius) {
			//  	console.log('y true.')
			//  } else {
			//  	console.log('y false')
			//  }


			return Math.abs(touchX - this.centerX) < radius &&
				Math.abs(touchY - this.centerY) < radius;
			// return Math.abs(touchX - this.x) < radius &&
			// 	Math.abs(touchY - this.y) < radius;
		};

		TouchableButton.prototype.draw = function() {
			// console.log('in draw 758');
			var cacheId = this.type + '' + this.id + '' + this.active,
				cached = GameController.cachedSprites[ cacheId ],
				r = this.radius;

			if( ! cached ){

				var subCanvas = document.createElement('canvas');
				var ctx = subCanvas.getContext( '2d');

				ctx.lineWidth = this.stroke;
				subCanvas.width = subCanvas.height = 2 * (r + ctx.lineWidth);

				var gradient = ctx.createRadialGradient(r, r, 1, r, r, r);
				var textShadowColor;
				switch( this.backgroundColor ) {
					case 'blue':
						gradient.addColorStop(0, 'rgba(123, 181, 197, 0.6)');
						gradient.addColorStop(1, '#105a78');
						textShadowColor = '#0A4861';
						break;
					case 'green':
						gradient.addColorStop(0, 'rgba(29, 201, 36, 0.6)');
						gradient.addColorStop(1, '#107814');
						textShadowColor = '#085C0B';
						break;
					case 'red':
						gradient.addColorStop(0, 'rgba(165, 34, 34, 0.6)');
						gradient.addColorStop(1, '#520101');
						textShadowColor = '#330000';
						break;
					case 'yellow':
						gradient.addColorStop(0, 'rgba(219, 217, 59, 0.6)');
						gradient.addColorStop(1, '#E8E10E');
						textShadowColor = '#BDB600';
						break;
					default:
					case 'white':
						gradient.addColorStop(0, 'rgba( 255,255,255,.3 )');
						gradient.addColorStop(1, '#eee');
						break;
				}

				if( this.active ) ctx.fillStyle = textShadowColor;
				else ctx.fillStyle = gradient;

				ctx.strokeStyle = textShadowColor;
				ctx.beginPath();
				//ctx.arc( this.x, this.y, r, 0 , PI2, false);
				var halfW = subCanvas.width / 2;
				// console.log(halfW);
				ctx.arc(halfW, halfW, r, 0 , PI2, false);
				ctx.fill();
				ctx.stroke();

				if( this.label ) {
					// Text Shadow
					var fontSize = this.fontSize || subCanvas.height * 0.35,
						halfH = subCanvas.height / 2;
					ctx.fillStyle = textShadowColor;
					ctx.font = 'bold ' + fontSize + 'px Verdana';
					ctx.textAlign = 'center';
					ctx.textBaseline = 'middle';
					ctx.fillText(this.label, halfH + 2, halfH + 2);

					ctx.fillStyle = this.fontColor;
					ctx.fillText(this.label, halfH, halfH);
				}

				cached = GameController.cachedSprites[ cacheId ] = subCanvas;
			}
			// console.log(cached);
			// console.log(GameController);
			GameController.ctx.drawImage( cached, this.x, this.y);
		};

		return TouchableButton;
	} )( TouchableArea);

	/**
	 * Shim for requestAnimationFrame
	 */
	(function() {
		// console.log('here');

	  if (typeof module !== 'undefined') return;
		var lastTime = 0;
		var vendors = ['ms', 'moz', 'webkit', 'o'];
		requestAnimationFrame = window.requestAnimationFrame;
		cancelAnimationFrame = window.cancelAnimationFrame;
		for( var x = 0; x < vendors.length && !requestAnimationFrame; ++x ){
			alert('HERE');
			requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
			cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] ||
				window[vendors[x]+'CancelRequestAnimationFrame'];
		}

		if (!requestAnimationFrame){
			alert('HERE');
			requestAnimationFrame = function(callback) {
				var currTime = Date.now();
				var timeToCall = Math.max(10, 16 - currTime + lastTime);
				lastTime = currTime + timeToCall;
				return window.setTimeout(function() {
					callback(currTime + timeToCall);
				}, timeToCall);
			};
		}

		if (!cancelAnimationFrame){
			alert('HERE');
			cancelAnimationFrame = function(id){ clearTimeout( id); };
		}
		// console.log(typeof(module));
	}());
})(typeof module !== 'undefined' ? module.exports : window);
