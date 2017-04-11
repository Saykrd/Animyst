module App {
	export class Main extends Animyst.Application{
		
		constructor() {
			super();
			this.initSignal.addOnce(this.onInit, this);
			this.bootSignal.addOnce(this.onBoot, this);

		}

		public onBoot():void{
			Animyst.Log.output("App Booted!");
		}

		public onInit():void{
			Animyst.Log.output("App Initialized!");

			this.runTest(PIXITests);
		}

		public runTest(cls:any):void{
			var state:Animyst.AppState = <Animyst.AppState> new cls();
			this.run(state);
		}

	}
}