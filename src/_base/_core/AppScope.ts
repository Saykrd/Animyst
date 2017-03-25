module Animyst {
    export class AppScope {

		public databases:any = {};
		public config:any;


    	constructor() {
    		// code...
    	}

    	public addDatabase (id:string, database:Database):void{
			this.databases[id] = database;
		}

		public getDatabase (id:string):Database{
			return this.databases[id];
		}
    }
}