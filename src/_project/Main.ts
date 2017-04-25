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

			this.runTest(PIXITests, "state01");
		}

		public runTest(cls:any, id:string):void{
			var state:Animyst.AppState = <Animyst.AppState> new cls(id);
			this.run(state);
		}

	}
}