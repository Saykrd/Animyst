Animyst.PaperViewport = function(){
	Animyst.Database.call(this);

	this.canvas = null;
	this.layers = [];
};

Animyst.PaperViewport.prototype = Object.create(Animyst.Database.prototype);
Animyst.PaperViewport.prototype.clear = function(){

	Animyst.Database.prototype.clear.call(this);
};

Animyst.PaperViewport.prototype.destroy = function(){

	Animyst.Database.prototype.destroy.call(this);
};