var System = function(){
	this.paused  = false;
	this.started = false;
	this.startupParams = null;
}
module.exports = System;

System.prototype.startup = function(params){
	this.started = true;
	this.startupParams = params;
}

System.prototype.shutdown = function(){
	this.started = false;

}

System.prototype.update = function(delta, time){

}