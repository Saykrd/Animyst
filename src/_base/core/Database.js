var signals = require('signals');
var ArrayUtil = require('../utils/ArrayUtil');

var Database = function(){
	this.signal = new signals.Signal();
	this._itemCount = 0;
	this._items = {};
	this._itemList = [];
	this._categoryLists  = {};
	this._categoryChecks = {};

}
module.exports = Database;

Database.ADDED   = 'added';
Database.REMOVED = 'removed';

/**
 * Adds an item category list to keep track of specific items
 * @param {string} name    Name of category
 * @param {function} check   A function evaluating the item. Ex: "function (item) { if(shouldBeInList) return true; return false}"
 * @param {class} cls     The class type the item should belong to
 * @param {ctx} context The 'this' variable to be used with the check
 */
Database.prototype.addCategory = function(name, check, cls, context){
	this._categoryLists[name] = [];
	this._categoryChecks[name] = { check: check, context: context, cls: cls};

	this.traverse(this.listItem, this);
};

/**
 * Adds item into all category lists that it belongs to
 * @param  {[type]} item [description]
 */
Database.prototype.listItem = function(item){
	for (var k in this._categoryLists) {
		var data = this._categoryChecks[k];
		if (item instanceof data.cls && data.check.call(data.context, item)) {
			ArrayUtil.include(item.id, this._categoryLists[k]);
		}
	}  
};

/** Removes item from all categories */
Database.prototype.unlistItem = function(itemID){
	for (var k in this._categoryLists) {
		for (var i = 0; i < this._categoryLists[k].length; i++) {
			ArrayUtil.remove(itemID, this._categoryLists[k]);
		}
	} 
};

/**
 * Returns the list of item ID's in a given category
 * @param  {[type]} category [description]
 * @return {[type]}          [description]
 */
Database.prototype.getItemsInCategory = function(category){
	var items = this._categoryLists[category] || [];

	for (var i = items.length - 1; i >= 0 && items.length > 0; i--) {
		var item = this.getItem(items[i]);
		if (!item) {
			items.splice(i, 1);
		}
	}

	return items; 
};

/**
 * Evaluates whether an item is listed in a specific category
 * @param  {string}  itemID   [description]
 * @param  {string}  category [description]
 * @return {Boolean}          [description]
 */
Database.prototype.isInCategory = function(itemID, category){
	var list = this._categoryLists[category];
	return list.indexOf(itemID) > -1;  
};

/**
 * Traverses a category of items or all items in this database and executes a command on all of them
 * @param  {function} command  Command to execute on all items ("function(item){//...}")
 * @param  {object} context  'this' variable for the command
 * @param  {string} category Category to traverse. Traverses entire database if no category is specified
 * @return {[type]}          [description]
 */
Database.prototype.traverse = function(command, context, category = null){
	var list = this._categoryLists[category] || this._itemList;

	for (var i = 0; i < list.length; i++) {
		var item = this.getItem(list[i]);

		if (item) {
			command.call(context, item);
		} else {
			list.splice(i, 1);
			i--;
			continue;
		}
	}
};


/**
 * Adds item to the database
 * @param {object} type   Class of the item
 * @param {string} id     Item ID
 * @param {object} params Params to initialize the item
 * @return {object} Returns the item that was added
 */
Database.prototype.addItem = function(type, id, params){
 	var item = new type(id, params);

	if(this._items[id]){
		id = id + this.itemCount;
	}

	this._items[id] = item;
	this._itemList.push(item.id);

	this.listItem(item);

	this.itemCount++;

	item.signal = this.signal;

	this.signal.dispatch(Database.ADDED, item.id);
	return item; 
};

/**
 * Removes item from database
 * @param  {[type]} itemID [description]
 * @return {[type]}        [description]
 */
Database.prototype.removeItem = function(itemID){
	if (!this._items[itemID]) return;
	var item = this.getItem(itemID);
	
	delete this._items[id]
	this.signal.dispatch(Database.REMOVED, itemID);  
};


/**
 * Removes all items in database
 * @return {[type]} [description]
 */
Database.prototype.removeAllItems = function(){
	this.traverse(function(item) { this.removeItem(item.id) }, this);
};


/**
 * Returns item in database
 * @param  {[type]} itemID [description]
 * @return {[type]}        [description]
 */
Database.prototype.getItem = function(itemID){
	return this._items[itemID];
};

Database.prototype.clear = function(){

}

Database.prototype.destroy = function(){

}