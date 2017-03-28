var Database = require('../core/Database');

var PaperView = function(){
	Animyst.Database.call(this);

	this.canvas = null;
	this.layers = [];
};
module.exports = PaperView;

PaperView.prototype = Object.create(Database.prototype);
PaperView.prototype.clear = function(){

	Database.prototype.clear.call(this);
};

PaperView.prototype.destroy = function(){

	Database.prototype.destroy.call(this);
};