Animyst.PixiEngine = function(pixiDisplay){
	Animyst.System.call(this);

	this.canvasSettings = null;
	this.pixiDisplay   = pixiDisplay;
}


Animyst.PixiEngine.cacheSpritesheets = function(){
	Animyst.DataLoad.addCommand(Animyst.DataLoad.FILE_LOADED, onLoad);

	function onLoad(event){
		var data = Animyst.DataLoad.getData(event.item.id);

		if(data.datatype == "spritesheet"){
			Animyst.LOG.output("[PixiEngine] Spritesheet JSON Loaded!", data)
			var ssLoader = new PIXI.SpriteSheetLoader(data.src);
			ssLoader.load();
		}
	}
}


Animyst.PixiEngine.prototype = Object.create(Animyst.System.prototype);
Animyst.PixiEngine.prototype.startup = function(params){
	
	Animyst.System.prototype.startup.call(this, params);
}

Animyst.PixiEngine.prototype.shutdown = function(){
	
	Animyst.System.prototype.shutdown.call(this);
}

Animyst.PixiEngine.prototype.update = function(delta, time){
	Animyst.System.prototype.update.call(this, delta, time);
}

Animyst.PixiEngine.prototype.scaleCanvas = function(){
}