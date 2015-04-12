Animyst.PaperEngine = function(paperDisplay){
	Animyst.System.call(this);

	this.canvasSettings = null;
	this.paperDisplay   = paperDisplay;
}

Animyst.PaperEngine.prototype = Object.create(Animyst.System.prototype);
Animyst.PaperEngine.prototype.startup = function(params){

	this.canvasSettings = params.canvasSettings;

	var canvas = document.createElement("canvas");
	canvas.id = this.canvasSettings.id;

	document.body.appendChild(canvas);

	this.paperDisplay.canvas = canvas;
	this.scaleCanvas();
	
	paper.setup(canvas)
	

	Animyst.Window.resizeSignal.add(this.scaleCanvas.bind(this));


	this.paperDisplay.addLayer(); //BG Layer
	this.paperDisplay.addLayer(); //FG Layer
	this.paperDisplay.addLayer(); //HUD Layer
	this.paperDisplay.addLayer(); //UI Layer
	this.paperDisplay.addLayer(); //Loader Layer

	this.paperDisplay.activateLayer(1);
	
	Animyst.System.prototype.startup.call(this, params);
}

Animyst.PaperEngine.prototype.shutdown = function(){
	
	Animyst.System.prototype.shutdown.call(this);
}

Animyst.PaperEngine.prototype.update = function(delta, time){
	Animyst.System.prototype.update.call(this, delta, time);
}

Animyst.PaperEngine.prototype.scaleCanvas = function(){
	Animyst.LOG.output("[PaperEngine] Rescale Canvas!")
	var w, h, parentWidth, parentHeight

	parentWidth  = document.body.clientWidth;
	parentHeight = document.body.clientHeight;

	if(this.canvasSettings.scaleMode == "noBorder"){
		w = parentWidth  > this.canvasSettings.minWidth  ?  parentWidth  : this.canvasSettings.minWidth;
		h = parentHeight > this.canvasSettings.minHeight ?  parentHeight : this.canvasSettings.minHeight;
	} else {
		w = this.canvasSettings.minWidth  || 0;
		h = this.canvasSettings.minHeight || 0;
	}

	this.paperDisplay.canvas.width  = w;
	this.paperDisplay.canvas.height = h;
}