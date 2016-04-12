var createjs = require('createjs');
var signals = require('signals');
var Log = require('./Logging');

var DataLoad = module.exports = {};

DataLoad._assetList  = {};
DataLoad._weakHandlers = []; // List of handlers to remove once the load is completed
DataLoad._loadQueue  = null;
DataLoad._loadSignal = null;

DataLoad._fileStartedSignal  = null;
DataLoad._fileProgressSignal = null;
DataLoad._fileLoadedSignal   = null;
DataLoad._fileErrorSignal    = null;

DataLoad._queueStartedSignal  = null;
DataLoad._queueProgressSignal = null;
DataLoad._queueLoadedSignal   = null;
DataLoad._queueErrorSignal    = null;

DataLoad._busy       = false;

DataLoad.LOAD_INITIALIZE = 0;
DataLoad.LOAD_STARTED    = 1;
DataLoad.LOAD_PROGRESS   = 2;
DataLoad.LOAD_COMPLETE   = 3;
DataLoad.LOAD_ERROR      = 4;
DataLoad.FILE_STARTED    = 5;
DataLoad.FILE_PROGRESS   = 6;
DataLoad.FILE_LOADED     = 7;
DataLoad.FILE_ERROR      = 9;


DataLoad.startup = function(params){
	DataLoad._loadQueue  = new createjs.LoadQueue(true);
	DataLoad._loadSignal = new signals.Signal();

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

	DataLoad._fileStartedSignal  = new signals.Signal();;
	DataLoad._fileProgressSignal = new signals.Signal();;
	DataLoad._fileLoadedSignal   = new signals.Signal();;
	DataLoad._fileErrorSignal    = new signals.Signal();;

	DataLoad._queueStartedSignal  = new signals.Signal();;
	DataLoad._queueProgressSignal = new signals.Signal();;
	DataLoad._queueLoadedSignal   = new signals.Signal();;
	DataLoad._queueErrorSignal    = new signals.Signal();;


	if(params.manifest != null){
		//DataLoad.loadManifest(params.manifest, params.callback)
	}


}

DataLoad.listAssets = function(manifest){
	var assetList = DataLoad._assetList;
	for(var i = 0; i < manifest.length; i++){
		var item = manifest[i];
		assetList[item.id] = item;
	}
}



DataLoad.loadFromManifest = function(value, loadHandler, persistant){
	var queue     = DataLoad._loadQueue;
	var manifest  = [];
	for(var i = 0; i < value.length; i++){
		var v = value[i];
		var item;

		if(typeof v == "string"){
			item = {"id" : v, "src" : v};
		} else {
			item = {"id" : v.id, "src" :  v.src};
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


DataLoad.loadAsset = function(value, loadHandler, persistant){
	let queue = DataLoad._loadQueue;
	var item; 

	if(typeof value == "string"){
		item = {"id" : value, "src" : value};
	} else {
		item = {"id" : value.id, "src" : value.src};
	}

	if(!DataLoad._assetList[item.id]){
		DataLoad._assetList[item.id] = item
	}

	DataLoad.addLoadHandler(loadHandler, persistant);
	DataLoad._busy = true;
	queue.loadFile(DataLoad._assetList[item.id]);
}

DataLoad.getAsset = function(id){
	return DataLoad._loadQueue.getResult(id);
}

DataLoad.getData = function(id){
	return DataLoad._assetList[id];
}




//===== HANDLER MANAGEMENT =========

DataLoad.addLoadHandler = function (handler, persistant){
	if(!handler) return;
	if(!persistant){
		DataLoad._weakHandlers.push(handler);
	}

	DataLoad._loadSignal.add(handler);
}

DataLoad.removeLoadHandler = function (handler){
	for(var i = DataLoad._weakHandlers.length - 1; i >= 0 && DataLoad._weakHandlers.length > 0; i--){
		var h = DataLoad._weakHandlers[i];
		if(h == handler){
			DataLoad._weakHandlers.splice(i, 1);
			break;
		}
	}
	DataLoad._loadSignal.remove(handler);	
}

DataLoad.removeWeakHandlers = function(handlers){
	var loadSignal = DataLoad._loadSignal;
	while(handlers.length > 0){
		var handler = handlers.shift();
		DataLoad.removeLoadHandler(handler);
	}
}

DataLoad.addCommand = function(commandID, command, addOnce){
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
			signal = DataLoad._loadProgressSignal;
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


DataLoad.removeCommand = function(commandID, command){
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
			signal = DataLoad._loadProgressSignal;
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


//===== LOAD EVENTS ===========


DataLoad.handleLoadInitialize = function(event){
	var loadSignal = DataLoad._loadSignal;
	loadSignal.dispatch(DataLoad.LOAD_INITIALIZE, event)
}

DataLoad.handleLoadStart = function(event){
	Log.output("[DataLoad] Load Started!");
	var loadSignal = DataLoad._loadSignal;
	loadSignal.dispatch(DataLoad.LOAD_STARTED, event);
	DataLoad._queueStartedSignal.dispatch(event);
}

DataLoad.handleFileStart = function(event){
	Log.output("[DataLoad] Loading File:", event.item.id, "from:", event.item.src);
	var loadSignal = DataLoad._loadSignal;
	loadSignal.dispatch(DataLoad.FILE_STARTED, event)
	DataLoad._fileStartedSignal.dispatch(event);
}


DataLoad.handleFileLoaded = function(event){
	Log.output("[DataLoad] File Loaded:", event.item.id, "from:", event.item.src);
	var loadSignal = DataLoad._loadSignal;
	loadSignal.dispatch(DataLoad.FILE_LOADED, event)
	DataLoad._fileLoadedSignal.dispatch(event);
}

DataLoad.handleLoadComplete = function(event){
	Log.output("[DataLoad] Load Completed!");
	var loadSignal       = DataLoad._loadSignal;
	var handlersToRemove = DataLoad._weakHandlers.concat();

	loadSignal.dispatch(DataLoad.LOAD_COMPLETE, event);
	DataLoad._queueLoadedSignal.dispatch(event);
	DataLoad.removeWeakHandlers(handlersToRemove);
}

DataLoad.handleFileProgress = function(event){
	var loadSignal = DataLoad._loadSignal;
	loadSignal.dispatch(DataLoad.FILE_PROGRESS, event);
	DataLoad._fileProgressSignal.dispatch(event);
}

DataLoad.handleOverallProgress = function(event){
	var loadSignal = DataLoad._loadSignal;
	loadSignal.dispatch(DataLoad.LOAD_PROGRESS, event);
	DataLoad._queueProgressSignal.dispatch(event);
}

DataLoad.handleFileError = function(event){
	var loadSignal = DataLoad._loadSignal;
	loadSignal.dispatch(DataLoad.FILE_ERROR, event);
	DataLoad._fileErrorSignal.dispatch(event);
}

DataLoad.handleLoaderError = function(event){
	var loadSignal = DataLoad._loadSignal;
	loadSignal.dispatch(DataLoad.LOAD_ERROR, event);
	DataLoad._queueErrorSignal.dispatch(event);
}

