Animyst.SideScrollerWorld3D = function (threeDisplay){
	Animyst.System.call(this);

	this.threeDisplay  = threeDisplay;
}

Animyst.SideScrollerWorld3D.prototype = Object.create(Animyst.System.prototype);
Animyst.SideScrollerWorld3D.prototype.startup = function(params){
}

Animyst.SideScrollerWorld3D.prototype.shutdown = function(){

	Animyst.System.prototype.shutdown.call(this);
}

Animyst.SideScrollerWorld3D.prototype.update = function(delta, time){

	Animyst.System.prototype.update.call(this, delta, time);
}
