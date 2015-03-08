Animyst.DataLoad = {};

Animyst.DataLoad._assetList  = {};
Animyst.DataLoad._weakHandlers = []; // List of handlers to remove once the load is completed
Animyst.DataLoad._loadQueue  = null;
Animyst.DataLoad._loadSignal = null;

Animyst.DataLoad._fileStartedSignal  = null;
Animyst.DataLoad._fileProgressSignal = null;
Animyst.DataLoad._fileLoadedSignal   = null;
Animyst.DataLoad._fileErrorSignal    = null;

Animyst.DataLoad._queueStartedSignal  = null;
Animyst.DataLoad._queueProgressSignal = null;
Animyst.DataLoad._queueLoadedSignal   = null;
Animyst.DataLoad._queueErrorSignal    = null;

Animyst.DataLoad._busy       = false;

Animyst.DataLoad.LOAD_INITIALIZE = 0;
Animyst.DataLoad.LOAD_STARTED    = 1;
Animyst.DataLoad.LOAD_PROGRESS   = 2;
Animyst.DataLoad.LOAD_COMPLETE   = 3;
Animyst.DataLoad.LOAD_ERROR      = 4;
Animyst.DataLoad.FILE_STARTED    = 5;
Animyst.DataLoad.FILE_PROGRESS   = 6;
Animyst.DataLoad.FILE_LOADED     = 7;
Animyst.DataLoad.FILE_ERROR      = 8;





Animyst.DataLoad.startup = function(params){
	Animyst.DataLoad._loadQueue  = new createjs.LoadQueue(true);
	Animyst.DataLoad._loadSignal = new signals.Signal();

	var queue = Animyst.DataLoad._loadQueue;

	queue.on("fileload",     Animyst.DataLoad.handleFileLoaded);
	queue.on("complete",     Animyst.DataLoad.handleLoadComplete);
	queue.on("fileerror",    Animyst.DataLoad.handleFileError);
	queue.on("error",        Animyst.DataLoad.handleLoaderError);
	queue.on("filestart",    Animyst.DataLoad.handleFileStart);
	queue.on("initialize",   Animyst.DataLoad.handleLoadInitialize);
	queue.on("loadstart",    Animyst.DataLoad.handleLoadStart);
	queue.on("fileprogress", Animyst.DataLoad.handleFileProgress);
	queue.on("progress",     Animyst.DataLoad.handleOverallProgress);

	Animyst.DataLoad._fileStartedSignal  = new signals.Signal();;
	Animyst.DataLoad._fileProgressSignal = new signals.Signal();;
	Animyst.DataLoad._fileLoadedSignal   = new signals.Signal();;
	Animyst.DataLoad._fileErrorSignal    = new signals.Signal();;

	Animyst.DataLoad._queueStartedSignal  = new signals.Signal();;
	Animyst.DataLoad._queueProgressSignal = new signals.Signal();;
	Animyst.DataLoad._queueLoadedSignal   = new signals.Signal();;
	Animyst.DataLoad._queueErrorSignal    = new signals.Signal();;


	if(params.manifest != null){
		//Animyst.DataLoad.loadManifest(params.manifest, params.callback)
	}


}

Animyst.DataLoad.listAssets = function(manifest){
	var assetList = Animyst.DataLoad._assetList;
	for(var i = 0; i < manifest.length; i++){
		var item = manifest[i];
		assetList[item.id] = item;
	}
}



Animyst.DataLoad.loadFromManifest = function(value, loadHandler, persistant){
	var queue     = Animyst.DataLoad._loadQueue;
	var manifest  = [];
	for(var i = 0; i < value.length; i++){
		var v = value[i];
		var item;

		if(typeof v == "string"){
			item = {"id" : v, "src" : v};
		} else {
			item = {"id" : v.id, "src" :  v.src};
		}

		if(!Animyst.DataLoad._assetList[item.id]){
			Animyst.DataLoad._assetList[item.id] = item
		}

		manifest.push(Animyst.DataLoad._assetList[item.id]);
	}

	Animyst.DataLoad.addLoadHandler(loadHandler, persistant);
	Animyst.DataLoad._busy = true;
	queue.loadManifest(manifest)
	
}


