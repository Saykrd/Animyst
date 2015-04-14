Animyst.ThreeDisplay = function(){
	Animyst.Database.call(this);

	this.scene    = null;
	this.renderer = null;
	this.camera   = null;

}

Animyst.ThreeDisplay.prototype = Object.create(Animyst.Database.prototype);
Animyst.ThreeDisplay.prototype.clear = function(){

	Animyst.Database.prototype.clear.call(this);
}

Animyst.ThreeDisplay.prototype.destroy = function(){

	Animyst.Database.prototype.destroy.call(this);
}

Animyst.ThreeDisplay.prototype.render = function(){
	this.renderer.render(this.scene, this.camera);
}
