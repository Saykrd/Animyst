Game = function(id){
	Animyst.AppState.call(this, id);

	this.inputData = null;
}

Game.prototype = Object.create(Animyst.AppState.prototype);
Game.prototype.setup = function(){
	console.log("[Game] Setting Up...");
	Animyst.AppState.prototype.setup.call(this);

	this.inputData = new Animyst.InputData();

	var input = new Animyst.Input(this.inputData);
	var inputView = new Animyst.InputDisplay(this.inputData);


	input.startup({tool:new Tool(), element: document.getElementById("game")});
	inputView.startup({});

	this.addSystem("input", input);
	this.addSystem("inputView", inputView)

}

Game.prototype.start = function(){
	console.log("[Game] Start");
	Animyst.AppState.prototype.start.call(this);
}

Game.prototype.update = function(delta, time){
	//console.log("[Game] Updating...")
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
