Animyst.PaperDisplay = function(){
	Animyst.Database.call(this);

	this.canvas = null;
	this.layers = [];
}

Animyst.PaperDisplay.prototype = Object.create(Animyst.Database.prototype);
Animyst.PaperDisplay.prototype.clear = function(){

	Animyst.Database.prototype.clear.call(this);
}

Animyst.PaperDisplay.prototype.destroy = function(){

	Animyst.Database.prototype.destroy.call(this);
}

Animyst.PaperDisplay.prototype.addLayer = function(){
	var layer = new Layer({position: new Point()});
	this.layers.push(layer);
}

Animyst.PaperDisplay.prototype.getLayer = function(index){
	return this.layers[index];
}

Animyst.PaperDisplay.prototype.activateLayer = function(index){
	this.layers[index].activate();
}