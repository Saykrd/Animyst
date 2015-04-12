GameDisplay = function(gameData){
	Animyst.System.call(this);

	this.gameData = gameData;
	this.layer    = null;
	this.graphics = {};

	this.graphicProperties = {}
	this.graphicProperties[GameDisplay.PLAYER] = {}
	this.graphicProperties[GameDisplay.ENEMY]  = {}
}

GameDisplay.PLAYER  = 0;
GameDisplay.ENEMY01 = 1;

GameDisplay.prototype = Object.create(Animyst.System.prototype);
GameDisplay.prototype.startup = function(params){

	this.gameData.signal.add(this.entityHandler, this);

	this.layer = params.layer || new Layer({position: new Point()});
	
	Animyst.System.prototype.startup.call(this, params);
}

GameDisplay.prototype.shutdown = function(){
	Animyst.System.prototype.shutdown.call(this);
}

GameDisplay.prototype.update = function(delta, time){
	Animyst.System.prototype.update.call(this);
}

GameDisplay.prototype.entityHandler = function(type, data){
	switch(type){
		case GameData.ENTITY_ADDED:
			var graphic = this.createGraphic(this.graphicProperties[data.graphic]);

			graphic.position = data.position.clone();

			this.layer.addChild(graphic);

			this.graphics[data.id] = graphic;
			break;
		case GameData.ENTITY_UPDATED:

			var graphic = this.getGraphicByID(data.id);
			
			graphic.position.x = data.position.x;
			graphic.position.y = data.position.y;

			break;

		case GameData.ENTITY_REMOVED:
			var graphic = this.getGraphicByID(data.id);

			graphic.remove();
			this.graphics[data.id] = null;
			delete this.graphics[data.id];
			break;
	}
}

GameDisplay.prototype.createGraphic = function(prop){
	return new Shape.Circle({radius:20, fillColor:"#00FFFF"});
}

GameDisplay.prototype.getGraphicByID = function(id){
	return this.graphics[id];
}