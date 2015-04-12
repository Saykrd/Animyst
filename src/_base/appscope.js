Animyst.AppScope = function(){
	this.databases = {};
	this.config = null;
}

Animyst.AppScope.prototype = {};
Animyst.AppScope.prototype.addDatabase = function (id, database){
	this.databases[id] = database;
}

Animyst.AppScope.prototype.getDatabase = function(id){
	return this.databases[id];
}