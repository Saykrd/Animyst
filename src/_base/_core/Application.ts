module Animyst {
    export class Application {

    	private _appStateList:any[];
    	private _appStateLib:any;
    	private _stats:any;
    	private _startParams:any;

    	private _lastFrame:number = 0;
    	private _framerate:number = 60;
    	public get framerate():number { return this._framerate;};
    	
    	private _framecount:number = 0;
    	public get framecount():number{return this._framecount};

    	private _timestep:number = 1000 / this._framerate;
    	public get timestep():number { return this._timestep;};
    	public set timestep(v:number) { this._timestep = v;};

    	public appScope:AppScope;
    	public initSignal:any;
    	public config:any;
    	public runtime:number = 0;
    	
    	constructor(argument) {
    		this._appStateList  = [];
			this._appStateLib   = {};

			this.appScope = new AppScope();

			this.initSignal = new Signal();
    	}

    	public startup(params:any):void{
    		Log.output("===================================================");
			Log.output("   ----- AnimystJS: (v " + VERSION + ") by ~Saykrd -----   ");
			Log.output("===================================================");
			Log.output("Browser:", Environment.browserName);
			Log.output("Version:", Environment.browserVersion);
			Log.output("Platform:", Environment.platformName);
			Log.output("===================================================");

			this._startParams = params;

			// Load all configuration files and and assets first
			DataLoad.startup({});
			DataLoad.loadAsset({"id" : "config", "src" : "config.json"}, (type, evt) => this.onLoading(type, evt));
    	}


    	private onLoading(type:number, evt:any):void{
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
				this.init();
			}
    	}

    	private init():void{
    		var params = this._startParams;

			LOGGING = this.config.settings.logging || LOGGING;
			DEBUG   = this.config.settings.debug   || DEBUG;

			//window["Paper"] = {};
			//paper.install(window["Paper"]);

			Log.output("[Application] Application Started")

			if(this.config.settings.debug){
				if(window["Stats"] && !Environment.isCocoonJS){
					this._stats = new window["Stats"]();
					this._stats.domElement.style.position = 'absolute';
					this._stats.domElement.style.left = '0px';
					this._stats.domElement.style.top = '0px';

					document.body.appendChild( this._stats.domElement );
					Log.output("[Application] Stats Enabled");
				}

				if(window["dat"] && !Environment.isCocoonJS){
					Animyst.GUI = new window["dat"].GUI();
				}
			}
			

			var coreprocess = new CoreProcess(CoreProcess.ID);
			this.run(coreprocess);

			this.timestep = this.config.settings.timestep || this.timestep;

			setInterval(() => this.fixedUpdate, this.timestep);

			if(window["view"]){
				window["view"].onFrame = this.frameUpdate.bind(this);	
			} else {
				this.initFrame();
			}
			

			
			this.initSignal.dispatch();
    	}

    	private initFrame():void{
    		requestAnimationFrame(() => this.initFrame());
			this.frameUpdate();
    	}

    	public run(appState:AppState):void{
    		if(!this._appStateLib[appState.id]){
				this._appStateLib[appState.id] = appState;

				this._appStateList.push(appState);

				appState.setScope(this.appScope);
				appState.framerate = this.framerate;
				appState.timestep = this.timestep;
				appState.setup();
				appState.start();
			}
    	}


    	public halt(appStateID:string):void{
    		if(!this._appStateLib[appStateID]){
				this._appStateLib[appStateID].pause();
			}
    	}

    	public resume(appStateID:string):void{
    		if(!this._appStateLib[appStateID]){
				this._appStateLib[appStateID].resume();
			}
    	}

    	public end(appStateID):void{
    		if(!this._appStateLib[appStateID]){
				var appState = this._appStateLib[appStateID]

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

    	public endAll():void{
    		for(var k in this._appStateLib){
				this.end(k)
			}
    	}

    	public fixedUpdate():void{
    		this.runtime += this.timestep;

			for(var i = 0; i < this._appStateList.length; i++){
				var state:AppState = this._appStateList[i];
				state.fixedUpdate(this.timestep, this.runtime);
			}
    	}

    	public frameUpdate(event?:any):void{
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
				var state:AppState = this._appStateList[i];
				state.update(delta, this._framecount);
			}

			this._framecount++;

			if(this._stats){
				this._stats.end();
			}
    	}
    }
}