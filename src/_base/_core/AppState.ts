module Animyst {
    export class AppState {
    	

    	private _id:string;
    	public get id():string{return this._id};

    	private _systemList:any[] = [];
    	private _systemLib:any = [];

    	public active:boolean;
    	public paused:boolean;
    	public appScope:AppScope;
    	private _framerate:number = 60;
    	public get framerate():number { return this._framerate};
    	public set framerate(v:number){this._framerate = v};

    	public _timestep:number = 1000/this.framerate;
    	public get timestep():number { return this._timestep};
    	public set timestep(v:number){this._timestep = v};

		public setScope (appScope):void{
			this.appScope = appScope;
		}


		public clearScope ():void{
			this.appScope = null;
		}


		public setup ():void{

		}

		public start ():void{
			this.active = true;
		}

		public stop ():void{
			this.active = false;
			for(var i = 0 ; i < this._systemList.length; i++){
				var system = this._systemList[i];
				system.shutdown();	
			}
		}

		public frameUpdate (delta:number, framecount:number):void{
			//console.log("[AppState] Updating...", this);
			if(this.active && !this.paused){
				for(var i = 0 ; i < this._systemList.length; i++){
					var system = this._systemList[i];
					if(system.started && !system.paused){
						system.update(delta, framecount);	
					}
				}

			}
		}

		public fixedUpdate (timestep:number, time:number):void{
			//console.log("[AppState] Updating...", this);
			if(this.active && !this.paused){
				for(var i = 0 ; i < this._systemList.length; i++){
					var system = this._systemList[i];
					if(system.started && !system.paused){
						system.fixedUpdate(timestep, time);	
					}
				}

			}
		}

		public pause ():void{
			this.paused = true;
		}

		public resume ():void{
			this.paused = false;
		}

		public kill ():void{
			this.stop();
			this.clearScope();
			
			this._systemList = null;
			this._systemLib  = null;
		}

		public restart ():void{

		}

		public addSystem (id, system):void{
			if(!this._systemList[id]){
				this._systemLib[id] = system;
				this._systemList.push(system);
			}
		}

		public getSystem (id):void{
			if(!this._systemList[id]){
				return this._systemLib[id];
			}

			console.error("[AppState] !! No system found with ID: " + id);
		}






    	constructor(id:string) {
    		this._id = id;
    	}
    }
}