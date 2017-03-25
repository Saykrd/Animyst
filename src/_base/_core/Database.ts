module Animyst {
    export class Database {

    	static ADDED:string   = 'added';
		static REMOVED:string = 'removed';

		private _itemCount = 0;
		private _items = {};
		private _itemList = [];
		private _categoryLists  = {};
		private _categoryChecks = {};

		public signal = new Signal();
    	
    	constructor() {
    		// code...
    	}

    	/**
		 * Adds an item category list to keep track of specific items
		 * @param {string} name    Name of category
		 * @param {function} check   A function evaluating the item. Ex: "function (item) { if(shouldBeInList) return true; return false}"
		 * @param {class} cls     The class type the item should belong to
		 * @param {ctx} context The 'this' variable to be used with the check
		 */
		public addCategory (name:string, check:any, cls?:any, context?:any){
			this._categoryLists[name] = [];
			this._categoryChecks[name] = { check: check, context: context, cls: cls};

			this.traverse(this.list, this);
		};

		/**
		 * Checks if a category exists
		 * @param {string} name [description]
		 */
		public hasCategory (name:string){
			return this._categoryLists[name] != null;
		};

		/**
		 * Adds item into all category lists that it belongs to
		 * @param {Item} item [description]
		 */
		public list (item:Item){
			for (var k in this._categoryLists) {
				var data = this._categoryChecks[k];
				if (item instanceof data.cls && data.check.call(data.context, item)) {
					ArrayUtil.include(item.id, this._categoryLists[k]);
				}
			}  
		};

		/**
		 * Removes item from all categories 
		 * @param {string} itemID [description]
		 */
		public unlist (itemID:string){
			for (var k in this._categoryLists) {
				for (var i = 0; i < this._categoryLists[k].length; i++) {
					ArrayUtil.remove(itemID, this._categoryLists[k]);
				}
			} 
		};

		/**
		 * Returns the list of item ID's in a given category
		 * @param {string} category [description]
		 */
		public getItemsInCategory (category:string){
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
		 */
		public isInCategory (itemID:string, category:string){
			var list = this._categoryLists[category];
			return list.indexOf(itemID) > -1;  
		};

		/**
		 * Traverses a category of items or all items in this database and executes a command on all of them
		 * @param  {function} command  Command to execute on all items ("function(item){//...}")
		 * @param  {object} context  'this' variable for the command
		 * @param  {string} category Category to traverse. Traverses entire database if no category is specified
		 */
		public traverse (command:any, context:any, category:string = null){
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
		 * Creates an item and adds it to the database
		 * @param {object} cls   Class of the item
		 * @param {string} id     Item ID
		 * @param {object} params Params to initialize the item
		 * @return {object} Returns the item that was added
		 */
		public create (cls:any, id:string, params?:any):Item{
		 	if(!id){
		 		id = "item" + this._itemCount  
		 	}

			if(this._items[id]){
				id = id + this._itemCount;
			}

			var item = new cls(id, params);

			item.id = id;

			this._items[id] = item;
			this._itemList.push(item.id);

			this.list(item);

			this._itemCount++;

			item.signal = this.signal;

			this.signal.dispatch(Database.ADDED, item.id);
			return item; 
		};

		/**
		 * Removes item from database
		 * @param {string} itemID [description]
		 */
		public remove (itemID:string){
			if (!this._items[itemID]) return;
			var item = this.getItem(itemID);
			
			this.unlist(itemID);
			delete this._items[itemID]
			this.signal.dispatch(Database.REMOVED, itemID);  
		};


		/**
		 * Removes all items in database
		 */
		public removeAll (){
			this.traverse(function(item) { this.remove(item.id) }, this);
		};

		
		/**
		 * Returns item in database
		 * @param {string} itemID [description]
		 */
		public getItem (itemID:string){
			return this._items[itemID];
		};

		public clear (){

		}

		public destroy (){

		}
    }
}			