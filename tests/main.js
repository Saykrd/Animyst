var Main = function(){
	this.game = null;
	this.app  = null;
}

Main.prototype = {

	start: function(){
		console.log("===== MAIN ======");

		this.app = new Animyst.Application();

		this.app.initSignal.addOnce(this.onAppInit, this);

		this.app.startup({paper:true, canvasID:"game", debug: true});
	},

	onAppInit: function(){
		var game = new Game("game1");
		this.app.run(game);
	}

}

