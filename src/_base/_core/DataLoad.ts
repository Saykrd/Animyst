module Animyst {

	export class AssetData {
		public id:string;
		public src:string;

		constructor(params:any) {
			this.id = params.id;
			this.src = params.src;
		}
	}
    export class DataLoad {

    	static LOAD_INITIALIZE:number = 0;
		static LOAD_STARTED:number    = 1;
		static LOAD_PROGRESS:number   = 2;
		static LOAD_COMPLETE:number   = 3;
		static LOAD_ERROR:number      = 4;
		static FILE_STARTED:number    = 5;
		static FILE_PROGRESS:number   = 6;
		static FILE_LOADED:number     = 7;
		static FILE_ERROR:number      = 9;


    	static _assetList:any  = {};
		static _weakHandlers:any[] = []; // List of handlers to remove once the load is completed
		static _loadQueue:createjs.LoadQueue  = null;   // CreateJS load queue
		static _loadSignal:Signal = null;

		static _fileStartedSignal:Signal  = null;
		static _fileProgressSignal:Signal = null;
		static _fileLoadedSignal:Signal   = null;
		static _fileErrorSignal:Signal    = null;

		static _queueStartedSignal:Signal  = null;
		static _queueProgressSignal:Signal = null;
		static _queueLoadedSignal:Signal   = null;
		static _queueErrorSignal:Signal    = null;

		static _busy:boolean = false;

		static startup(params):void{
			DataLoad._loadQueue  = new createjs.LoadQueue(true);
			DataLoad._loadSignal = new Signal();

			var queue = DataLoad._loadQueue;

			queue.on("fileload",     DataLoad.handleFileLoaded);
			queue.on("complete",     DataLoad.handleLoadComplete);
			queue.on("fileerror",    DataLoad.handleFileError);
			queue.on("error",        DataLoad.handleLoaderError);
			queue.on("filestart",    DataLoad.handleFileStart);
			queue.on("initialize",   DataLoad.handleLoadInitialize);
			queue.on("loadstart",    DataLoad.handleLoadStart);
			queue.on("fileprogress", DataLoad.handleFileProgress);
			queue.on("progress",     DataLoad.handleOverallProgress);

			DataLoad._fileStartedSignal  = new Signal();;
			DataLoad._fileProgressSignal = new Signal();;
			DataLoad._fileLoadedSignal   = new Signal();;
			DataLoad._fileErrorSignal    = new Signal();;

			DataLoad._queueStartedSignal  = new Signal();;
			DataLoad._queueProgressSignal = new Signal();;
			DataLoad._queueLoadedSignal   = new Signal();;
			DataLoad._queueErrorSignal    = new Signal();;


			if(params.manifest != null){
				//DataLoad.loadManifest(params.manifest, params.callback)
			}

			if(PIXI){
				DataLoad.addCommand(DataLoad.FILE_LOADED, function(event:any){
					//console.log(event);
					if(event.result instanceof HTMLImageElement || event.result instanceof HTMLCanvasElement){
						console.log(event.result);
						let baseTexture = PIXI.BaseTexture.fromCanvas(event.result as HTMLCanvasElement);
						PIXI.utils.BaseTextureCache[event.item.src] = baseTexture;
					}
				})
			}
		}

		static listAssets(manifest):void{
			var assetList = DataLoad._assetList;
			for(var i = 0; i < manifest.length; i++){
				var item = manifest[i];
				assetList[item.id] = item;
			}
		}

		static loadFromManifest(value:any, loadHandler?:any, persistant:boolean = false):void{
			var queue     = DataLoad._loadQueue;
			var manifest  = [];
			for(var i = 0; i < value.length; i++){
				var v = value[i];
				var item;

				if(typeof v == "string"){
					item = new AssetData({"id" : v, "src" : v});
				} else {
					item = new AssetData({"id" : v.id, "src" :  v.src});
				}

				if(!DataLoad._assetList[item.id]){
					DataLoad._assetList[item.id] = item
				}

				manifest.push(DataLoad._assetList[item.id]);
			}

			DataLoad.addLoadHandler(loadHandler, persistant);
			DataLoad._busy = true;
			queue.loadManifest(manifest)
			
		}

		static loadAsset(value:any, loadHandler?:any, persistant:boolean = false):void{
			var queue = DataLoad._loadQueue;
			var item; 

			if(typeof value == "string"){
				item = new AssetData({"id" : value, "src" : value});
			} else {
				item = new AssetData({"id" : value.id, "src" : value.src});
			}

			if(!DataLoad._assetList[item.id]){
				DataLoad._assetList[item.id] = item
			}

			DataLoad.addLoadHandler(loadHandler, persistant);
			DataLoad._busy = true;
			queue.loadFile(DataLoad._assetList[item.id]);
		}

		static getAsset(id:string):any{
			return DataLoad._loadQueue.getResult(id);
		}

		static getData(id:string):AssetData{
			return DataLoad._assetList[id];
		}

		static getPath(id:string):string{
			return DataLoad._assetList[id].src;
		}


//=========== HANDLER MANAGEMENT =========
		
		static addLoadHandler(handler:any, persistant:boolean = false):void{
			if(!handler) return;
			if(!persistant){
				DataLoad._weakHandlers.push(handler);
			}

			DataLoad._loadSignal.add(handler);
		}

		static removeLoadHandler(handler:any):void{
			for(var i = DataLoad._weakHandlers.length - 1; i >= 0 && DataLoad._weakHandlers.length > 0; i--){
				var h = DataLoad._weakHandlers[i];
				if(h == handler){
					DataLoad._weakHandlers.splice(i, 1);
					break;
				}
			}
			DataLoad._loadSignal.remove(handler);	
		}

		static removeWeakHandlers(handlers:any[]):void{
			var loadSignal = DataLoad._loadSignal;
			while(handlers.length > 0){
				var handler = handlers.shift();
				DataLoad.removeLoadHandler(handler);
			}
		}

		static addCommand(commandID:number, command:any, addOnce:boolean = false):void{
			var signal;
			switch(commandID){
				case DataLoad.LOAD_STARTED:
					signal = DataLoad._queueStartedSignal;
					break;
				case DataLoad.FILE_STARTED:
					signal = DataLoad._fileStartedSignal;
					break;
				case DataLoad.LOAD_PROGRESS:
					signal = DataLoad._queueProgressSignal;
					break;
				case DataLoad.FILE_PROGRESS:
					signal = DataLoad._fileProgressSignal;
					break;
				case DataLoad.LOAD_COMPLETE:
					signal = DataLoad._queueLoadedSignal;
					break;
				case DataLoad.FILE_LOADED:
					signal = DataLoad._fileLoadedSignal;
					break;
				case DataLoad.LOAD_ERROR:
					signal = DataLoad._queueErrorSignal;	
					break;
				case DataLoad.FILE_ERROR:
					signal = DataLoad._fileErrorSignal;
					break;
			}

			if(addOnce){
				signal.addOnce(command);
			} else {
				signal.add(command);
			}
		}

		static removeCommand(commandID:number, command:any):void{
			var signal;
			switch(commandID){
				case DataLoad.LOAD_STARTED:
					signal = DataLoad._queueStartedSignal;
					break;
				case DataLoad.FILE_STARTED:
					signal = DataLoad._fileStartedSignal;
					break;
				case DataLoad.LOAD_PROGRESS:
					signal = DataLoad._queueProgressSignal;
					break;
				case DataLoad.FILE_PROGRESS:
					signal = DataLoad._fileProgressSignal;
					break;
				case DataLoad.LOAD_COMPLETE:
					signal = DataLoad._queueLoadedSignal;
					break;
				case DataLoad.FILE_LOADED:
					signal = DataLoad._fileLoadedSignal;
					break;
				case DataLoad.LOAD_ERROR:
					signal = DataLoad._queueErrorSignal;	
					break;
				case DataLoad.FILE_ERROR:
					signal = DataLoad._fileErrorSignal;
					break;
			}

			signal.remove(command);
		}

//=========== LOAD EVENTS =========

		static handleLoadInitialize(event:any):void{
			var loadSignal = DataLoad._loadSignal;
			loadSignal.dispatch(DataLoad.LOAD_INITIALIZE, event)
		}

		static handleLoadStart(event:any):void{
			Log.output("[DataLoad] Load Started!");
			var loadSignal = DataLoad._loadSignal;
			loadSignal.dispatch(DataLoad.LOAD_STARTED, event);
			DataLoad._queueStartedSignal.dispatch(event);
		}

		static handleFileStart(event:any):void{
			Log.output("[DataLoad] Loading File:", event.item.id, "from:", event.item.src);
			var loadSignal = DataLoad._loadSignal;
			loadSignal.dispatch(DataLoad.FILE_STARTED, event)
			DataLoad._fileStartedSignal.dispatch(event);
		}

		static handleFileLoaded(event:any):void{
			Log.output("[DataLoad] File Loaded:", event.item.id, "from:", event.item.src);
			var loadSignal = DataLoad._loadSignal;
			loadSignal.dispatch(DataLoad.FILE_LOADED, event)
			DataLoad._fileLoadedSignal.dispatch(event);
		}

		static handleLoadComplete(event:any):void{
			Log.output("[DataLoad] Load Completed!");
			var loadSignal       = DataLoad._loadSignal;
			var handlersToRemove = DataLoad._weakHandlers.concat();

			loadSignal.dispatch(DataLoad.LOAD_COMPLETE, event);
			DataLoad._queueLoadedSignal.dispatch(event);
			DataLoad.removeWeakHandlers(handlersToRemove);
		}

		static handleFileProgress(event:any):void{
			var loadSignal = DataLoad._loadSignal;
			loadSignal.dispatch(DataLoad.FILE_PROGRESS, event);
			DataLoad._fileProgressSignal.dispatch(event);
		}

		static handleOverallProgress(event:any):void{
			var loadSignal = DataLoad._loadSignal;
			loadSignal.dispatch(DataLoad.LOAD_PROGRESS, event);
			DataLoad._queueProgressSignal.dispatch(event);
		}

		static handleFileError(event:any):void{
			var loadSignal = DataLoad._loadSignal;
			loadSignal.dispatch(DataLoad.FILE_ERROR, event);
			DataLoad._fileErrorSignal.dispatch(event);
		}

		static handleLoaderError(event:any):void{
			var loadSignal = DataLoad._loadSignal;
			loadSignal.dispatch(DataLoad.LOAD_ERROR, event);
			DataLoad._queueErrorSignal.dispatch(event);
		}


    	constructor(argument) {
    		// code...
    	}
    }
}