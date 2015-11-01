Animyst.Application = function(){
	this._appStateList  = [];
	this._appStateLib   = {};

	this._stats = null;
	this._startParams = null;

	this.appScope = new Animyst.AppScope();

	this.initSignal = new signals.Signal();

	this.config  = null;
	this.runtime = 0;
	this._lastFrame = 0;
}


Animyst.Application.prototype.startup = function(params){
	Animyst.LOG.output("===================================================");
	Animyst.LOG.output("   ----- AnimystJS: (v 0.0.0) by ~Saykrd -----   ");
	Animyst.LOG.output("===================================================");
	Animyst.LOG.output("Browser:", Animyst.Environment.browserName);
	Animyst.LOG.output("Version:", Animyst.Environment.browserVersion);
	Animyst.LOG.output("Platform:", Animyst.Environment.platformName);
	Animyst.LOG.output("===================================================");

	this._startParams = params;

	// Load all configuration files and and assets first
	Animyst.DataLoad.startup({});
	Animyst.DataLoad.loadAsset({"id" : "config", "src" : "config.json"}, this._load.bind(this))
}

Animyst.Application.prototype._load = function(type, evt){
	if(type == Animyst.DataLoad.FILE_LOADED){

		switch(evt.item.id){
			case "config":
				Animyst.LOG.output("[Application] Config json loaded");
				
				this.config = Animyst.DataLoad.getAsset("config");
				this.appScope.config = this.config;

				Animyst.DataLoad.loadFromManifest([
					{"id" : "assets", "src" : this.config.assets}, 
					{"id" : "strings", "src" : this.config.strings}
				]);

				break;
			case "assets":
				Animyst.LOG.output("[Application] Assets json loaded");
				var assets = Animyst.DataLoad.getAsset("assets");
				Animyst.DataLoad.listAssets(assets.manifest);
				//Animyst.LOG.output(Animyst.DataLoad._assetList);

				if(assets.initialLoad){
					Animyst.DataLoad.loadFromManifest(assets.initialLoad);
				}
				break;
			case "strings":
				Animyst.LOG.output("[Application] Strings json loaded");
				break;

		}
		
		
	} else if(type == Animyst.DataLoad.LOAD_COMPLETE){
		//Animyst.DataLoad.removeLoadHandler(this._load);
		this._init();
	}
}

Animyst.Application.prototype._init = function(){
	var params = this._startParams;

	Animyst.LOGGING = this.config.settings.logging || false;
	Animyst.DEBUG   = this.config.settings.debug   || false;

	window["Paper"] = {};
	paper.install(window["Paper"]);

	Animyst.LOG.output("[Application] Application Started")

	if(this.config.settings.debug){
		if(window["Stats"] && !Animyst.Environment.isCocoonJS){
			this._stats = new Stats();
			this._stats.domElement.style.position = 'absolute';
			this._stats.domElement.style.left = '0px';
			this._stats.domElement.style.top = '0px';

			document.body.appendChild( this._stats.domElement );
			Animyst.LOG.output("[Application] Stats Enabled");
		}

		if(window["dat"] && !Animyst.Environment.isCocoonJS){
			Animyst.datGUI = new dat.GUI();
		}
	}

	

	var coreprocess = new Animyst.CoreProcess(Animyst.CoreProcess.ID);
	this.run(coreprocess);

	if(window["view"]){
		window["view"].onFrame = this.update.bind(this);	
	} else {
		this._initFrame();
	}
	

	
	this.initSignal.dispatch();
}

Animyst.Application.prototype.run = function(appState){
	if(!this._appStateLib[appState.id]){
		this._appStateLib[appState.id] = appState;

		this._appStateList.push(appState);

		appState.setScope(this.appScope);
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
	// Calculate time intervals
	var delta = 0;
	var time  = 0;

	if(event){
		delta = event.delta;
		time  = event.time;
	} else {
		time  = Date.now();
		delta = time - (this._lastFrame || Date.now());
		this._lastFrame = time;
	}

	this.runtime += delta;

	if(this._stats){
		this._stats.begin();
	}

	for(var i = 0; i < this._appStateList.length; i++){
		var state = this._appStateList[i];
		state.update(delta, this.runtime);
	}

	if(this._stats){
		this._stats.end();
	}
}


Animyst.Application.prototype._initFrame =  function(){
	requestAnimationFrame(this._initFrame.bind(this));
	this.update();
}