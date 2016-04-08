var Physics = module.exports = {}

Physics.addVelocity = function(entity, vector){
	entity.mVector = entity.mVector.add(vector);
}

Physics.applyFriction = function(entity, friction){
	entity.mVector = entity.mVector.multiply(friction);
}