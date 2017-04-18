module Animyst {
    export class Item {
    	
    	public id:string;
    	public props:any;

    	constructor(id:string, params:any) {
    		// code...
    		this.id = id;
    		this.props = params;
    		this.setup(params);
    	}

    	public setup(params:any):void{
    	}

    	public reset():void{
    		this.setup(this.props);
    	}

    	public destroy():void{
    		this.props = null;
    	}
    }
}			