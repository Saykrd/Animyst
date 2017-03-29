module App {
	export class Game extends Animyst.AppState {
		
		constructor() {
			super("game");
			// code...
		}


		public setup():void{
			console.log("Setting up game");
		}
	}
}