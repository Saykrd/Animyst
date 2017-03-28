
var THREE = require('three');
var Game = function(id){
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


	let texture = new THREE.Texture(Animyst.DataLoad.getAsset('run_sheet'));
	texture.needsUpdate = true;
	console.log(texture)
	let material = new THREE.SpriteMaterial({map:texture});
	let sprite = new THREE.Sprite( material );

	sprite.scale.set(texture.image.width,texture.image.height,1.0);
	scene.add(sprite);

	var ssData = new Animyst.SpriteSheetData("run", Animyst.DataLoad.getAsset('run_data'))
	var anim = new Animyst.SpriteSheetAnimation('running', this.framerate);
	//console.log(ssData.getFrames('run'));
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
