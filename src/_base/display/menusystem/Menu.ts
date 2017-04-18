module Animyst {
    export class Menu extends Database {
    	
    	public activeScreens:string[] = [];
    	public menuData:any;
    	public elements:any;
    	public scene:IScene;



    	constructor() {
    		super();

    		this.activeScreens = [];


    		this.addCategory('buttons', function(elm:MenuItem){return elm.type == MenuItemType.BUTTON});

    		this.create
    	}



    	public enableButton(button:string):void{
    		var element:MenuItem = this.get(button);
    		if(element.type == MenuItemType.BUTTON){
    			var b:IButton = element.display;
    			b.enable();

    			//element.enable(); 
    		}
    	}

    	public disableButton(button:string):void{
    		var element:MenuItem = this.get(button);
    		if(element.type == MenuItemType.BUTTON){
    			var b:IButton = element.display;
    			b.disable();
    			//element.disable(); 
    		}
    	}

    	public enableButtons(buttons?:any):void{
    		buttons = buttons || this.getFromCategory('buttons');

    		if(Array.isArray(buttons)){
    			for(var i = 0; i < buttons.length; i++){
    				this.enableButton(buttons[i]);
    			}
    		} else if(typeof buttons === 'string'){
    			this.enableButton(buttons);
    		}
    	}

    	public disableButtons(buttons?:any):void{
    		buttons = buttons || this.getFromCategory('buttons');

    		if(Array.isArray(buttons)){
    			for(var i = 0; i < buttons.length; i++){
    				this.enableButton(buttons[i]);
    			}
    		} else if(typeof buttons === 'string'){
    			this.enableButton(buttons);
    		}
    	}

    }

    export class MenuItemType {
    	static SPRITE:string = "sprite";
    	static BUTTON:string = "button";
    }

    export class MenuItem extends Item {

    	public type:string;
    	public display:any;
    	private _enabled:boolean;
    	public get enabled():boolean{return this._enabled};
    	
    	constructor(id, params:any) {
    		super(id, params);
    	}

    	public setup(params:any):void{
    		super.setup(params);

    		this.type = params.type;
    	}

/*    	public enable():void{
    		this._enabled = true;
    	}

    	public disable():void{
    		this._enabled = false;
    	}*/
    }
}