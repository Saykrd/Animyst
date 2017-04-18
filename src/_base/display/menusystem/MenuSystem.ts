module Animyst {
    export class MenuSystem extends System {
    		
    	private menu:Menu;

    	constructor(menu:Menu) {
    		super();

    		this.menu = menu;
    	}

    	public startup(params?:any):void{

    	}

	   	public show(name:string, callback?:any):void{
			// Exit all active screens that are pinned

    		// Show the screen you want to show
    	}

    	public exit(name:string, callback?:any):void{
    		// Exit named screen
    	}
    }
}