Animyst.DataLoad.loadAsset = function(value, loadHandler, persistant){
	var queue = Animyst.DataLoad._loadQueue;
	var item; 

	if(typeof value == "string"){
		item = {"id" : value, "src" : value};
	} else {
		item = {"id" : value.id, "src" : value.src};
	}

	if(!Animyst.DataLoad._assetList[item.id]){
		Animyst.DataLoad._assetList[item.id] = item
	}

	Animyst.DataLoad.addLoadHandler(loadHandler, persistant);
	Animyst.DataLoad._busy = true;
	queue.loadFile(Animyst.DataLoad._assetList[item.id]);
}

Animyst.DataLoad.getAsset = function(id){
	return Animyst.DataLoad._loadQueue.getResult(id);
}

Animyst.DataLoad.getData = function(id){
	return Animyst.DataLoad._assetList[id];
}




//===== HANDLER MANAGEMENT =========

Animyst.DataLoad.addLoadHandler = function (handler, persistant){
	if(!handler) return;
	if(!persistant){
		Animyst.DataLoad._weakHandlers.push(handler);
	}

	Animyst.DataLoad._loadSignal.add(handler);
}

Animyst.DataLoad.removeLoadHandler = function (handler){
	for(var i = Animyst.DataLoad._weakHandlers.length - 1; i >= 0 && Animyst.DataLoad._weakHandlers.length > 0; i--){
		var h = Animyst.DataLoad._weakHandlers[i];
		if(h == handler){
			Animyst.DataLoad._weakHandlers.splice(i, 1);
			break;
		}
	}
	Animyst.DataLoad._loadSignal.remove(handler);	
}

Animyst.DataLoad.removeWeakHandlers = function(handlers){
	var loadSignal = Animyst.DataLoad._loadSignal;
	while(handlers.length > 0){
		var handler = handlers.shift();
		Animyst.DataLoad.removeLoadHandler(handler);
	}
}

Animyst.DataLoad.addCommand = function(commandID, command, addOnce){
	var signal;
	switch(commandID){
		case Animyst.DataLoad.LOAD_STARTED:
			signal = Animyst.DataLoad._queueStartedSignal;
			break;
		case Animyst.DataLoad.FILE_STARTED:
			signal = Animyst.DataLoad._fileStartedSignal;
			break;
		case Animyst.DataLoad.LOAD_PROGRESS:
			signal = Animyst.DataLoad._queueProgressSignal;
			break;
		case Animyst.DataLoad.FILE_PROGRESS:
			signal = Animyst.DataLoad._loadProgressSignal;
			break;
		case Animyst.DataLoad.LOAD_COMPLETE:
			signal = Animyst.DataLoad._queueLoadedSignal;
			break;
		case Animyst.DataLoad.FILE_LOADED:
			signal = Animyst.DataLoad._fileLoadedSignal;
			break;
		case Animyst.DataLoad.LOAD_ERROR:
			signal = Animyst.DataLoad._queueErrorSignal;	
			break;
		case Animyst.DataLoad.FILE_ERROR:
			signal = Animyst.DataLoad._fileErrorSignal;
			break;
	}

	if(addOnce){
		signal.addOnce(command);
	} else {
		signal.add(command);
	}
}


