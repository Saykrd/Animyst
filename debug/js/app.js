(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
Game = function(id){
	Animyst.AppState.call(this, id);

	this.inputData = null;
	this.gameData  = null;
	this.viewport = null;
}

module.exports = Game;
Game.prototype = Object.create(Animyst.AppState.prototype);
Game.prototype.setup = function(){
	console.log("[Game] Setting Up...");
	Animyst.AppState.prototype.setup.call(this);

	this.inputData = this.appScope.getDatabase(Animyst.CoreProcess.INPUT);
	
	var scene = new THREE.Scene();
	this.viewport = new Animyst.View3D(scene, Animyst.Window.width, Animyst.Window.height);
	this.viewport.initDisplay({resize : true, debugControls : true, addAxis : true});
	this.viewport.append();
	//this.gameData = new GameData();

	//var gameLogic   = new GameLogic(this.gameData, this.inputData);
	//var gameDisplay = new GameDisplay(this.gameData);



	
	//gameDisplay.startup({layer: this.appScope.getDatabase(Animyst.CoreProcess.PAPER_DISPLAY).getLayer(1)});
	//gameLogic.startup();

	//var threeDisplay = this.appScope.getDatabase(Animyst.CoreProcess.THREE_DISPLAY);
	//var sideScrollerWorld3d = new Animyst.SideScrollerWorld3D(threeDisplay);

	//sideScrollerWorld3d.startup({})

	//this.addSystem("world", sideScrollerWorld3d);

	//this.addSystem("gameLogic", gameLogic);
	//this.addSystem("gameDisplay", gameDisplay)
	//this.addSystem("sound", sound);

}

Game.prototype.start = function(){
	console.log("[Game] Start");
	Animyst.AppState.prototype.start.call(this);
}

Game.prototype.update = function(delta, time){
	//console.log("[Game] Updating...", delta, time)
	Animyst.AppState.prototype.update.call(this, delta, time);

	this.viewport.render();
}

Game.prototype.pause = function(){
	Animyst.AppState.prototype.pause.call(this);
}

Game.prototype.resume = function(){
	Animyst.AppState.prototype.resume.call(this);
}

Game.prototype.kill = function(){
	Animyst.AppState.prototype.kill.call(this);
}

Game.prototype.restart = function(){
	Animyst.AppState.prototype.restart.call(this);
}

},{}],2:[function(require,module,exports){
GameData = function () {
	Animyst.Database.call(this);

	this.entities            = {};
	this.entities._total     = 0;
	this.entityCreationCount = 0;

	this.addedSignal   = new signals.Signal();
	this.removedSignal = new signals.Signal();
	this.updateSignal  = new signals.Signal();
}

module.exports = GameData;

GameData.PLAYER = 0;


GameData.ENTITY_ADDED   = 0; // Passes Entity
GameData.ENTITY_REMOVED = 1; // Passes Removed Entity Data
GameData.ENTITY_UPDATED = 2; // Passes Entity

GameData.prototype = Object.create(Animyst.Database.prototype);
GameData.prototype.clear = function(){


	Animyst.Database.prototype.clear.call(this);
}

GameData.prototype.destroy = function(){
	this.entities = null;

	Animyst.Database.prototype.destroy.call(this);
}

GameData.prototype.addEntity = function(type, id, params){
	if(!this.entities[type]){
		this.entities[type]       = {};
		this.entities[type].count = 0;
	}

	var entity = {};

	entity.id   = id || type + "_" + this.entities[type].count;
	entity.type = type;

	if(params){
		for(var k in params){
			entity[k] = params[k];
		}
	}

	this.entities[type][entity.id] = entity;
	this.entities[type].count++;

	this.entities._total++;

	this.signal.dispatch(GameData.ENTITY_ADDED, entity);
	this.addedSignal.dispatch(entity);

	return entity

}


GameData.prototype.getEntity = function(id, type){
	if(!type){
		for(var k in this.entities){
			var list = this.entities[k];
			for(var entityID in list){
				if(id == entityID){
					type = k;
					break;
				}
			}
			if(type) break;
		}
	}

	if(!type || !this.entities[type][id])return;

	return this.entities[type][id];
}

GameData.prototype.removeEntity = function(id, type){
	if(!type){
		for(var k in this.entities){
			var list = this.entities[k];
			for(var entityID in list){
				if(id == entityID){
					type = k;
					break;
				}
			}
			if(type) break;
		}
	}

	if(!type || !this.entities[type][id])return;

	this.entities[type][id] = null;
	this.entities[type].count--;
	this.entities._total--

	delete this.entities[type][id];

	var data = {id:id, type:type}
	this.signal.dispatch(GameData.ENTITY_REMOVED, data);
	this.removedSignal.dispatch(data);
}


GameData.prototype.notifyUpdate = function(id, type){
	var entity = this.getEntity(id, type);
	if(entity){
		this.signal.dispatch(GameData.ENTITY_UPDATED, entity);
		this.updateSignal.dispatch(entity)
	}
}
},{}],3:[function(require,module,exports){
GameDisplay = function(gameData){
	Animyst.System.call(this);

	this.gameData = gameData;
	this.layer    = null;
	this.graphics = {};

	this.graphicProperties = {}
	this.graphicProperties[GameDisplay.PLAYER] = {}
	this.graphicProperties[GameDisplay.ENEMY]  = {}
}

module.exports = GameDisplay;

GameDisplay.PLAYER  = 0;
GameDisplay.ENEMY01 = 1;


GameDisplay.prototype = Object.create(Animyst.System.prototype);
GameDisplay.prototype.startup = function(params){

	this.gameData.signal.add(this.entityHandler, this);

	this.layer = params.layer || new Layer({position: new Point()});
	
	Animyst.System.prototype.startup.call(this, params);
}

GameDisplay.prototype.shutdown = function(){
	Animyst.System.prototype.shutdown.call(this);
}

GameDisplay.prototype.update = function(delta, time){
	Animyst.System.prototype.update.call(this);
}

GameDisplay.prototype.entityHandler = function(type, data){
	switch(type){
		case GameData.ENTITY_ADDED:
			var graphic = this.createGraphic(this.graphicProperties[data.graphic]);

			graphic.position = data.position.clone();

			this.layer.addChild(graphic);

			this.graphics[data.id] = graphic;
			break;
		case GameData.ENTITY_UPDATED:

			var graphic = this.getGraphicByID(data.id);
			
			graphic.position.x = data.position.x;
			graphic.position.y = data.position.y;

			break;

		case GameData.ENTITY_REMOVED:
			var graphic = this.getGraphicByID(data.id);

			graphic.remove();
			this.graphics[data.id] = null;
			delete this.graphics[data.id];
			break;
	}
}

GameDisplay.prototype.createGraphic = function(prop){
	return new Shape.Circle({radius:20, fillColor:"#00FFFF"});
}

GameDisplay.prototype.getGraphicByID = function(id){
	return this.graphics[id];
}
},{}],4:[function(require,module,exports){
GameLogic = function (gameData, inputData){
	Animyst.System.call(this);

	this.gameData  = gameData;
	this.inputData = inputData;
	this.screenDimensions = new Point();

	this.commands = {
		"up"    : false,
		"down"  : false,
		"left"  : false,
		"right" : false,
		"fire"  : false,
		"bomb"  : false,
		"focus" : false
	}
}

module.exports = GameLogic;
GameLogic.prototype = Object.create(Animyst.System.prototype);
GameLogic.prototype.startup = function(params){

	Animyst.System.prototype.startup.call(this);

	this.screenDimensions.x = Animyst.Window.width;
	this.screenDimensions.y = Animyst.Window.height;

	var player = this.gameData.addEntity(GameData.PLAYER, "player", {
		vector:       new Point(), 
		position:     new Point(),
		neutralSpeed: new Point(10, 10),
		focusSpeed:   new Point( 5,  5),
		focus:        false,

		graphic:      GameDisplay.PLAYER
	});

	player.position.x = this.screenDimensions.x / 2;
	player.position.y = this.screenDimensions.y / 2;

	console.log(this.screenDimensions);
	this.gameData.notifyUpdate("player", GameData.PLAYER);

	Animyst.System.prototype.startup.call(this, params);
}

GameLogic.prototype.shutdown = function(){

	Animyst.System.prototype.shutdown.call(this);
}

GameLogic.prototype.update = function(delta, time){
	this.updateCommands();
	this.updatePlayer();

	Animyst.System.prototype.update.call(this);
}

GameLogic.prototype.updateCommands = function(){

	this.commands.up    = this.inputData.isKeyDown("up");
	this.commands.down  = this.inputData.isKeyDown("down");
	this.commands.left  = this.inputData.isKeyDown("left");
	this.commands.right = this.inputData.isKeyDown("right");
	this.commands.fire  = this.inputData.isKeyDown("z");
	this.commands.focus = this.inputData.isKeyDown("shift");
}

GameLogic.prototype.updatePlayer = function(){

	var player = this.gameData.getEntity("player", GameData.PLAYER);

	player.focus = this.commands.focus;

	var speed = player.focus ? player.focusSpeed : player.neutralSpeed;

	player.vector.x = (!this.commands.left && !this.commands.right) ? 0 : this.commands.left ? -speed.x : speed.x;
	player.vector.y = (!this.commands.up   && !this.commands.down)  ? 0 : this.commands.up   ? -speed.y : speed.y;

	player.position = player.position.add(player.vector);
	this.gameData.notifyUpdate("player", GameData.PLAYER);

	//console.log(player.position.x, player.position.y, player.vector.x, player.vector.y, speed.x, speed.y);
}
},{}],5:[function(require,module,exports){
//Animyst = require("../../bin/animyst.js");
Main    = require('./main.js');
Game 	= require('./game.js');
GameLogic = require('./gamelogic.js');
GameData = require('./gamedata.js');
GameDisplay = require('./gamedisplay.js');
},{"./game.js":1,"./gamedata.js":2,"./gamedisplay.js":3,"./gamelogic.js":4,"./main.js":6}],6:[function(require,module,exports){
//require("../../bin/animyst.js");

Main = function(){
	this.game = null;
	this.app  = null;
}

module.exports = Main;

Main.prototype = {

	start: function(){
		console.log("===== MAIN ======");

		this.app = new Animyst.Application();

		this.app.initSignal.addOnce(this.onAppInit, this);

		this.app.startup({});

	},

	onAppInit: function(){
		var game = new Game("game1");
		this.app.run(game);
	}

}


},{}]},{},[5]);
