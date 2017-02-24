var Log = require('./Logging');
var	DataLoad = require('./DataLoad');
var	Environment = require('./Environment');
var	CoreProcess = require('../states/CoreProcess');
var	AppScope = require('./AppScope');
var	signals = require('signals');
var Stats = require('stats');
var datGUI = require('datGUI');
var ArrayUtil = require('../utils/ArrayUtil');


var Application = function(){
	this._appStateList  = [];
	this._appStateLib   = {};

	this._stats = null;
	this._startParams = null;

	this.appScope = new AppScope();

	this.initSignal = new signals.Signal();

	this.config  = null;
	this.runtime = 0;
	this._lastFrame = 0;
	this.framerate = 60;
	this.timestep = 1000 / this.framerate;

}
module.exports = Application;


Application.prototype.startup = function(params){
	Log.output("===================================================");
	Log.output("   ----- AnimystJS: (v 0.0.0) by ~Saykrd -----   ");
	Log.output("===================================================");
	Log.output("Browser:", Environment.browserName);
	Log.output("Version:", Environment.browserVersion);
	Log.output("Platform:", Environment.platformName);
	Log.output("===================================================");

	this._startParams = params;

	// Load all configuration files and and assets first
	DataLoad.startup({});
	DataLoad.loadAsset({"id" : "config", "src" : "config.json"}, this._load.bind(this))
}

Application.prototype._load = function(type, evt){
	if(type == DataLoad.FILE_LOADED){

		switch(evt.item.id){
			case "config":
				Log.output("[Application] Config json loaded");
				
				this.config = DataLoad.getAsset("config");
				this.appScope.config = this.config;

				DataLoad.loadFromManifest([
					{"id" : "assets", "src" : this.config.assets}, 
					{"id" : "strings", "src" : this.config.strings}
				]);

				break;
			case "assets":
				Log.output("[Application] Assets json loaded");
				var assets = DataLoad.getAsset("assets");
				DataLoad.listAssets(assets.manifest);
				//Log.output(DataLoad._assetList);

				if(assets.initialLoad){
					DataLoad.loadFromManifest(assets.initialLoad);
				}
				break;
			case "strings":
				Log.output("[Application] Strings json loaded");
				break;

		}
		
		
	} else if(type == DataLoad.LOAD_COMPLETE){
		//DataLoad.removeLoadHandler(this._load);
		this._init();
	}
}

Application.prototype._init = function(){
	var params = this._startParams;

	Animyst.LOGGING = this.config.settings.logging || false;
	Animyst.DEBUG   = this.config.settings.debug   || false;

	//window["Paper"] = {};
	//paper.install(window["Paper"]);

	Log.output("[Application] Application Started")

	if(this.config.settings.debug){
		if(Stats && !Environment.isCocoonJS){
			this._stats = new Stats();
			this._stats.domElement.style.position = 'absolute';
			this._stats.domElement.style.left = '0px';
			this._stats.domElement.style.top = '0px';

			document.body.appendChild( this._stats.domElement );
			Log.output("[Application] Stats Enabled");
		}

		if(datGUI && !Environment.isCocoonJS){
			Animyst.datGUI = new datGUI.GUI();
		}
	}
	

	var coreprocess = new Animyst.CoreProcess(Animyst.CoreProcess.ID);
	this.run(coreprocess);

	this.timestep = this.config.settings.timestep || this.timestep;

	setInterval(() => this.fixedUpdate, this.timestep);

	if(window["view"]){
		window["view"].onFrame = this.update.bind(this);	
	} else {
		this._initFrame();
	}
	

	
	this.initSignal.dispatch();
}

Application.prototype.run = function(appState){
	if(!this._appStateLib[appState.id]){
		this._appStateLib[appState.id] = appState;

		this._appStateList.push(appState);

		appState.setScope(this.appScope);
		appState.setFrameRate(this.framerate);
		appState.setTimeStep(this.timestep);
		appState.setup();
		appState.start();
	}
}

Application.prototype.halt = function(appStateID){
	if(!this._appStateLib[appStateID]){
		this._appStateLib[appStateID].pause();
	}
}

Application.prototype.resume = function(appStateID){
	if(!this._appStateLib[appStateID]){
		this._appStateLib[appStateID].resume();
	}
}


Application.prototype.end = function(appStateID){
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

Application.prototype.endAll = function(){
	for(var k in this._appStateLib){
		this.end(k)
	}
}

Application.prototype.fixedUpdate = function(){
	this.runtime += this.timestep;

	for(var i = 0; i < this._appStateList.length; i++){
		var state = this._appStateList[i];
		state.fixedUpdate(this.timestep, this.runtime);
	}
}

Application.prototype.update = function(event){
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

Application.prototype._initFrame =  function(){
	requestAnimationFrame(this._initFrame.bind(this));
	this.update()
}