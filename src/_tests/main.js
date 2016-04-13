var Main = function(){
	this.game = null;
	this.app  = null;
}

module.exports = Main;

Main.prototype = {

	start: function(){
		console.log("======= MAIN ======");

		this.app = new Animyst.Application();

		this.app.initSignal.addOnce(this.onAppInit, this);

		this.app.startup({});

	},

	onAppInit: function(){
		let game = new Game("game1");
		this.app.run(game);
	}

}

