var AppState = function(id){
	this.id = id;
	this._systemList = [];
	this._systemLib  = {};
	this.active = false;
	this.paused = false;
	this.appScope = null;

}

module.exports = AppState;
AppState.prototype.setScope = function(appScope){
	this.appScope = appScope;
}


AppState.prototype.clearScope = function(){
	this.appScope = null;
}

AppState.prototype.setup = function(){

}

AppState.prototype.start = function(){
	this.active = true;
}

AppState.prototype.stop = function(){
	this.active = false;
	for(var i = 0 ; i < this._systemList.length; i++){
		var system = this._systemList[i];
		system.shutdown();	
	}
}

AppState.prototype.update = function(delta, time){
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

AppState.prototype.pause = function(){
	this.paused = true;
}

AppState.prototype.resume = function(){
	this.paused = false;
}

AppState.prototype.kill = function(){
	this.stop();
	this.clearScope();
	
	this._systemList = null;
	this._systemLib  = null;
}

AppState.prototype.restart = function(){

}

AppState.prototype.addSystem = function(id, system){
	if(!this._systemList[id]){
		this._systemLib[id] = system;
		this._systemList.push(system);
	}
}

AppState.prototype.getSystem = function(id){
	if(!this._systemList[id]){
		return this._systemLib[id];
	}

	console.error("[AppState] !! No system found with ID: " + id);
}





