GameLogic = function (gameData, inputData){
	Animyst.System.call(this);

	this.gameData  = gameData;
	this.inputData = inputData;
	this.screenDimensions = new Point();

	this.commands = {
		"up"    : false,
		"down"  : false,
		"left"  : false,
		"right" : false,
		"fire"  : false,
		"bomb"  : false,
		"focus" : false
	}
}

module.exports = GameLogic;
GameLogic.prototype = Object.create(Animyst.System.prototype);
GameLogic.prototype.startup = function(params){

	Animyst.System.prototype.startup.call(this);

	this.screenDimensions.x = Animyst.Window.width;
	this.screenDimensions.y = Animyst.Window.height;

	var player = this.gameData.addEntity(GameData.PLAYER, "player", {
		vector:       new Point(), 
		position:     new Point(),
		neutralSpeed: new Point(10, 10),
		focusSpeed:   new Point( 5,  5),
		focus:        false,

		graphic:      GameDisplay.PLAYER
	});

	player.position.x = this.screenDimensions.x / 2;
	player.position.y = this.screenDimensions.y / 2;

	console.log(this.screenDimensions);
	this.gameData.notifyUpdate("player", GameData.PLAYER);

	Animyst.System.prototype.startup.call(this, params);
}

GameLogic.prototype.shutdown = function(){

	Animyst.System.prototype.shutdown.call(this);
}

GameLogic.prototype.update = function(delta, time){
	this.updateCommands();
	this.updatePlayer();

	Animyst.System.prototype.update.call(this);
}

GameLogic.prototype.updateCommands = function(){

	this.commands.up    = this.inputData.isKeyDown("up");
	this.commands.down  = this.inputData.isKeyDown("down");
	this.commands.left  = this.inputData.isKeyDown("left");
	this.commands.right = this.inputData.isKeyDown("right");
	this.commands.fire  = this.inputData.isKeyDown("z");
	this.commands.focus = this.inputData.isKeyDown("shift");
}

GameLogic.prototype.updatePlayer = function(){

	var player = this.gameData.getEntity("player", GameData.PLAYER);

	player.focus = this.commands.focus;

	var speed = player.focus ? player.focusSpeed : player.neutralSpeed;

	player.vector.x = (!this.commands.left && !this.commands.right) ? 0 : this.commands.left ? -speed.x : speed.x;
	player.vector.y = (!this.commands.up   && !this.commands.down)  ? 0 : this.commands.up   ? -speed.y : speed.y;

	player.position = player.position.add(player.vector);
	this.gameData.notifyUpdate("player", GameData.PLAYER);

	//console.log(player.position.x, player.position.y, player.vector.x, player.vector.y, speed.x, speed.y);
}