module Animyst {

    export class MenuCategory {
        static ACTIVE:string = 'active';
        static PINNED:string = 'pinned';
        static EXITABLE:string = 'exitable';
    }

    export class Menu extends Database {

    	public menuData:any;
    	public elements:any;
    	public scene:IScene;

        public destroyOnExit:boolean;
        public prebuild:boolean;
        public disableTransitions:boolean;
        public tweenEngine:TweenEngine;



    	constructor(scene:IScene, params?:any) {
    		super();

            this.scene = scene;

            this.addCategory(MenuCategory.ACTIVE, (s:Screen) => {return s.active}, Screen);
            this.addCategory(MenuCategory.PINNED, (s:Screen) => {return s.pinned}, Screen);
            this.addCategory(MenuCategory.EXITABLE, (s:Screen) => {return !s.pinned && s.active}, Screen);

            if(params){
                this.tweenEngine = params.tweenEngine as TweenEngine;
                this.disableTransitions = params.disableTransitions;
            }
    	}

        public addScreens(screens:any): void {

            for (var k in screens) {
                var data: any = screens[k];
                this.create(Screen, k, data)

                if (this.prebuild) this.build(k);
            }

        }


        public build(screenID:string):void{
            var screen:Screen = this.get(screenID) as Screen;

            if (screen.built) return;

            this.scene.makeElements(screen.elements);

            for (var j = 0; j < screen.elements.length; j++) {
                var element: any = screen.elements[j];

                var graphic:any = this.scene.getChild(element.name);
                if (!graphic) continue;
                graphic.visible = false;
            }

            screen.built = true;
        }

        public deconstruct(screenID: any): void {
            var screen:Screen = this.get(screenID) as Screen;
            var elements = screen.elements;

            for (var j = 0; j < elements.length; j++) {
                var element: any = elements[j];

                var graphic:any = this.scene.getChild(element.name);
                if (!graphic) continue;

               // this.destroyTree(graphic);
               this.scene.removeChild(element.name);

                
               TweenMax.killTweensOf(graphic);
               //graphic.removeAllChildren();
               graphic.destroy();
            }

            screen.built = false;
        }

        public show(name:string, callback?:any):void{
            // Exit all active screens that aren't pinned, then come back and show this screen
            if(!this.isCategoryEmpty(MenuCategory.EXITABLE)){
                this.traverse((s:Screen) => {
                    this.exit(s.id, () => {
                        if(this.isCategoryEmpty(MenuCategory.EXITABLE)) this.show(name, callback);
                    })
                }, null, MenuCategory.EXITABLE);
                return;    
            }

            // Show the screen you want to show
            var screen:Screen = this.get(name);
            var enterTransition: any = ArrayUtil.search("name", "enter", screen.transitions);
            var idleTransitions: any = ArrayUtil.search("name", "idle", screen.transitions);
            var displays:any[] = [];

            this.build(name);

            screen.elements.forEach((element:any) => {
                var display = this.scene.getChild(element.name);
                TweenMax.killTweensOf(display);
                displays.push(display);
            })

            var onEnter: any = () => {
                this.scene.enableInteract();
                if (idleTransitions) this.tweenEngine.animateElements(idleTransitions, displays);
                this.executeCommandsFor("start");
                if (callback) callback();
            }

            

            screen.activate();

            this.scene.disableInteract();
            this.resetPositions(name, true);

            this.executeCommandsFor("enter");

            if(this.tweenEngine){
                 if (this.disableTransitions || !enterTransition) {
                    onEnter();
                } else{
                    this.tweenEngine.animateElements(enterTransition, displays, () => onEnter());
                }
            } else {
                onEnter();
            }

           

            
        }

        public exit(name:string, callback?:any):void{
            // Exit named screen
            var screen:Screen = this.get(name) as Screen;
            var exitTransitions: any = ArrayUtil.search("name", "exit", screen.transitions);
            var displays:any[] = [];

            screen.elements.forEach((element:any) => {
                var display = this.scene.getChild(element.name);
                TweenMax.killTweensOf(display);
                displays.push(display);
            });

            var onExit: any = (s:string, c:any) => {
                this.executeCommandsFor("exit");
                this.resetPositions(s, false); 

                let curScreen:Screen = this.get(s);
                curScreen.deactivate();
                if(this.destroyOnExit) this.deconstruct(s);            
                if (c) c();
            }

            this.scene.disableInteract();
            this.executeCommandsFor("end");

            if(this.tweenEngine){
                if (this.disableTransitions || !exitTransitions) {
                    onExit(name, callback);
                } else {
                    this.tweenEngine.animateElements(exitTransitions, displays, () => onExit(name, callback));
                } 
            } else {
                onExit(name, callback);
            }
           
        }

        public executeCommandsFor(name:string):void{

        }

        public hideAll():void{
            this.traverse((screen:Screen) => {
                if (!screen.built) return;
                for (var j = 0; j < screen.elements.length; j++) {
                    var element: any = screen.elements[j];

                    var graphic:any = this.scene.getChild(element.name);
                    if (!graphic) continue;
                    graphic.visible = false;
                }
            });
        }

        public resetPositions(screenID:string, visible: boolean = false): void {
            var screen:Screen = this.get(screenID);

            for (var i = 0; i < screen.elements.length; i++) {
                var element: any = screen.elements[i];

                var graphic:any = this.scene.getChild(element.name);
                if (!graphic) continue;

                this.scene.setProperties(graphic, element);
                
                if (visible !== null) {
                    graphic.visible = element.visible == null ? visible : element.visible;
                }
            }
        }

    }


    export class Screen extends Item {

    	public type:string;
        private _active:boolean;
        public get active():boolean{return this._active};
        public elements:Object[];
        public transitions:Object[];
        public commands:Object[];
        public data:Object;
        public built:boolean;
        private _pinned:boolean;
        public get pinned():boolean{return this._pinned};
    	
    	constructor(id, params:any) {
    		super(id, params);
    	}

    	public setup(params:any):void{
    		super.setup(params);

    		this.type = params.type;
            this.elements = params.elements || [];
            this.transitions = params.transitions || [];
            this.commands = params.commands || [];
            this.built = false;

            this.data = {};

            this._pinned = params.pin;
    	}

        public activate():void{
            this._active = true;
            this.relist();
        }

        public deactivate():void{
            this._active = false;
            this.relist();
        }

        public pin():void{
            this._pinned = false;
            this.relist();
        }

        public unpin():void{
            this._pinned = false;
            this.relist();
        }

    }
}