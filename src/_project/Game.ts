module App {
	export class Game extends Animyst.AppState {
		

		public viewport:Animyst.View3D;

		constructor() {
			super("game");
			// code...
		}


		public setup():void{
			console.log("Setting up game");

			this.viewport = new Animyst.View3D();
			this.viewport.initDisplay({resize : true, debugControls : true, addAxis : true});
			this.viewport.append();
		}

		public frameUpdate(delta:number, framecount:number):void{
			super.frameUpdate(delta, framecount);
			if(this.viewport) this.viewport.render();
		}
	}
}