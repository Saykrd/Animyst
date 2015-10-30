Game = function(id){
	Animyst.AppState.call(this, id);

	this.inputData = null;
	this.gameData  = null;
}

Game.prototype = Object.create(Animyst.AppState.prototype);
Game.prototype.setup = function(){
	console.log("[Game] Setting Up...");
	Animyst.AppState.prototype.setup.call(this);

	this.inputData = this.appScope.getDatabase(Animyst.CoreProcess.INPUT);
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
