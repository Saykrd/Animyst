Animyst.Application = function(){
	this._appStateList = [];
	this._appStateLib  = {};

}

Animyst.Application.prototype.startup = function(params){
	console.log("===================================================");
	console.log("   ----- AnimystJS: (v 0.0.0) by ~Saykrd -----   ");
	console.log("===================================================");



	if(params.paper){
		paper.install(window);
		paper.setup(params.canvasID);

		view.onFrame = this.update.bind(this);
	}


	console.log("[Application] Application Started")
}

Animyst.Application.prototype.run = function(appState){
	if(!this._appStateLib[appState.id]){
		this._appStateLib[appState.id] = appState;

		this._appStateList.push(appState);

		appState.setup();
		appState.start();
	}
}

Animyst.Application.prototype.halt = function(appStateID){
	if(!this._appStateLib[appState.id]){
		this._appStateLib[appState.id].pause();
	}
}

Animyst.Application.prototype.resume = function(appStateID){
	if(!this._appStateLib[appState.id]){
		this._appStateLib[appState.id].resume();
	}
}


Animyst.Application.prototype.end = function(appStateID){
	if(!this._appStateLib[appState.id]){
		var appState = this._appStateLib[appState.id]

		appState.kill();

		this._appStateLib[appState.id] = null;

		for(var i = 0; i < this._appStateList.length; i++){
			var state = this._appStateList[i];
			if(state.id == appState.id){
				this._appStateList.splice(i,1);
				break;
			}
		}
	}
}

Animyst.Application.prototype.endAll = function(){
	for(var k in this._appStateLib){
		this.end(k)
	}
}

Animyst.Application.prototype.update = function(event){
	for(var i = 0; i < this._appStateList.length; i++){
		var state = this._appStateList[i];
		state.update(event.delta, event.time);
	}
}