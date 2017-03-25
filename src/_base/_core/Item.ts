module Animyst {
    export class Item {
    	
    	public id:string;
    	public startParams:any;

    	constructor(id:string, params:any) {
    		// code...
    		this.id = id;
    		this.startParams = params;
    		this.setup(params);
    	}

    	public setup(params:any):void{
    	}

    	public reset():void{
    		this.setup(this.startParams);
    	}

    	public destroy():void{
    		this.startParams = null;
    	}
    }
}			