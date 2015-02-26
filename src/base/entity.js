Animyst.Entity = function(id, type, cls, position){
	Animyst.Entity.instances = (Animyst.Entity.instances || 0) + 1

	this.id       = id || "instance" + Animyst.Entity.instances;
	this.type     = type || EntityType.ENEMY;
	this.class    = cls;
	this.position = position || new Point();
	this.hitBox   = null;
	this.mVector  = new Point();
}


Animyst.Entity.prototype.update = function(){
	this.position = this.position.add(this.mVector);

	this.render();
}

Animyst.Entity.prototype.setHitBox = function(){
	this.hitBox = hitBox;
}

Animyst.EntityType = {
	PLAYER    : 0,
	ENEMY     : 1,
	PROJECTILE: 2
}

Animyst.EntityClass = {
	GENERIC : 0
}