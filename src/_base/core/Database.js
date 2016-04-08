var signals = require('signals');
var Database = function(){
	this.signal = new signals.Signal();
}
module.exports = Database;

Database.prototype.clear = function(){

}

Database.prototype.destroy = function(){

}