var AppState = require('../core/AppState'),
	Log = require('../core/Logging'),
	Input = require('../input/Input'),
	InputData = require('../input/InputData');

var CoreProcess = function(id){
	AppState.call(this, id);

	this.inputData = null;

}

module.exports = CoreProcess;

CoreProcess.ID      = "core";

CoreProcess.INPUT          = "input";
CoreProcess.PAPER_VIEWPORT = "paperViewport";
CoreProcess.VIEWPORT_3D    = "threeViewport";
CoreProcess.PIXI_VIEWPORT  = "PIXIViewport";

CoreProcess.prototype = Object.create(AppState.prototype);
CoreProcess.prototype.setup = function(){
	Log.output("[CoreProcess] Core Process Initialize");
	AppState.prototype.setup.call(this);

	this.inputData = new InputData();

	var config = this.appScope.config;
	var input  = new Input(this.inputData);


	input.startup({element: document.body, keyboardSettings:config.settings.keyboard});

	this.addSystem("input", input);


	this.appScope.addDatabase(CoreProcess.INPUT, this.inputData);

}

CoreProcess.prototype.start = function(){
	Log.output("[CoreProcess] Start");
	AppState.prototype.start.call(this);
}

CoreProcess.prototype.update = function(delta, time){
	//console.log("[Game] Updating...")
	AppState.prototype.update.call(this, delta, time);
}

CoreProcess.prototype.pause = function(){
	AppState.prototype.pause.call(this);
}

CoreProcess.prototype.resume = function(){
	AppState.prototype.resume.call(this);
}

CoreProcess.prototype.kill = function(){
	AppState.prototype.kill.call(this);
}

CoreProcess.prototype.restart = function(){
	AppState.prototype.restart.call(this);
}