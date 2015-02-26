Animyst.System = function(){
	this.paused  = false;
	this.started = false;
	this.startupParams = null;
}

Animyst.System.prototype.startup = function(params){
	this.started = true;
	this.startupParams = params;
}

Animyst.System.prototype.shutdown = function(){
	this.started = false;

}

Animyst.System.prototype.update = function(delta, time){

}