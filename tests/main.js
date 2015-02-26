var Main = function(){
	this.game = null;
}

Main.prototype = {

	start: function(){
		console.log("===== APPLICATION STARTED ======");

		var app = new Animyst.Application();
		app.startup({paper:true, canvasID:"game", debug: true});

		var game = new Game("game1");
		app.run(game);
	}

}

