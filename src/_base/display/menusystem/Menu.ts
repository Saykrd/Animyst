module Animyst {
    export class Menu extends Database {
    	
    	public activeScreens:string[] = [];
    	public menuData:any;
    	public elements:any;
    	public scene:IScene;



    	constructor(scene:IScene) {
    		super();

            this.scene = scene;
    	}



    	

    }


    export class Screen extends Item {

    	public type:string;
        public active:boolean;
    	
    	constructor(id, params:any) {
    		super(id, params);
    	}

    	public setup(params:any):void{
    		super.setup(params);

    		this.type = params.type;
    	}

    }
}