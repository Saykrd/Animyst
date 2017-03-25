module Animyst {
    export class System {

    	protected _paused:boolean;
    	public get paused():boolean{return this._paused};

    	protected _started:boolean;
    	public get started():boolean{return this._started};

    	private _startupParams:any;


		public startup(params?:any):void{
			this._started = true;
			this._startupParams = params;
		}

		public shutdown():void{
			this._started = false;

		}

		public update(delta:number, framecount:number):void{

		}

		public fixedUpdate(timestep:number, time:number):void{

		}


    	constructor() {
    	}
    }
}