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

			var game:Game = new Game();
			this.run(game);
		}

	}
}