module Animyst {
    export class CoreProcess extends AppState {
    	
    	static ID:string      = "core";
		static INPUT:string   = "input";

    	private _inputData:InputData;
    	

    	constructor(id:string) {
    		super(id);

    	}

    	public setup():void{
			Log.output("[CoreProcess] Core Process Initialize");
			super.setup.call(this);

			this._inputData = new InputData();

			var config = this.appScope.config;
			var input  = new Input(this._inputData);


			input.startup({element: document.body, keyboardSettings:config.settings.keyboard});

			this.addSystem("input", input);


			this.appScope.addDatabase(CoreProcess.INPUT, this._inputData);

		}

		public start():void{
			Log.output("[CoreProcess] Start");
			super.start();
		}

		public fixedUpdate(delta, time):void{
			//console.log("[Game] Updating...")
			super.fixedUpdate(delta, time);
		}

		public pause():void{
			super.pause();
		}

		public resume():void{
			super.resume();
		}

		public kill():void{
			super.kill();
		}

		public restart():void{
			super.restart();
		}
    }
}