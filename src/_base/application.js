Animyst.Application = function(){
	this._appStateList  = [];
	this._appStateLib   = {};

	this._stats = null;
	this._startParams = null;

	this.initSignal = new signals.Signal();

	this.config  = null;
}


Animyst.Application.prototype.startup = function(params){
	console.log("===================================================");
	console.log("   ----- AnimystJS: (v 0.0.0) by ~Saykrd -----   ");
	console.log("===================================================");

	this._startParams = params;

	// Load all configuration files and and assets first
	Animyst.DataLoad.startup({});
	Animyst.DataLoad.loadAsset({"id" : "config", "src" : "config.json"}, this._load.bind(this))
}

Animyst.Application.prototype._load = function(type, evt){
	if(type == Animyst.DataLoad.FILE_LOADED){

		switch(evt.item.id){
			case "config":
				console.log("[Application] Config json loaded");
				console.log(Animyst.DataLoad.getAsset("config"));

				this.config = Animyst.DataLoad.getAsset("config");
				Animyst.DataLoad.loadFromManifest([
					{"id" : "assets", "src" : this.config.assets}, 
					{"id" : "strings", "src" : this.config.strings}
				]);

				break;
			case "assets":
				console.log("[Application] Assets json loaded");
				var assets = Animyst.DataLoad.getAsset("assets");
				Animyst.DataLoad.listAssets(assets.manifest);
				console.log(Animyst.DataLoad._assetList);

				if(assets.initialLoad){
					Animyst.DataLoad.loadFromManifest(assets.initialLoad);
				}
				break;
			case "strings":
				console.log("[Application] Strings json loaded");
				break;

		}
		
		
	} else if(type == Animyst.DataLoad.LOAD_COMPLETE){
		//Animyst.DataLoad.removeLoadHandler(this._load);
		this._init();
	}
}

Animyst.Application.prototype._init = function(){
	var params = this._startParams;
	if(this.config.settings.canvasSettings){

		var canvasSettings = this.config.settings.canvasSettings

		switch(canvasSettings.type){
			case "paper":
				paper.install(window);

				var canvas = document.createElement("canvas");
				canvas.id = "paper";

				document.body.appendChild(canvas);

				scale();

				function scale(){
					console.log("[Application] Rescale Canvas!")
					var w, h, parentWidth, parentHeight

					parentWidth  = document.body.clientWidth;
					parentHeight = document.body.clientHeight;

					if(canvasSettings.scaleMode == "noBorder"){
						w = parentWidth > canvasSettings.minWidth ? parentWidth : canvasSettings.minWidth;
						h = parentHeight > canvasSettings.minHeight ?  parentHeight : canvasSettings.minHeight;
					} else {
						w = canvasSettings.minWidth  || 0;
						h = canvasSettings.minHeight || 0;
					}

					canvas.width  = w;
					canvas.height = h;
				}

				Animyst.Window.resizeSignal.add(scale)

				

				paper.setup(canvas);
			break;
		}
		
		

		view.onFrame = this.update.bind(this);
	}

	if(this.config.settings.debug){
		if(window["Stats"]){
			this._stats = new Stats();
			this._stats.domElement.style.position = 'absolute';
			this._stats.domElement.style.left = '0px';
			this._stats.domElement.style.top = '0px';

			document.body.appendChild( this._stats.domElement );
			console.log("[Application] Stats Enabled");
		}
	}

	console.log("[Application] Application Started")
	this.initSignal.dispatch();
}

Animyst.Application.prototype.run = function(appState){
	if(!this._appStateLib[appState.id]){
		this._appStateLib[appState.id] = appState;

		this._appStateList.push(appState);

		appState.setup();
		appState.start();
	}
}

Animyst.Application.prototype.halt = function(appStateID){
	if(!this._appStateLib[appState.id]){
		this._appStateLib[appState.id].pause();
	}
}

Animyst.Application.prototype.resume = function(appStateID){
	if(!this._appStateLib[appState.id]){
		this._appStateLib[appState.id].resume();
	}
}


Animyst.Application.prototype.end = function(appStateID){
	if(!this._appStateLib[appState.id]){
		var appState = this._appStateLib[appState.id]

		appState.kill();

		this._appStateLib[appState.id] = null;

		for(var i = 0; i < this._appStateList.length; i++){
			var state = this._appStateList[i];
			if(state.id == appState.id){
				this._appStateList.splice(i,1);
				break;
			}
		}
	}
}

Animyst.Application.prototype.endAll = function(){
	for(var k in this._appStateLib){
		this.end(k)
	}
}

Animyst.Application.prototype.update = function(event){
	if(this._stats){
		this._stats.begin();
	}

	for(var i = 0; i < this._appStateList.length; i++){
		var state = this._appStateList[i];
		state.update(event.delta, event.time);
	}

	if(this._stats){
		this._stats.end();
	}
}