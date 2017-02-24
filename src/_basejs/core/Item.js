var Item = function(id, params){
	this.id = id;
	this.startParams = params;
	this.setup(params);
}

module.exports = Item;

Item.prototype.setup = function(params){
	//Override to suit use case
	this.data = params;
};

Item.prototype.reset = function(){
	this.setup(this.startParams) 
};

Item.prototype.destroy = function(){
	this.startParams = null;
	this.data = null;
};