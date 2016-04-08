var Entity = function(id, type, cls, position){
	Entity.instances = (Entity.instances || 0) + 1

	this.id       = id || "instance" + Entity.instances;
	this.type     = type || EntityType.ENEMY;
	this.class    = cls;
	this.position = position || new Point();
	this.hitBox   = null;
	this.mVector  = new Point();
}
module.exports = Entity;


Entity.prototype.update = function(){
	this.position = this.position.add(this.mVector);

	this.render();
}

Entity.prototype.setHitBox = function(){
	this.hitBox = hitBox;
}

Entity.EntityType = {
	PLAYER    : 0,
	ENEMY     : 1,
	PROJECTILE: 2
}

Entity.EntityClass = {
	GENERIC : 0
}