Animyst.AppState = function(id){
	this.id = id;
	this._systemList = [];
	this._systemLib  = {};
	this.active = false;
	this.paused = false;
	this.appScope = null;

}

Animyst.AppState.prototype.setScope = function(appScope){
	this.appScope = appScope;
}


Animyst.AppState.prototype.clearScope = function(){
	this.appScope = null;
}

Animyst.AppState.prototype.setup = function(){

}

Animyst.AppState.prototype.start = function(){
	this.active = true;
}

Animyst.AppState.prototype.stop = function(){
	this.active = false;
	for(var i = 0 ; i < this._systemList.length; i++){
		var system = this._systemList[i];
		system.shutdown();	
	}
}

Animyst.AppState.prototype.update = function(delta, time){
	//console.log("[AppState] Updating...", this);
	if(this.active && !this.paused){
		for(var i = 0 ; i < this._systemList.length; i++){
			var system = this._systemList[i];
			if(system.started && !system.paused){
				system.update(delta, time);	
			}
		}

	}
}

Animyst.AppState.prototype.pause = function(){
	this.paused = true;
}

Animyst.AppState.prototype.resume = function(){
	this.paused = false;
}

Animyst.AppState.prototype.kill = function(){
	this.stop();
	this.clearScope();
	
	this._systemList = null;
	this._systemLib  = null;
}

Animyst.AppState.prototype.restart = function(){

}

Animyst.AppState.prototype.addSystem = function(id, system){
	if(!this._systemList[id]){
		this._systemLib[id] = system;
		this._systemList.push(system);
	}
}

Animyst.AppState.prototype.getSystem = function(id){
	if(!this._systemList[id]){
		return this._systemLib[id];
	}

	console.error("[AppState] !! No system found with ID: " + id);
}





