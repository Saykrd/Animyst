Animyst.Physics = {

}

Animyst.Physics.addVelocity = function(entity, vector){
	entity.mVector = entity.mVector.add(vector);
}

Animyst.Physics.applyFriction = function(entity, friction){
	entity.mVector = entity.mVector.multiply(friction);
}