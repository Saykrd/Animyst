Animyst.CoreProcess = function(id){
	Animyst.AppState.call(this, id);

	this.inputData = null;

}

Animyst.CoreProcess.ID      = "core";

Animyst.CoreProcess.INPUT         = "input";
Animyst.CoreProcess.PAPER_DISPLAY = "paperDisplay";
Animyst.CoreProcess.THREE_DISPLAY = "threeDisplay";
Animyst.CoreProcess.PIXI_DISPLAY  = "PIXIDisplay";

Animyst.CoreProcess.prototype = Object.create(Animyst.AppState.prototype);
Animyst.CoreProcess.prototype.setup = function(){
	Animyst.LOG.output("[CoreProcess] Core Process Initialize");
	Animyst.AppState.prototype.setup.call(this);

	this.inputData = new Animyst.InputData();

	var config = this.appScope.config;
	var input  = new Animyst.Input(this.inputData);

	if(config.settings.canvasSettings){

		var canvasSettings = config.settings.canvasSettings;
		switch(canvasSettings.type){
			case "paper":
				//
				var paperDisplay = new Animyst.PaperDisplay();
				var paperEngine  = new Animyst.PaperEngine(paperDisplay);
				

				paperEngine.startup({canvasSettings : canvasSettings})

				this.addSystem("paperEngine", paperEngine);
				this.appScope.addDatabase(Animyst.CoreProcess.PAPER_DISPLAY, paperDisplay);
				break;
		}	
	}

	



	input.startup({tool:new Tool(), element: document.getElementById(canvasSettings.id)});

	this.addSystem("input", input);


	this.appScope.addDatabase(Animyst.CoreProcess.INPUT, this.inputData);

}

Animyst.CoreProcess.prototype.start = function(){
	Animyst.LOG.output("[CoreProcess] Start");
	Animyst.AppState.prototype.start.call(this);
}

Animyst.CoreProcess.prototype.update = function(delta, time){
	//console.log("[Game] Updating...")
	Animyst.AppState.prototype.update.call(this, delta, time);
}

Animyst.CoreProcess.prototype.pause = function(){
	Animyst.AppState.prototype.pause.call(this);
}

Animyst.CoreProcess.prototype.resume = function(){
	Animyst.AppState.prototype.resume.call(this);
}

Animyst.CoreProcess.prototype.kill = function(){
	Animyst.AppState.prototype.kill.call(this);
}

Animyst.CoreProcess.prototype.restart = function(){
	Animyst.AppState.prototype.restart.call(this);
}