Animyst.DataLoad.removeCommand = function(commandID, command){
	var signal;
	switch(commandID){
		case Animyst.DataLoad.LOAD_STARTED:
			signal = Animyst.DataLoad._queueStartedSignal;
			break;
		case Animyst.DataLoad.FILE_STARTED:
			signal = Animyst.DataLoad._fileStartedSignal;
			break;
		case Animyst.DataLoad.LOAD_PROGRESS:
			signal = Animyst.DataLoad._queueProgressSignal;
			break;
		case Animyst.DataLoad.FILE_PROGRESS:
			signal = Animyst.DataLoad._loadProgressSignal;
			break;
		case Animyst.DataLoad.LOAD_COMPLETE:
			signal = Animyst.DataLoad._queueLoadedSignal;
			break;
		case Animyst.DataLoad.FILE_LOADED:
			signal = Animyst.DataLoad._fileLoadedSignal;
			break;
		case Animyst.DataLoad.LOAD_ERROR:
			signal = Animyst.DataLoad._queueErrorSignal;	
			break;
		case Animyst.DataLoad.FILE_ERROR:
			signal = Animyst.DataLoad._fileErrorSignal;
			break;
	}

	signal.remove(command);
}


//===== LOAD EVENTS ===========


Animyst.DataLoad.handleLoadInitialize = function(event){
	var loadSignal = Animyst.DataLoad._loadSignal;
	loadSignal.dispatch(Animyst.DataLoad.LOAD_INITIALIZE, event)
}

Animyst.DataLoad.handleLoadStart = function(event){
	console.log("[DataLoad] Load Started!");
	var loadSignal = Animyst.DataLoad._loadSignal;
	loadSignal.dispatch(Animyst.DataLoad.LOAD_STARTED, event);
	Animyst.DataLoad._queueStartedSignal.dispatch(event);
}

Animyst.DataLoad.handleFileStart = function(event){
	console.log("[DataLoad] Loading File:", event.item.id, "from:", event.item.src);
	var loadSignal = Animyst.DataLoad._loadSignal;
	loadSignal.dispatch(Animyst.DataLoad.FILE_STARTED, event)
	Animyst.DataLoad._fileStartedSignal.dispatch(event);
}


Animyst.DataLoad.handleFileLoaded = function(event){
	console.log("[DataLoad] File Loaded:", event.item.id, "from:", event.item.src);
	var loadSignal = Animyst.DataLoad._loadSignal;
	loadSignal.dispatch(Animyst.DataLoad.FILE_LOADED, event)
	Animyst.DataLoad._fileLoadedSignal.dispatch(event);
}

Animyst.DataLoad.handleLoadComplete = function(event){
	console.log("[DataLoad] Load Completed!");
	var loadSignal       = Animyst.DataLoad._loadSignal;
	var handlersToRemove = Animyst.DataLoad._weakHandlers.concat();

	loadSignal.dispatch(Animyst.DataLoad.LOAD_COMPLETE, event);
	Animyst.DataLoad._queueLoadedSignal.dispatch(event);
	Animyst.DataLoad.removeWeakHandlers(handlersToRemove);
}

Animyst.DataLoad.handleFileProgress = function(event){
	var loadSignal = Animyst.DataLoad._loadSignal;
	loadSignal.dispatch(Animyst.DataLoad.FILE_PROGRESS, event);
	Animyst.DataLoad._fileProgressSignal.dispatch(event);
}

Animyst.DataLoad.handleOverallProgress = function(event){
	var loadSignal = Animyst.DataLoad._loadSignal;
	loadSignal.dispatch(Animyst.DataLoad.LOAD_PROGRESS, event);
	Animyst.DataLoad._queueProgressSignal.dispatch(event);
}

Animyst.DataLoad.handleFileError = function(event){
	var loadSignal = Animyst.DataLoad._loadSignal;
	loadSignal.dispatch(Animyst.DataLoad.FILE_ERROR, event);
	Animyst.DataLoad._fileErrorSignal.dispatch(event);
}

Animyst.DataLoad.handleLoaderError = function(event){
	var loadSignal = Animyst.DataLoad._loadSignal;
	loadSignal.dispatch(Animyst.DataLoad.LOAD_ERROR, event);
	Animyst.DataLoad._queueErrorSignal.dispatch(event);
}

