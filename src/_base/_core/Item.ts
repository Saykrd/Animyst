module Animyst {
    export class Item {

        static RELIST:string = "relist";
    	
    	public id:string;
    	public props:any;
        public signal:Signal;

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

        public relist():void{
            if(this.signal) this.signal.dispatch(Item.RELIST, this.id);
        }
    }
}			