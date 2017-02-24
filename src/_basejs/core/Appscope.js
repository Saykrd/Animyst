var AppScope = function(){
	this.databases = {};
	this.config = null;
}
	
module.exports = AppScope;
AppScope.prototype = {};
AppScope.prototype.addDatabase = function (id, database){
	this.databases[id] = database;
}

AppScope.prototype.getDatabase = function(id){
	return this.databases[id];
}