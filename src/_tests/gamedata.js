var GameData = function () {
	Animyst.Database.call(this);

	this.entities            = {};
	this.entities._total     = 0;
	this.entityCreationCount = 0;

	this.addedSignal   = new signals.Signal();
	this.removedSignal = new signals.Signal();
	this.updateSignal  = new signals.Signal();
}

module.exports = GameData;

GameData.PLAYER = 0;


GameData.ENTITY_ADDED   = 0; // Passes Entity
GameData.ENTITY_REMOVED = 1; // Passes Removed Entity Data
GameData.ENTITY_UPDATED = 2; // Passes Entity

GameData.prototype = Object.create(Animyst.Database.prototype);
GameData.prototype.clear = function(){


	Animyst.Database.prototype.clear.call(this);
}

GameData.prototype.destroy = function(){
	this.entities = null;

	Animyst.Database.prototype.destroy.call(this);
}

GameData.prototype.addEntity = function(type, id, params){
	if(!this.entities[type]){
		this.entities[type]       = {};
		this.entities[type].count = 0;
	}

	var entity = {};

	entity.id   = id || type + "_" + this.entities[type].count;
	entity.type = type;

	if(params){
		for(var k in params){
			entity[k] = params[k];
		}
	}

	this.entities[type][entity.id] = entity;
	this.entities[type].count++;

	this.entities._total++;

	this.signal.dispatch(GameData.ENTITY_ADDED, entity);
	this.addedSignal.dispatch(entity);

	return entity

}


GameData.prototype.getEntity = function(id, type){
	if(!type){
		for(var k in this.entities){
			var list = this.entities[k];
			for(var entityID in list){
				if(id == entityID){
					type = k;
					break;
				}
			}
			if(type) break;
		}
	}

	if(!type || !this.entities[type][id])return;

	return this.entities[type][id];
}

GameData.prototype.removeEntity = function(id, type){
	if(!type){
		for(var k in this.entities){
			var list = this.entities[k];
			for(var entityID in list){
				if(id == entityID){
					type = k;
					break;
				}
			}
			if(type) break;
		}
	}

	if(!type || !this.entities[type][id])return;

	this.entities[type][id] = null;
	this.entities[type].count--;
	this.entities._total--

	delete this.entities[type][id];

	var data = {id:id, type:type}
	this.signal.dispatch(GameData.ENTITY_REMOVED, data);
	this.removedSignal.dispatch(data);
}


GameData.prototype.notifyUpdate = function(id, type){
	var entity = this.getEntity(id, type);
	if(entity){
		this.signal.dispatch(GameData.ENTITY_UPDATED, entity);
		this.updateSignal.dispatch(entity)
	}
}