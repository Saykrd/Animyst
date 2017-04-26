module App {
    export class PIXITests extends Animyst.AppState {
    	
    	public viewport:Animyst.ViewPIXI;
        public menu:Animyst.Menu;

    	constructor() {
    		super('PIXITests');
    	}

    	public setup():void{
    		this.viewport = new Animyst.ViewPIXI();
    		this.viewport.init({
    			backgroundColor: 0x555555 
    		});
    		this.viewport.append();

            var gameLayer:Animyst.ScenePIXI = <Animyst.ScenePIXI> this.viewport.create(Animyst.ScenePIXI, "gameLayer", {});
            var uiLayer:Animyst.ScenePIXI = <Animyst.ScenePIXI> this.viewport.create(Animyst.ScenePIXI, "uiLayer", {});

            var menus:any = Animyst.DataLoad.getAsset('menus');
            this.menu = new Animyst.Menu(gameLayer, {tweenEngine: new Animyst.TweenEngine()});
            this.menu.destroyOnExit = false;
            this.menu.addScreens(menus.menus);

            this.menu.show('Generic');


            /*gameLayer.makeElement('raptor', 'spine', {
                atlas: 'raptor_atlas',
                data: 'raptor_data',
                sheet: 'raptor_sheet',
                anim : 'walk',
                x : this.viewport.halfWidth, y : this.viewport.halfHeight + 600 / 2,
                scale : {x : 0.75, y : 0.75}
            })

            var button = uiLayer.makeElement('button', 'button', {
                up : 'greenball2',
                down : 'redball1',
                over: 'yellowball1',
                x: 50, y : 500, scale : 0.5
            })

    		button.down.add(function(id:number, button:Animyst.ButtonPIXI){
                console.log(id, button.name);
            })

            button.up.add(function(id:number, button:Animyst.ButtonPIXI){
                console.log(id, button.name);
            })

            button.over.add(function(id:number, button:Animyst.ButtonPIXI){
                console.log(id, button.name);
            })

            button.out.add(function(id:number, button:Animyst.ButtonPIXI){
                console.log(id, button.name);
            })*/

    	}

    	public frameUpdate(delta:number, framecount:number):void{
    		this.viewport.render();	
    	}
    }
}