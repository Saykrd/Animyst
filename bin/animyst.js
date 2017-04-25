var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Animyst;
(function (Animyst) {
    Animyst.LOGGING = true;
    Animyst.DEBUG = true;
    Animyst.MAJOR = 0;
    Animyst.MINOR = 0;
    Animyst.BUILD = 0;
    Animyst.DATA = "";
    Animyst.VERSION = Animyst.MAJOR + "." + Animyst.MINOR + "." + Animyst.BUILD;
})(Animyst || (Animyst = {}));
var Animyst;
(function (Animyst) {
    var Application = (function () {
        function Application() {
            this._lastFrame = 0;
            this._framerate = 60;
            this._framecount = 0;
            this._timestep = 1000 / this._framerate;
            this.runtime = 0;
            this._appStateList = [];
            this._appStateLib = {};
            this.appScope = new Animyst.AppScope();
            this.initSignal = new Animyst.Signal();
            this.bootSignal = new Animyst.Signal();
        }
        Object.defineProperty(Application.prototype, "framerate", {
            get: function () { return this._framerate; },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(Application.prototype, "framecount", {
            get: function () { return this._framecount; },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(Application.prototype, "timestep", {
            get: function () { return this._timestep; },
            set: function (v) { this._timestep = v; },
            enumerable: true,
            configurable: true
        });
        ;
        ;
        Application.prototype.startup = function (params) {
            var _this = this;
            Animyst.Log.output("===================================================");
            Animyst.Log.output("   ----- AnimystJS: (v " + Animyst.VERSION + ") by ~Saykrd -----   ");
            Animyst.Log.output("===================================================");
            Animyst.Log.output("Browser:", Animyst.Environment.browserName);
            Animyst.Log.output("Version:", Animyst.Environment.browserVersion);
            Animyst.Log.output("Platform:", Animyst.Environment.platformName);
            Animyst.Log.output("===================================================");
            this._startParams = params;
            // Load all configuration files and and assets first
            Animyst.DataLoad.startup({});
            Animyst.DataLoad.loadAsset({ "id": "config", "src": "config.json" }, function (type, evt) { return _this.onLoading(type, evt); });
        };
        Application.prototype.onLoading = function (type, evt) {
            if (type == Animyst.DataLoad.FILE_LOADED) {
                switch (evt.item.id) {
                    case "config":
                        Animyst.Log.output("[Application] Config json loaded");
                        this.config = Animyst.DataLoad.getAsset("config");
                        this.appScope.config = this.config;
                        this.bootSignal.dispatch();
                        var manifest = [];
                        if (this.config.externals) {
                            for (var k in this.config.externals) {
                                manifest.push(this.config.externals[k]);
                            }
                        }
                        manifest.push({ "id": "assets", "src": this.config.assets });
                        manifest.push({ "id": "strings", "src": this.config.strings });
                        Animyst.DataLoad.loadFromManifest(manifest);
                        break;
                    case "assets":
                        Animyst.Log.output("[Application] Assets json loaded");
                        var assets = Animyst.DataLoad.getAsset("assets");
                        Animyst.DataLoad.listAssets(assets.manifest);
                        //Log.output(DataLoad._assetList);
                        if (assets.initialLoad) {
                            Animyst.DataLoad.loadFromManifest(assets.initialLoad);
                        }
                        break;
                    case "strings":
                        Animyst.Log.output("[Application] Strings json loaded");
                        break;
                }
            }
            else if (type == Animyst.DataLoad.LOAD_COMPLETE) {
                //DataLoad.removeLoadHandler(this._load);
                this.init();
            }
        };
        Application.prototype.init = function () {
            var _this = this;
            var params = this._startParams;
            Animyst.LOGGING = this.config.settings.logging || Animyst.LOGGING;
            Animyst.DEBUG = this.config.settings.debug || Animyst.DEBUG;
            //window["Paper"] = {};
            //paper.install(window["Paper"]);
            Animyst.Log.output("[Application] Application Started");
            if (this.config.settings.debug) {
                if (window["Stats"] && !Animyst.Environment.isCocoonJS) {
                    this._stats = new window["Stats"]();
                    this._stats.domElement.style.position = 'absolute';
                    this._stats.domElement.style.left = '0px';
                    this._stats.domElement.style.top = '0px';
                    document.body.appendChild(this._stats.domElement);
                    Animyst.Log.output("[Application] Stats Enabled");
                }
                if (window["dat"] && !Animyst.Environment.isCocoonJS) {
                    Animyst.GUI = new window["dat"].GUI();
                }
            }
            var coreprocess = new Animyst.CoreProcess(Animyst.CoreProcess.ID);
            this.run(coreprocess);
            this.timestep = this.config.settings.timestep || this.timestep;
            setInterval(function () { return _this.fixedUpdate; }, this.timestep);
            if (window["view"]) {
                window["view"].onFrame = this.frameUpdate.bind(this);
            }
            else {
                this.initFrame();
            }
            this.initSignal.dispatch();
        };
        Application.prototype.initFrame = function () {
            var _this = this;
            requestAnimationFrame(function () { return _this.initFrame(); });
            this.frameUpdate();
        };
        Application.prototype.run = function (appState) {
            if (!this._appStateLib[appState.id]) {
                this._appStateLib[appState.id] = appState;
                this._appStateList.push(appState);
                appState.setScope(this.appScope);
                appState.framerate = this.framerate;
                appState.timestep = this.timestep;
                appState.setup();
                appState.start();
            }
        };
        Application.prototype.halt = function (appStateID) {
            if (this._appStateLib[appStateID]) {
                this._appStateLib[appStateID].pause();
            }
        };
        Application.prototype.resume = function (appStateID) {
            if (this._appStateLib[appStateID]) {
                this._appStateLib[appStateID].resume();
            }
        };
        Application.prototype.end = function (appStateID) {
            if (!this._appStateLib[appStateID]) {
                var appState = this._appStateLib[appStateID];
                appState.kill();
                this._appStateLib[appState.id] = null;
                for (var i = 0; i < this._appStateList.length; i++) {
                    var state = this._appStateList[i];
                    if (state.id == appState.id) {
                        this._appStateList.splice(i, 1);
                        break;
                    }
                }
            }
        };
        Application.prototype.getState = function (appStateID) {
            return this._appStateLib[appStateID];
        };
        Application.prototype.endAll = function () {
            for (var k in this._appStateLib) {
                this.end(k);
            }
        };
        Application.prototype.fixedUpdate = function () {
            this.runtime += this.timestep;
            for (var i = 0; i < this._appStateList.length; i++) {
                var state = this._appStateList[i];
                if (state.paused)
                    continue;
                state.fixedUpdate(this.timestep, this.runtime);
            }
        };
        Application.prototype.frameUpdate = function (event) {
            // Calculate time intervals
            var delta = 0;
            var time = 0;
            if (event) {
                delta = event.delta;
                time = event.time;
            }
            else {
                time = Date.now();
                delta = time - (this._lastFrame || Date.now());
                this._lastFrame = time;
            }
            if (this._stats) {
                this._stats.begin();
            }
            for (var i = 0; i < this._appStateList.length; i++) {
                var state = this._appStateList[i];
                if (state.paused)
                    continue;
                state.frameUpdate(delta, this._framecount);
            }
            this._framecount++;
            if (this._stats) {
                this._stats.end();
            }
        };
        return Application;
    }());
    Animyst.Application = Application;
})(Animyst || (Animyst = {}));
var Animyst;
(function (Animyst) {
    var AppScope = (function () {
        function AppScope() {
            this.databases = {};
            // code...
        }
        AppScope.prototype.addDatabase = function (id, database) {
            this.databases[id] = database;
        };
        AppScope.prototype.getDatabase = function (id) {
            return this.databases[id];
        };
        return AppScope;
    }());
    Animyst.AppScope = AppScope;
})(Animyst || (Animyst = {}));
var Animyst;
(function (Animyst) {
    var AppState = (function () {
        function AppState(id) {
            this._systemList = [];
            this._systemLib = [];
            this._framerate = 60;
            this._timestep = 1000 / this.framerate;
            this._id = id;
        }
        Object.defineProperty(AppState.prototype, "id", {
            get: function () { return this._id; },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(AppState.prototype, "framerate", {
            get: function () { return this._framerate; },
            set: function (v) { this._framerate = v; },
            enumerable: true,
            configurable: true
        });
        ;
        ;
        Object.defineProperty(AppState.prototype, "timestep", {
            get: function () { return this._timestep; },
            set: function (v) { this._timestep = v; },
            enumerable: true,
            configurable: true
        });
        ;
        ;
        AppState.prototype.setScope = function (appScope) {
            this.appScope = appScope;
        };
        AppState.prototype.clearScope = function () {
            this.appScope = null;
        };
        AppState.prototype.setup = function () {
        };
        AppState.prototype.start = function () {
            this.active = true;
        };
        AppState.prototype.stop = function () {
            this.active = false;
            for (var i = 0; i < this._systemList.length; i++) {
                var system = this._systemList[i];
                system.shutdown();
            }
        };
        AppState.prototype.frameUpdate = function (delta, framecount) {
            //console.log("[AppState] Updating...", this);
            if (this.active && !this.paused) {
                for (var i = 0; i < this._systemList.length; i++) {
                    var system = this._systemList[i];
                    if (system.started && !system.paused) {
                        system.update(delta, framecount);
                    }
                }
            }
        };
        AppState.prototype.fixedUpdate = function (timestep, time) {
            //console.log("[AppState] Updating...", this);
            if (this.active && !this.paused) {
                for (var i = 0; i < this._systemList.length; i++) {
                    var system = this._systemList[i];
                    if (system.started && !system.paused) {
                        system.fixedUpdate(timestep, time);
                    }
                }
            }
        };
        AppState.prototype.pause = function () {
            this.paused = true;
        };
        AppState.prototype.resume = function () {
            this.paused = false;
        };
        AppState.prototype.kill = function () {
            this.stop();
            this.clearScope();
            this._systemList = null;
            this._systemLib = null;
        };
        AppState.prototype.restart = function () {
        };
        AppState.prototype.addSystem = function (id, system) {
            if (!this._systemList[id]) {
                this._systemLib[id] = system;
                this._systemList.push(system);
            }
        };
        AppState.prototype.getSystem = function (id) {
            if (!this._systemList[id]) {
                return this._systemLib[id];
            }
            console.error("[AppState] !! No system found with ID: " + id);
        };
        return AppState;
    }());
    Animyst.AppState = AppState;
})(Animyst || (Animyst = {}));
var Animyst;
(function (Animyst) {
    var Database = (function () {
        function Database() {
            // code...
            this._itemCount = 0;
            this._items = {};
            this._itemList = [];
            this._categoryLists = {};
            this._categoryChecks = {};
            this.signal = new Animyst.Signal();
            this.signal.add(this.onItemSignal, this, 100000);
        }
        /**
         * Adds an item category list to keep track of specific items
         * @param {string} name    Name of category
         * @param {function} check   A function evaluating the item. Ex: "function (item) { if(shouldBeInList) return true; return false}"
         * @param {class} cls     The class type the item should belong to
         * @param {ctx} context The 'this' variable to be used with the check
         */
        Database.prototype.addCategory = function (name, check, cls, context) {
            this._categoryLists[name] = [];
            this._categoryChecks[name] = { check: check, context: context, cls: cls };
            this.traverse(this.list, this);
        };
        ;
        /**
         * Checks if a category exists
         * @param {string} name [description]
         */
        Database.prototype.hasCategory = function (name) {
            return this._categoryLists[name] != null;
        };
        ;
        /**
         * Adds item into all category lists that it belongs to
         * @param {Item} item [description]
         */
        Database.prototype.list = function (item) {
            for (var k in this._categoryLists) {
                var data = this._categoryChecks[k];
                if ((!data.cls || item instanceof data.cls) && data.check.call(data.context, item)) {
                    Animyst.ArrayUtil.include(item.id, this._categoryLists[k]);
                }
                else {
                    Animyst.ArrayUtil.remove(item.id, this._categoryLists[k]);
                }
            }
        };
        ;
        /**
         * Removes item from all categories
         * @param {string} itemID [description]
         */
        Database.prototype.unlist = function (itemID) {
            for (var k in this._categoryLists) {
                for (var i = 0; i < this._categoryLists[k].length; i++) {
                    Animyst.ArrayUtil.remove(itemID, this._categoryLists[k]);
                }
            }
        };
        ;
        /**
         * Returns the list of item ID's in a given category
         * @param {string} category [description]
         */
        Database.prototype.getCategory = function (category) {
            var items = this._categoryLists[category] || [];
            for (var i = items.length - 1; i >= 0 && items.length > 0; i--) {
                var item = this.get(items[i]);
                if (!item) {
                    items.splice(i, 1);
                }
            }
            return items;
        };
        ;
        Database.prototype.getFromCategory = function (category) {
            var list = this.getCategory(category);
            var items = [];
            for (var i = 0; i < list.length; ++i) {
                items.push(this.get(list[i]));
            }
            return items;
        };
        /**
         * Evaluates whether an item is listed in a specific category
         * @param  {string}  itemID   [description]
         * @param  {string}  category [description]
         */
        Database.prototype.isInCategory = function (itemID, category) {
            var list = this._categoryLists[category];
            return list.indexOf(itemID) > -1;
        };
        ;
        Database.prototype.isCategoryEmpty = function (category) {
            var list = this._categoryLists[category];
            return list.length <= 0;
        };
        /**
         * Traverses a category of items or all items in this database and executes a command on all of them
         * @param  {function} command  Command to execute on all items ("function(item){//...}")
         * @param  {object} context  'this' variable for the command
         * @param  {string} category Category to traverse. Traverses entire database if no category is specified
         */
        Database.prototype.traverse = function (command, context, category) {
            if (category === void 0) { category = null; }
            var list = this._categoryLists[category] || this._itemList;
            for (var i = 0; i < list.length; i++) {
                var item = this.get(list[i]);
                if (item) {
                    command.call(context, item);
                }
                else {
                    list.splice(i, 1);
                    i--;
                    continue;
                }
            }
        };
        ;
        /**
         * Creates an item and adds it to the database
         * @param {object} cls   Class of the item
         * @param {string} id     Item ID
         * @param {object} params Params to initialize the item
         * @return {object} Returns the item that was added
         */
        Database.prototype.create = function (cls, id, params) {
            if (!id) {
                id = "item" + this._itemCount;
            }
            if (this._items[id]) {
                id = id + this._itemCount;
            }
            var item = new cls(id, params);
            item.id = id;
            this._items[id] = item;
            this._itemList.push(item.id);
            this.list(item);
            this._itemCount++;
            item.signal = this.signal;
            this.signal.dispatch(Database.ADDED, item.id);
            return item;
        };
        ;
        /**
         * Removes item from database
         * @param {string} itemID [description]
         */
        Database.prototype.remove = function (itemID) {
            if (!this._items[itemID])
                return;
            var item = this.get(itemID);
            this.unlist(itemID);
            delete this._items[itemID];
            this.signal.dispatch(Database.REMOVED, itemID);
        };
        ;
        /**
         * Removes all items in database
         */
        Database.prototype.removeAll = function () {
            this.traverse(function (item) { this.remove(item.id); }, this);
        };
        ;
        /**
         * Returns item in database
         * @param {string} itemID [description]
         */
        Database.prototype.get = function (itemID) {
            return this._items[itemID];
        };
        ;
        Database.prototype.clear = function () {
        };
        Database.prototype.destroy = function () {
            this._itemCount = undefined;
            this._items = null;
            this._itemList = null;
            this._categoryLists = null;
            this._categoryChecks = null;
        };
        Database.prototype.onItemSignal = function (id, entity) {
            switch (id) {
                case Animyst.Item.RELIST:
                    this.list(this.get(entity));
                    break;
            }
        };
        return Database;
    }());
    Database.ADDED = 'added';
    Database.REMOVED = 'removed';
    Animyst.Database = Database;
})(Animyst || (Animyst = {}));
var Animyst;
(function (Animyst) {
    var AssetData = (function () {
        function AssetData(params) {
            this.id = params.id;
            this.src = params.src;
        }
        return AssetData;
    }());
    Animyst.AssetData = AssetData;
    var DataLoad = (function () {
        function DataLoad(argument) {
            // code...
        }
        DataLoad.startup = function (params) {
            DataLoad._loadQueue = new createjs.LoadQueue(true);
            DataLoad._loadSignal = new Animyst.Signal();
            var queue = DataLoad._loadQueue;
            queue.on("fileload", DataLoad.handleFileLoaded);
            queue.on("complete", DataLoad.handleLoadComplete);
            queue.on("fileerror", DataLoad.handleFileError);
            queue.on("error", DataLoad.handleLoaderError);
            queue.on("filestart", DataLoad.handleFileStart);
            queue.on("initialize", DataLoad.handleLoadInitialize);
            queue.on("loadstart", DataLoad.handleLoadStart);
            queue.on("fileprogress", DataLoad.handleFileProgress);
            queue.on("progress", DataLoad.handleOverallProgress);
            DataLoad._fileStartedSignal = new Animyst.Signal();
            ;
            DataLoad._fileProgressSignal = new Animyst.Signal();
            ;
            DataLoad._fileLoadedSignal = new Animyst.Signal();
            ;
            DataLoad._fileErrorSignal = new Animyst.Signal();
            ;
            DataLoad._queueStartedSignal = new Animyst.Signal();
            ;
            DataLoad._queueProgressSignal = new Animyst.Signal();
            ;
            DataLoad._queueLoadedSignal = new Animyst.Signal();
            ;
            DataLoad._queueErrorSignal = new Animyst.Signal();
            ;
            if (params.manifest != null) {
                //DataLoad.loadManifest(params.manifest, params.callback)
            }
            if (PIXI) {
                DataLoad.addCommand(DataLoad.FILE_LOADED, function (event) {
                    //console.log(event);
                    if (event.result instanceof HTMLImageElement || event.result instanceof HTMLCanvasElement) {
                        console.log(event.result);
                        var baseTexture = PIXI.BaseTexture.fromCanvas(event.result);
                        PIXI.utils.BaseTextureCache[event.item.src] = baseTexture;
                    }
                });
            }
        };
        DataLoad.listAssets = function (manifest) {
            var assetList = DataLoad._assetList;
            for (var i = 0; i < manifest.length; i++) {
                var item = manifest[i];
                assetList[item.id] = item;
            }
        };
        DataLoad.loadFromManifest = function (value, loadHandler, persistant) {
            if (persistant === void 0) { persistant = false; }
            var queue = DataLoad._loadQueue;
            var manifest = [];
            for (var i = 0; i < value.length; i++) {
                var v = value[i];
                var item;
                if (typeof v == "string") {
                    item = new AssetData({ "id": v, "src": v });
                }
                else {
                    item = new AssetData({ "id": v.id, "src": v.src });
                }
                if (!DataLoad._assetList[item.id]) {
                    DataLoad._assetList[item.id] = item;
                }
                manifest.push(DataLoad._assetList[item.id]);
            }
            DataLoad.addLoadHandler(loadHandler, persistant);
            DataLoad._busy = true;
            queue.loadManifest(manifest);
        };
        DataLoad.loadAsset = function (value, loadHandler, persistant) {
            if (persistant === void 0) { persistant = false; }
            var queue = DataLoad._loadQueue;
            var item;
            if (typeof value == "string") {
                item = new AssetData({ "id": value, "src": value });
            }
            else {
                item = new AssetData({ "id": value.id, "src": value.src });
            }
            if (!DataLoad._assetList[item.id]) {
                DataLoad._assetList[item.id] = item;
            }
            DataLoad.addLoadHandler(loadHandler, persistant);
            DataLoad._busy = true;
            queue.loadFile(DataLoad._assetList[item.id]);
        };
        DataLoad.getAsset = function (id) {
            return DataLoad._loadQueue.getResult(id);
        };
        DataLoad.getData = function (id) {
            return DataLoad._assetList[id];
        };
        DataLoad.getPath = function (id) {
            return DataLoad._assetList[id].src;
        };
        //=========== HANDLER MANAGEMENT =========
        DataLoad.addLoadHandler = function (handler, persistant) {
            if (persistant === void 0) { persistant = false; }
            if (!handler)
                return;
            if (!persistant) {
                DataLoad._weakHandlers.push(handler);
            }
            DataLoad._loadSignal.add(handler);
        };
        DataLoad.removeLoadHandler = function (handler) {
            for (var i = DataLoad._weakHandlers.length - 1; i >= 0 && DataLoad._weakHandlers.length > 0; i--) {
                var h = DataLoad._weakHandlers[i];
                if (h == handler) {
                    DataLoad._weakHandlers.splice(i, 1);
                    break;
                }
            }
            DataLoad._loadSignal.remove(handler);
        };
        DataLoad.removeWeakHandlers = function (handlers) {
            var loadSignal = DataLoad._loadSignal;
            while (handlers.length > 0) {
                var handler = handlers.shift();
                DataLoad.removeLoadHandler(handler);
            }
        };
        DataLoad.addCommand = function (commandID, command, addOnce) {
            if (addOnce === void 0) { addOnce = false; }
            var signal;
            switch (commandID) {
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
            if (addOnce) {
                signal.addOnce(command);
            }
            else {
                signal.add(command);
            }
        };
        DataLoad.removeCommand = function (commandID, command) {
            var signal;
            switch (commandID) {
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
        };
        //=========== LOAD EVENTS =========
        DataLoad.handleLoadInitialize = function (event) {
            var loadSignal = DataLoad._loadSignal;
            loadSignal.dispatch(DataLoad.LOAD_INITIALIZE, event);
        };
        DataLoad.handleLoadStart = function (event) {
            Animyst.Log.output("[DataLoad] Load Started!");
            var loadSignal = DataLoad._loadSignal;
            loadSignal.dispatch(DataLoad.LOAD_STARTED, event);
            DataLoad._queueStartedSignal.dispatch(event);
        };
        DataLoad.handleFileStart = function (event) {
            Animyst.Log.output("[DataLoad] Loading File:", event.item.id, "from:", event.item.src);
            var loadSignal = DataLoad._loadSignal;
            loadSignal.dispatch(DataLoad.FILE_STARTED, event);
            DataLoad._fileStartedSignal.dispatch(event);
        };
        DataLoad.handleFileLoaded = function (event) {
            Animyst.Log.output("[DataLoad] File Loaded:", event.item.id, "from:", event.item.src);
            var loadSignal = DataLoad._loadSignal;
            loadSignal.dispatch(DataLoad.FILE_LOADED, event);
            DataLoad._fileLoadedSignal.dispatch(event);
        };
        DataLoad.handleLoadComplete = function (event) {
            Animyst.Log.output("[DataLoad] Load Completed!");
            var loadSignal = DataLoad._loadSignal;
            var handlersToRemove = DataLoad._weakHandlers.concat();
            loadSignal.dispatch(DataLoad.LOAD_COMPLETE, event);
            DataLoad._queueLoadedSignal.dispatch(event);
            DataLoad.removeWeakHandlers(handlersToRemove);
        };
        DataLoad.handleFileProgress = function (event) {
            var loadSignal = DataLoad._loadSignal;
            loadSignal.dispatch(DataLoad.FILE_PROGRESS, event);
            DataLoad._fileProgressSignal.dispatch(event);
        };
        DataLoad.handleOverallProgress = function (event) {
            var loadSignal = DataLoad._loadSignal;
            loadSignal.dispatch(DataLoad.LOAD_PROGRESS, event);
            DataLoad._queueProgressSignal.dispatch(event);
        };
        DataLoad.handleFileError = function (event) {
            var loadSignal = DataLoad._loadSignal;
            loadSignal.dispatch(DataLoad.FILE_ERROR, event);
            DataLoad._fileErrorSignal.dispatch(event);
        };
        DataLoad.handleLoaderError = function (event) {
            var loadSignal = DataLoad._loadSignal;
            loadSignal.dispatch(DataLoad.LOAD_ERROR, event);
            DataLoad._queueErrorSignal.dispatch(event);
        };
        return DataLoad;
    }());
    DataLoad.LOAD_INITIALIZE = 0;
    DataLoad.LOAD_STARTED = 1;
    DataLoad.LOAD_PROGRESS = 2;
    DataLoad.LOAD_COMPLETE = 3;
    DataLoad.LOAD_ERROR = 4;
    DataLoad.FILE_STARTED = 5;
    DataLoad.FILE_PROGRESS = 6;
    DataLoad.FILE_LOADED = 7;
    DataLoad.FILE_ERROR = 9;
    DataLoad._assetList = {};
    DataLoad._weakHandlers = []; // List of handlers to remove once the load is completed
    DataLoad._loadQueue = null; // CreateJS load queue
    DataLoad._loadSignal = null;
    DataLoad._fileStartedSignal = null;
    DataLoad._fileProgressSignal = null;
    DataLoad._fileLoadedSignal = null;
    DataLoad._fileErrorSignal = null;
    DataLoad._queueStartedSignal = null;
    DataLoad._queueProgressSignal = null;
    DataLoad._queueLoadedSignal = null;
    DataLoad._queueErrorSignal = null;
    DataLoad._busy = false;
    Animyst.DataLoad = DataLoad;
})(Animyst || (Animyst = {}));
var Animyst;
(function (Animyst) {
    var Environment = (function () {
        function Environment() {
        }
        //========================================
        Environment._setup = function () {
            Environment._checkBrowser();
            Environment._checkPlatform();
            Environment._checkDevice();
            return true;
        };
        Environment._checkPlatform = function () {
            var userAgent = navigator.userAgent;
            if (/Linux/.test(userAgent)) {
                Environment.platformName = "Linux";
                Environment.isLinux = true;
            }
            if (/Android/.test(userAgent)) {
                Environment.platformName = "Android";
                Environment.isAndroid = true;
            }
            if (/CrOS/.test(userAgent)) {
                Environment.platformName = "ChromeOS";
                Environment.isChromeOS = true;
            }
            if (/iP[ao]d|iPhone/i.test(userAgent)) {
                Environment.platformName = "iOS";
                Environment.isIOS = true;
            }
            if (/Mac OS/.test(userAgent)) {
                Environment.platformName = "Mac";
                Environment.isMacOS = true;
            }
            if (/Windows/.test(userAgent)) {
                Environment.platformName = "Windows";
                Environment.isWindows = true;
            }
            if (Environment.isWindows || Environment.isMacOS || Environment.isLinux) {
                Environment.isDesktop = true;
            }
            if (Environment.isAndroid || Environment.isIOS || Environment.isWebApp) {
                Environment.isMobile = true;
            }
        };
        Environment._checkDevice = function () {
            Environment.pixelRatio = window.devicePixelRatio || 1;
            Environment.colorDepth = window.screen.colorDepth;
            if (Environment.isMobile) {
                Environment.screenWidth = window.screen.width * Environment.pixelRatio;
                Environment.screenHeight = window.screen.height * Environment.pixelRatio;
            }
            else {
                Environment.screenWidth = window.screen.width;
                Environment.screenHeight = window.screen.height;
            }
        };
        Environment._checkBrowser = function () {
            var userAgent = navigator.userAgent;
            if (/Safari/.test(userAgent)) {
                Environment.browserName = "Safari";
                Environment.isSafari = true;
                Environment.browserVersion = (userAgent.indexOf("Version") != -1) ? userAgent.substring(userAgent.indexOf("Version") + 8) : userAgent.substring(userAgent.indexOf("Safari") + 7);
            }
            if (/Mobile(.*)Safari/.test(userAgent)) {
                Environment.browserName = "MobileSafari";
                Environment.isSafari = true;
                Environment.browserVersion = (userAgent.indexOf("Version") != -1) ? userAgent.substring(userAgent.indexOf("Version") + 8) : userAgent.substring(userAgent.indexOf("Safari") + 7);
            }
            if (/Chrome/.test(userAgent)) {
                Environment.browserName = "Chrome";
                Environment.isChrome = true;
                Environment.browserVersion = userAgent.substring(userAgent.indexOf("Chrome") + 7, userAgent.indexOf(" Safari") || null);
            }
            if (/Firefox/.test(userAgent)) {
                Environment.browserName = "Firefox";
                Environment.isFirefox = true;
                Environment.browserVersion = userAgent.substring(userAgent.indexOf("Firefox") + 8);
            }
            if (/MSIE (\d+\.\d+);/.test(userAgent)) {
                Environment.browserName = "MSIE";
                Environment.isIE = true;
                Environment.browserVersion = userAgent.substring(userAgent.indexOf("MSIE") + 5);
            }
            if (/Edge/.test(userAgent)) {
                Environment.browserName = "MSEdge";
                Environment.isEdge = true;
                Environment.browserVersion = userAgent.substring(userAgent.indexOf("Edge") + 5);
            }
            if (navigator['standalone']) {
                Environment.browserName = "WebApp";
                Environment.isWebApp = true;
            }
            if (navigator['isCocoonJS']) {
                Environment.browserName = "CocoonJS";
                Environment.isCocoonJS = true;
            }
            Environment.url = window.location.href;
            Environment.queryString = window.location.search;
            Environment.host = window.location.hostname;
            Environment.path = window.location.pathname;
            Environment.port = window.location.port;
            var details = Environment.browserVersion.split(".");
            switch (details.length) {
                case 1:
                    Environment.browserDetails.major = parseInt(details[0]);
                    break;
                case 2:
                    Environment.browserDetails.major = parseInt(details[0]);
                    Environment.browserDetails.minor = parseInt(details[1]);
                    break;
                case 3:
                    Environment.browserDetails.major = parseInt(details[0]);
                    Environment.browserDetails.minor = parseInt(details[1]);
                    Environment.browserDetails.build = parseInt(details[2]);
                    break;
                case 4:
                    Environment.browserDetails.major = parseInt(details[0]);
                    Environment.browserDetails.minor = parseInt(details[1]);
                    Environment.browserDetails.build = parseInt(details[2]);
                    Environment.browserDetails.revision = parseInt(details[3]);
                    break;
            }
        };
        Environment.getURLParameterByName = function (name, escapeSpaces) {
            if (escapeSpaces === void 0) { escapeSpaces = false; }
            if (escapeSpaces === null)
                escapeSpaces = true;
            var match = new RegExp('[?&]' + name + '=([^&]*)').exec(Environment.queryString);
            return (escapeSpaces) ? match && decodeURIComponent(match[1].replace(/\/+/g, '')) : match && decodeURIComponent(match[1]);
        };
        return Environment;
    }());
    //========================================
    //------------- Platform -----------------
    //========================================
    Environment.isDesktop = false;
    Environment.isMobile = false;
    Environment.isIOS = false;
    Environment.isAndroid = false;
    Environment.isChromeOS = false;
    Environment.isMacOS = false;
    Environment.isWindows = false;
    Environment.isLinux = false;
    Environment.platformName = "";
    //========================================
    //------------- Device -------------------
    //========================================
    Environment.pixelRatio = 1;
    Environment.colorDepth = -1;
    Environment.screenWidth = -1;
    Environment.screenHeight = -1;
    //========================================
    //------------- Browser ------------------
    //========================================
    Environment.isChrome = false;
    Environment.isFirefox = false;
    Environment.isIE = false;
    Environment.isEdge = false;
    Environment.isSafari = false;
    Environment.isWebApp = false;
    Environment.isCocoonJS = false;
    Environment.browserVersion = "";
    Environment.browserName = "";
    Environment.browserDetails = {};
    Environment.url = "";
    Environment.host = "";
    Environment.path = "";
    Environment.port = "";
    Environment.queryString = "";
    Environment.setup = Environment._setup();
    Animyst.Environment = Environment;
})(Animyst || (Animyst = {}));
var Animyst;
(function (Animyst) {
    var Item = (function () {
        function Item(id, params) {
            // code...
            this.id = id;
            this.props = params;
            this.setup(params);
        }
        Item.prototype.setup = function (params) {
        };
        Item.prototype.reset = function () {
            this.setup(this.props);
        };
        Item.prototype.destroy = function () {
            this.props = null;
        };
        Item.prototype.relist = function () {
            if (this.signal)
                this.signal.dispatch(Item.RELIST, this.id);
        };
        return Item;
    }());
    Item.RELIST = "relist";
    Animyst.Item = Item;
})(Animyst || (Animyst = {}));
var Animyst;
(function (Animyst) {
    var Log = (function () {
        function Log() {
        }
        Log.output = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (!Animyst.LOGGING)
                return;
            var logData = [];
            logData.push(":[LOG]:");
            for (var i = 0; i < args.length; i++) {
                logData.push(args[i]);
            }
            console.log.apply(console, logData);
        };
        Log.error = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (!Animyst.LOGGING)
                return;
            var logData = [];
            logData.push(":[ERROR]:");
            for (var i = 0; i < args.length; i++) {
                logData.push(args[i]);
            }
            console.error.apply(console, logData);
        };
        return Log;
    }());
    Animyst.Log = Log;
})(Animyst || (Animyst = {}));
/// <reference path="Signal.ts" />
/*
*	@desc   	An object that represents a binding between a Signal and a listener function.
*               Released under the MIT license
*				http://millermedeiros.github.com/js-signals/
*
*	@version	1.0 - 7th March 2013
*
*	@author 	Richard Davey, TypeScript conversion
*	@author		Miller Medeiros, JS Signals
*	@author		Robert Penner, AS Signals
*
*	@url		http://www.kiwijs.org
*
*/
var Animyst;
/// <reference path="Signal.ts" />
/*
*	@desc   	An object that represents a binding between a Signal and a listener function.
*               Released under the MIT license
*				http://millermedeiros.github.com/js-signals/
*
*	@version	1.0 - 7th March 2013
*
*	@author 	Richard Davey, TypeScript conversion
*	@author		Miller Medeiros, JS Signals
*	@author		Robert Penner, AS Signals
*
*	@url		http://www.kiwijs.org
*
*/
(function (Animyst) {
    var SignalBinding = (function () {
        /**
        * Object that represents a binding between a Signal and a listener function.
        * <br />- <strong>This is an internal constructor and shouldn't be called by regular users.</strong>
        * <br />- inspired by Joa Ebert AS3 SignalBinding and Robert Penner's Slot classes.
        * @author Miller Medeiros
        * @constructor
        * @internal
        * @name SignalBinding
        * @param {Signal} signal Reference to Signal object that listener is currently bound to.
        * @param {Function} listener Handler function bound to the signal.
        * @param {boolean} isOnce If binding should be executed just once.
        * @param {Object} [listenerContext] Context on which listener will be executed (object that should represent the `this` variable inside listener function).
        * @param {Number} [priority] The priority level of the event listener. (default = 0).
        */
        function SignalBinding(signal, listener, isOnce, listenerContext, priority) {
            if (priority === void 0) { priority = 0; }
            /**
            * If binding is active and should be executed.
            * @type boolean
            */
            this.active = true;
            /**
            * Default parameters passed to listener during `Signal.dispatch` and `SignalBinding.execute`. (curried parameters)
            * @type Array|null
            */
            this.params = null;
            this._listener = listener;
            this._isOnce = isOnce;
            this.context = listenerContext;
            this._signal = signal;
            this.priority = priority || 0;
        }
        /**
        * Call listener passing arbitrary parameters.
        * <p>If binding was added using `Signal.addOnce()` it will be automatically removed from signal dispatch queue, this method is used internally for the signal dispatch.</p>
        * @param {Array} [paramsArr] Array of parameters that should be passed to the listener
        * @return {*} Value returned by the listener.
        */
        SignalBinding.prototype.execute = function (paramsArr) {
            var handlerReturn;
            var params;
            if (this.active && !!this._listener) {
                params = this.params ? this.params.concat(paramsArr) : paramsArr;
                handlerReturn = this._listener.apply(this.context, params);
                if (this._isOnce) {
                    this.detach();
                }
            }
            return handlerReturn;
        };
        /**
        * Detach binding from signal.
        * - alias to:mySignal.remove(myBinding.getListener());
        * @return {Function|null} Handler function bound to the signal or `null` if binding was previously detached.
        */
        SignalBinding.prototype.detach = function () {
            return this.isBound() ? this._signal.remove(this._listener, this.context) : null;
        };
        /**
        * @return {Boolean} `true` if binding is still bound to the signal and have a listener.
        */
        SignalBinding.prototype.isBound = function () {
            return (!!this._signal && !!this._listener);
        };
        /**
        * @return {boolean} If SignalBinding will only be executed once.
        */
        SignalBinding.prototype.isOnce = function () {
            return this._isOnce;
        };
        /**
        * @return {Function} Handler function bound to the signal.
        */
        SignalBinding.prototype.getListener = function () {
            return this._listener;
        };
        /**
        * @return {Signal} Signal that listener is currently bound to.
        */
        SignalBinding.prototype.getSignal = function () {
            return this._signal;
        };
        /**
        * Delete instance properties
        * @private
        */
        SignalBinding.prototype._destroy = function () {
            delete this._signal;
            delete this._listener;
            delete this.context;
        };
        /**
        * @return {string} String representation of the object.
        */
        SignalBinding.prototype.toString = function () {
            return '[SignalBinding isOnce:' + this._isOnce + ', isBound:' + this.isBound() + ', active:' + this.active + ']';
        };
        return SignalBinding;
    }());
    Animyst.SignalBinding = SignalBinding;
})(Animyst || (Animyst = {}));
/// <reference path="SignalBinding.ts" />
/**
*	@desc       A TypeScript conversion of JS Signals by Miller Medeiros
*               Released under the MIT license
*				http://millermedeiros.github.com/js-signals/
*
*	@version	1.0 - 7th March 2013
*
*	@author 	Richard Davey, TypeScript conversion
*	@author		Miller Medeiros, JS Signals
*	@author		Robert Penner, AS Signals
*
*	@url		http://www.photonstorm.com
*/
/**
* Custom event broadcaster
* <br />- inspired by Robert Penner's AS3 Signals.
* @name Signal
* @author Miller Medeiros
* @constructor
*/
var Animyst;
/// <reference path="SignalBinding.ts" />
/**
*	@desc       A TypeScript conversion of JS Signals by Miller Medeiros
*               Released under the MIT license
*				http://millermedeiros.github.com/js-signals/
*
*	@version	1.0 - 7th March 2013
*
*	@author 	Richard Davey, TypeScript conversion
*	@author		Miller Medeiros, JS Signals
*	@author		Robert Penner, AS Signals
*
*	@url		http://www.photonstorm.com
*/
/**
* Custom event broadcaster
* <br />- inspired by Robert Penner's AS3 Signals.
* @name Signal
* @author Miller Medeiros
* @constructor
*/
(function (Animyst) {
    var Signal = (function () {
        function Signal() {
            /**
            * @property _bindings
            * @type Array
            * @private
            */
            this._bindings = [];
            /**
            * @property _prevParams
            * @type Any
            * @private
            */
            this._prevParams = null;
            /**
            * If Signal should keep record of previously dispatched parameters and
            * automatically execute listener during `add()`/`addOnce()` if Signal was
            * already dispatched before.
            * @type boolean
            */
            this.memorize = false;
            /**
            * @type boolean
            * @private
            */
            this._shouldPropagate = true;
            /**
            * If Signal is active and should broadcast events.
            * <p><strong>IMPORTANT:</strong> Setting this property during a dispatch will only affect the next dispatch, if you want to stop the propagation of a signal use `halt()` instead.</p>
            * @type boolean
            */
            this.active = true;
        }
        /**
        * @method validateListener
        * @param {Any} listener
        * @param {Any} fnName
        */
        Signal.prototype.validateListener = function (listener, fnName) {
            if (typeof listener !== 'function') {
                throw new Error('listener is a required param of {fn}() and should be a Function.'.replace('{fn}', fnName));
            }
        };
        /**
        * @param {Function} listener
        * @param {boolean} isOnce
        * @param {Object} [listenerContext]
        * @param {Number} [priority]
        * @return {SignalBinding}
        * @private
        */
        Signal.prototype._registerListener = function (listener, isOnce, listenerContext, priority) {
            var prevIndex = this._indexOfListener(listener, listenerContext);
            var binding;
            if (prevIndex !== -1) {
                binding = this._bindings[prevIndex];
                if (binding.isOnce() !== isOnce) {
                    throw new Error('You cannot add' + (isOnce ? '' : 'Once') + '() then add' + (!isOnce ? '' : 'Once') + '() the same listener without removing the relationship first.');
                }
            }
            else {
                binding = new Animyst.SignalBinding(this, listener, isOnce, listenerContext, priority);
                this._addBinding(binding);
            }
            if (this.memorize && this._prevParams) {
                binding.execute(this._prevParams);
            }
            return binding;
        };
        /**
        * @method _addBinding
        * @param {SignalBinding} binding
        * @private
        */
        Signal.prototype._addBinding = function (binding) {
            //simplified insertion sort
            var n = this._bindings.length;
            do {
                --n;
            } while (this._bindings[n] && binding.priority <= this._bindings[n].priority);
            this._bindings.splice(n + 1, 0, binding);
        };
        /**
        * @method _indexOfListener
        * @param {Function} listener
        * @return {number}
        * @private
        */
        Signal.prototype._indexOfListener = function (listener, context) {
            var n = this._bindings.length;
            var cur;
            while (n--) {
                cur = this._bindings[n];
                if (cur.getListener() === listener && cur.context === context) {
                    return n;
                }
            }
            return -1;
        };
        /**
        * Check if listener was attached to Signal.
        * @param {Function} listener
        * @param {Object} [context]
        * @return {boolean} if Signal has the specified listener.
        */
        Signal.prototype.has = function (listener, context) {
            return this._indexOfListener(listener, context) !== -1;
        };
        /**
        * Add a listener to the signal.
        * @param {Function} listener Signal handler function.
        * @param {Object} [listenerContext] Context on which listener will be executed (object that should represent the `this` variable inside listener function).
        * @param {Number} [priority] The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added. (default = 0)
        * @return {SignalBinding} An Object representing the binding between the Signal and listener.
        */
        Signal.prototype.add = function (listener, listenerContext, priority) {
            if (priority === void 0) { priority = 0; }
            this.validateListener(listener, 'add');
            return this._registerListener(listener, false, listenerContext, priority);
        };
        /**
        * Add listener to the signal that should be removed after first execution (will be executed only once).
        * @param {Function} listener Signal handler function.
        * @param {Object} [listenerContext] Context on which listener will be executed (object that should represent the `this` variable inside listener function).
        * @param {Number} [priority] The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added. (default = 0)
        * @return {SignalBinding} An Object representing the binding between the Signal and listener.
        */
        Signal.prototype.addOnce = function (listener, listenerContext, priority) {
            if (priority === void 0) { priority = 0; }
            this.validateListener(listener, 'addOnce');
            return this._registerListener(listener, true, listenerContext, priority);
        };
        /**
        * Remove a single listener from the dispatch queue.
        * @param {Function} listener Handler function that should be removed.
        * @param {Object} [context] Execution context (since you can add the same handler multiple times if executing in a different context).
        * @return {Function} Listener handler function.
        */
        Signal.prototype.remove = function (listener, context) {
            this.validateListener(listener, 'remove');
            var i = this._indexOfListener(listener, context);
            if (i !== -1) {
                this._bindings[i]._destroy(); //no reason to a SignalBinding exist if it isn't attached to a signal
                this._bindings.splice(i, 1);
            }
            return listener;
        };
        /**
        * Remove all listeners from the Signal.
        */
        Signal.prototype.removeAll = function () {
            var n = this._bindings.length;
            while (n--) {
                this._bindings[n]._destroy();
            }
            this._bindings.length = 0;
        };
        /**
        * @return {number} Number of listeners attached to the Signal.
        */
        Signal.prototype.getNumListeners = function () {
            return this._bindings.length;
        };
        /**
        * Stop propagation of the event, blocking the dispatch to next listeners on the queue.
        * <p><strong>IMPORTANT:</strong> should be called only during signal dispatch, calling it before/after dispatch won't affect signal broadcast.</p>
        * @see Signal.prototype.disable
        */
        Signal.prototype.halt = function () {
            this._shouldPropagate = false;
        };
        /**
        * Dispatch/Broadcast Signal to all listeners added to the queue.
        * @param {...*} [params] Parameters that should be passed to each handler.
        */
        Signal.prototype.dispatch = function () {
            var paramsArr = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                paramsArr[_i] = arguments[_i];
            }
            if (!this.active) {
                return;
            }
            var n = this._bindings.length;
            var bindings;
            if (this.memorize) {
                this._prevParams = paramsArr;
            }
            if (!n) {
                //should come after memorize
                return;
            }
            bindings = this._bindings.slice(0); //clone array in case add/remove items during dispatch
            this._shouldPropagate = true; //in case `halt` was called before dispatch or during the previous dispatch.
            //execute all callbacks until end of the list or until a callback returns `false` or stops propagation
            //reverse loop since listeners with higher priority will be added at the end of the list
            do {
                n--;
            } while (bindings[n] && this._shouldPropagate && bindings[n].execute(paramsArr) !== false);
        };
        /**
        * Forget memorized arguments.
        * @see Signal.memorize
        */
        Signal.prototype.forget = function () {
            this._prevParams = null;
        };
        /**
        * Remove all bindings from signal and destroy any reference to external objects (destroy Signal object).
        * <p><strong>IMPORTANT:</strong> calling any method on the signal instance after calling dispose will throw errors.</p>
        */
        Signal.prototype.dispose = function () {
            this.removeAll();
            delete this._bindings;
            delete this._prevParams;
        };
        /**
        * @return {string} String representation of the object.
        */
        Signal.prototype.toString = function () {
            return '[Signal active:' + this.active + ' numListeners:' + this.getNumListeners() + ']';
        };
        return Signal;
    }());
    /**
    * Signals Version Number
    * @property VERSION
    * @type String
    * @const
    */
    Signal.VERSION = '1.0.0';
    Animyst.Signal = Signal;
})(Animyst || (Animyst = {}));
var Animyst;
(function (Animyst) {
    var System = (function () {
        function System() {
        }
        Object.defineProperty(System.prototype, "paused", {
            get: function () { return this._paused; },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(System.prototype, "started", {
            get: function () { return this._started; },
            enumerable: true,
            configurable: true
        });
        ;
        System.prototype.startup = function (params) {
            this._started = true;
            this._startupParams = params;
        };
        System.prototype.shutdown = function () {
            this._started = false;
        };
        System.prototype.update = function (delta, framecount) {
        };
        System.prototype.fixedUpdate = function (timestep, time) {
        };
        return System;
    }());
    Animyst.System = System;
})(Animyst || (Animyst = {}));
var Animyst;
(function (Animyst) {
    var Window = (function () {
        function Window() {
        }
        Object.defineProperty(Window, "orientation", {
            get: function () { return window.orientation; },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(Window, "isLandscape", {
            get: function () { return window.innerWidth > window.innerHeight; },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(Window, "isPortrait", {
            get: function () { return window.innerHeight > window.innerWidth; },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(Window, "width", {
            get: function () { return document.documentElement.clientWidth; },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(Window, "height", {
            get: function () { return document.documentElement.clientHeight; },
            enumerable: true,
            configurable: true
        });
        ;
        Window._onResize = function (evt) {
            Animyst.Log.output("[Window] onResize!");
            Window.resizeSignal.dispatch(evt);
        };
        Window._onWindowLoad = function (evt) {
            Animyst.Log.output("[Window] Window loaded:", "w:", Window.width, "h:", Window.height);
        };
        Window._setup = function () {
            window.addEventListener("resize", Window._onResize);
            window.addEventListener("load", Window._onWindowLoad);
        };
        return Window;
    }());
    Window.resizeSignal = new Animyst.Signal();
    Animyst.Window = Window;
})(Animyst || (Animyst = {}));
Animyst.Window._setup();
var Animyst;
(function (Animyst) {
    var Sound = (function () {
        function Sound() {
        }
        return Sound;
    }());
    Animyst.Sound = Sound;
})(Animyst || (Animyst = {}));
var Animyst;
(function (Animyst) {
    var SceneItem = (function (_super) {
        __extends(SceneItem, _super);
        function SceneItem(id, params) {
            return _super.call(this, id, params) || this;
        }
        SceneItem.prototype.setup = function (params) {
            _super.prototype.setup.call(this, params);
            this.type = params.type;
        };
        return SceneItem;
    }(Animyst.Item));
    SceneItem.BUTTON = 'button';
    SceneItem.SPRITE = 'sprite';
    SceneItem.SPINE = 'spine';
    Animyst.SceneItem = SceneItem;
})(Animyst || (Animyst = {}));
var Animyst;
(function (Animyst) {
    var TweenEngine = (function (_super) {
        __extends(TweenEngine, _super);
        function TweenEngine() {
            var _this = _super.call(this) || this;
            _this.tweenTypes = {
                "Power1.easeIn": Power1.easeIn,
                "Power1.easeInOut": Power1.easeInOut,
                "Power2.easeIn": Power2.easeIn,
                "Power2.easeInOut": Power2.easeInOut,
                "Power3.easeIn": Power3.easeIn,
                "Power3.easeInOut": Power3.easeInOut,
                "Power4.easeIn": Power4.easeIn,
                "Power4.easeInOut": Power4.easeInOut,
                "Bounce.easeOut": Bounce.easeOut,
                "Bounce.easeIn": Bounce.easeIn,
                "Bounce.easeInOut": Bounce.easeInOut,
                "Back.easeIn": Back.easeIn,
                "Back.easeOut": Back.easeOut,
                "Back.easeInOut": Back.easeInOut,
                "Elastic.easeIn": Elastic.easeIn,
                "Elastic.easeOut": Elastic.easeOut,
                "Elastic.easeInOut": Elastic.easeInOut,
                "Linear.easeIn": Linear.easeIn,
                "Linear.easeOut": Linear.easeOut,
                "Linear.easeInOut": Linear.easeInOut,
            };
            return _this;
        }
        TweenEngine.prototype.addAnimation = function (name, anim) {
            this.create(Animyst.Item, name, anim);
        };
        TweenEngine.prototype.animateElements = function (anim, elements, callback) {
            var onEnd = function () { if (callback)
                callback(); };
            var animations;
            if (typeof anim == "string") {
                var animData = this.get(name);
                if (!animData) {
                    console.warn("No anim found for:", anim);
                    return;
                }
                animations = animData.props.anims;
            }
            else {
                animations = anim.anims;
            }
            var timeline = new TimelineMax({ onComplete: function () { return onEnd(); } });
            var tweenElements = [];
            for (var i = 0; i < animations.length; i++) {
                var transition = animations[i];
                switch (transition.element) {
                    case "all":
                        elements.forEach(function (element) { tweenElements.push(element); });
                        break;
                    default:
                        Animyst.ArrayUtil.searchAll("name", transition.element, elements, tweenElements);
                        break;
                }
                //
                if (tweenElements.length == 0)
                    continue;
                while (tweenElements.length) {
                    var graphic = tweenElements.shift();
                    if (!graphic)
                        continue;
                    for (var j = 0; j < transition.tweens.length; j++) {
                        var tween = transition.tweens[j];
                        var params = {};
                        for (var k in tween.params) {
                            if (k == "ease") {
                                params[k] = this.tweenTypes[tween.params[k]];
                            }
                            else {
                                params[k] = tween.params[k];
                            }
                        }
                        timeline.add(TweenMax[tween.type](graphic, tween.time, params));
                    }
                }
            }
        };
        return TweenEngine;
    }(Animyst.Database));
    Animyst.TweenEngine = TweenEngine;
})(Animyst || (Animyst = {}));
var Animyst;
(function (Animyst) {
    var MenuCategory = (function () {
        function MenuCategory() {
        }
        return MenuCategory;
    }());
    MenuCategory.ACTIVE = 'active';
    MenuCategory.PINNED = 'pinned';
    MenuCategory.EXITABLE = 'exitable';
    Animyst.MenuCategory = MenuCategory;
    var Menu = (function (_super) {
        __extends(Menu, _super);
        function Menu(scene, params) {
            var _this = _super.call(this) || this;
            _this.scene = scene;
            _this.addCategory(MenuCategory.ACTIVE, function (s) { return s.active; }, Screen);
            _this.addCategory(MenuCategory.PINNED, function (s) { return s.pinned; }, Screen);
            _this.addCategory(MenuCategory.EXITABLE, function (s) { return !s.pinned && s.active; }, Screen);
            if (params) {
                _this.tweenEngine = params.tweenEngine;
                _this.disableTransitions = params.disableTransitions;
            }
            return _this;
        }
        Menu.prototype.addScreens = function (screens) {
            for (var k in screens) {
                var data = screens[k];
                this.create(Screen, k, data);
                if (this.prebuild)
                    this.build(k);
            }
        };
        Menu.prototype.build = function (screenID) {
            var screen = this.get(screenID);
            if (screen.built)
                return;
            this.scene.makeElements(screen.elements);
            for (var j = 0; j < screen.elements.length; j++) {
                var element = screen.elements[j];
                var graphic = this.scene.getChild(element.name);
                if (!graphic)
                    continue;
                graphic.visible = false;
            }
            screen.built = true;
        };
        Menu.prototype.deconstruct = function (screenID) {
            var screen = this.get(screenID);
            var elements = screen.elements;
            for (var j = 0; j < elements.length; j++) {
                var element = elements[j];
                var graphic = this.scene.getChild(element.name);
                if (!graphic)
                    continue;
                // this.destroyTree(graphic);
                this.scene.removeChild(element.name);
                TweenMax.killTweensOf(graphic);
                //graphic.removeAllChildren();
                graphic.destroy();
            }
            screen.built = false;
        };
        Menu.prototype.show = function (name, callback) {
            var _this = this;
            // Exit all active screens that aren't pinned, then come back and show this screen
            if (!this.isCategoryEmpty(MenuCategory.EXITABLE)) {
                this.traverse(function (s) {
                    _this.exit(s.id, function () {
                        if (_this.isCategoryEmpty(MenuCategory.EXITABLE))
                            _this.show(name, callback);
                    });
                }, null, MenuCategory.EXITABLE);
                return;
            }
            // Show the screen you want to show
            var screen = this.get(name);
            var enterTransition = Animyst.ArrayUtil.search("name", "enter", screen.transitions);
            var idleTransitions = Animyst.ArrayUtil.search("name", "idle", screen.transitions);
            var displays = [];
            this.build(name);
            screen.elements.forEach(function (element) {
                var display = _this.scene.getChild(element.name);
                TweenMax.killTweensOf(display);
                displays.push(display);
            });
            var onEnter = function () {
                _this.scene.enableInteract();
                if (idleTransitions)
                    _this.tweenEngine.animateElements(idleTransitions, displays);
                _this.executeCommandsFor("start");
                if (callback)
                    callback();
            };
            screen.activate();
            this.scene.disableInteract();
            this.resetPositions(name, true);
            this.executeCommandsFor("enter");
            if (this.tweenEngine) {
                if (this.disableTransitions || !enterTransition) {
                    onEnter();
                }
                else {
                    this.tweenEngine.animateElements(enterTransition, displays, function () { return onEnter(); });
                }
            }
            else {
                onEnter();
            }
        };
        Menu.prototype.exit = function (name, callback) {
            var _this = this;
            // Exit named screen
            var screen = this.get(name);
            var exitTransitions = Animyst.ArrayUtil.search("name", "exit", screen.transitions);
            var displays = [];
            screen.elements.forEach(function (element) {
                var display = _this.scene.getChild(element.name);
                TweenMax.killTweensOf(display);
                displays.push(display);
            });
            var onExit = function (s, c) {
                _this.executeCommandsFor("exit");
                _this.resetPositions(s, false);
                var curScreen = _this.get(s);
                curScreen.deactivate();
                if (_this.destroyOnExit)
                    _this.deconstruct(s);
                if (c)
                    c();
            };
            this.scene.disableInteract();
            this.executeCommandsFor("end");
            if (this.tweenEngine) {
                if (this.disableTransitions || !exitTransitions) {
                    onExit(name, callback);
                }
                else {
                    this.tweenEngine.animateElements(exitTransitions, displays, function () { return onExit(name, callback); });
                }
            }
            else {
                onExit(name, callback);
            }
        };
        Menu.prototype.executeCommandsFor = function (name) {
        };
        Menu.prototype.hideAll = function () {
            var _this = this;
            this.traverse(function (screen) {
                if (!screen.built)
                    return;
                for (var j = 0; j < screen.elements.length; j++) {
                    var element = screen.elements[j];
                    var graphic = _this.scene.getChild(element.name);
                    if (!graphic)
                        continue;
                    graphic.visible = false;
                }
            });
        };
        Menu.prototype.resetPositions = function (screenID, visible) {
            if (visible === void 0) { visible = false; }
            var screen = this.get(screenID);
            for (var i = 0; i < screen.elements.length; i++) {
                var element = screen.elements[i];
                var graphic = this.scene.getChild(element.name);
                if (!graphic)
                    continue;
                this.scene.setProperties(graphic, element);
                if (visible !== null) {
                    graphic.visible = element.visible == null ? visible : element.visible;
                }
            }
        };
        return Menu;
    }(Animyst.Database));
    Animyst.Menu = Menu;
    var Screen = (function (_super) {
        __extends(Screen, _super);
        function Screen(id, params) {
            return _super.call(this, id, params) || this;
        }
        Object.defineProperty(Screen.prototype, "active", {
            get: function () { return this._active; },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(Screen.prototype, "pinned", {
            get: function () { return this._pinned; },
            enumerable: true,
            configurable: true
        });
        ;
        Screen.prototype.setup = function (params) {
            _super.prototype.setup.call(this, params);
            this.type = params.type;
            this.elements = params.elements || [];
            this.transitions = params.transitions || [];
            this.commands = params.commands || [];
            this.built = false;
            this.data = {};
            this._pinned = params.pin;
        };
        Screen.prototype.activate = function () {
            this._active = true;
            this.relist();
        };
        Screen.prototype.deactivate = function () {
            this._active = false;
            this.relist();
        };
        Screen.prototype.pin = function () {
            this._pinned = false;
            this.relist();
        };
        Screen.prototype.unpin = function () {
            this._pinned = false;
            this.relist();
        };
        return Screen;
    }(Animyst.Item));
    Animyst.Screen = Screen;
})(Animyst || (Animyst = {}));
var Animyst;
(function (Animyst) {
    var MenuSystem = (function (_super) {
        __extends(MenuSystem, _super);
        function MenuSystem(menu) {
            var _this = _super.call(this) || this;
            _this.menu = menu;
            return _this;
        }
        MenuSystem.prototype.startup = function (params) {
        };
        MenuSystem.prototype.show = function (name, callback) {
            // Exit all active screens that are pinned
            // Show the screen you want to show
        };
        MenuSystem.prototype.exit = function (name, callback) {
            // Exit named screen
        };
        return MenuSystem;
    }(Animyst.System));
    Animyst.MenuSystem = MenuSystem;
})(Animyst || (Animyst = {}));
var Animyst;
(function (Animyst) {
    var ScenePIXICategory = (function () {
        function ScenePIXICategory() {
        }
        return ScenePIXICategory;
    }());
    ScenePIXICategory.INTERACTABLES = 'interact';
    ScenePIXICategory.BUTTONS = 'buttons';
    Animyst.ScenePIXICategory = ScenePIXICategory;
    var ScenePIXI = (function (_super) {
        __extends(ScenePIXI, _super);
        function ScenePIXI(id, params) {
            return _super.call(this, id, params) || this;
        }
        ScenePIXI.prototype.setup = function (params) {
            this.container = new PIXI.Container;
            this.root = params.stage;
            this.input = new Animyst.Signal();
            this.root.addChild(this.container);
            this.elements = new Animyst.Database();
            this.elements.addCategory(ScenePIXICategory.BUTTONS, function (elm) { return elm.type == Animyst.SceneItem.BUTTON; });
            this.elements.addCategory(ScenePIXICategory.INTERACTABLES, function (elm) { return elm.props.display.hasOwnProperty("enableInteract"); });
            _super.prototype.setup.call(this, params);
        };
        ScenePIXI.prototype.destroy = function () {
            var _this = this;
            this.elements.traverse(function (elm) { return _this.removeChild(elm.id); });
            this.container.removeChildren();
            this.container.destroy();
            this.root = null;
            this.container = null;
            this.elements = null;
            _super.prototype.destroy.call(this);
        };
        ScenePIXI.prototype.addChild = function (child) {
            this.container.addChild(child);
            this.elements.create(Animyst.SceneItem, child.name, { display: child });
        };
        ScenePIXI.prototype.getChild = function (name) {
            var element = this.elements.get(name);
            if (element)
                return element.props.display;
        };
        ScenePIXI.prototype.removeChild = function (child) {
            var display;
            if (child instanceof PIXI.DisplayObject) {
                display = child;
            }
            else if (typeof child == "string") {
                var item = this.elements.get(child);
                if (!item) {
                    Animyst.Log.error("[!ScenePIXI] No child found with the name", child);
                }
                else {
                    display = item.props.display;
                }
            }
            this.elements.remove(display.name);
            this.container.removeChild(display);
        };
        ScenePIXI.prototype.makeElements = function (elements) {
            for (var i = 0; i < elements.length; ++i) {
                var element = elements[i];
                this.makeElement(element.name, element.type, element);
            }
        };
        ScenePIXI.prototype.makeElement = function (name, type, params) {
            var element;
            switch (type) {
                case 'sprite':
                    element = this.makeSprite(name, params);
                    break;
                case 'button':
                    element = this.makeButton(name, params);
                    break;
                case 'spine':
                    element = this.makeSpine(name, params);
                    break;
            }
            return element;
        };
        ScenePIXI.prototype.makeSprite = function (name, params) {
            var texture;
            if (params.path) {
                texture = PIXI.Texture.from(params.path);
            }
            else {
                texture = PIXI.Texture.from(Animyst.DataLoad.getPath(params.texture));
            }
            var sprite = new PIXI.Sprite(texture);
            sprite.name = name;
            this.setProperties(sprite, params);
            this.addChild(sprite);
            return sprite;
        };
        ScenePIXI.prototype.makeButton = function (name, params) {
            var up = PIXI.Texture.from(Animyst.DataLoad.getPath(params.up));
            var opt = {
                downTexture: params.down ? PIXI.Texture.from(Animyst.DataLoad.getPath(params.down)) : null,
                overTexture: params.over ? PIXI.Texture.from(Animyst.DataLoad.getPath(params.over)) : null
            };
            var button = new Animyst.ButtonPIXI(up, opt);
            button.name = name;
            this.setProperties(button, params);
            this.addChild(button);
            return button;
        };
        ScenePIXI.prototype.makeSpine = function (name, params) {
            var atlas = new PIXI.spine.core.TextureAtlas(Animyst.DataLoad.getAsset(params.atlas), function (line, callback) {
                callback(PIXI.BaseTexture.from(Animyst.DataLoad.getPath(params.sheet)));
            });
            var rawSkelData = Animyst.DataLoad.getAsset(params.data);
            var spineJSONParser = new PIXI.spine.core.SkeletonJson(new PIXI.spine.core.AtlasAttachmentLoader(atlas));
            var skeletonData = spineJSONParser.readSkeletonData(rawSkelData);
            var anim = new PIXI.spine.Spine(skeletonData);
            anim.name = name;
            if (params.anim && anim.state.hasAnimation(params.anim)) {
                anim.state.setAnimation(params.trackIndex || 0, params.anim, params.loop === undefined ? true : params.loop);
            }
            this.setProperties(anim, params);
            this.addChild(anim);
            return anim;
        };
        ScenePIXI.prototype.setProperties = function (obj, params) {
            obj.x = params.x || 0;
            obj.y = params.y || 0;
            if (params.scaleX)
                obj.scale.x = params.scaleX;
            if (params.scaleY)
                obj.scale.y = params.scaleY;
            if (params.scale) {
                if (typeof params.scale == 'object')
                    obj.scale.set(params.scale.x, params.scale.y);
                if (typeof params.scale == 'number')
                    obj.scale.set(params.scale, params.scale);
            }
            obj.rotation = params.rotation || 0;
        };
        ScenePIXI.prototype.enableInteractable = function (interactable) {
            var element = this.elements.get(interactable);
            var b = element.props.display;
            b.enableInteract();
        };
        ScenePIXI.prototype.disableInteractable = function (interactable) {
            var element = this.elements.get(interactable);
            var b = element.props.display;
            b.disableInteract();
        };
        ScenePIXI.prototype.enableInteract = function (interactables) {
            interactables = interactables || this.elements.getFromCategory('buttons');
            if (Array.isArray(interactables)) {
                for (var i = 0; i < interactables.length; i++) {
                    this.enableInteractable(interactables[i]);
                }
            }
            else if (typeof interactables === 'string') {
                this.enableInteractable(interactables);
            }
        };
        ScenePIXI.prototype.disableInteract = function (interactables) {
            interactables = interactables || this.elements.getFromCategory('interactables');
            if (Array.isArray(interactables)) {
                for (var i = 0; i < interactables.length; i++) {
                    this.disableInteractable(interactables[i]);
                }
            }
            else if (typeof interactables === 'string') {
                this.disableInteractable(interactables);
            }
        };
        return ScenePIXI;
    }(Animyst.Item));
    Animyst.ScenePIXI = ScenePIXI;
})(Animyst || (Animyst = {}));
var Animyst;
(function (Animyst) {
    var SpritePIXI = (function (_super) {
        __extends(SpritePIXI, _super);
        function SpritePIXI(texture) {
            var _this = _super.call(this, texture) || this;
            _this.down = new Animyst.Signal();
            _this.up = new Animyst.Signal();
            _this.over = new Animyst.Signal();
            _this.out = new Animyst.Signal();
            return _this;
        }
        Object.defineProperty(SpritePIXI.prototype, "enabled", {
            get: function () { return this._enabled; },
            enumerable: true,
            configurable: true
        });
        ;
        SpritePIXI.prototype.disableInteract = function () {
            this.removeAllListeners();
            this.interactive = false;
            this._enabled = false;
        };
        SpritePIXI.prototype.enableInteract = function () {
            this.on('pointerdown', this.onDown);
            this.on('pointerup', this.onUp);
            this.on('pointerover', this.onOver);
            this.on('pointerout', this.onOut);
            this.interactive = true;
            this._enabled = true;
        };
        SpritePIXI.prototype.onDown = function () {
            this.down.dispatch(Animyst.Input.MOUSE_DOWN, this);
        };
        SpritePIXI.prototype.onUp = function () {
            this.up.dispatch(Animyst.Input.MOUSE_UP, this);
        };
        SpritePIXI.prototype.onOver = function () {
            this.over.dispatch(Animyst.Input.MOUSE_MOVE, this);
        };
        SpritePIXI.prototype.onOut = function () {
            this.out.dispatch(Animyst.Input.MOUSE_LEAVE, this);
        };
        return SpritePIXI;
    }(PIXI.Sprite));
    Animyst.SpritePIXI = SpritePIXI;
})(Animyst || (Animyst = {}));
var Animyst;
(function (Animyst) {
    var ViewPIXI = (function (_super) {
        __extends(ViewPIXI, _super);
        function ViewPIXI() {
            var _this = _super.call(this) || this;
            _this.width = 0;
            _this.height = 0;
            return _this;
        }
        Object.defineProperty(ViewPIXI.prototype, "halfWidth", {
            get: function () { return this.width / 2; },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(ViewPIXI.prototype, "halfHeight", {
            get: function () { return this.height / 2; },
            enumerable: true,
            configurable: true
        });
        ;
        ViewPIXI.prototype.init = function (params) {
            this.width = params.width || Animyst.Window.width;
            this.height = params.height || Animyst.Window.height;
            this.renderer = PIXI.autoDetectRenderer(this.width, this.height, params.options, params.noWebGL);
            this.renderer.backgroundColor = params.backgroundColor || this.renderer.backgroundColor;
            this.stage = new PIXI.Container();
        };
        ViewPIXI.prototype.create = function (cls, id, params) {
            if (!params.stage)
                params.stage = this.stage;
            return _super.prototype.create.call(this, cls, id, params);
        };
        ViewPIXI.prototype.append = function (containerID) {
            if (!containerID) {
                document.body.appendChild(this.renderer.view);
                //document.body.appendChild(this.view);
            }
            else {
                var container = document.getElementById(containerID);
                if (container) {
                    container.appendChild(this.renderer.view);
                    //container.appendChild(this.view);
                }
                else {
                    Animyst.Log.error("[ViewPIXI] Container ID", containerID, "doesn't exist");
                }
            }
        };
        ViewPIXI.prototype.render = function () {
            this.renderer.render(this.stage);
        };
        return ViewPIXI;
    }(Animyst.Database));
    Animyst.ViewPIXI = ViewPIXI;
})(Animyst || (Animyst = {}));
var Animyst;
(function (Animyst) {
    var ButtonPIXI = (function (_super) {
        __extends(ButtonPIXI, _super);
        function ButtonPIXI(upTexture, options) {
            var _this = _super.call(this, upTexture) || this;
            _this.upTexture = upTexture;
            _this.options = options;
            _this.enableInteract();
            _this.interactive = true;
            _this.buttonMode = true;
            _this.setup(_this.options);
            return _this;
        }
        Object.defineProperty(ButtonPIXI.prototype, "isDown", {
            get: function () { return this._isDown; },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(ButtonPIXI.prototype, "isOver", {
            get: function () { return this._isOver; },
            enumerable: true,
            configurable: true
        });
        ;
        ButtonPIXI.prototype.setup = function (params) {
            if (params) {
                this.downTexture = params.downTexture;
                this.overTexture = params.overTexture;
            }
        };
        ButtonPIXI.prototype.disableInteract = function () {
            this.buttonMode = false;
            _super.prototype.disableInteract.call(this);
        };
        ButtonPIXI.prototype.enableInteract = function () {
            this.buttonMode = true;
            _super.prototype.enableInteract.call(this);
        };
        ButtonPIXI.prototype.onDown = function () {
            this._isDown = true;
            if (this.downTexture)
                this.texture = this.downTexture;
            _super.prototype.onDown.call(this);
        };
        ButtonPIXI.prototype.onUp = function () {
            this._isDown = false;
            this.texture = this.upTexture;
            _super.prototype.onUp.call(this);
        };
        ButtonPIXI.prototype.onOver = function () {
            this._isOver = true;
            if (this.overTexture)
                this.texture = this.overTexture;
            _super.prototype.onOver.call(this);
        };
        ButtonPIXI.prototype.onOut = function () {
            this._isOver = false;
            this.texture = this.upTexture;
            _super.prototype.onOut.call(this);
        };
        return ButtonPIXI;
    }(Animyst.SpritePIXI));
    Animyst.ButtonPIXI = ButtonPIXI;
})(Animyst || (Animyst = {}));
var Animyst;
(function (Animyst) {
    var PIXITexture = (function (_super) {
        __extends(PIXITexture, _super);
        function PIXITexture(stage, renderer) {
            var _this = _super.call(this) || this;
            _this.stage = stage;
            _this.renderer = renderer;
            _this.width = renderer.view.width;
            _this.height = renderer.view.height;
            _this._init();
            return _this;
        }
        PIXITexture.prototype._init = function () {
            this.image = this.renderer.view;
            var graphics = new PIXI.Graphics();
            graphics.lineStyle(2, 0xFF00FF, 1);
            graphics.beginFill(0xFF00BB, 0.25);
            graphics.drawCircle(this.width / 2, this.height / 2, 100);
            graphics.endFill();
            var texture = PIXI.Texture.fromCanvas(Animyst.DataLoad.getAsset('samusftilt'));
            var sprite = new PIXI.Sprite(texture);
            this.stage.addChild(sprite);
            this.stage.addChild(graphics);
            this.invalidate();
            this.update();
        };
        PIXITexture.prototype.invalidate = function () {
            this.shouldUpdate = true;
        };
        ;
        PIXITexture.prototype.update = function () {
            if (this.shouldUpdate) {
                this.renderer.render(this.stage);
                this.needsUpdate = true;
                this.shouldUpdate = false;
            }
        };
        ;
        return PIXITexture;
    }(THREE.Texture));
    Animyst.PIXITexture = PIXITexture;
})(Animyst || (Animyst = {}));
var Animyst;
(function (Animyst) {
    var SpriteSheetTexture = (function (_super) {
        __extends(SpriteSheetTexture, _super);
        function SpriteSheetTexture(atlas) {
            var _this = _super.call(this) || this;
            _this.playTime = 0;
            _this.time = 0;
            _this.currentFrame = 0;
            _this.currentFrameID = "";
            _this.sprite = null;
            _this.renderWidth = 0;
            _this.renderHeight = 0;
            _this.sourceFile = "";
            _this.timePassed = 0;
            _this.addSheet(atlas);
            return _this;
        }
        SpriteSheetTexture.prototype._initSprite = function (startFrame) {
            this.stage = new PIXI.Container();
            this.renderer = PIXI.autoDetectRenderer(256, 256, { transparent: true });
            this.sprite = new PIXI.Sprite(PIXI.Texture.fromFrame(startFrame));
            this.image = this.renderer.view;
            this.stage.addChild(this.sprite);
            this.renderer.render(this.stage);
            this.needsUpdate = true;
        };
        SpriteSheetTexture.prototype.addSheet = function (atlas) {
            this.atlas = atlas;
            this.frames = [];
            for (var k in atlas.frames) {
                var frame = atlas.frames[k];
                if (frame.frame.w > this.renderWidth) {
                    this.renderWidth = frame.frame.w % 2 == 0 ? frame.frame.w : frame.frame.w + 1;
                }
                if (frame.frame.h > this.renderHeight) {
                    this.renderHeight = frame.frame.h % 2 == 0 ? frame.frame.h : frame.frame.h + 1;
                }
                this.frames.push(k);
            }
            if (!this.sprite) {
                this._initSprite(this.frames[0]);
                this.currentFrameID = this.frames[0];
                this.currentFrame = 0;
            }
        };
        SpriteSheetTexture.prototype.showFrame = function (frame) {
            if (this.frames.length <= 0)
                return;
            if (!frame)
                frame = this.currentFrame || 0;
            var thisFrame;
            if (typeof frame == "string") {
                thisFrame = frame;
            }
            else if (typeof frame == "number") {
                thisFrame = this.frames[frame];
            }
            this.sprite.setTexture(PIXI.Texture.fromFrame(thisFrame));
            this.renderer.render(this.stage);
            this.needsUpdate = true;
        };
        SpriteSheetTexture.prototype.play = function (time, loop) {
            if (this.frames.length <= 0)
                return;
            this.playing = true;
            this.loop = loop;
            this.playTime = time;
            this.time = 0;
        };
        SpriteSheetTexture.prototype.stop = function () {
            this.playing = false;
            this.timePassed = 0;
        };
        SpriteSheetTexture.prototype.animate = function (delta, runtime) {
            if (this.playing) {
                //console.log(delta, time, this.time, this.playTime, this.currentFrame, this.sourceFile)
                if (this.time >= this.playTime) {
                    if (this.loop) {
                        this.time = 0;
                    }
                    else {
                        this.playing = false;
                    }
                }
                else {
                    this.time += delta;
                    this.currentFrame = Math.round((this.time / this.playTime) * (this.frames.length - 1));
                    if (this.currentFrame >= this.frames.length)
                        this.currentFrame = this.frames.length - 1;
                    this.showFrame();
                }
            }
        };
        return SpriteSheetTexture;
    }(THREE.Texture));
    Animyst.SpriteSheetTexture = SpriteSheetTexture;
})(Animyst || (Animyst = {}));
var Animyst;
(function (Animyst) {
    var View3D = (function (_super) {
        __extends(View3D, _super);
        function View3D() {
            return _super.call(this) || this;
        }
        Object.defineProperty(View3D.prototype, "aspect", {
            get: function () { return this.width / this.height; },
            enumerable: true,
            configurable: true
        });
        ;
        View3D.prototype.clear = function () {
            _super.prototype.clear.call(this);
        };
        View3D.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
        };
        View3D.prototype.init = function (params) {
            if (!params) {
                Animyst.Log.error("[View3D] No initialization params specified");
                return;
            }
            Animyst.Log.output("[View3D] Initializing Viewport..");
            this.width = params.width || Animyst.Window.width;
            this.height = params.height || Animyst.Window.height;
            this._resize = params.resize;
            this._renderer = new THREE.WebGLRenderer();
            this._renderer.setPixelRatio(window.devicePixelRatio);
            this._renderer.setClearColor(params.rendererColor || 0x888888);
            this._renderer.setSize(this.width, this.height);
            this._renderer.autoClear = false;
            if (params.debugControls) {
                View3D.CONTROLS = params.debugControls;
                if (Animyst.GUI) {
                    var displayControls = Animyst.GUI.addFolder("View3D");
                }
            }
            if (params.resize) {
                Animyst.Window.resizeSignal.add(this.onResize, this);
            }
        };
        View3D.prototype.append = function (containerID) {
            if (!containerID) {
                document.body.appendChild(this._renderer.domElement);
                //document.body.appendChild(this.view);
            }
            else {
                var container = document.getElementById(containerID);
                if (container) {
                    container.appendChild(this._renderer.domElement);
                    //container.appendChild(this.view);
                }
                else {
                    Animyst.Log.error("[Viewport3D] Container ID", containerID, "doesn't exist");
                }
            }
        };
        View3D.prototype.render = function () {
            this._renderer.clear();
            this.traverse(this.renderScene3D, this);
        };
        View3D.prototype.renderScene3D = function (scene3D) {
            var camera = scene3D.getActiveCamera();
            this._renderer.clearDepth();
            this._renderer.render(scene3D.scene, camera);
        };
        View3D.prototype.update = function () {
        };
        View3D.prototype.onResize = function () {
            //this.renderer.setSize(Animyst.)
        };
        return View3D;
    }(Animyst.Database));
    View3D.CONTROLS = false;
    Animyst.View3D = View3D;
    var CameraType = (function () {
        function CameraType() {
        }
        return CameraType;
    }());
    CameraType.PERSPECTIVE = "perspective";
    CameraType.ORTHOGRAPHIC = "orthographic";
    Animyst.CameraType = CameraType;
    var Scene3D = (function (_super) {
        __extends(Scene3D, _super);
        function Scene3D(id, params) {
            return _super.call(this, id, params) || this;
        }
        Scene3D.prototype.setup = function (params) {
            _super.prototype.setup.call(this, params);
            this.scene = new THREE.Scene();
            if (params.addAxis) {
                var axis = new THREE.AxisHelper(20);
                this.scene.add(axis);
            }
            if (params.cameras) {
                for (var i = 0; i < params.cameras.length; ++i) {
                    var camera;
                    var data = params.cameras[i];
                    switch (data.type) {
                        case CameraType.PERSPECTIVE:
                            var pers = new THREE.PerspectiveCamera(data.fov, data.aspect, data.near, data.far);
                            //PerspectiveCamera specific code here...
                            //...
                            camera = pers;
                            break;
                        case CameraType.ORTHOGRAPHIC:
                            var orth = new THREE.OrthographicCamera(data.left, data.right, data.top, data.bottom, data.near, data.far);
                            //OrthographicCamera specific code here...
                            //...
                            camera = orth;
                            break;
                    }
                    camera.name = data.name;
                    if (data.main) {
                        this.activeCamera = camera.name;
                        if (params.debugControls && View3D.CONTROLS && Animyst.GUI) {
                            var controls = new THREE.OrbitControls(camera);
                            var displayControls = Animyst.GUI.__folders['View3D'];
                            var c_folder = displayControls.addFolder("camera");
                            c_folder.add(camera.position, "x", -1000, 1000).listen();
                            c_folder.add(camera.position, "y", -1000, 1000).listen();
                            c_folder.add(camera.position, "z", -1000, 1000).listen();
                        }
                    }
                    camera.position.x = data.x !== null ? data.x : 500;
                    camera.position.y = data.y !== null ? data.y : 500;
                    camera.position.z = data.z !== null ? data.z : 500;
                    this.scene.add(camera);
                    if (data.lookAtScene === undefined || data.lookAtScene) {
                        camera.lookAt(this.scene.position);
                    }
                }
            }
        };
        Scene3D.prototype.getActiveCamera = function () {
            return this.scene.getObjectByName(this.activeCamera);
        };
        return Scene3D;
    }(Animyst.Item));
    Animyst.Scene3D = Scene3D;
})(Animyst || (Animyst = {}));
var Animyst;
(function (Animyst) {
    var Input = (function (_super) {
        __extends(Input, _super);
        function Input(inputData) {
            var _this = _super.call(this) || this;
            _this.inputData = inputData;
            return _this;
        }
        Input.prototype.startup = function (params) {
            var element = params.element;
            var tool = params.tool;
            this.keyboardSettings = params.keyboardSettings;
            if (tool) {
                tool.onKeyUp = this.onKeyUp.bind(this);
                tool.onKeyDown = this.onKeyDown.bind(this);
                tool.onMouseDown = this.onMouseDown.bind(this);
                tool.onMouseUp = this.onMouseUp.bind(this);
                tool.onMouseDrag = this.onMouseDrag.bind(this);
                tool.onMouseMove = this.onMouseMove.bind(this);
            }
            if (element) {
                element.addEventListener('touchstart', this.onTouchStart.bind(this));
                element.addEventListener('touchmove', this.onTouchMove.bind(this));
                element.addEventListener('touchend', this.onTouchRelease.bind(this));
                element.addEventListener('touchenter', this.onTouchEnter.bind(this));
                element.addEventListener('touchleave', this.onTouchLeave.bind(this));
                element.addEventListener('mousedown', this.onMouseDown.bind(this));
                element.addEventListener('mouseup', this.onMouseUp.bind(this));
                element.addEventListener('mousemove', this.onMouseMove.bind(this));
                element.addEventListener('mouseenter', this.onMouseEnter.bind(this));
                element.addEventListener('mouseleave', this.onMouseLeave.bind(this));
                element.addEventListener('keydown', this.onKeyDown.bind(this));
                element.addEventListener('keyup', this.onKeyUp.bind(this));
            }
            Animyst.System.prototype.startup.call(this, params);
        };
        Input.prototype.shutdown = function () {
            this.inputData = null;
            Animyst.System.prototype.shutdown.call(this);
        };
        Input.prototype.update = function (delta, runtime) {
            this.inputData.onTick(delta);
        };
        //=============== TOUCH EVENTS ======================//
        Input.prototype.onTouchStart = function (evt) {
            if (Input.LOGGING && Animyst.LOGGING)
                console.log("[Input] Touch Start!");
            this.handleTouchInput(Input.TOUCH_START, evt);
        };
        Input.prototype.onTouchMove = function (evt) {
            if (Input.LOGGING && Animyst.LOGGING)
                console.log("[Input] Touch Move!");
            this.handleTouchInput(Input.TOUCH_MOVE, evt);
        };
        Input.prototype.onTouchRelease = function (evt) {
            if (Input.LOGGING && Animyst.LOGGING)
                console.log("[Input] Touch Release!");
            this.handleTouchInput(Input.TOUCH_RELEASE, evt);
        };
        Input.prototype.onTouchEnter = function (evt) {
            if (Input.LOGGING && Animyst.LOGGING)
                console.log("[Input] Touch Enter!");
            this.handleTouchInput(Input.TOUCH_ENTER, evt);
        };
        Input.prototype.onTouchLeave = function (evt) {
            if (Input.LOGGING && Animyst.LOGGING)
                console.log("[Input] Touch Leave!");
            this.handleTouchInput(Input.TOUCH_LEAVE, evt);
        };
        //================= MOUSE EVENTS =====================//
        Input.prototype.onClick = function (evt) {
            if (Input.LOGGING && Animyst.LOGGING)
                console.log("[Input] Mouse Click!");
            this.handleMouseInput(Input.MOUSE_CLICK, evt);
        };
        Input.prototype.onMouseDown = function (evt) {
            if (Input.LOGGING && Animyst.LOGGING)
                console.log("[Input] Mouse Down!");
            this.handleMouseInput(Input.MOUSE_DOWN, evt);
        };
        Input.prototype.onMouseDrag = function (evt) {
            if (Input.LOGGING && Animyst.LOGGING)
                console.log("[Input] Mouse Drag!");
            this.handleMouseInput(Input.MOUSE_DRAG, evt);
        };
        Input.prototype.onMouseMove = function (evt) {
            if (Input.LOGGING && Animyst.LOGGING)
                console.log("[Input] Mouse Move!");
            this.handleMouseInput(Input.MOUSE_MOVE, evt);
        };
        Input.prototype.onMouseUp = function (evt) {
            if (Input.LOGGING && Animyst.LOGGING)
                console.log("[Input] Mouse Up!");
            this.handleMouseInput(Input.MOUSE_UP, evt);
        };
        Input.prototype.onMouseEnter = function (evt) {
            if (Input.LOGGING && Animyst.LOGGING)
                console.log("[Input] Mouse Enter!");
            this.handleMouseInput(Input.MOUSE_ENTER, evt);
        };
        Input.prototype.onMouseLeave = function (evt) {
            if (Input.LOGGING && Animyst.LOGGING)
                console.log("[Input] Mouse Leave!");
            this.handleMouseInput(Input.MOUSE_LEAVE, evt);
        };
        //================ KEYBOARD EVENTS ===================//
        Input.prototype.onKeyUp = function (evt) {
            if (Input.LOGGING && Animyst.LOGGING)
                console.log("[Input] Released Key:", evt.key || Animyst.InputData.KEY_NAMES[evt.keyCode]);
            if (!this.keyboardSettings.allowDefault[evt.key || Animyst.InputData.KEY_NAMES[evt.keyCode]]) {
                evt.preventDefault();
            }
            this.handleKeyInput(Input.KEY_UP, evt.keyCode || Animyst.InputData.KEY_CODES[evt.key]);
        };
        Input.prototype.onKeyDown = function (evt) {
            if (Input.LOGGING && Animyst.LOGGING)
                console.log("[Input] Pressed Key:", evt.key || Animyst.InputData.KEY_NAMES[evt.keyCode]);
            if (!this.keyboardSettings.allowDefault[evt.key || Animyst.InputData.KEY_NAMES[evt.keyCode]]) {
                evt.preventDefault();
            }
            this.handleKeyInput(Input.KEY_DOWN, evt.keyCode || Animyst.InputData.KEY_CODES[evt.key]);
        };
        //====================================================//
        Input.prototype.handleMouseInput = function (type, evt) {
            //console.log(evt);
            var down;
            if (type == Input.MOUSE_DOWN || type == Input.MOUSE_DRAG) {
                down = true;
            }
            if (type == Input.MOUSE_UP || type == Input.MOUSE_LEAVE) {
                down = false;
            }
            this.inputData.setMouseInput(evt, down);
        };
        Input.prototype.handleKeyInput = function (type, keyCode) {
            this.inputData.setKeyInput(keyCode, type == Input.KEY_DOWN);
        };
        Input.prototype.handleTouchInput = function (type, evt) {
            switch (type) {
                case Input.TOUCH_START:
                    this.inputData.addTouches(evt.changedTouches);
                    break;
                case Input.TOUCH_MOVE:
                    break;
                case Input.TOUCH_RELEASE:
                    this.inputData.removeTouches(evt.touches);
                    break;
                case Input.TOUCH_ENTER:
                    break;
                case Input.TOUCH_LEAVE:
                    break;
            }
            this.inputData.updateTouches(evt.changedTouches);
        };
        return Input;
    }(Animyst.System));
    Input.LOGGING = false;
    Input.KEY_DOWN = 0;
    Input.KEY_UP = 1;
    Input.TOUCH_START = 0;
    Input.TOUCH_MOVE = 1;
    Input.TOUCH_RELEASE = 2;
    Input.TOUCH_ENTER = 3;
    Input.TOUCH_LEAVE = 4;
    Input.MOUSE_DOWN = 5;
    Input.MOUSE_UP = 6;
    Input.MOUSE_DRAG = 7;
    Input.MOUSE_MOVE = 8;
    Input.MOUSE_ENTER = 9;
    Input.MOUSE_LEAVE = 10;
    Input.MOUSE_CLICK = 11;
    Animyst.Input = Input;
})(Animyst || (Animyst = {}));
var Animyst;
(function (Animyst) {
    var InputData = (function (_super) {
        __extends(InputData, _super);
        function InputData() {
            var _this = _super.call(this) || this;
            _this.map = {};
            _this.touches = [];
            _this.touchHistory = [];
            _this.mouse = {};
            _this.mouseHistory = [];
            _this.totalTouchCount = 0;
            _this.time = 0;
            return _this;
        }
        Object.defineProperty(InputData, "KEY_NAMES", {
            get: function () {
                if (!InputData.__KEY_NAMES) {
                    InputData.__KEY_NAMES = Animyst.ObjectUtil.invert(InputData.KEY_CODES);
                }
                return InputData.__KEY_NAMES;
            },
            enumerable: true,
            configurable: true
        });
        ;
        InputData.prototype.clear = function () {
            this.map = {};
            this.touches = [];
            this.touchHistory = [];
            this.totalTouchCount = 0;
            _super.prototype.clear.call(this);
        };
        InputData.prototype.destroy = function () {
            this.map = null;
            this.touches = null;
            this.touchHistory = null;
            this.totalTouchCount = 0;
            _super.prototype.destroy.call(this);
        };
        InputData.prototype.onTick = function (delta) {
            this.time += delta;
            if (this.mouse.down) {
                this.mouse.clickTime += delta;
            }
            for (var k in this.map) {
                var data = this.map[k];
                if (data.active) {
                    data.time = (data.time || 0) + delta;
                }
            }
            for (var i = 0; i < this.touches.length; i++) {
                var touchData = this.touches[i];
                touchData.time += delta;
            }
        };
        InputData.prototype.isKeyDown = function (keyName) {
            var keyCode = InputData.KEY_CODES[keyName];
            return (this.map[keyCode] && this.map[keyCode].active) ? true : false;
        };
        InputData.prototype.setKeyInput = function (keyCode, active) {
            var data = this.map[keyCode] || {};
            var evtType;
            if (active && !data.active) {
                data.time = 0;
                evtType = InputData.KEY_ACTIVE;
            }
            if (!active && data.active) {
                data.lastInput = {};
                data.lastInput.endTime = this.time;
                data.lastInput.duration = data.time;
                data.lastInput.startTime = this.time - data.time;
                data.time = 0;
                evtType = InputData.KEY_INACTIVE;
            }
            data.active = active === true;
            if (!this.map[keyCode]) {
                this.map[keyCode] = data;
            }
            if (evtType)
                this.signal.dispatch(InputData.KEY, evtType, data);
        };
        InputData.prototype.setMouseInput = function (evt, down) {
            if (this.touches.length > 0 && down)
                down = false;
            if (typeof (down) != "boolean")
                down = this.mouse.down;
            var lastClick = this.mouse.down && !down ? this.mouse.lastClick || {} : null;
            var clickStart = !this.mouse.down && down ? {} : null;
            var evtType = InputData.MOUSE_MOVE;
            for (var i = 0; i < InputData.MOUSE_PROPERTIES.length; i++) {
                var k = InputData.MOUSE_PROPERTIES[i];
                if (evt[k]) {
                    this.mouse[k] = evt[k];
                    if (lastClick)
                        lastClick[k] = evt[k];
                    if (clickStart)
                        clickStart[k] = evt[k];
                }
            }
            if (clickStart) {
                if (InputData.LOGGING && Animyst.LOGGING)
                    console.log("[InputData] Click Start!");
                this.mouse.clickStart = clickStart;
                this.mouse.clickTime = 0;
                evtType = InputData.MOUSE_DOWN;
            }
            if (lastClick) {
                if (InputData.LOGGING && Animyst.LOGGING)
                    console.log("[InputData] Click Ended!", this.mouse.clickTime);
                lastClick.clickStart = this.mouse.clickStart;
                lastClick.clickTime = this.mouse.clickTime;
                this.mouse.clickStart = null;
                this.mouse.lastClick = lastClick;
                evtType = InputData.MOUSE_UP;
            }
            this.mouse.down = down;
            this.signal.dispatch(InputData.MOUSE, evtType, this.mouse);
        };
        InputData.prototype.getTouches = function () {
            return this.touches.concat();
        };
        InputData.prototype.addTouches = function (touches) {
            for (var i = 0; i < touches.length; i++) {
                var touch = touches[i];
                var isNew = true;
                for (var j = 0; j < this.touches.length; j++) {
                    if (this.touches[j].identifier == touch.identifier) {
                        isNew = false;
                        break;
                    }
                }
                if (isNew) {
                    var data = {};
                    var startData = {};
                    for (var j = 0; j < InputData.TOUCH_PROPERTIES.length; j++) {
                        var k = InputData.TOUCH_PROPERTIES[j];
                        data[k] = (typeof touch[k] != "object" || k == "target") ? touch[k] : null;
                        startData[k] = (typeof touch[k] != "object") ? touch[k] : null;
                    }
                    data.time = 0; //Time Counter
                    data.timestamp = this.time; //When the touch began
                    data.startData = startData; //Data assosiated with the start of the touch
                    data.uid = data.identifier + "" + this.totalTouchCount; //Unique identifier for this touch that seperates it from past touches
                    this.touches.push(data);
                    this.totalTouchCount++;
                    if (InputData.LOGGING && Animyst.LOGGING)
                        console.log("[InputData] Adding Touch:", data.uid);
                    this.signal.dispatch(InputData.TOUCH, InputData.TOUCH_ADDED, data);
                }
            }
        };
        InputData.prototype.removeTouches = function (touches) {
            for (var i = this.touches.length - 1; i > -1 && this.touches.length > 0; i--) {
                var touchData = this.touches[i];
                var isGone = true;
                for (var j = 0; j < touches.length; j++) {
                    if (touches[j].identifier == touchData.identifier) {
                        isGone = false;
                        break;
                    }
                }
                if (isGone) {
                    if (InputData.LOGGING && Animyst.LOGGING)
                        console.log("[InputData] Removing Touch:", touchData.uid);
                    this.touchHistory.unshift(touchData);
                    this.touches.splice(i, 1);
                    if (this.touchHistory.length > InputData.TOUCH_HISTORY_LIMIT) {
                        this.touchHistory.pop();
                    }
                    this.signal.dispatch(InputData.TOUCH, InputData.TOUCH_REMOVED, touchData);
                }
            }
        };
        InputData.prototype.updateTouches = function (touches) {
            for (var i = 0; i < touches.length; i++) {
                var touch = touches[i];
                var data;
                for (var j = 0; j < this.touches.length; j++) {
                    if (this.touches[j].identifier == touch.identifier) {
                        data = this.touches[j];
                        break;
                    }
                }
                if (data) {
                    for (var j = 0; j < InputData.TOUCH_PROPERTIES.length; j++) {
                        var k = InputData.TOUCH_PROPERTIES[j];
                        data[k] = touch[k];
                    }
                    if (InputData.LOGGING && Animyst.LOGGING)
                        console.log("[InputData] Updated Touch:", data.uid, Math.round(data.pageX), Math.round(data.pageY), Math.round(data.screenX), Math.round(data.screenY), data.force || data.webkitForce);
                    this.signal.dispatch(InputData.TOUCH, InputData.TOUCH_UPDATED, data);
                }
            }
        };
        return InputData;
    }(Animyst.Database));
    InputData.LOGGING = false;
    InputData.TOUCH_HISTORY_LIMIT = 12;
    InputData.TOUCH_PROPERTIES = ["identifier", "screenX", "screenY", "clientX", "clientY",
        "pageX", "pageY", "radiusX", "radiusY", "rotationAngle",
        "force", "webkitForce", "target"];
    InputData.MOUSE_PROPERTIES = ["clientX", "clientY", "screenX", "screenY", "type", "point",
        "lastPoint", "downPoint", "middlePoint", "count", "item", "modifiers"];
    InputData.KEY_CODES = {
        'backspace': 8,
        'tab': 9,
        'enter': 13,
        'shift': 16,
        'ctrl': 17,
        'alt': 18,
        'pause': 19,
        'capslock': 20,
        'numlock': 144,
        'esc': 27,
        'pageup': 33,
        'pagedown': 34,
        'end': 35,
        'home': 36,
        'leftarrow': 37,
        'uparrow': 38,
        'rightarrow': 39,
        'downarrow': 40,
        'insert': 45,
        'delete': 46,
        'clear': 12,
        '0': 48,
        '1': 49,
        '2': 50,
        '3': 51,
        '4': 52,
        '5': 53,
        '6': 54,
        '7': 55,
        '8': 56,
        '9': 57,
        'a': 65,
        'b': 66,
        'c': 67,
        'd': 68,
        'e': 69,
        'f': 70,
        'g': 71,
        'h': 72,
        'i': 73,
        'j': 74,
        'k': 75,
        'l': 76,
        'm': 77,
        'n': 78,
        'o': 79,
        'p': 80,
        'q': 81,
        'r': 82,
        's': 83,
        't': 84,
        'u': 85,
        'v': 86,
        'w': 87,
        'x': 88,
        'y': 89,
        'z': 90,
        'numpad0': 96,
        'numpad1': 97,
        'numpad2': 98,
        'numpad3': 99,
        'numpad4': 100,
        'numpad5': 101,
        'numpad6': 102,
        'numpad7': 103,
        'numpad8': 104,
        'numpad9': 105,
        'multiply': 106,
        'plus': 107,
        'minus': 109,
        'dot': 110,
        'divide': 111,
        'f1': 112,
        'f2': 113,
        'f3': 114,
        'f4': 115,
        'f5': 116,
        'f6': 117,
        'f7': 118,
        'f8': 119,
        'f9': 120,
        'f10': 121,
        'f11': 122,
        'f12': 123,
        '=': 187,
        ',': 188,
        '.': 190,
        '/': 191,
        'backslash': 220,
        ";": 186,
        "'": 222,
        "[": 219,
        "]": 221,
        "-": 189,
        "space": 32,
        "~": 192
    };
    InputData.MOUSE = 0;
    InputData.TOUCH = 1;
    InputData.KEY = 2;
    InputData.TOUCH_ADDED = 0;
    InputData.TOUCH_REMOVED = 1;
    InputData.TOUCH_UPDATED = 2;
    InputData.MOUSE_DOWN = 0;
    InputData.MOUSE_UP = 1;
    InputData.MOUSE_MOVE = 2;
    InputData.MOUSE_OUT = 3;
    InputData.KEY_ACTIVE = 0;
    InputData.KEY_INACTIVE = 1;
    Animyst.InputData = InputData;
})(Animyst || (Animyst = {}));
/*!
 *  howler.js v2.0.3
 *  howlerjs.com
 *
 *  (c) 2013-2017, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */
(function () {
    'use strict';
    /** Global Methods **/
    /***************************************************************************/
    /**
     * Create the global controller. All contained methods and properties apply
     * to all sounds that are currently playing or will be in the future.
     */
    var HowlerGlobal = function () {
        this.init();
    };
    HowlerGlobal.prototype = {
        /**
         * Initialize the global Howler object.
         * @return {Howler}
         */
        init: function () {
            var self = this || Howler;
            // Create a global ID counter.
            self._counter = 0;
            // Internal properties.
            self._codecs = {};
            self._howls = [];
            self._muted = false;
            self._volume = 1;
            self._canPlayEvent = 'canplaythrough';
            self._navigator = (typeof window !== 'undefined' && window.navigator) ? window.navigator : null;
            // Public properties.
            self.masterGain = null;
            self.noAudio = false;
            self.usingWebAudio = true;
            self.autoSuspend = true;
            self.ctx = null;
            // Set to false to disable the auto iOS enabler.
            self.mobileAutoEnable = true;
            // Setup the various state values for global tracking.
            self._setup();
            return self;
        },
        /**
         * Get/set the global volume for all sounds.
         * @param  {Float} vol Volume from 0.0 to 1.0.
         * @return {Howler/Float}     Returns self or current volume.
         */
        volume: function (vol) {
            var self = this || Howler;
            vol = parseFloat(vol);
            // If we don't have an AudioContext created yet, run the setup.
            if (!self.ctx) {
                setupAudioContext();
            }
            if (typeof vol !== 'undefined' && vol >= 0 && vol <= 1) {
                self._volume = vol;
                // Don't update any of the nodes if we are muted.
                if (self._muted) {
                    return self;
                }
                // When using Web Audio, we just need to adjust the master gain.
                if (self.usingWebAudio) {
                    self.masterGain.gain.value = vol;
                }
                // Loop through and change volume for all HTML5 audio nodes.
                for (var i = 0; i < self._howls.length; i++) {
                    if (!self._howls[i]._webAudio) {
                        // Get all of the sounds in this Howl group.
                        var ids = self._howls[i]._getSoundIds();
                        // Loop through all sounds and change the volumes.
                        for (var j = 0; j < ids.length; j++) {
                            var sound = self._howls[i]._soundById(ids[j]);
                            if (sound && sound._node) {
                                sound._node.volume = sound._volume * vol;
                            }
                        }
                    }
                }
                return self;
            }
            return self._volume;
        },
        /**
         * Handle muting and unmuting globally.
         * @param  {Boolean} muted Is muted or not.
         */
        mute: function (muted) {
            var self = this || Howler;
            // If we don't have an AudioContext created yet, run the setup.
            if (!self.ctx) {
                setupAudioContext();
            }
            self._muted = muted;
            // With Web Audio, we just need to mute the master gain.
            if (self.usingWebAudio) {
                self.masterGain.gain.value = muted ? 0 : self._volume;
            }
            // Loop through and mute all HTML5 Audio nodes.
            for (var i = 0; i < self._howls.length; i++) {
                if (!self._howls[i]._webAudio) {
                    // Get all of the sounds in this Howl group.
                    var ids = self._howls[i]._getSoundIds();
                    // Loop through all sounds and mark the audio node as muted.
                    for (var j = 0; j < ids.length; j++) {
                        var sound = self._howls[i]._soundById(ids[j]);
                        if (sound && sound._node) {
                            sound._node.muted = (muted) ? true : sound._muted;
                        }
                    }
                }
            }
            return self;
        },
        /**
         * Unload and destroy all currently loaded Howl objects.
         * @return {Howler}
         */
        unload: function () {
            var self = this || Howler;
            for (var i = self._howls.length - 1; i >= 0; i--) {
                self._howls[i].unload();
            }
            // Create a new AudioContext to make sure it is fully reset.
            if (self.usingWebAudio && self.ctx && typeof self.ctx.close !== 'undefined') {
                self.ctx.close();
                self.ctx = null;
                setupAudioContext();
            }
            return self;
        },
        /**
         * Check for codec support of specific extension.
         * @param  {String} ext Audio file extention.
         * @return {Boolean}
         */
        codecs: function (ext) {
            return (this || Howler)._codecs[ext.replace(/^x-/, '')];
        },
        /**
         * Setup various state values for global tracking.
         * @return {Howler}
         */
        _setup: function () {
            var self = this || Howler;
            // Keeps track of the suspend/resume state of the AudioContext.
            self.state = self.ctx ? self.ctx.state || 'running' : 'running';
            // Automatically begin the 30-second suspend process
            self._autoSuspend();
            // Check if audio is available.
            if (!self.usingWebAudio) {
                // No audio is available on this system if noAudio is set to true.
                if (typeof Audio !== 'undefined') {
                    try {
                        var test = new Audio();
                        // Check if the canplaythrough event is available.
                        if (typeof test.oncanplaythrough === 'undefined') {
                            self._canPlayEvent = 'canplay';
                        }
                    }
                    catch (e) {
                        self.noAudio = true;
                    }
                }
                else {
                    self.noAudio = true;
                }
            }
            // Test to make sure audio isn't disabled in Internet Explorer.
            try {
                var test = new Audio();
                if (test.muted) {
                    self.noAudio = true;
                }
            }
            catch (e) { }
            // Check for supported codecs.
            if (!self.noAudio) {
                self._setupCodecs();
            }
            return self;
        },
        /**
         * Check for browser support for various codecs and cache the results.
         * @return {Howler}
         */
        _setupCodecs: function () {
            var self = this || Howler;
            var audioTest = null;
            // Must wrap in a try/catch because IE11 in server mode throws an error.
            try {
                audioTest = (typeof Audio !== 'undefined') ? new Audio() : null;
            }
            catch (err) {
                return self;
            }
            if (!audioTest || typeof audioTest.canPlayType !== 'function') {
                return self;
            }
            var mpegTest = audioTest.canPlayType('audio/mpeg;').replace(/^no$/, '');
            // Opera version <33 has mixed MP3 support, so we need to check for and block it.
            var checkOpera = self._navigator && self._navigator.userAgent.match(/OPR\/([0-6].)/g);
            var isOldOpera = (checkOpera && parseInt(checkOpera[0].split('/')[1], 10) < 33);
            self._codecs = {
                mp3: !!(!isOldOpera && (mpegTest || audioTest.canPlayType('audio/mp3;').replace(/^no$/, ''))),
                mpeg: !!mpegTest,
                opus: !!audioTest.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, ''),
                ogg: !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ''),
                oga: !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ''),
                wav: !!audioTest.canPlayType('audio/wav; codecs="1"').replace(/^no$/, ''),
                aac: !!audioTest.canPlayType('audio/aac;').replace(/^no$/, ''),
                caf: !!audioTest.canPlayType('audio/x-caf;').replace(/^no$/, ''),
                m4a: !!(audioTest.canPlayType('audio/x-m4a;') || audioTest.canPlayType('audio/m4a;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/, ''),
                mp4: !!(audioTest.canPlayType('audio/x-mp4;') || audioTest.canPlayType('audio/mp4;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/, ''),
                weba: !!audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, ''),
                webm: !!audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, ''),
                dolby: !!audioTest.canPlayType('audio/mp4; codecs="ec-3"').replace(/^no$/, ''),
                flac: !!(audioTest.canPlayType('audio/x-flac;') || audioTest.canPlayType('audio/flac;')).replace(/^no$/, '')
            };
            return self;
        },
        /**
         * Mobile browsers will only allow audio to be played after a user interaction.
         * Attempt to automatically unlock audio on the first user interaction.
         * Concept from: http://paulbakaus.com/tutorials/html5/web-audio-on-ios/
         * @return {Howler}
         */
        _enableMobileAudio: function () {
            var self = this || Howler;
            // Only run this on mobile devices if audio isn't already eanbled.
            var isMobile = /iPhone|iPad|iPod|Android|BlackBerry|BB10|Silk|Mobi/i.test(self._navigator && self._navigator.userAgent);
            var isTouch = !!(('ontouchend' in window) || (self._navigator && self._navigator.maxTouchPoints > 0) || (self._navigator && self._navigator.msMaxTouchPoints > 0));
            if (self._mobileEnabled || !self.ctx || (!isMobile && !isTouch)) {
                return;
            }
            self._mobileEnabled = false;
            // Some mobile devices/platforms have distortion issues when opening/closing tabs and/or web views.
            // Bugs in the browser (especially Mobile Safari) can cause the sampleRate to change from 44100 to 48000.
            // By calling Howler.unload(), we create a new AudioContext with the correct sampleRate.
            if (!self._mobileUnloaded && self.ctx.sampleRate !== 44100) {
                self._mobileUnloaded = true;
                self.unload();
            }
            // Scratch buffer for enabling iOS to dispose of web audio buffers correctly, as per:
            // http://stackoverflow.com/questions/24119684
            self._scratchBuffer = self.ctx.createBuffer(1, 1, 22050);
            // Call this method on touch start to create and play a buffer,
            // then check if the audio actually played to determine if
            // audio has now been unlocked on iOS, Android, etc.
            var unlock = function () {
                // Create an empty buffer.
                var source = self.ctx.createBufferSource();
                source.buffer = self._scratchBuffer;
                source.connect(self.ctx.destination);
                // Play the empty buffer.
                if (typeof source.start === 'undefined') {
                    source.noteOn(0);
                }
                else {
                    source.start(0);
                }
                // Setup a timeout to check that we are unlocked on the next event loop.
                source.onended = function () {
                    source.disconnect(0);
                    // Update the unlocked state and prevent this check from happening again.
                    self._mobileEnabled = true;
                    self.mobileAutoEnable = false;
                    // Remove the touch start listener.
                    document.removeEventListener('touchend', unlock, true);
                };
            };
            // Setup a touch start listener to attempt an unlock in.
            document.addEventListener('touchend', unlock, true);
            return self;
        },
        /**
         * Automatically suspend the Web Audio AudioContext after no sound has played for 30 seconds.
         * This saves processing/energy and fixes various browser-specific bugs with audio getting stuck.
         * @return {Howler}
         */
        _autoSuspend: function () {
            var self = this;
            if (!self.autoSuspend || !self.ctx || typeof self.ctx.suspend === 'undefined' || !Howler.usingWebAudio) {
                return;
            }
            // Check if any sounds are playing.
            for (var i = 0; i < self._howls.length; i++) {
                if (self._howls[i]._webAudio) {
                    for (var j = 0; j < self._howls[i]._sounds.length; j++) {
                        if (!self._howls[i]._sounds[j]._paused) {
                            return self;
                        }
                    }
                }
            }
            if (self._suspendTimer) {
                clearTimeout(self._suspendTimer);
            }
            // If no sound has played after 30 seconds, suspend the context.
            self._suspendTimer = setTimeout(function () {
                if (!self.autoSuspend) {
                    return;
                }
                self._suspendTimer = null;
                self.state = 'suspending';
                self.ctx.suspend().then(function () {
                    self.state = 'suspended';
                    if (self._resumeAfterSuspend) {
                        delete self._resumeAfterSuspend;
                        self._autoResume();
                    }
                });
            }, 30000);
            return self;
        },
        /**
         * Automatically resume the Web Audio AudioContext when a new sound is played.
         * @return {Howler}
         */
        _autoResume: function () {
            var self = this;
            if (!self.ctx || typeof self.ctx.resume === 'undefined' || !Howler.usingWebAudio) {
                return;
            }
            if (self.state === 'running' && self._suspendTimer) {
                clearTimeout(self._suspendTimer);
                self._suspendTimer = null;
            }
            else if (self.state === 'suspended') {
                self.state = 'resuming';
                self.ctx.resume().then(function () {
                    self.state = 'running';
                    // Emit to all Howls that the audio has resumed.
                    for (var i = 0; i < self._howls.length; i++) {
                        self._howls[i]._emit('resume');
                    }
                });
                if (self._suspendTimer) {
                    clearTimeout(self._suspendTimer);
                    self._suspendTimer = null;
                }
            }
            else if (self.state === 'suspending') {
                self._resumeAfterSuspend = true;
            }
            return self;
        }
    };
    // Setup the global audio controller.
    var Howler = new HowlerGlobal();
    /** Group Methods **/
    /***************************************************************************/
    /**
     * Create an audio group controller.
     * @param {Object} o Passed in properties for this group.
     */
    var Howl = function (o) {
        var self = this;
        // Throw an error if no source is provided.
        if (!o.src || o.src.length === 0) {
            console.error('An array of source files must be passed with any new Howl.');
            return;
        }
        self.init(o);
    };
    Howl.prototype = {
        /**
         * Initialize a new Howl group object.
         * @param  {Object} o Passed in properties for this group.
         * @return {Howl}
         */
        init: function (o) {
            var self = this;
            // If we don't have an AudioContext created yet, run the setup.
            if (!Howler.ctx) {
                setupAudioContext();
            }
            // Setup user-defined default properties.
            self._autoplay = o.autoplay || false;
            self._format = (typeof o.format !== 'string') ? o.format : [o.format];
            self._html5 = o.html5 || false;
            self._muted = o.mute || false;
            self._loop = o.loop || false;
            self._pool = o.pool || 5;
            self._preload = (typeof o.preload === 'boolean') ? o.preload : true;
            self._rate = o.rate || 1;
            self._sprite = o.sprite || {};
            self._src = (typeof o.src !== 'string') ? o.src : [o.src];
            self._volume = o.volume !== undefined ? o.volume : 1;
            // Setup all other default properties.
            self._duration = 0;
            self._state = 'unloaded';
            self._sounds = [];
            self._endTimers = {};
            self._queue = [];
            // Setup event listeners.
            self._onend = o.onend ? [{ fn: o.onend }] : [];
            self._onfade = o.onfade ? [{ fn: o.onfade }] : [];
            self._onload = o.onload ? [{ fn: o.onload }] : [];
            self._onloaderror = o.onloaderror ? [{ fn: o.onloaderror }] : [];
            self._onpause = o.onpause ? [{ fn: o.onpause }] : [];
            self._onplay = o.onplay ? [{ fn: o.onplay }] : [];
            self._onstop = o.onstop ? [{ fn: o.onstop }] : [];
            self._onmute = o.onmute ? [{ fn: o.onmute }] : [];
            self._onvolume = o.onvolume ? [{ fn: o.onvolume }] : [];
            self._onrate = o.onrate ? [{ fn: o.onrate }] : [];
            self._onseek = o.onseek ? [{ fn: o.onseek }] : [];
            self._onresume = [];
            // Web Audio or HTML5 Audio?
            self._webAudio = Howler.usingWebAudio && !self._html5;
            // Automatically try to enable audio on iOS.
            if (typeof Howler.ctx !== 'undefined' && Howler.ctx && Howler.mobileAutoEnable) {
                Howler._enableMobileAudio();
            }
            // Keep track of this Howl group in the global controller.
            Howler._howls.push(self);
            // If they selected autoplay, add a play event to the load queue.
            if (self._autoplay) {
                self._queue.push({
                    event: 'play',
                    action: function () {
                        self.play();
                    }
                });
            }
            // Load the source file unless otherwise specified.
            if (self._preload) {
                self.load();
            }
            return self;
        },
        /**
         * Load the audio file.
         * @return {Howler}
         */
        load: function () {
            var self = this;
            var url = null;
            // If no audio is available, quit immediately.
            if (Howler.noAudio) {
                self._emit('loaderror', null, 'No audio support.');
                return;
            }
            // Make sure our source is in an array.
            if (typeof self._src === 'string') {
                self._src = [self._src];
            }
            // Loop through the sources and pick the first one that is compatible.
            for (var i = 0; i < self._src.length; i++) {
                var ext, str;
                if (self._format && self._format[i]) {
                    // If an extension was specified, use that instead.
                    ext = self._format[i];
                }
                else {
                    // Make sure the source is a string.
                    str = self._src[i];
                    if (typeof str !== 'string') {
                        self._emit('loaderror', null, 'Non-string found in selected audio sources - ignoring.');
                        continue;
                    }
                    // Extract the file extension from the URL or base64 data URI.
                    ext = /^data:audio\/([^;,]+);/i.exec(str);
                    if (!ext) {
                        ext = /\.([^.]+)$/.exec(str.split('?', 1)[0]);
                    }
                    if (ext) {
                        ext = ext[1].toLowerCase();
                    }
                }
                // Log a warning if no extension was found.
                if (!ext) {
                    console.warn('No file extension was found. Consider using the "format" property or specify an extension.');
                }
                // Check if this extension is available.
                if (ext && Howler.codecs(ext)) {
                    url = self._src[i];
                    break;
                }
            }
            if (!url) {
                self._emit('loaderror', null, 'No codec support for selected audio sources.');
                return;
            }
            self._src = url;
            self._state = 'loading';
            // If the hosting page is HTTPS and the source isn't,
            // drop down to HTML5 Audio to avoid Mixed Content errors.
            if (window.location.protocol === 'https:' && url.slice(0, 5) === 'http:') {
                self._html5 = true;
                self._webAudio = false;
            }
            // Create a new sound object and add it to the pool.
            new Sound(self);
            // Load and decode the audio data for playback.
            if (self._webAudio) {
                loadBuffer(self);
            }
            return self;
        },
        /**
         * Play a sound or resume previous playback.
         * @param  {String/Number} sprite   Sprite name for sprite playback or sound id to continue previous.
         * @param  {Boolean} internal Internal Use: true prevents event firing.
         * @return {Number}          Sound ID.
         */
        play: function (sprite, internal) {
            var self = this;
            var id = null;
            // Determine if a sprite, sound id or nothing was passed
            if (typeof sprite === 'number') {
                id = sprite;
                sprite = null;
            }
            else if (typeof sprite === 'string' && self._state === 'loaded' && !self._sprite[sprite]) {
                // If the passed sprite doesn't exist, do nothing.
                return null;
            }
            else if (typeof sprite === 'undefined') {
                // Use the default sound sprite (plays the full audio length).
                sprite = '__default';
                // Check if there is a single paused sound that isn't ended.
                // If there is, play that sound. If not, continue as usual.
                var num = 0;
                for (var i = 0; i < self._sounds.length; i++) {
                    if (self._sounds[i]._paused && !self._sounds[i]._ended) {
                        num++;
                        id = self._sounds[i]._id;
                    }
                }
                if (num === 1) {
                    sprite = null;
                }
                else {
                    id = null;
                }
            }
            // Get the selected node, or get one from the pool.
            var sound = id ? self._soundById(id) : self._inactiveSound();
            // If the sound doesn't exist, do nothing.
            if (!sound) {
                return null;
            }
            // Select the sprite definition.
            if (id && !sprite) {
                sprite = sound._sprite || '__default';
            }
            // If we have no sprite and the sound hasn't loaded, we must wait
            // for the sound to load to get our audio's duration.
            if (self._state !== 'loaded' && !self._sprite[sprite]) {
                self._queue.push({
                    event: 'play',
                    action: function () {
                        self.play(self._soundById(sound._id) ? sound._id : undefined);
                    }
                });
                return sound._id;
            }
            // Don't play the sound if an id was passed and it is already playing.
            if (id && !sound._paused) {
                // Trigger the play event, in order to keep iterating through queue.
                if (!internal) {
                    setTimeout(function () {
                        self._emit('play', sound._id);
                    }, 0);
                }
                return sound._id;
            }
            // Make sure the AudioContext isn't suspended, and resume it if it is.
            if (self._webAudio) {
                Howler._autoResume();
            }
            // Determine how long to play for and where to start playing.
            var seek = Math.max(0, sound._seek > 0 ? sound._seek : self._sprite[sprite][0] / 1000);
            var duration = Math.max(0, ((self._sprite[sprite][0] + self._sprite[sprite][1]) / 1000) - seek);
            var timeout = (duration * 1000) / Math.abs(sound._rate);
            // Update the parameters of the sound
            sound._paused = false;
            sound._ended = false;
            sound._sprite = sprite;
            sound._seek = seek;
            sound._start = self._sprite[sprite][0] / 1000;
            sound._stop = (self._sprite[sprite][0] + self._sprite[sprite][1]) / 1000;
            sound._loop = !!(sound._loop || self._sprite[sprite][2]);
            // Begin the actual playback.
            var node = sound._node;
            if (self._webAudio) {
                // Fire this when the sound is ready to play to begin Web Audio playback.
                var playWebAudio = function () {
                    self._refreshBuffer(sound);
                    // Setup the playback params.
                    var vol = (sound._muted || self._muted) ? 0 : sound._volume;
                    node.gain.setValueAtTime(vol, Howler.ctx.currentTime);
                    sound._playStart = Howler.ctx.currentTime;
                    // Play the sound using the supported method.
                    if (typeof node.bufferSource.start === 'undefined') {
                        sound._loop ? node.bufferSource.noteGrainOn(0, seek, 86400) : node.bufferSource.noteGrainOn(0, seek, duration);
                    }
                    else {
                        sound._loop ? node.bufferSource.start(0, seek, 86400) : node.bufferSource.start(0, seek, duration);
                    }
                    // Start a new timer if none is present.
                    if (timeout !== Infinity) {
                        self._endTimers[sound._id] = setTimeout(self._ended.bind(self, sound), timeout);
                    }
                    if (!internal) {
                        setTimeout(function () {
                            self._emit('play', sound._id);
                        }, 0);
                    }
                };
                var isRunning = (Howler.state === 'running');
                if (self._state === 'loaded' && isRunning) {
                    playWebAudio();
                }
                else {
                    // Wait for the audio to load and then begin playback.
                    var event = !isRunning && self._state === 'loaded' ? 'resume' : 'load';
                    self.once(event, playWebAudio, isRunning ? sound._id : null);
                    // Cancel the end timer.
                    self._clearTimer(sound._id);
                }
            }
            else {
                // Fire this when the sound is ready to play to begin HTML5 Audio playback.
                var playHtml5 = function () {
                    node.currentTime = seek;
                    node.muted = sound._muted || self._muted || Howler._muted || node.muted;
                    node.volume = sound._volume * Howler.volume();
                    node.playbackRate = sound._rate;
                    node.play();
                    // Setup the new end timer.
                    if (timeout !== Infinity) {
                        self._endTimers[sound._id] = setTimeout(self._ended.bind(self, sound), timeout);
                    }
                    if (!internal) {
                        self._emit('play', sound._id);
                    }
                };
                // Play immediately if ready, or wait for the 'canplaythrough'e vent.
                var loadedNoReadyState = (self._state === 'loaded' && (window && window.ejecta || !node.readyState && Howler._navigator.isCocoonJS));
                if (node.readyState === 4 || loadedNoReadyState) {
                    playHtml5();
                }
                else {
                    var listener = function () {
                        // Begin playback.
                        playHtml5();
                        // Clear this listener.
                        node.removeEventListener(Howler._canPlayEvent, listener, false);
                    };
                    node.addEventListener(Howler._canPlayEvent, listener, false);
                    // Cancel the end timer.
                    self._clearTimer(sound._id);
                }
            }
            return sound._id;
        },
        /**
         * Pause playback and save current position.
         * @param  {Number} id The sound ID (empty to pause all in group).
         * @return {Howl}
         */
        pause: function (id) {
            var self = this;
            // If the sound hasn't loaded, add it to the load queue to pause when capable.
            if (self._state !== 'loaded') {
                self._queue.push({
                    event: 'pause',
                    action: function () {
                        self.pause(id);
                    }
                });
                return self;
            }
            // If no id is passed, get all ID's to be paused.
            var ids = self._getSoundIds(id);
            for (var i = 0; i < ids.length; i++) {
                // Clear the end timer.
                self._clearTimer(ids[i]);
                // Get the sound.
                var sound = self._soundById(ids[i]);
                if (sound && !sound._paused) {
                    // Reset the seek position.
                    sound._seek = self.seek(ids[i]);
                    sound._rateSeek = 0;
                    sound._paused = true;
                    // Stop currently running fades.
                    self._stopFade(ids[i]);
                    if (sound._node) {
                        if (self._webAudio) {
                            // make sure the sound has been created
                            if (!sound._node.bufferSource) {
                                return self;
                            }
                            if (typeof sound._node.bufferSource.stop === 'undefined') {
                                sound._node.bufferSource.noteOff(0);
                            }
                            else {
                                sound._node.bufferSource.stop(0);
                            }
                            // Clean up the buffer source.
                            self._cleanBuffer(sound._node);
                        }
                        else if (!isNaN(sound._node.duration) || sound._node.duration === Infinity) {
                            sound._node.pause();
                        }
                    }
                }
                // Fire the pause event, unless `true` is passed as the 2nd argument.
                if (!arguments[1]) {
                    self._emit('pause', sound ? sound._id : null);
                }
            }
            return self;
        },
        /**
         * Stop playback and reset to start.
         * @param  {Number} id The sound ID (empty to stop all in group).
         * @param  {Boolean} internal Internal Use: true prevents event firing.
         * @return {Howl}
         */
        stop: function (id, internal) {
            var self = this;
            // If the sound hasn't loaded, add it to the load queue to stop when capable.
            if (self._state !== 'loaded') {
                self._queue.push({
                    event: 'stop',
                    action: function () {
                        self.stop(id);
                    }
                });
                return self;
            }
            // If no id is passed, get all ID's to be stopped.
            var ids = self._getSoundIds(id);
            for (var i = 0; i < ids.length; i++) {
                // Clear the end timer.
                self._clearTimer(ids[i]);
                // Get the sound.
                var sound = self._soundById(ids[i]);
                if (sound) {
                    // Reset the seek position.
                    sound._seek = sound._start || 0;
                    sound._rateSeek = 0;
                    sound._paused = true;
                    sound._ended = true;
                    // Stop currently running fades.
                    self._stopFade(ids[i]);
                    if (sound._node) {
                        if (self._webAudio) {
                            // make sure the sound has been created
                            if (!sound._node.bufferSource) {
                                if (!internal) {
                                    self._emit('stop', sound._id);
                                }
                                return self;
                            }
                            if (typeof sound._node.bufferSource.stop === 'undefined') {
                                sound._node.bufferSource.noteOff(0);
                            }
                            else {
                                sound._node.bufferSource.stop(0);
                            }
                            // Clean up the buffer source.
                            self._cleanBuffer(sound._node);
                        }
                        else if (!isNaN(sound._node.duration) || sound._node.duration === Infinity) {
                            sound._node.currentTime = sound._start || 0;
                            sound._node.pause();
                        }
                    }
                }
                if (sound && !internal) {
                    self._emit('stop', sound._id);
                }
            }
            return self;
        },
        /**
         * Mute/unmute a single sound or all sounds in this Howl group.
         * @param  {Boolean} muted Set to true to mute and false to unmute.
         * @param  {Number} id    The sound ID to update (omit to mute/unmute all).
         * @return {Howl}
         */
        mute: function (muted, id) {
            var self = this;
            // If the sound hasn't loaded, add it to the load queue to mute when capable.
            if (self._state !== 'loaded') {
                self._queue.push({
                    event: 'mute',
                    action: function () {
                        self.mute(muted, id);
                    }
                });
                return self;
            }
            // If applying mute/unmute to all sounds, update the group's value.
            if (typeof id === 'undefined') {
                if (typeof muted === 'boolean') {
                    self._muted = muted;
                }
                else {
                    return self._muted;
                }
            }
            // If no id is passed, get all ID's to be muted.
            var ids = self._getSoundIds(id);
            for (var i = 0; i < ids.length; i++) {
                // Get the sound.
                var sound = self._soundById(ids[i]);
                if (sound) {
                    sound._muted = muted;
                    if (self._webAudio && sound._node) {
                        sound._node.gain.setValueAtTime(muted ? 0 : sound._volume, Howler.ctx.currentTime);
                    }
                    else if (sound._node) {
                        sound._node.muted = Howler._muted ? true : muted;
                    }
                    self._emit('mute', sound._id);
                }
            }
            return self;
        },
        /**
         * Get/set the volume of this sound or of the Howl group. This method can optionally take 0, 1 or 2 arguments.
         *   volume() -> Returns the group's volume value.
         *   volume(id) -> Returns the sound id's current volume.
         *   volume(vol) -> Sets the volume of all sounds in this Howl group.
         *   volume(vol, id) -> Sets the volume of passed sound id.
         * @return {Howl/Number} Returns self or current volume.
         */
        volume: function () {
            var self = this;
            var args = arguments;
            var vol, id;
            // Determine the values based on arguments.
            if (args.length === 0) {
                // Return the value of the groups' volume.
                return self._volume;
            }
            else if (args.length === 1 || args.length === 2 && typeof args[1] === 'undefined') {
                // First check if this is an ID, and if not, assume it is a new volume.
                var ids = self._getSoundIds();
                var index = ids.indexOf(args[0]);
                if (index >= 0) {
                    id = parseInt(args[0], 10);
                }
                else {
                    vol = parseFloat(args[0]);
                }
            }
            else if (args.length >= 2) {
                vol = parseFloat(args[0]);
                id = parseInt(args[1], 10);
            }
            // Update the volume or return the current volume.
            var sound;
            if (typeof vol !== 'undefined' && vol >= 0 && vol <= 1) {
                // If the sound hasn't loaded, add it to the load queue to change volume when capable.
                if (self._state !== 'loaded') {
                    self._queue.push({
                        event: 'volume',
                        action: function () {
                            self.volume.apply(self, args);
                        }
                    });
                    return self;
                }
                // Set the group volume.
                if (typeof id === 'undefined') {
                    self._volume = vol;
                }
                // Update one or all volumes.
                id = self._getSoundIds(id);
                for (var i = 0; i < id.length; i++) {
                    // Get the sound.
                    sound = self._soundById(id[i]);
                    if (sound) {
                        sound._volume = vol;
                        // Stop currently running fades.
                        if (!args[2]) {
                            self._stopFade(id[i]);
                        }
                        if (self._webAudio && sound._node && !sound._muted) {
                            sound._node.gain.setValueAtTime(vol, Howler.ctx.currentTime);
                        }
                        else if (sound._node && !sound._muted) {
                            sound._node.volume = vol * Howler.volume();
                        }
                        self._emit('volume', sound._id);
                    }
                }
            }
            else {
                sound = id ? self._soundById(id) : self._sounds[0];
                return sound ? sound._volume : 0;
            }
            return self;
        },
        /**
         * Fade a currently playing sound between two volumes (if no id is passsed, all sounds will fade).
         * @param  {Number} from The value to fade from (0.0 to 1.0).
         * @param  {Number} to   The volume to fade to (0.0 to 1.0).
         * @param  {Number} len  Time in milliseconds to fade.
         * @param  {Number} id   The sound id (omit to fade all sounds).
         * @return {Howl}
         */
        fade: function (from, to, len, id) {
            var self = this;
            var diff = Math.abs(from - to);
            var dir = from > to ? 'out' : 'in';
            var steps = diff / 0.01;
            var stepLen = (steps > 0) ? len / steps : len;
            // Since browsers clamp timeouts to 4ms, we need to clamp our steps to that too.
            if (stepLen < 4) {
                steps = Math.ceil(steps / (4 / stepLen));
                stepLen = 4;
            }
            // If the sound hasn't loaded, add it to the load queue to fade when capable.
            if (self._state !== 'loaded') {
                self._queue.push({
                    event: 'fade',
                    action: function () {
                        self.fade(from, to, len, id);
                    }
                });
                return self;
            }
            // Set the volume to the start position.
            self.volume(from, id);
            // Fade the volume of one or all sounds.
            var ids = self._getSoundIds(id);
            for (var i = 0; i < ids.length; i++) {
                // Get the sound.
                var sound = self._soundById(ids[i]);
                // Create a linear fade or fall back to timeouts with HTML5 Audio.
                if (sound) {
                    // Stop the previous fade if no sprite is being used (otherwise, volume handles this).
                    if (!id) {
                        self._stopFade(ids[i]);
                    }
                    // If we are using Web Audio, let the native methods do the actual fade.
                    if (self._webAudio && !sound._muted) {
                        var currentTime = Howler.ctx.currentTime;
                        var end = currentTime + (len / 1000);
                        sound._volume = from;
                        sound._node.gain.setValueAtTime(from, currentTime);
                        sound._node.gain.linearRampToValueAtTime(to, end);
                    }
                    var vol = from;
                    sound._interval = setInterval(function (soundId, sound) {
                        // Update the volume amount, but only if the volume should change.
                        if (steps > 0) {
                            vol += (dir === 'in' ? 0.01 : -0.01);
                        }
                        // Make sure the volume is in the right bounds.
                        vol = Math.max(0, vol);
                        vol = Math.min(1, vol);
                        // Round to within 2 decimal points.
                        vol = Math.round(vol * 100) / 100;
                        // Change the volume.
                        if (self._webAudio) {
                            if (typeof id === 'undefined') {
                                self._volume = vol;
                            }
                            sound._volume = vol;
                        }
                        else {
                            self.volume(vol, soundId, true);
                        }
                        // When the fade is complete, stop it and fire event.
                        if ((to < from && vol <= to) || (to > from && vol >= to)) {
                            clearInterval(sound._interval);
                            sound._interval = null;
                            self.volume(to, soundId);
                            self._emit('fade', soundId);
                        }
                    }.bind(self, ids[i], sound), stepLen);
                }
            }
            return self;
        },
        /**
         * Internal method that stops the currently playing fade when
         * a new fade starts, volume is changed or the sound is stopped.
         * @param  {Number} id The sound id.
         * @return {Howl}
         */
        _stopFade: function (id) {
            var self = this;
            var sound = self._soundById(id);
            if (sound && sound._interval) {
                if (self._webAudio) {
                    sound._node.gain.cancelScheduledValues(Howler.ctx.currentTime);
                }
                clearInterval(sound._interval);
                sound._interval = null;
                self._emit('fade', id);
            }
            return self;
        },
        /**
         * Get/set the loop parameter on a sound. This method can optionally take 0, 1 or 2 arguments.
         *   loop() -> Returns the group's loop value.
         *   loop(id) -> Returns the sound id's loop value.
         *   loop(loop) -> Sets the loop value for all sounds in this Howl group.
         *   loop(loop, id) -> Sets the loop value of passed sound id.
         * @return {Howl/Boolean} Returns self or current loop value.
         */
        loop: function () {
            var self = this;
            var args = arguments;
            var loop, id, sound;
            // Determine the values for loop and id.
            if (args.length === 0) {
                // Return the grou's loop value.
                return self._loop;
            }
            else if (args.length === 1) {
                if (typeof args[0] === 'boolean') {
                    loop = args[0];
                    self._loop = loop;
                }
                else {
                    // Return this sound's loop value.
                    sound = self._soundById(parseInt(args[0], 10));
                    return sound ? sound._loop : false;
                }
            }
            else if (args.length === 2) {
                loop = args[0];
                id = parseInt(args[1], 10);
            }
            // If no id is passed, get all ID's to be looped.
            var ids = self._getSoundIds(id);
            for (var i = 0; i < ids.length; i++) {
                sound = self._soundById(ids[i]);
                if (sound) {
                    sound._loop = loop;
                    if (self._webAudio && sound._node && sound._node.bufferSource) {
                        sound._node.bufferSource.loop = loop;
                        if (loop) {
                            sound._node.bufferSource.loopStart = sound._start || 0;
                            sound._node.bufferSource.loopEnd = sound._stop;
                        }
                    }
                }
            }
            return self;
        },
        /**
         * Get/set the playback rate of a sound. This method can optionally take 0, 1 or 2 arguments.
         *   rate() -> Returns the first sound node's current playback rate.
         *   rate(id) -> Returns the sound id's current playback rate.
         *   rate(rate) -> Sets the playback rate of all sounds in this Howl group.
         *   rate(rate, id) -> Sets the playback rate of passed sound id.
         * @return {Howl/Number} Returns self or the current playback rate.
         */
        rate: function () {
            var self = this;
            var args = arguments;
            var rate, id;
            // Determine the values based on arguments.
            if (args.length === 0) {
                // We will simply return the current rate of the first node.
                id = self._sounds[0]._id;
            }
            else if (args.length === 1) {
                // First check if this is an ID, and if not, assume it is a new rate value.
                var ids = self._getSoundIds();
                var index = ids.indexOf(args[0]);
                if (index >= 0) {
                    id = parseInt(args[0], 10);
                }
                else {
                    rate = parseFloat(args[0]);
                }
            }
            else if (args.length === 2) {
                rate = parseFloat(args[0]);
                id = parseInt(args[1], 10);
            }
            // Update the playback rate or return the current value.
            var sound;
            if (typeof rate === 'number') {
                // If the sound hasn't loaded, add it to the load queue to change playback rate when capable.
                if (self._state !== 'loaded') {
                    self._queue.push({
                        event: 'rate',
                        action: function () {
                            self.rate.apply(self, args);
                        }
                    });
                    return self;
                }
                // Set the group rate.
                if (typeof id === 'undefined') {
                    self._rate = rate;
                }
                // Update one or all volumes.
                id = self._getSoundIds(id);
                for (var i = 0; i < id.length; i++) {
                    // Get the sound.
                    sound = self._soundById(id[i]);
                    if (sound) {
                        // Keep track of our position when the rate changed and update the playback
                        // start position so we can properly adjust the seek position for time elapsed.
                        sound._rateSeek = self.seek(id[i]);
                        sound._playStart = self._webAudio ? Howler.ctx.currentTime : sound._playStart;
                        sound._rate = rate;
                        // Change the playback rate.
                        if (self._webAudio && sound._node && sound._node.bufferSource) {
                            sound._node.bufferSource.playbackRate.value = rate;
                        }
                        else if (sound._node) {
                            sound._node.playbackRate = rate;
                        }
                        // Reset the timers.
                        var seek = self.seek(id[i]);
                        var duration = ((self._sprite[sound._sprite][0] + self._sprite[sound._sprite][1]) / 1000) - seek;
                        var timeout = (duration * 1000) / Math.abs(sound._rate);
                        // Start a new end timer if sound is already playing.
                        if (self._endTimers[id[i]] || !sound._paused) {
                            self._clearTimer(id[i]);
                            self._endTimers[id[i]] = setTimeout(self._ended.bind(self, sound), timeout);
                        }
                        self._emit('rate', sound._id);
                    }
                }
            }
            else {
                sound = self._soundById(id);
                return sound ? sound._rate : self._rate;
            }
            return self;
        },
        /**
         * Get/set the seek position of a sound. This method can optionally take 0, 1 or 2 arguments.
         *   seek() -> Returns the first sound node's current seek position.
         *   seek(id) -> Returns the sound id's current seek position.
         *   seek(seek) -> Sets the seek position of the first sound node.
         *   seek(seek, id) -> Sets the seek position of passed sound id.
         * @return {Howl/Number} Returns self or the current seek position.
         */
        seek: function () {
            var self = this;
            var args = arguments;
            var seek, id;
            // Determine the values based on arguments.
            if (args.length === 0) {
                // We will simply return the current position of the first node.
                id = self._sounds[0]._id;
            }
            else if (args.length === 1) {
                // First check if this is an ID, and if not, assume it is a new seek position.
                var ids = self._getSoundIds();
                var index = ids.indexOf(args[0]);
                if (index >= 0) {
                    id = parseInt(args[0], 10);
                }
                else {
                    id = self._sounds[0]._id;
                    seek = parseFloat(args[0]);
                }
            }
            else if (args.length === 2) {
                seek = parseFloat(args[0]);
                id = parseInt(args[1], 10);
            }
            // If there is no ID, bail out.
            if (typeof id === 'undefined') {
                return self;
            }
            // If the sound hasn't loaded, add it to the load queue to seek when capable.
            if (self._state !== 'loaded') {
                self._queue.push({
                    event: 'seek',
                    action: function () {
                        self.seek.apply(self, args);
                    }
                });
                return self;
            }
            // Get the sound.
            var sound = self._soundById(id);
            if (sound) {
                if (typeof seek === 'number' && seek >= 0) {
                    // Pause the sound and update position for restarting playback.
                    var playing = self.playing(id);
                    if (playing) {
                        self.pause(id, true);
                    }
                    // Move the position of the track and cancel timer.
                    sound._seek = seek;
                    sound._ended = false;
                    self._clearTimer(id);
                    // Restart the playback if the sound was playing.
                    if (playing) {
                        self.play(id, true);
                    }
                    // Update the seek position for HTML5 Audio.
                    if (!self._webAudio && sound._node) {
                        sound._node.currentTime = seek;
                    }
                    self._emit('seek', id);
                }
                else {
                    if (self._webAudio) {
                        var realTime = self.playing(id) ? Howler.ctx.currentTime - sound._playStart : 0;
                        var rateSeek = sound._rateSeek ? sound._rateSeek - sound._seek : 0;
                        return sound._seek + (rateSeek + realTime * Math.abs(sound._rate));
                    }
                    else {
                        return sound._node.currentTime;
                    }
                }
            }
            return self;
        },
        /**
         * Check if a specific sound is currently playing or not (if id is provided), or check if at least one of the sounds in the group is playing or not.
         * @param  {Number}  id The sound id to check. If none is passed, the whole sound group is checked.
         * @return {Boolean} True if playing and false if not.
         */
        playing: function (id) {
            var self = this;
            // Check the passed sound ID (if any).
            if (typeof id === 'number') {
                var sound = self._soundById(id);
                return sound ? !sound._paused : false;
            }
            // Otherwise, loop through all sounds and check if any are playing.
            for (var i = 0; i < self._sounds.length; i++) {
                if (!self._sounds[i]._paused) {
                    return true;
                }
            }
            return false;
        },
        /**
         * Get the duration of this sound. Passing a sound id will return the sprite duration.
         * @param  {Number} id The sound id to check. If none is passed, return full source duration.
         * @return {Number} Audio duration in seconds.
         */
        duration: function (id) {
            var self = this;
            var duration = self._duration;
            // If we pass an ID, get the sound and return the sprite length.
            var sound = self._soundById(id);
            if (sound) {
                duration = self._sprite[sound._sprite][1] / 1000;
            }
            return duration;
        },
        /**
         * Returns the current loaded state of this Howl.
         * @return {String} 'unloaded', 'loading', 'loaded'
         */
        state: function () {
            return this._state;
        },
        /**
         * Unload and destroy the current Howl object.
         * This will immediately stop all sound instances attached to this group.
         */
        unload: function () {
            var self = this;
            // Stop playing any active sounds.
            var sounds = self._sounds;
            for (var i = 0; i < sounds.length; i++) {
                // Stop the sound if it is currently playing.
                if (!sounds[i]._paused) {
                    self.stop(sounds[i]._id);
                }
                // Remove the source or disconnect.
                if (!self._webAudio) {
                    // Set the source to 0-second silence to stop any downloading.
                    sounds[i]._node.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
                    // Remove any event listeners.
                    sounds[i]._node.removeEventListener('error', sounds[i]._errorFn, false);
                    sounds[i]._node.removeEventListener(Howler._canPlayEvent, sounds[i]._loadFn, false);
                }
                // Empty out all of the nodes.
                delete sounds[i]._node;
                // Make sure all timers are cleared out.
                self._clearTimer(sounds[i]._id);
                // Remove the references in the global Howler object.
                var index = Howler._howls.indexOf(self);
                if (index >= 0) {
                    Howler._howls.splice(index, 1);
                }
            }
            // Delete this sound from the cache (if no other Howl is using it).
            var remCache = true;
            for (i = 0; i < Howler._howls.length; i++) {
                if (Howler._howls[i]._src === self._src) {
                    remCache = false;
                    break;
                }
            }
            if (cache && remCache) {
                delete cache[self._src];
            }
            // Clear global errors.
            Howler.noAudio = false;
            // Clear out `self`.
            self._state = 'unloaded';
            self._sounds = [];
            self = null;
            return null;
        },
        /**
         * Listen to a custom event.
         * @param  {String}   event Event name.
         * @param  {Function} fn    Listener to call.
         * @param  {Number}   id    (optional) Only listen to events for this sound.
         * @param  {Number}   once  (INTERNAL) Marks event to fire only once.
         * @return {Howl}
         */
        on: function (event, fn, id, once) {
            var self = this;
            var events = self['_on' + event];
            if (typeof fn === 'function') {
                events.push(once ? { id: id, fn: fn, once: once } : { id: id, fn: fn });
            }
            return self;
        },
        /**
         * Remove a custom event. Call without parameters to remove all events.
         * @param  {String}   event Event name.
         * @param  {Function} fn    Listener to remove. Leave empty to remove all.
         * @param  {Number}   id    (optional) Only remove events for this sound.
         * @return {Howl}
         */
        off: function (event, fn, id) {
            var self = this;
            var events = self['_on' + event];
            var i = 0;
            if (fn) {
                // Loop through event store and remove the passed function.
                for (i = 0; i < events.length; i++) {
                    if (fn === events[i].fn && id === events[i].id) {
                        events.splice(i, 1);
                        break;
                    }
                }
            }
            else if (event) {
                // Clear out all events of this type.
                self['_on' + event] = [];
            }
            else {
                // Clear out all events of every type.
                var keys = Object.keys(self);
                for (i = 0; i < keys.length; i++) {
                    if ((keys[i].indexOf('_on') === 0) && Array.isArray(self[keys[i]])) {
                        self[keys[i]] = [];
                    }
                }
            }
            return self;
        },
        /**
         * Listen to a custom event and remove it once fired.
         * @param  {String}   event Event name.
         * @param  {Function} fn    Listener to call.
         * @param  {Number}   id    (optional) Only listen to events for this sound.
         * @return {Howl}
         */
        once: function (event, fn, id) {
            var self = this;
            // Setup the event listener.
            self.on(event, fn, id, 1);
            return self;
        },
        /**
         * Emit all events of a specific type and pass the sound id.
         * @param  {String} event Event name.
         * @param  {Number} id    Sound ID.
         * @param  {Number} msg   Message to go with event.
         * @return {Howl}
         */
        _emit: function (event, id, msg) {
            var self = this;
            var events = self['_on' + event];
            // Loop through event store and fire all functions.
            for (var i = events.length - 1; i >= 0; i--) {
                if (!events[i].id || events[i].id === id || event === 'load') {
                    setTimeout(function (fn) {
                        fn.call(this, id, msg);
                    }.bind(self, events[i].fn), 0);
                    // If this event was setup with `once`, remove it.
                    if (events[i].once) {
                        self.off(event, events[i].fn, events[i].id);
                    }
                }
            }
            return self;
        },
        /**
         * Queue of actions initiated before the sound has loaded.
         * These will be called in sequence, with the next only firing
         * after the previous has finished executing (even if async like play).
         * @return {Howl}
         */
        _loadQueue: function () {
            var self = this;
            if (self._queue.length > 0) {
                var task = self._queue[0];
                // don't move onto the next task until this one is done
                self.once(task.event, function () {
                    self._queue.shift();
                    self._loadQueue();
                });
                task.action();
            }
            return self;
        },
        /**
         * Fired when playback ends at the end of the duration.
         * @param  {Sound} sound The sound object to work with.
         * @return {Howl}
         */
        _ended: function (sound) {
            var self = this;
            var sprite = sound._sprite;
            // Should this sound loop?
            var loop = !!(sound._loop || self._sprite[sprite][2]);
            // Fire the ended event.
            self._emit('end', sound._id);
            // Restart the playback for HTML5 Audio loop.
            if (!self._webAudio && loop) {
                self.stop(sound._id, true).play(sound._id);
            }
            // Restart this timer if on a Web Audio loop.
            if (self._webAudio && loop) {
                self._emit('play', sound._id);
                sound._seek = sound._start || 0;
                sound._rateSeek = 0;
                sound._playStart = Howler.ctx.currentTime;
                var timeout = ((sound._stop - sound._start) * 1000) / Math.abs(sound._rate);
                self._endTimers[sound._id] = setTimeout(self._ended.bind(self, sound), timeout);
            }
            // Mark the node as paused.
            if (self._webAudio && !loop) {
                sound._paused = true;
                sound._ended = true;
                sound._seek = sound._start || 0;
                sound._rateSeek = 0;
                self._clearTimer(sound._id);
                // Clean up the buffer source.
                self._cleanBuffer(sound._node);
                // Attempt to auto-suspend AudioContext if no sounds are still playing.
                Howler._autoSuspend();
            }
            // When using a sprite, end the track.
            if (!self._webAudio && !loop) {
                self.stop(sound._id);
            }
            return self;
        },
        /**
         * Clear the end timer for a sound playback.
         * @param  {Number} id The sound ID.
         * @return {Howl}
         */
        _clearTimer: function (id) {
            var self = this;
            if (self._endTimers[id]) {
                clearTimeout(self._endTimers[id]);
                delete self._endTimers[id];
            }
            return self;
        },
        /**
         * Return the sound identified by this ID, or return null.
         * @param  {Number} id Sound ID
         * @return {Object}    Sound object or null.
         */
        _soundById: function (id) {
            var self = this;
            // Loop through all sounds and find the one with this ID.
            for (var i = 0; i < self._sounds.length; i++) {
                if (id === self._sounds[i]._id) {
                    return self._sounds[i];
                }
            }
            return null;
        },
        /**
         * Return an inactive sound from the pool or create a new one.
         * @return {Sound} Sound playback object.
         */
        _inactiveSound: function () {
            var self = this;
            self._drain();
            // Find the first inactive node to recycle.
            for (var i = 0; i < self._sounds.length; i++) {
                if (self._sounds[i]._ended) {
                    return self._sounds[i].reset();
                }
            }
            // If no inactive node was found, create a new one.
            return new Sound(self);
        },
        /**
         * Drain excess inactive sounds from the pool.
         */
        _drain: function () {
            var self = this;
            var limit = self._pool;
            var cnt = 0;
            var i = 0;
            // If there are less sounds than the max pool size, we are done.
            if (self._sounds.length < limit) {
                return;
            }
            // Count the number of inactive sounds.
            for (i = 0; i < self._sounds.length; i++) {
                if (self._sounds[i]._ended) {
                    cnt++;
                }
            }
            // Remove excess inactive sounds, going in reverse order.
            for (i = self._sounds.length - 1; i >= 0; i--) {
                if (cnt <= limit) {
                    return;
                }
                if (self._sounds[i]._ended) {
                    // Disconnect the audio source when using Web Audio.
                    if (self._webAudio && self._sounds[i]._node) {
                        self._sounds[i]._node.disconnect(0);
                    }
                    // Remove sounds until we have the pool size.
                    self._sounds.splice(i, 1);
                    cnt--;
                }
            }
        },
        /**
         * Get all ID's from the sounds pool.
         * @param  {Number} id Only return one ID if one is passed.
         * @return {Array}    Array of IDs.
         */
        _getSoundIds: function (id) {
            var self = this;
            if (typeof id === 'undefined') {
                var ids = [];
                for (var i = 0; i < self._sounds.length; i++) {
                    ids.push(self._sounds[i]._id);
                }
                return ids;
            }
            else {
                return [id];
            }
        },
        /**
         * Load the sound back into the buffer source.
         * @param  {Sound} sound The sound object to work with.
         * @return {Howl}
         */
        _refreshBuffer: function (sound) {
            var self = this;
            // Setup the buffer source for playback.
            sound._node.bufferSource = Howler.ctx.createBufferSource();
            sound._node.bufferSource.buffer = cache[self._src];
            // Connect to the correct node.
            if (sound._panner) {
                sound._node.bufferSource.connect(sound._panner);
            }
            else {
                sound._node.bufferSource.connect(sound._node);
            }
            // Setup looping and playback rate.
            sound._node.bufferSource.loop = sound._loop;
            if (sound._loop) {
                sound._node.bufferSource.loopStart = sound._start || 0;
                sound._node.bufferSource.loopEnd = sound._stop;
            }
            sound._node.bufferSource.playbackRate.value = sound._rate;
            return self;
        },
        /**
         * Prevent memory leaks by cleaning up the buffer source after playback.
         * @param  {Object} node Sound's audio node containing the buffer source.
         * @return {Howl}
         */
        _cleanBuffer: function (node) {
            var self = this;
            if (self._scratchBuffer) {
                node.bufferSource.onended = null;
                node.bufferSource.disconnect(0);
                try {
                    node.bufferSource.buffer = self._scratchBuffer;
                }
                catch (e) { }
            }
            node.bufferSource = null;
            return self;
        }
    };
    /** Single Sound Methods **/
    /***************************************************************************/
    /**
     * Setup the sound object, which each node attached to a Howl group is contained in.
     * @param {Object} howl The Howl parent group.
     */
    var Sound = function (howl) {
        this._parent = howl;
        this.init();
    };
    Sound.prototype = {
        /**
         * Initialize a new Sound object.
         * @return {Sound}
         */
        init: function () {
            var self = this;
            var parent = self._parent;
            // Setup the default parameters.
            self._muted = parent._muted;
            self._loop = parent._loop;
            self._volume = parent._volume;
            self._muted = parent._muted;
            self._rate = parent._rate;
            self._seek = 0;
            self._paused = true;
            self._ended = true;
            self._sprite = '__default';
            // Generate a unique ID for this sound.
            self._id = ++Howler._counter;
            // Add itself to the parent's pool.
            parent._sounds.push(self);
            // Create the new node.
            self.create();
            return self;
        },
        /**
         * Create and setup a new sound object, whether HTML5 Audio or Web Audio.
         * @return {Sound}
         */
        create: function () {
            var self = this;
            var parent = self._parent;
            var volume = (Howler._muted || self._muted || self._parent._muted) ? 0 : self._volume;
            if (parent._webAudio) {
                // Create the gain node for controlling volume (the source will connect to this).
                self._node = (typeof Howler.ctx.createGain === 'undefined') ? Howler.ctx.createGainNode() : Howler.ctx.createGain();
                self._node.gain.setValueAtTime(volume, Howler.ctx.currentTime);
                self._node.paused = true;
                self._node.connect(Howler.masterGain);
            }
            else {
                self._node = new Audio();
                // Listen for errors (http://dev.w3.org/html5/spec-author-view/spec.html#mediaerror).
                self._errorFn = self._errorListener.bind(self);
                self._node.addEventListener('error', self._errorFn, false);
                // Listen for 'canplaythrough' event to let us know the sound is ready.
                self._loadFn = self._loadListener.bind(self);
                self._node.addEventListener(Howler._canPlayEvent, self._loadFn, false);
                // Setup the new audio node.
                self._node.src = parent._src;
                self._node.preload = 'auto';
                self._node.volume = volume * Howler.volume();
                // Begin loading the source.
                self._node.load();
            }
            return self;
        },
        /**
         * Reset the parameters of this sound to the original state (for recycle).
         * @return {Sound}
         */
        reset: function () {
            var self = this;
            var parent = self._parent;
            // Reset all of the parameters of this sound.
            self._muted = parent._muted;
            self._loop = parent._loop;
            self._volume = parent._volume;
            self._muted = parent._muted;
            self._rate = parent._rate;
            self._seek = 0;
            self._rateSeek = 0;
            self._paused = true;
            self._ended = true;
            self._sprite = '__default';
            // Generate a new ID so that it isn't confused with the previous sound.
            self._id = ++Howler._counter;
            return self;
        },
        /**
         * HTML5 Audio error listener callback.
         */
        _errorListener: function () {
            var self = this;
            // Fire an error event and pass back the code.
            self._parent._emit('loaderror', self._id, self._node.error ? self._node.error.code : 0);
            // Clear the event listener.
            self._node.removeEventListener('error', self._errorListener, false);
        },
        /**
         * HTML5 Audio canplaythrough listener callback.
         */
        _loadListener: function () {
            var self = this;
            var parent = self._parent;
            // Round up the duration to account for the lower precision in HTML5 Audio.
            parent._duration = Math.ceil(self._node.duration * 10) / 10;
            // Setup a sprite if none is defined.
            if (Object.keys(parent._sprite).length === 0) {
                parent._sprite = { __default: [0, parent._duration * 1000] };
            }
            if (parent._state !== 'loaded') {
                parent._state = 'loaded';
                parent._emit('load');
                parent._loadQueue();
            }
            // Clear the event listener.
            self._node.removeEventListener(Howler._canPlayEvent, self._loadFn, false);
        }
    };
    /** Helper Methods **/
    /***************************************************************************/
    var cache = {};
    /**
     * Buffer a sound from URL, Data URI or cache and decode to audio source (Web Audio API).
     * @param  {Howl} self
     */
    var loadBuffer = function (self) {
        var url = self._src;
        // Check if the buffer has already been cached and use it instead.
        if (cache[url]) {
            // Set the duration from the cache.
            self._duration = cache[url].duration;
            // Load the sound into this Howl.
            loadSound(self);
            return;
        }
        if (/^data:[^;]+;base64,/.test(url)) {
            // Decode the base64 data URI without XHR, since some browsers don't support it.
            var data = atob(url.split(',')[1]);
            var dataView = new Uint8Array(data.length);
            for (var i = 0; i < data.length; ++i) {
                dataView[i] = data.charCodeAt(i);
            }
            decodeAudioData(dataView.buffer, self);
        }
        else {
            // Load the buffer from the URL.
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'arraybuffer';
            xhr.onload = function () {
                // Make sure we get a successful response back.
                var code = (xhr.status + '')[0];
                if (code !== '0' && code !== '2' && code !== '3') {
                    self._emit('loaderror', null, 'Failed loading audio file with status: ' + xhr.status + '.');
                    return;
                }
                decodeAudioData(xhr.response, self);
            };
            xhr.onerror = function () {
                // If there is an error, switch to HTML5 Audio.
                if (self._webAudio) {
                    self._html5 = true;
                    self._webAudio = false;
                    self._sounds = [];
                    delete cache[url];
                    self.load();
                }
            };
            safeXhrSend(xhr);
        }
    };
    /**
     * Send the XHR request wrapped in a try/catch.
     * @param  {Object} xhr XHR to send.
     */
    var safeXhrSend = function (xhr) {
        try {
            xhr.send();
        }
        catch (e) {
            xhr.onerror();
        }
    };
    /**
     * Decode audio data from an array buffer.
     * @param  {ArrayBuffer} arraybuffer The audio data.
     * @param  {Howl}        self
     */
    var decodeAudioData = function (arraybuffer, self) {
        // Decode the buffer into an audio source.
        Howler.ctx.decodeAudioData(arraybuffer, function (buffer) {
            if (buffer && self._sounds.length > 0) {
                cache[self._src] = buffer;
                loadSound(self, buffer);
            }
        }, function () {
            self._emit('loaderror', null, 'Decoding audio data failed.');
        });
    };
    /**
     * Sound is now loaded, so finish setting everything up and fire the loaded event.
     * @param  {Howl} self
     * @param  {Object} buffer The decoded buffer sound source.
     */
    var loadSound = function (self, buffer) {
        // Set the duration.
        if (buffer && !self._duration) {
            self._duration = buffer.duration;
        }
        // Setup a sprite if none is defined.
        if (Object.keys(self._sprite).length === 0) {
            self._sprite = { __default: [0, self._duration * 1000] };
        }
        // Fire the loaded event.
        if (self._state !== 'loaded') {
            self._state = 'loaded';
            self._emit('load');
            self._loadQueue();
        }
    };
    /**
     * Setup the audio context when available, or switch to HTML5 Audio mode.
     */
    var setupAudioContext = function () {
        // Check if we are using Web Audio and setup the AudioContext if we are.
        try {
            if (typeof AudioContext !== 'undefined') {
                Howler.ctx = new AudioContext();
            }
            else if (typeof webkitAudioContext !== 'undefined') {
                Howler.ctx = new webkitAudioContext();
            }
            else {
                Howler.usingWebAudio = false;
            }
        }
        catch (e) {
            Howler.usingWebAudio = false;
        }
        // Check if a webview is being used on iOS8 or earlier (rather than the browser).
        // If it is, disable Web Audio as it causes crashing.
        var iOS = (/iP(hone|od|ad)/.test(Howler._navigator && Howler._navigator.platform));
        var appVersion = Howler._navigator && Howler._navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);
        var version = appVersion ? parseInt(appVersion[1], 10) : null;
        if (iOS && version && version < 9) {
            var safari = /safari/.test(Howler._navigator && Howler._navigator.userAgent.toLowerCase());
            if (Howler._navigator && Howler._navigator.standalone && !safari || Howler._navigator && !Howler._navigator.standalone && !safari) {
                Howler.usingWebAudio = false;
            }
        }
        // Create and expose the master GainNode when using Web Audio (useful for plugins or advanced usage).
        if (Howler.usingWebAudio) {
            Howler.masterGain = (typeof Howler.ctx.createGain === 'undefined') ? Howler.ctx.createGainNode() : Howler.ctx.createGain();
            Howler.masterGain.gain.value = 1;
            Howler.masterGain.connect(Howler.ctx.destination);
        }
        // Re-run the setup on Howler.
        Howler._setup();
    };
    // Add support for AMD (Asynchronous Module Definition) libraries such as require.js.
    if (typeof define === 'function' && define.amd) {
        define([], function () {
            return {
                Howler: Howler,
                Howl: Howl
            };
        });
    }
    // Add support for CommonJS libraries such as browserify.
    if (typeof exports !== 'undefined') {
        exports.Howler = Howler;
        exports.Howl = Howl;
    }
    // Define globally in case AMD is not available or unused.
    if (typeof window !== 'undefined') {
        window.HowlerGlobal = HowlerGlobal;
        window.Howler = Howler;
        window.Howl = Howl;
        window.Sound = Sound;
    }
    else if (typeof global !== 'undefined') {
        global.HowlerGlobal = HowlerGlobal;
        global.Howler = Howler;
        global.Howl = Howl;
        global.Sound = Sound;
    }
})();
/*!
* PreloadJS
* Visit http://createjs.com/ for documentation, updates and examples.
*
* Copyright (c) 2010 gskinner.com, inc.
*
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use,
* copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following
* conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
* OTHER DEALINGS IN THE SOFTWARE.
*/
//##############################################################################
// version.js
//##############################################################################
this.createjs = this.createjs || {};
(function () {
    "use strict";
    /**
     * Static class holding library specific information such as the version and buildDate of the library.
     * @class PreloadJS
     **/
    var s = createjs.PreloadJS = createjs.PreloadJS || {};
    /**
     * The version string for this release.
     * @property version
     * @type {String}
     * @static
     **/
    s.version = "0.6.2"; // injected by build process
    /**
     * The build date for this release in UTC format.
     * @property buildDate
     * @type {String}
     * @static
     **/
    s.buildDate = "Thu, 26 Nov 2015 20:44:31 GMT"; // injected by build process
})();
//##############################################################################
// extend.js
//##############################################################################
this.createjs = this.createjs || {};
/**
 * @class Utility Methods
 */
/**
 * Sets up the prototype chain and constructor property for a new class.
 *
 * This should be called right after creating the class constructor.
 *
 * 	function MySubClass() {}
 * 	createjs.extend(MySubClass, MySuperClass);
 * 	MySubClass.prototype.doSomething = function() { }
 *
 * 	var foo = new MySubClass();
 * 	console.log(foo instanceof MySuperClass); // true
 * 	console.log(foo.prototype.constructor === MySubClass); // true
 *
 * @method extend
 * @param {Function} subclass The subclass.
 * @param {Function} superclass The superclass to extend.
 * @return {Function} Returns the subclass's new prototype.
 */
createjs.extend = function (subclass, superclass) {
    "use strict";
    function o() { this.constructor = subclass; }
    o.prototype = superclass.prototype;
    return (subclass.prototype = new o());
};
//##############################################################################
// promote.js
//##############################################################################
this.createjs = this.createjs || {};
/**
 * @class Utility Methods
 */
/**
 * Promotes any methods on the super class that were overridden, by creating an alias in the format `prefix_methodName`.
 * It is recommended to use the super class's name as the prefix.
 * An alias to the super class's constructor is always added in the format `prefix_constructor`.
 * This allows the subclass to call super class methods without using `function.call`, providing better performance.
 *
 * For example, if `MySubClass` extends `MySuperClass`, and both define a `draw` method, then calling `promote(MySubClass, "MySuperClass")`
 * would add a `MySuperClass_constructor` method to MySubClass and promote the `draw` method on `MySuperClass` to the
 * prototype of `MySubClass` as `MySuperClass_draw`.
 *
 * This should be called after the class's prototype is fully defined.
 *
 * 	function ClassA(name) {
 * 		this.name = name;
 * 	}
 * 	ClassA.prototype.greet = function() {
 * 		return "Hello "+this.name;
 * 	}
 *
 * 	function ClassB(name, punctuation) {
 * 		this.ClassA_constructor(name);
 * 		this.punctuation = punctuation;
 * 	}
 * 	createjs.extend(ClassB, ClassA);
 * 	ClassB.prototype.greet = function() {
 * 		return this.ClassA_greet()+this.punctuation;
 * 	}
 * 	createjs.promote(ClassB, "ClassA");
 *
 * 	var foo = new ClassB("World", "!?!");
 * 	console.log(foo.greet()); // Hello World!?!
 *
 * @method promote
 * @param {Function} subclass The class to promote super class methods on.
 * @param {String} prefix The prefix to add to the promoted method names. Usually the name of the superclass.
 * @return {Function} Returns the subclass.
 */
createjs.promote = function (subclass, prefix) {
    "use strict";
    var subP = subclass.prototype, supP = (Object.getPrototypeOf && Object.getPrototypeOf(subP)) || subP.__proto__;
    if (supP) {
        subP[(prefix += "_") + "constructor"] = supP.constructor; // constructor is not always innumerable
        for (var n in supP) {
            if (subP.hasOwnProperty(n) && (typeof supP[n] == "function")) {
                subP[prefix + n] = supP[n];
            }
        }
    }
    return subclass;
};
//##############################################################################
// proxy.js
//##############################################################################
this.createjs = this.createjs || {};
/**
 * Various utilities that the CreateJS Suite uses. Utilities are created as separate files, and will be available on the
 * createjs namespace directly.
 *
 * <h4>Example</h4>
 *
 *      myObject.addEventListener("change", createjs.proxy(myMethod, scope));
 *
 * @class Utility Methods
 * @main Utility Methods
 */
(function () {
    "use strict";
    /**
     * A function proxy for methods. By default, JavaScript methods do not maintain scope, so passing a method as a
     * callback will result in the method getting called in the scope of the caller. Using a proxy ensures that the
     * method gets called in the correct scope.
     *
     * Additional arguments can be passed that will be applied to the function when it is called.
     *
     * <h4>Example</h4>
     *
     *      myObject.addEventListener("event", createjs.proxy(myHandler, this, arg1, arg2));
     *
     *      function myHandler(arg1, arg2) {
     *           // This gets called when myObject.myCallback is executed.
     *      }
     *
     * @method proxy
     * @param {Function} method The function to call
     * @param {Object} scope The scope to call the method name on
     * @param {mixed} [arg] * Arguments that are appended to the callback for additional params.
     * @public
     * @static
     */
    createjs.proxy = function (method, scope) {
        var aArgs = Array.prototype.slice.call(arguments, 2);
        return function () {
            return method.apply(scope, Array.prototype.slice.call(arguments, 0).concat(aArgs));
        };
    };
}());
//##############################################################################
// indexOf.js
//##############################################################################
this.createjs = this.createjs || {};
/**
 * @class Utility Methods
 */
/**
 * Finds the first occurrence of a specified value searchElement in the passed in array, and returns the index of
 * that value.  Returns -1 if value is not found.
 *
 *      var i = createjs.indexOf(myArray, myElementToFind);
 *
 * @method indexOf
 * @param {Array} array Array to search for searchElement
 * @param searchElement Element to find in array.
 * @return {Number} The first index of searchElement in array.
 */
createjs.indexOf = function (array, searchElement) {
    "use strict";
    for (var i = 0, l = array.length; i < l; i++) {
        if (searchElement === array[i]) {
            return i;
        }
    }
    return -1;
};
//##############################################################################
// Event.js
//##############################################################################
this.createjs = this.createjs || {};
(function () {
    "use strict";
    // constructor:
    /**
     * Contains properties and methods shared by all events for use with
     * {{#crossLink "EventDispatcher"}}{{/crossLink}}.
     *
     * Note that Event objects are often reused, so you should never
     * rely on an event object's state outside of the call stack it was received in.
     * @class Event
     * @param {String} type The event type.
     * @param {Boolean} bubbles Indicates whether the event will bubble through the display list.
     * @param {Boolean} cancelable Indicates whether the default behaviour of this event can be cancelled.
     * @constructor
     **/
    function Event(type, bubbles, cancelable) {
        // public properties:
        /**
         * The type of event.
         * @property type
         * @type String
         **/
        this.type = type;
        /**
         * The object that generated an event.
         * @property target
         * @type Object
         * @default null
         * @readonly
        */
        this.target = null;
        /**
         * The current target that a bubbling event is being dispatched from. For non-bubbling events, this will
         * always be the same as target. For example, if childObj.parent = parentObj, and a bubbling event
         * is generated from childObj, then a listener on parentObj would receive the event with
         * target=childObj (the original target) and currentTarget=parentObj (where the listener was added).
         * @property currentTarget
         * @type Object
         * @default null
         * @readonly
        */
        this.currentTarget = null;
        /**
         * For bubbling events, this indicates the current event phase:<OL>
         * 	<LI> capture phase: starting from the top parent to the target</LI>
         * 	<LI> at target phase: currently being dispatched from the target</LI>
         * 	<LI> bubbling phase: from the target to the top parent</LI>
         * </OL>
         * @property eventPhase
         * @type Number
         * @default 0
         * @readonly
        */
        this.eventPhase = 0;
        /**
         * Indicates whether the event will bubble through the display list.
         * @property bubbles
         * @type Boolean
         * @default false
         * @readonly
        */
        this.bubbles = !!bubbles;
        /**
         * Indicates whether the default behaviour of this event can be cancelled via
         * {{#crossLink "Event/preventDefault"}}{{/crossLink}}. This is set via the Event constructor.
         * @property cancelable
         * @type Boolean
         * @default false
         * @readonly
        */
        this.cancelable = !!cancelable;
        /**
         * The epoch time at which this event was created.
         * @property timeStamp
         * @type Number
         * @default 0
         * @readonly
        */
        this.timeStamp = (new Date()).getTime();
        /**
         * Indicates if {{#crossLink "Event/preventDefault"}}{{/crossLink}} has been called
         * on this event.
         * @property defaultPrevented
         * @type Boolean
         * @default false
         * @readonly
        */
        this.defaultPrevented = false;
        /**
         * Indicates if {{#crossLink "Event/stopPropagation"}}{{/crossLink}} or
         * {{#crossLink "Event/stopImmediatePropagation"}}{{/crossLink}} has been called on this event.
         * @property propagationStopped
         * @type Boolean
         * @default false
         * @readonly
        */
        this.propagationStopped = false;
        /**
         * Indicates if {{#crossLink "Event/stopImmediatePropagation"}}{{/crossLink}} has been called
         * on this event.
         * @property immediatePropagationStopped
         * @type Boolean
         * @default false
         * @readonly
        */
        this.immediatePropagationStopped = false;
        /**
         * Indicates if {{#crossLink "Event/remove"}}{{/crossLink}} has been called on this event.
         * @property removed
         * @type Boolean
         * @default false
         * @readonly
        */
        this.removed = false;
    }
    var p = Event.prototype;
    /**
     * <strong>REMOVED</strong>. Removed in favor of using `MySuperClass_constructor`.
     * See {{#crossLink "Utility Methods/extend"}}{{/crossLink}} and {{#crossLink "Utility Methods/promote"}}{{/crossLink}}
     * for details.
     *
     * There is an inheritance tutorial distributed with EaselJS in /tutorials/Inheritance.
     *
     * @method initialize
     * @protected
     * @deprecated
     */
    // p.initialize = function() {}; // searchable for devs wondering where it is.
    // public methods:
    /**
     * Sets {{#crossLink "Event/defaultPrevented"}}{{/crossLink}} to true if the event is cancelable.
     * Mirrors the DOM level 2 event standard. In general, cancelable events that have `preventDefault()` called will
     * cancel the default behaviour associated with the event.
     * @method preventDefault
     **/
    p.preventDefault = function () {
        this.defaultPrevented = this.cancelable && true;
    };
    /**
     * Sets {{#crossLink "Event/propagationStopped"}}{{/crossLink}} to true.
     * Mirrors the DOM event standard.
     * @method stopPropagation
     **/
    p.stopPropagation = function () {
        this.propagationStopped = true;
    };
    /**
     * Sets {{#crossLink "Event/propagationStopped"}}{{/crossLink}} and
     * {{#crossLink "Event/immediatePropagationStopped"}}{{/crossLink}} to true.
     * Mirrors the DOM event standard.
     * @method stopImmediatePropagation
     **/
    p.stopImmediatePropagation = function () {
        this.immediatePropagationStopped = this.propagationStopped = true;
    };
    /**
     * Causes the active listener to be removed via removeEventListener();
     *
     * 		myBtn.addEventListener("click", function(evt) {
     * 			// do stuff...
     * 			evt.remove(); // removes this listener.
     * 		});
     *
     * @method remove
     **/
    p.remove = function () {
        this.removed = true;
    };
    /**
     * Returns a clone of the Event instance.
     * @method clone
     * @return {Event} a clone of the Event instance.
     **/
    p.clone = function () {
        return new Event(this.type, this.bubbles, this.cancelable);
    };
    /**
     * Provides a chainable shortcut method for setting a number of properties on the instance.
     *
     * @method set
     * @param {Object} props A generic object containing properties to copy to the instance.
     * @return {Event} Returns the instance the method is called on (useful for chaining calls.)
     * @chainable
    */
    p.set = function (props) {
        for (var n in props) {
            this[n] = props[n];
        }
        return this;
    };
    /**
     * Returns a string representation of this object.
     * @method toString
     * @return {String} a string representation of the instance.
     **/
    p.toString = function () {
        return "[Event (type=" + this.type + ")]";
    };
    createjs.Event = Event;
}());
//##############################################################################
// ErrorEvent.js
//##############################################################################
this.createjs = this.createjs || {};
(function () {
    "use strict";
    /**
     * A general error {{#crossLink "Event"}}{{/crossLink}}, that describes an error that occurred, as well as any details.
     * @class ErrorEvent
     * @param {String} [title] The error title
     * @param {String} [message] The error description
     * @param {Object} [data] Additional error data
     * @constructor
     */
    function ErrorEvent(title, message, data) {
        this.Event_constructor("error");
        /**
         * The short error title, which indicates the type of error that occurred.
         * @property title
         * @type String
         */
        this.title = title;
        /**
         * The verbose error message, containing details about the error.
         * @property message
         * @type String
         */
        this.message = message;
        /**
         * Additional data attached to an error.
         * @property data
         * @type {Object}
         */
        this.data = data;
    }
    var p = createjs.extend(ErrorEvent, createjs.Event);
    p.clone = function () {
        return new createjs.ErrorEvent(this.title, this.message, this.data);
    };
    createjs.ErrorEvent = createjs.promote(ErrorEvent, "Event");
}());
//##############################################################################
// EventDispatcher.js
//##############################################################################
this.createjs = this.createjs || {};
(function () {
    "use strict";
    // constructor:
    /**
     * EventDispatcher provides methods for managing queues of event listeners and dispatching events.
     *
     * You can either extend EventDispatcher or mix its methods into an existing prototype or instance by using the
     * EventDispatcher {{#crossLink "EventDispatcher/initialize"}}{{/crossLink}} method.
     *
     * Together with the CreateJS Event class, EventDispatcher provides an extended event model that is based on the
     * DOM Level 2 event model, including addEventListener, removeEventListener, and dispatchEvent. It supports
     * bubbling / capture, preventDefault, stopPropagation, stopImmediatePropagation, and handleEvent.
     *
     * EventDispatcher also exposes a {{#crossLink "EventDispatcher/on"}}{{/crossLink}} method, which makes it easier
     * to create scoped listeners, listeners that only run once, and listeners with associated arbitrary data. The
     * {{#crossLink "EventDispatcher/off"}}{{/crossLink}} method is merely an alias to
     * {{#crossLink "EventDispatcher/removeEventListener"}}{{/crossLink}}.
     *
     * Another addition to the DOM Level 2 model is the {{#crossLink "EventDispatcher/removeAllEventListeners"}}{{/crossLink}}
     * method, which can be used to listeners for all events, or listeners for a specific event. The Event object also
     * includes a {{#crossLink "Event/remove"}}{{/crossLink}} method which removes the active listener.
     *
     * <h4>Example</h4>
     * Add EventDispatcher capabilities to the "MyClass" class.
     *
     *      EventDispatcher.initialize(MyClass.prototype);
     *
     * Add an event (see {{#crossLink "EventDispatcher/addEventListener"}}{{/crossLink}}).
     *
     *      instance.addEventListener("eventName", handlerMethod);
     *      function handlerMethod(event) {
     *          console.log(event.target + " Was Clicked");
     *      }
     *
     * <b>Maintaining proper scope</b><br />
     * Scope (ie. "this") can be be a challenge with events. Using the {{#crossLink "EventDispatcher/on"}}{{/crossLink}}
     * method to subscribe to events simplifies this.
     *
     *      instance.addEventListener("click", function(event) {
     *          console.log(instance == this); // false, scope is ambiguous.
     *      });
     *
     *      instance.on("click", function(event) {
     *          console.log(instance == this); // true, "on" uses dispatcher scope by default.
     *      });
     *
     * If you want to use addEventListener instead, you may want to use function.bind() or a similar proxy to manage
     * scope.
     *
     * <b>Browser support</b>
     * The event model in CreateJS can be used separately from the suite in any project, however the inheritance model
     * requires modern browsers (IE9+).
     *
     *
     * @class EventDispatcher
     * @constructor
     **/
    function EventDispatcher() {
        // private properties:
        /**
         * @protected
         * @property _listeners
         * @type Object
         **/
        this._listeners = null;
        /**
         * @protected
         * @property _captureListeners
         * @type Object
         **/
        this._captureListeners = null;
    }
    var p = EventDispatcher.prototype;
    /**
     * <strong>REMOVED</strong>. Removed in favor of using `MySuperClass_constructor`.
     * See {{#crossLink "Utility Methods/extend"}}{{/crossLink}} and {{#crossLink "Utility Methods/promote"}}{{/crossLink}}
     * for details.
     *
     * There is an inheritance tutorial distributed with EaselJS in /tutorials/Inheritance.
     *
     * @method initialize
     * @protected
     * @deprecated
     */
    // p.initialize = function() {}; // searchable for devs wondering where it is.
    // static public methods:
    /**
     * Static initializer to mix EventDispatcher methods into a target object or prototype.
     *
     * 		EventDispatcher.initialize(MyClass.prototype); // add to the prototype of the class
     * 		EventDispatcher.initialize(myObject); // add to a specific instance
     *
     * @method initialize
     * @static
     * @param {Object} target The target object to inject EventDispatcher methods into. This can be an instance or a
     * prototype.
     **/
    EventDispatcher.initialize = function (target) {
        target.addEventListener = p.addEventListener;
        target.on = p.on;
        target.removeEventListener = target.off = p.removeEventListener;
        target.removeAllEventListeners = p.removeAllEventListeners;
        target.hasEventListener = p.hasEventListener;
        target.dispatchEvent = p.dispatchEvent;
        target._dispatchEvent = p._dispatchEvent;
        target.willTrigger = p.willTrigger;
    };
    // public methods:
    /**
     * Adds the specified event listener. Note that adding multiple listeners to the same function will result in
     * multiple callbacks getting fired.
     *
     * <h4>Example</h4>
     *
     *      displayObject.addEventListener("click", handleClick);
     *      function handleClick(event) {
     *         // Click happened.
     *      }
     *
     * @method addEventListener
     * @param {String} type The string type of the event.
     * @param {Function | Object} listener An object with a handleEvent method, or a function that will be called when
     * the event is dispatched.
     * @param {Boolean} [useCapture] For events that bubble, indicates whether to listen for the event in the capture or bubbling/target phase.
     * @return {Function | Object} Returns the listener for chaining or assignment.
     **/
    p.addEventListener = function (type, listener, useCapture) {
        var listeners;
        if (useCapture) {
            listeners = this._captureListeners = this._captureListeners || {};
        }
        else {
            listeners = this._listeners = this._listeners || {};
        }
        var arr = listeners[type];
        if (arr) {
            this.removeEventListener(type, listener, useCapture);
        }
        arr = listeners[type]; // remove may have deleted the array
        if (!arr) {
            listeners[type] = [listener];
        }
        else {
            arr.push(listener);
        }
        return listener;
    };
    /**
     * A shortcut method for using addEventListener that makes it easier to specify an execution scope, have a listener
     * only run once, associate arbitrary data with the listener, and remove the listener.
     *
     * This method works by creating an anonymous wrapper function and subscribing it with addEventListener.
     * The wrapper function is returned for use with `removeEventListener` (or `off`).
     *
     * <b>IMPORTANT:</b> To remove a listener added with `on`, you must pass in the returned wrapper function as the listener, or use
     * {{#crossLink "Event/remove"}}{{/crossLink}}. Likewise, each time you call `on` a NEW wrapper function is subscribed, so multiple calls
     * to `on` with the same params will create multiple listeners.
     *
     * <h4>Example</h4>
     *
     * 		var listener = myBtn.on("click", handleClick, null, false, {count:3});
     * 		function handleClick(evt, data) {
     * 			data.count -= 1;
     * 			console.log(this == myBtn); // true - scope defaults to the dispatcher
     * 			if (data.count == 0) {
     * 				alert("clicked 3 times!");
     * 				myBtn.off("click", listener);
     * 				// alternately: evt.remove();
     * 			}
     * 		}
     *
     * @method on
     * @param {String} type The string type of the event.
     * @param {Function | Object} listener An object with a handleEvent method, or a function that will be called when
     * the event is dispatched.
     * @param {Object} [scope] The scope to execute the listener in. Defaults to the dispatcher/currentTarget for function listeners, and to the listener itself for object listeners (ie. using handleEvent).
     * @param {Boolean} [once=false] If true, the listener will remove itself after the first time it is triggered.
     * @param {*} [data] Arbitrary data that will be included as the second parameter when the listener is called.
     * @param {Boolean} [useCapture=false] For events that bubble, indicates whether to listen for the event in the capture or bubbling/target phase.
     * @return {Function} Returns the anonymous function that was created and assigned as the listener. This is needed to remove the listener later using .removeEventListener.
     **/
    p.on = function (type, listener, scope, once, data, useCapture) {
        if (listener.handleEvent) {
            scope = scope || listener;
            listener = listener.handleEvent;
        }
        scope = scope || this;
        return this.addEventListener(type, function (evt) {
            listener.call(scope, evt, data);
            once && evt.remove();
        }, useCapture);
    };
    /**
     * Removes the specified event listener.
     *
     * <b>Important Note:</b> that you must pass the exact function reference used when the event was added. If a proxy
     * function, or function closure is used as the callback, the proxy/closure reference must be used - a new proxy or
     * closure will not work.
     *
     * <h4>Example</h4>
     *
     *      displayObject.removeEventListener("click", handleClick);
     *
     * @method removeEventListener
     * @param {String} type The string type of the event.
     * @param {Function | Object} listener The listener function or object.
     * @param {Boolean} [useCapture] For events that bubble, indicates whether to listen for the event in the capture or bubbling/target phase.
     **/
    p.removeEventListener = function (type, listener, useCapture) {
        var listeners = useCapture ? this._captureListeners : this._listeners;
        if (!listeners) {
            return;
        }
        var arr = listeners[type];
        if (!arr) {
            return;
        }
        for (var i = 0, l = arr.length; i < l; i++) {
            if (arr[i] == listener) {
                if (l == 1) {
                    delete (listeners[type]);
                } // allows for faster checks.
                else {
                    arr.splice(i, 1);
                }
                break;
            }
        }
    };
    /**
     * A shortcut to the removeEventListener method, with the same parameters and return value. This is a companion to the
     * .on method.
     *
     * <b>IMPORTANT:</b> To remove a listener added with `on`, you must pass in the returned wrapper function as the listener. See
     * {{#crossLink "EventDispatcher/on"}}{{/crossLink}} for an example.
     *
     * @method off
     * @param {String} type The string type of the event.
     * @param {Function | Object} listener The listener function or object.
     * @param {Boolean} [useCapture] For events that bubble, indicates whether to listen for the event in the capture or bubbling/target phase.
     **/
    p.off = p.removeEventListener;
    /**
     * Removes all listeners for the specified type, or all listeners of all types.
     *
     * <h4>Example</h4>
     *
     *      // Remove all listeners
     *      displayObject.removeAllEventListeners();
     *
     *      // Remove all click listeners
     *      displayObject.removeAllEventListeners("click");
     *
     * @method removeAllEventListeners
     * @param {String} [type] The string type of the event. If omitted, all listeners for all types will be removed.
     **/
    p.removeAllEventListeners = function (type) {
        if (!type) {
            this._listeners = this._captureListeners = null;
        }
        else {
            if (this._listeners) {
                delete (this._listeners[type]);
            }
            if (this._captureListeners) {
                delete (this._captureListeners[type]);
            }
        }
    };
    /**
     * Dispatches the specified event to all listeners.
     *
     * <h4>Example</h4>
     *
     *      // Use a string event
     *      this.dispatchEvent("complete");
     *
     *      // Use an Event instance
     *      var event = new createjs.Event("progress");
     *      this.dispatchEvent(event);
     *
     * @method dispatchEvent
     * @param {Object | String | Event} eventObj An object with a "type" property, or a string type.
     * While a generic object will work, it is recommended to use a CreateJS Event instance. If a string is used,
     * dispatchEvent will construct an Event instance if necessary with the specified type. This latter approach can
     * be used to avoid event object instantiation for non-bubbling events that may not have any listeners.
     * @param {Boolean} [bubbles] Specifies the `bubbles` value when a string was passed to eventObj.
     * @param {Boolean} [cancelable] Specifies the `cancelable` value when a string was passed to eventObj.
     * @return {Boolean} Returns false if `preventDefault()` was called on a cancelable event, true otherwise.
     **/
    p.dispatchEvent = function (eventObj, bubbles, cancelable) {
        if (typeof eventObj == "string") {
            // skip everything if there's no listeners and it doesn't bubble:
            var listeners = this._listeners;
            if (!bubbles && (!listeners || !listeners[eventObj])) {
                return true;
            }
            eventObj = new createjs.Event(eventObj, bubbles, cancelable);
        }
        else if (eventObj.target && eventObj.clone) {
            // redispatching an active event object, so clone it:
            eventObj = eventObj.clone();
        }
        // TODO: it would be nice to eliminate this. Maybe in favour of evtObj instanceof Event? Or !!evtObj.createEvent
        try {
            eventObj.target = this;
        }
        catch (e) { } // try/catch allows redispatching of native events
        if (!eventObj.bubbles || !this.parent) {
            this._dispatchEvent(eventObj, 2);
        }
        else {
            var top = this, list = [top];
            while (top.parent) {
                list.push(top = top.parent);
            }
            var i, l = list.length;
            // capture & atTarget
            for (i = l - 1; i >= 0 && !eventObj.propagationStopped; i--) {
                list[i]._dispatchEvent(eventObj, 1 + (i == 0));
            }
            // bubbling
            for (i = 1; i < l && !eventObj.propagationStopped; i++) {
                list[i]._dispatchEvent(eventObj, 3);
            }
        }
        return !eventObj.defaultPrevented;
    };
    /**
     * Indicates whether there is at least one listener for the specified event type.
     * @method hasEventListener
     * @param {String} type The string type of the event.
     * @return {Boolean} Returns true if there is at least one listener for the specified event.
     **/
    p.hasEventListener = function (type) {
        var listeners = this._listeners, captureListeners = this._captureListeners;
        return !!((listeners && listeners[type]) || (captureListeners && captureListeners[type]));
    };
    /**
     * Indicates whether there is at least one listener for the specified event type on this object or any of its
     * ancestors (parent, parent's parent, etc). A return value of true indicates that if a bubbling event of the
     * specified type is dispatched from this object, it will trigger at least one listener.
     *
     * This is similar to {{#crossLink "EventDispatcher/hasEventListener"}}{{/crossLink}}, but it searches the entire
     * event flow for a listener, not just this object.
     * @method willTrigger
     * @param {String} type The string type of the event.
     * @return {Boolean} Returns `true` if there is at least one listener for the specified event.
     **/
    p.willTrigger = function (type) {
        var o = this;
        while (o) {
            if (o.hasEventListener(type)) {
                return true;
            }
            o = o.parent;
        }
        return false;
    };
    /**
     * @method toString
     * @return {String} a string representation of the instance.
     **/
    p.toString = function () {
        return "[EventDispatcher]";
    };
    // private methods:
    /**
     * @method _dispatchEvent
     * @param {Object | String | Event} eventObj
     * @param {Object} eventPhase
     * @protected
     **/
    p._dispatchEvent = function (eventObj, eventPhase) {
        var l, listeners = (eventPhase == 1) ? this._captureListeners : this._listeners;
        if (eventObj && listeners) {
            var arr = listeners[eventObj.type];
            if (!arr || !(l = arr.length)) {
                return;
            }
            try {
                eventObj.currentTarget = this;
            }
            catch (e) { }
            try {
                eventObj.eventPhase = eventPhase;
            }
            catch (e) { }
            eventObj.removed = false;
            arr = arr.slice(); // to avoid issues with items being removed or added during the dispatch
            for (var i = 0; i < l && !eventObj.immediatePropagationStopped; i++) {
                var o = arr[i];
                if (o.handleEvent) {
                    o.handleEvent(eventObj);
                }
                else {
                    o(eventObj);
                }
                if (eventObj.removed) {
                    this.off(eventObj.type, o, eventPhase == 1);
                    eventObj.removed = false;
                }
            }
        }
    };
    createjs.EventDispatcher = EventDispatcher;
}());
//##############################################################################
// ProgressEvent.js
//##############################################################################
this.createjs = this.createjs || {};
(function (scope) {
    "use strict";
    // constructor
    /**
     * A CreateJS {{#crossLink "Event"}}{{/crossLink}} that is dispatched when progress changes.
     * @class ProgressEvent
     * @param {Number} loaded The amount that has been loaded. This can be any number relative to the total.
     * @param {Number} [total=1] The total amount that will load. This will default to 1, so if the `loaded` value is
     * a percentage (between 0 and 1), it can be omitted.
     * @todo Consider having this event be a "fileprogress" event as well
     * @constructor
     */
    function ProgressEvent(loaded, total) {
        this.Event_constructor("progress");
        /**
         * The amount that has been loaded (out of a total amount)
         * @property loaded
         * @type {Number}
         */
        this.loaded = loaded;
        /**
         * The total "size" of the load.
         * @property total
         * @type {Number}
         * @default 1
         */
        this.total = (total == null) ? 1 : total;
        /**
         * The percentage (out of 1) that the load has been completed. This is calculated using `loaded/total`.
         * @property progress
         * @type {Number}
         * @default 0
         */
        this.progress = (total == 0) ? 0 : this.loaded / this.total;
    }
    ;
    var p = createjs.extend(ProgressEvent, createjs.Event);
    /**
     * Returns a clone of the ProgressEvent instance.
     * @method clone
     * @return {ProgressEvent} a clone of the Event instance.
     **/
    p.clone = function () {
        return new createjs.ProgressEvent(this.loaded, this.total);
    };
    createjs.ProgressEvent = createjs.promote(ProgressEvent, "Event");
}(window));
//##############################################################################
// json3.js
//##############################################################################
/*! JSON v3.3.2 | http://bestiejs.github.io/json3 | Copyright 2012-2014, Kit Cambridge | http://kit.mit-license.org */
;
(function () {
    // Detect the `define` function exposed by asynchronous module loaders. The
    // strict `define` check is necessary for compatibility with `r.js`.
    var isLoader = typeof define === "function" && define.amd;
    // A set of types used to distinguish objects from primitives.
    var objectTypes = {
        "function": true,
        "object": true
    };
    // Detect the `exports` object exposed by CommonJS implementations.
    var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;
    // Use the `global` object exposed by Node (including Browserify via
    // `insert-module-globals`), Narwhal, and Ringo as the default context,
    // and the `window` object in browsers. Rhino exports a `global` function
    // instead.
    var root = objectTypes[typeof window] && window || this, freeGlobal = freeExports && objectTypes[typeof module] && module && !module.nodeType && typeof global == "object" && global;
    if (freeGlobal && (freeGlobal["global"] === freeGlobal || freeGlobal["window"] === freeGlobal || freeGlobal["self"] === freeGlobal)) {
        root = freeGlobal;
    }
    // Public: Initializes JSON 3 using the given `context` object, attaching the
    // `stringify` and `parse` functions to the specified `exports` object.
    function runInContext(context, exports) {
        context || (context = root["Object"]());
        exports || (exports = root["Object"]());
        // Native constructor aliases.
        var Number = context["Number"] || root["Number"], String = context["String"] || root["String"], Object = context["Object"] || root["Object"], Date = context["Date"] || root["Date"], SyntaxError = context["SyntaxError"] || root["SyntaxError"], TypeError = context["TypeError"] || root["TypeError"], Math = context["Math"] || root["Math"], nativeJSON = context["JSON"] || root["JSON"];
        // Delegate to the native `stringify` and `parse` implementations.
        if (typeof nativeJSON == "object" && nativeJSON) {
            exports.stringify = nativeJSON.stringify;
            exports.parse = nativeJSON.parse;
        }
        // Convenience aliases.
        var objectProto = Object.prototype, getClass = objectProto.toString, isProperty, forEach, undef;
        // Test the `Date#getUTC*` methods. Based on work by @Yaffle.
        var isExtended = new Date(-3509827334573292);
        try {
            // The `getUTCFullYear`, `Month`, and `Date` methods return nonsensical
            // results for certain dates in Opera >= 10.53.
            isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() === 1 &&
                // Safari < 2.0.2 stores the internal millisecond time value correctly,
                // but clips the values returned by the date methods to the range of
                // signed 32-bit integers ([-2 ** 31, 2 ** 31 - 1]).
                isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708;
        }
        catch (exception) { }
        // Internal: Determines whether the native `JSON.stringify` and `parse`
        // implementations are spec-compliant. Based on work by Ken Snyder.
        function has(name) {
            if (has[name] !== undef) {
                // Return cached feature test result.
                return has[name];
            }
            var isSupported;
            if (name == "bug-string-char-index") {
                // IE <= 7 doesn't support accessing string characters using square
                // bracket notation. IE 8 only supports this for primitives.
                isSupported = "a"[0] != "a";
            }
            else if (name == "json") {
                // Indicates whether both `JSON.stringify` and `JSON.parse` are
                // supported.
                isSupported = has("json-stringify") && has("json-parse");
            }
            else {
                var value, serialized = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
                // Test `JSON.stringify`.
                if (name == "json-stringify") {
                    var stringify = exports.stringify, stringifySupported = typeof stringify == "function" && isExtended;
                    if (stringifySupported) {
                        // A test function object with a custom `toJSON` method.
                        (value = function () {
                            return 1;
                        }).toJSON = value;
                        try {
                            stringifySupported =
                                // Firefox 3.1b1 and b2 serialize string, number, and boolean
                                // primitives as object literals.
                                stringify(0) === "0" &&
                                    // FF 3.1b1, b2, and JSON 2 serialize wrapped primitives as object
                                    // literals.
                                    stringify(new Number()) === "0" &&
                                    stringify(new String()) == '""' &&
                                    // FF 3.1b1, 2 throw an error if the value is `null`, `undefined`, or
                                    // does not define a canonical JSON representation (this applies to
                                    // objects with `toJSON` properties as well, *unless* they are nested
                                    // within an object or array).
                                    stringify(getClass) === undef &&
                                    // IE 8 serializes `undefined` as `"undefined"`. Safari <= 5.1.7 and
                                    // FF 3.1b3 pass this test.
                                    stringify(undef) === undef &&
                                    // Safari <= 5.1.7 and FF 3.1b3 throw `Error`s and `TypeError`s,
                                    // respectively, if the value is omitted entirely.
                                    stringify() === undef &&
                                    // FF 3.1b1, 2 throw an error if the given value is not a number,
                                    // string, array, object, Boolean, or `null` literal. This applies to
                                    // objects with custom `toJSON` methods as well, unless they are nested
                                    // inside object or array literals. YUI 3.0.0b1 ignores custom `toJSON`
                                    // methods entirely.
                                    stringify(value) === "1" &&
                                    stringify([value]) == "[1]" &&
                                    // Prototype <= 1.6.1 serializes `[undefined]` as `"[]"` instead of
                                    // `"[null]"`.
                                    stringify([undef]) == "[null]" &&
                                    // YUI 3.0.0b1 fails to serialize `null` literals.
                                    stringify(null) == "null" &&
                                    // FF 3.1b1, 2 halts serialization if an array contains a function:
                                    // `[1, true, getClass, 1]` serializes as "[1,true,],". FF 3.1b3
                                    // elides non-JSON values from objects and arrays, unless they
                                    // define custom `toJSON` methods.
                                    stringify([undef, getClass, null]) == "[null,null,null]" &&
                                    // Simple serialization test. FF 3.1b1 uses Unicode escape sequences
                                    // where character escape codes are expected (e.g., `\b` => `\u0008`).
                                    stringify({ "a": [value, true, false, null, "\x00\b\n\f\r\t"] }) == serialized &&
                                    // FF 3.1b1 and b2 ignore the `filter` and `width` arguments.
                                    stringify(null, value) === "1" &&
                                    stringify([1, 2], null, 1) == "[\n 1,\n 2\n]" &&
                                    // JSON 2, Prototype <= 1.7, and older WebKit builds incorrectly
                                    // serialize extended years.
                                    stringify(new Date(-8.64e15)) == '"-271821-04-20T00:00:00.000Z"' &&
                                    // The milliseconds are optional in ES 5, but required in 5.1.
                                    stringify(new Date(8.64e15)) == '"+275760-09-13T00:00:00.000Z"' &&
                                    // Firefox <= 11.0 incorrectly serializes years prior to 0 as negative
                                    // four-digit years instead of six-digit years. Credits: @Yaffle.
                                    stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' &&
                                    // Safari <= 5.1.5 and Opera >= 10.53 incorrectly serialize millisecond
                                    // values less than 1000. Credits: @Yaffle.
                                    stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';
                        }
                        catch (exception) {
                            stringifySupported = false;
                        }
                    }
                    isSupported = stringifySupported;
                }
                // Test `JSON.parse`.
                if (name == "json-parse") {
                    var parse = exports.parse;
                    if (typeof parse == "function") {
                        try {
                            // FF 3.1b1, b2 will throw an exception if a bare literal is provided.
                            // Conforming implementations should also coerce the initial argument to
                            // a string prior to parsing.
                            if (parse("0") === 0 && !parse(false)) {
                                // Simple parsing test.
                                value = parse(serialized);
                                var parseSupported = value["a"].length == 5 && value["a"][0] === 1;
                                if (parseSupported) {
                                    try {
                                        // Safari <= 5.1.2 and FF 3.1b1 allow unescaped tabs in strings.
                                        parseSupported = !parse('"\t"');
                                    }
                                    catch (exception) { }
                                    if (parseSupported) {
                                        try {
                                            // FF 4.0 and 4.0.1 allow leading `+` signs and leading
                                            // decimal points. FF 4.0, 4.0.1, and IE 9-10 also allow
                                            // certain octal literals.
                                            parseSupported = parse("01") !== 1;
                                        }
                                        catch (exception) { }
                                    }
                                    if (parseSupported) {
                                        try {
                                            // FF 4.0, 4.0.1, and Rhino 1.7R3-R4 allow trailing decimal
                                            // points. These environments, along with FF 3.1b1 and 2,
                                            // also allow trailing commas in JSON objects and arrays.
                                            parseSupported = parse("1.") !== 1;
                                        }
                                        catch (exception) { }
                                    }
                                }
                            }
                        }
                        catch (exception) {
                            parseSupported = false;
                        }
                    }
                    isSupported = parseSupported;
                }
            }
            return has[name] = !!isSupported;
        }
        if (!has("json")) {
            // Common `[[Class]]` name aliases.
            var functionClass = "[object Function]", dateClass = "[object Date]", numberClass = "[object Number]", stringClass = "[object String]", arrayClass = "[object Array]", booleanClass = "[object Boolean]";
            // Detect incomplete support for accessing string characters by index.
            var charIndexBuggy = has("bug-string-char-index");
            // Define additional utility methods if the `Date` methods are buggy.
            if (!isExtended) {
                var floor = Math.floor;
                // A mapping between the months of the year and the number of days between
                // January 1st and the first of the respective month.
                var Months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
                // Internal: Calculates the number of days between the Unix epoch and the
                // first day of the given month.
                var getDay = function (year, month) {
                    return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);
                };
            }
            // Internal: Determines if a property is a direct property of the given
            // object. Delegates to the native `Object#hasOwnProperty` method.
            if (!(isProperty = objectProto.hasOwnProperty)) {
                isProperty = function (property) {
                    var members = {}, constructor;
                    if ((members.__proto__ = null, members.__proto__ = {
                        // The *proto* property cannot be set multiple times in recent
                        // versions of Firefox and SeaMonkey.
                        "toString": 1
                    }, members).toString != getClass) {
                        // Safari <= 2.0.3 doesn't implement `Object#hasOwnProperty`, but
                        // supports the mutable *proto* property.
                        isProperty = function (property) {
                            // Capture and break the object's prototype chain (see section 8.6.2
                            // of the ES 5.1 spec). The parenthesized expression prevents an
                            // unsafe transformation by the Closure Compiler.
                            var original = this.__proto__, result = property in (this.__proto__ = null, this);
                            // Restore the original prototype chain.
                            this.__proto__ = original;
                            return result;
                        };
                    }
                    else {
                        // Capture a reference to the top-level `Object` constructor.
                        constructor = members.constructor;
                        // Use the `constructor` property to simulate `Object#hasOwnProperty` in
                        // other environments.
                        isProperty = function (property) {
                            var parent = (this.constructor || constructor).prototype;
                            return property in this && !(property in parent && this[property] === parent[property]);
                        };
                    }
                    members = null;
                    return isProperty.call(this, property);
                };
            }
            // Internal: Normalizes the `for...in` iteration algorithm across
            // environments. Each enumerated key is yielded to a `callback` function.
            forEach = function (object, callback) {
                var size = 0, Properties, members, property;
                // Tests for bugs in the current environment's `for...in` algorithm. The
                // `valueOf` property inherits the non-enumerable flag from
                // `Object.prototype` in older versions of IE, Netscape, and Mozilla.
                (Properties = function () {
                    this.valueOf = 0;
                }).prototype.valueOf = 0;
                // Iterate over a new instance of the `Properties` class.
                members = new Properties();
                for (property in members) {
                    // Ignore all properties inherited from `Object.prototype`.
                    if (isProperty.call(members, property)) {
                        size++;
                    }
                }
                Properties = members = null;
                // Normalize the iteration algorithm.
                if (!size) {
                    // A list of non-enumerable properties inherited from `Object.prototype`.
                    members = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
                    // IE <= 8, Mozilla 1.0, and Netscape 6.2 ignore shadowed non-enumerable
                    // properties.
                    forEach = function (object, callback) {
                        var isFunction = getClass.call(object) == functionClass, property, length;
                        var hasProperty = !isFunction && typeof object.constructor != "function" && objectTypes[typeof object.hasOwnProperty] && object.hasOwnProperty || isProperty;
                        for (property in object) {
                            // Gecko <= 1.0 enumerates the `prototype` property of functions under
                            // certain conditions; IE does not.
                            if (!(isFunction && property == "prototype") && hasProperty.call(object, property)) {
                                callback(property);
                            }
                        }
                        // Manually invoke the callback for each non-enumerable property.
                        for (length = members.length; property = members[--length]; hasProperty.call(object, property) && callback(property))
                            ;
                    };
                }
                else if (size == 2) {
                    // Safari <= 2.0.4 enumerates shadowed properties twice.
                    forEach = function (object, callback) {
                        // Create a set of iterated properties.
                        var members = {}, isFunction = getClass.call(object) == functionClass, property;
                        for (property in object) {
                            // Store each property name to prevent double enumeration. The
                            // `prototype` property of functions is not enumerated due to cross-
                            // environment inconsistencies.
                            if (!(isFunction && property == "prototype") && !isProperty.call(members, property) && (members[property] = 1) && isProperty.call(object, property)) {
                                callback(property);
                            }
                        }
                    };
                }
                else {
                    // No bugs detected; use the standard `for...in` algorithm.
                    forEach = function (object, callback) {
                        var isFunction = getClass.call(object) == functionClass, property, isConstructor;
                        for (property in object) {
                            if (!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
                                callback(property);
                            }
                        }
                        // Manually invoke the callback for the `constructor` property due to
                        // cross-environment inconsistencies.
                        if (isConstructor || isProperty.call(object, (property = "constructor"))) {
                            callback(property);
                        }
                    };
                }
                return forEach(object, callback);
            };
            // Public: Serializes a JavaScript `value` as a JSON string. The optional
            // `filter` argument may specify either a function that alters how object and
            // array members are serialized, or an array of strings and numbers that
            // indicates which properties should be serialized. The optional `width`
            // argument may be either a string or number that specifies the indentation
            // level of the output.
            if (!has("json-stringify")) {
                // Internal: A map of control characters and their escaped equivalents.
                var Escapes = {
                    92: "\\\\",
                    34: '\\"',
                    8: "\\b",
                    12: "\\f",
                    10: "\\n",
                    13: "\\r",
                    9: "\\t"
                };
                // Internal: Converts `value` into a zero-padded string such that its
                // length is at least equal to `width`. The `width` must be <= 6.
                var leadingZeroes = "000000";
                var toPaddedString = function (width, value) {
                    // The `|| 0` expression is necessary to work around a bug in
                    // Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
                    return (leadingZeroes + (value || 0)).slice(-width);
                };
                // Internal: Double-quotes a string `value`, replacing all ASCII control
                // characters (characters with code unit values between 0 and 31) with
                // their escaped equivalents. This is an implementation of the
                // `Quote(value)` operation defined in ES 5.1 section 15.12.3.
                var unicodePrefix = "\\u00";
                var quote = function (value) {
                    var result = '"', index = 0, length = value.length, useCharIndex = !charIndexBuggy || length > 10;
                    var symbols = useCharIndex && (charIndexBuggy ? value.split("") : value);
                    for (; index < length; index++) {
                        var charCode = value.charCodeAt(index);
                        // If the character is a control character, append its Unicode or
                        // shorthand escape sequence; otherwise, append the character as-is.
                        switch (charCode) {
                            case 8:
                            case 9:
                            case 10:
                            case 12:
                            case 13:
                            case 34:
                            case 92:
                                result += Escapes[charCode];
                                break;
                            default:
                                if (charCode < 32) {
                                    result += unicodePrefix + toPaddedString(2, charCode.toString(16));
                                    break;
                                }
                                result += useCharIndex ? symbols[index] : value.charAt(index);
                        }
                    }
                    return result + '"';
                };
                // Internal: Recursively serializes an object. Implements the
                // `Str(key, holder)`, `JO(value)`, and `JA(value)` operations.
                var serialize = function (property, object, callback, properties, whitespace, indentation, stack) {
                    var value, className, year, month, date, time, hours, minutes, seconds, milliseconds, results, element, index, length, prefix, result;
                    try {
                        // Necessary for host object support.
                        value = object[property];
                    }
                    catch (exception) { }
                    if (typeof value == "object" && value) {
                        className = getClass.call(value);
                        if (className == dateClass && !isProperty.call(value, "toJSON")) {
                            if (value > -1 / 0 && value < 1 / 0) {
                                // Dates are serialized according to the `Date#toJSON` method
                                // specified in ES 5.1 section 15.9.5.44. See section 15.9.1.15
                                // for the ISO 8601 date time string format.
                                if (getDay) {
                                    // Manually compute the year, month, date, hours, minutes,
                                    // seconds, and milliseconds if the `getUTC*` methods are
                                    // buggy. Adapted from @Yaffle's `date-shim` project.
                                    date = floor(value / 864e5);
                                    for (year = floor(date / 365.2425) + 1970 - 1; getDay(year + 1, 0) <= date; year++)
                                        ;
                                    for (month = floor((date - getDay(year, 0)) / 30.42); getDay(year, month + 1) <= date; month++)
                                        ;
                                    date = 1 + date - getDay(year, month);
                                    // The `time` value specifies the time within the day (see ES
                                    // 5.1 section 15.9.1.2). The formula `(A % B + B) % B` is used
                                    // to compute `A modulo B`, as the `%` operator does not
                                    // correspond to the `modulo` operation for negative numbers.
                                    time = (value % 864e5 + 864e5) % 864e5;
                                    // The hours, minutes, seconds, and milliseconds are obtained by
                                    // decomposing the time within the day. See section 15.9.1.10.
                                    hours = floor(time / 36e5) % 24;
                                    minutes = floor(time / 6e4) % 60;
                                    seconds = floor(time / 1e3) % 60;
                                    milliseconds = time % 1e3;
                                }
                                else {
                                    year = value.getUTCFullYear();
                                    month = value.getUTCMonth();
                                    date = value.getUTCDate();
                                    hours = value.getUTCHours();
                                    minutes = value.getUTCMinutes();
                                    seconds = value.getUTCSeconds();
                                    milliseconds = value.getUTCMilliseconds();
                                }
                                // Serialize extended years correctly.
                                value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) +
                                    "-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) +
                                    // Months, dates, hours, minutes, and seconds should have two
                                    // digits; milliseconds should have three.
                                    "T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) +
                                    // Milliseconds are optional in ES 5.0, but required in 5.1.
                                    "." + toPaddedString(3, milliseconds) + "Z";
                            }
                            else {
                                value = null;
                            }
                        }
                        else if (typeof value.toJSON == "function" && ((className != numberClass && className != stringClass && className != arrayClass) || isProperty.call(value, "toJSON"))) {
                            // Prototype <= 1.6.1 adds non-standard `toJSON` methods to the
                            // `Number`, `String`, `Date`, and `Array` prototypes. JSON 3
                            // ignores all `toJSON` methods on these objects unless they are
                            // defined directly on an instance.
                            value = value.toJSON(property);
                        }
                    }
                    if (callback) {
                        // If a replacement function was provided, call it to obtain the value
                        // for serialization.
                        value = callback.call(object, property, value);
                    }
                    if (value === null) {
                        return "null";
                    }
                    className = getClass.call(value);
                    if (className == booleanClass) {
                        // Booleans are represented literally.
                        return "" + value;
                    }
                    else if (className == numberClass) {
                        // JSON numbers must be finite. `Infinity` and `NaN` are serialized as
                        // `"null"`.
                        return value > -1 / 0 && value < 1 / 0 ? "" + value : "null";
                    }
                    else if (className == stringClass) {
                        // Strings are double-quoted and escaped.
                        return quote("" + value);
                    }
                    // Recursively serialize objects and arrays.
                    if (typeof value == "object") {
                        // Check for cyclic structures. This is a linear search; performance
                        // is inversely proportional to the number of unique nested objects.
                        for (length = stack.length; length--;) {
                            if (stack[length] === value) {
                                // Cyclic structures cannot be serialized by `JSON.stringify`.
                                throw TypeError();
                            }
                        }
                        // Add the object to the stack of traversed objects.
                        stack.push(value);
                        results = [];
                        // Save the current indentation level and indent one additional level.
                        prefix = indentation;
                        indentation += whitespace;
                        if (className == arrayClass) {
                            // Recursively serialize array elements.
                            for (index = 0, length = value.length; index < length; index++) {
                                element = serialize(index, value, callback, properties, whitespace, indentation, stack);
                                results.push(element === undef ? "null" : element);
                            }
                            result = results.length ? (whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : ("[" + results.join(",") + "]")) : "[]";
                        }
                        else {
                            // Recursively serialize object members. Members are selected from
                            // either a user-specified list of property names, or the object
                            // itself.
                            forEach(properties || value, function (property) {
                                var element = serialize(property, value, callback, properties, whitespace, indentation, stack);
                                if (element !== undef) {
                                    // According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
                                    // is not the empty string, let `member` {quote(property) + ":"}
                                    // be the concatenation of `member` and the `space` character."
                                    // The "`space` character" refers to the literal space
                                    // character, not the `space` {width} argument provided to
                                    // `JSON.stringify`.
                                    results.push(quote(property) + ":" + (whitespace ? " " : "") + element);
                                }
                            });
                            result = results.length ? (whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : ("{" + results.join(",") + "}")) : "{}";
                        }
                        // Remove the object from the traversed object stack.
                        stack.pop();
                        return result;
                    }
                };
                // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
                exports.stringify = function (source, filter, width) {
                    var whitespace, callback, properties, className;
                    if (objectTypes[typeof filter] && filter) {
                        if ((className = getClass.call(filter)) == functionClass) {
                            callback = filter;
                        }
                        else if (className == arrayClass) {
                            // Convert the property names array into a makeshift set.
                            properties = {};
                            for (var index = 0, length = filter.length, value; index < length; value = filter[index++], ((className = getClass.call(value)), className == stringClass || className == numberClass) && (properties[value] = 1))
                                ;
                        }
                    }
                    if (width) {
                        if ((className = getClass.call(width)) == numberClass) {
                            // Convert the `width` to an integer and create a string containing
                            // `width` number of space characters.
                            if ((width -= width % 1) > 0) {
                                for (whitespace = "", width > 10 && (width = 10); whitespace.length < width; whitespace += " ")
                                    ;
                            }
                        }
                        else if (className == stringClass) {
                            whitespace = width.length <= 10 ? width : width.slice(0, 10);
                        }
                    }
                    // Opera <= 7.54u2 discards the values associated with empty string keys
                    // (`""`) only if they are used directly within an object member list
                    // (e.g., `!("" in { "": 1})`).
                    return serialize("", (value = {}, value[""] = source, value), callback, properties, whitespace, "", []);
                };
            }
            // Public: Parses a JSON source string.
            if (!has("json-parse")) {
                var fromCharCode = String.fromCharCode;
                // Internal: A map of escaped control characters and their unescaped
                // equivalents.
                var Unescapes = {
                    92: "\\",
                    34: '"',
                    47: "/",
                    98: "\b",
                    116: "\t",
                    110: "\n",
                    102: "\f",
                    114: "\r"
                };
                // Internal: Stores the parser state.
                var Index, Source;
                // Internal: Resets the parser state and throws a `SyntaxError`.
                var abort = function () {
                    Index = Source = null;
                    throw SyntaxError();
                };
                // Internal: Returns the next token, or `"$"` if the parser has reached
                // the end of the source string. A token may be a string, number, `null`
                // literal, or Boolean literal.
                var lex = function () {
                    var source = Source, length = source.length, value, begin, position, isSigned, charCode;
                    while (Index < length) {
                        charCode = source.charCodeAt(Index);
                        switch (charCode) {
                            case 9:
                            case 10:
                            case 13:
                            case 32:
                                // Skip whitespace tokens, including tabs, carriage returns, line
                                // feeds, and space characters.
                                Index++;
                                break;
                            case 123:
                            case 125:
                            case 91:
                            case 93:
                            case 58:
                            case 44:
                                // Parse a punctuator token (`{`, `}`, `[`, `]`, `:`, or `,`) at
                                // the current position.
                                value = charIndexBuggy ? source.charAt(Index) : source[Index];
                                Index++;
                                return value;
                            case 34:
                                // `"` delimits a JSON string; advance to the next character and
                                // begin parsing the string. String tokens are prefixed with the
                                // sentinel `@` character to distinguish them from punctuators and
                                // end-of-string tokens.
                                for (value = "@", Index++; Index < length;) {
                                    charCode = source.charCodeAt(Index);
                                    if (charCode < 32) {
                                        // Unescaped ASCII control characters (those with a code unit
                                        // less than the space character) are not permitted.
                                        abort();
                                    }
                                    else if (charCode == 92) {
                                        // A reverse solidus (`\`) marks the beginning of an escaped
                                        // control character (including `"`, `\`, and `/`) or Unicode
                                        // escape sequence.
                                        charCode = source.charCodeAt(++Index);
                                        switch (charCode) {
                                            case 92:
                                            case 34:
                                            case 47:
                                            case 98:
                                            case 116:
                                            case 110:
                                            case 102:
                                            case 114:
                                                // Revive escaped control characters.
                                                value += Unescapes[charCode];
                                                Index++;
                                                break;
                                            case 117:
                                                // `\u` marks the beginning of a Unicode escape sequence.
                                                // Advance to the first character and validate the
                                                // four-digit code point.
                                                begin = ++Index;
                                                for (position = Index + 4; Index < position; Index++) {
                                                    charCode = source.charCodeAt(Index);
                                                    // A valid sequence comprises four hexdigits (case-
                                                    // insensitive) that form a single hexadecimal value.
                                                    if (!(charCode >= 48 && charCode <= 57 || charCode >= 97 && charCode <= 102 || charCode >= 65 && charCode <= 70)) {
                                                        // Invalid Unicode escape sequence.
                                                        abort();
                                                    }
                                                }
                                                // Revive the escaped character.
                                                value += fromCharCode("0x" + source.slice(begin, Index));
                                                break;
                                            default:
                                                // Invalid escape sequence.
                                                abort();
                                        }
                                    }
                                    else {
                                        if (charCode == 34) {
                                            // An unescaped double-quote character marks the end of the
                                            // string.
                                            break;
                                        }
                                        charCode = source.charCodeAt(Index);
                                        begin = Index;
                                        // Optimize for the common case where a string is valid.
                                        while (charCode >= 32 && charCode != 92 && charCode != 34) {
                                            charCode = source.charCodeAt(++Index);
                                        }
                                        // Append the string as-is.
                                        value += source.slice(begin, Index);
                                    }
                                }
                                if (source.charCodeAt(Index) == 34) {
                                    // Advance to the next character and return the revived string.
                                    Index++;
                                    return value;
                                }
                                // Unterminated string.
                                abort();
                            default:
                                // Parse numbers and literals.
                                begin = Index;
                                // Advance past the negative sign, if one is specified.
                                if (charCode == 45) {
                                    isSigned = true;
                                    charCode = source.charCodeAt(++Index);
                                }
                                // Parse an integer or floating-point value.
                                if (charCode >= 48 && charCode <= 57) {
                                    // Leading zeroes are interpreted as octal literals.
                                    if (charCode == 48 && ((charCode = source.charCodeAt(Index + 1)), charCode >= 48 && charCode <= 57)) {
                                        // Illegal octal literal.
                                        abort();
                                    }
                                    isSigned = false;
                                    // Parse the integer component.
                                    for (; Index < length && ((charCode = source.charCodeAt(Index)), charCode >= 48 && charCode <= 57); Index++)
                                        ;
                                    // Floats cannot contain a leading decimal point; however, this
                                    // case is already accounted for by the parser.
                                    if (source.charCodeAt(Index) == 46) {
                                        position = ++Index;
                                        // Parse the decimal component.
                                        for (; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++)
                                            ;
                                        if (position == Index) {
                                            // Illegal trailing decimal.
                                            abort();
                                        }
                                        Index = position;
                                    }
                                    // Parse exponents. The `e` denoting the exponent is
                                    // case-insensitive.
                                    charCode = source.charCodeAt(Index);
                                    if (charCode == 101 || charCode == 69) {
                                        charCode = source.charCodeAt(++Index);
                                        // Skip past the sign following the exponent, if one is
                                        // specified.
                                        if (charCode == 43 || charCode == 45) {
                                            Index++;
                                        }
                                        // Parse the exponential component.
                                        for (position = Index; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++)
                                            ;
                                        if (position == Index) {
                                            // Illegal empty exponent.
                                            abort();
                                        }
                                        Index = position;
                                    }
                                    // Coerce the parsed value to a JavaScript number.
                                    return +source.slice(begin, Index);
                                }
                                // A negative sign may only precede numbers.
                                if (isSigned) {
                                    abort();
                                }
                                // `true`, `false`, and `null` literals.
                                if (source.slice(Index, Index + 4) == "true") {
                                    Index += 4;
                                    return true;
                                }
                                else if (source.slice(Index, Index + 5) == "false") {
                                    Index += 5;
                                    return false;
                                }
                                else if (source.slice(Index, Index + 4) == "null") {
                                    Index += 4;
                                    return null;
                                }
                                // Unrecognized token.
                                abort();
                        }
                    }
                    // Return the sentinel `$` character if the parser has reached the end
                    // of the source string.
                    return "$";
                };
                // Internal: Parses a JSON `value` token.
                var get = function (value) {
                    var results, hasMembers;
                    if (value == "$") {
                        // Unexpected end of input.
                        abort();
                    }
                    if (typeof value == "string") {
                        if ((charIndexBuggy ? value.charAt(0) : value[0]) == "@") {
                            // Remove the sentinel `@` character.
                            return value.slice(1);
                        }
                        // Parse object and array literals.
                        if (value == "[") {
                            // Parses a JSON array, returning a new JavaScript array.
                            results = [];
                            for (;; hasMembers || (hasMembers = true)) {
                                value = lex();
                                // A closing square bracket marks the end of the array literal.
                                if (value == "]") {
                                    break;
                                }
                                // If the array literal contains elements, the current token
                                // should be a comma separating the previous element from the
                                // next.
                                if (hasMembers) {
                                    if (value == ",") {
                                        value = lex();
                                        if (value == "]") {
                                            // Unexpected trailing `,` in array literal.
                                            abort();
                                        }
                                    }
                                    else {
                                        // A `,` must separate each array element.
                                        abort();
                                    }
                                }
                                // Elisions and leading commas are not permitted.
                                if (value == ",") {
                                    abort();
                                }
                                results.push(get(value));
                            }
                            return results;
                        }
                        else if (value == "{") {
                            // Parses a JSON object, returning a new JavaScript object.
                            results = {};
                            for (;; hasMembers || (hasMembers = true)) {
                                value = lex();
                                // A closing curly brace marks the end of the object literal.
                                if (value == "}") {
                                    break;
                                }
                                // If the object literal contains members, the current token
                                // should be a comma separator.
                                if (hasMembers) {
                                    if (value == ",") {
                                        value = lex();
                                        if (value == "}") {
                                            // Unexpected trailing `,` in object literal.
                                            abort();
                                        }
                                    }
                                    else {
                                        // A `,` must separate each object member.
                                        abort();
                                    }
                                }
                                // Leading commas are not permitted, object property names must be
                                // double-quoted strings, and a `:` must separate each property
                                // name and value.
                                if (value == "," || typeof value != "string" || (charIndexBuggy ? value.charAt(0) : value[0]) != "@" || lex() != ":") {
                                    abort();
                                }
                                results[value.slice(1)] = get(lex());
                            }
                            return results;
                        }
                        // Unexpected token encountered.
                        abort();
                    }
                    return value;
                };
                // Internal: Updates a traversed object member.
                var update = function (source, property, callback) {
                    var element = walk(source, property, callback);
                    if (element === undef) {
                        delete source[property];
                    }
                    else {
                        source[property] = element;
                    }
                };
                // Internal: Recursively traverses a parsed JSON object, invoking the
                // `callback` function for each value. This is an implementation of the
                // `Walk(holder, name)` operation defined in ES 5.1 section 15.12.2.
                var walk = function (source, property, callback) {
                    var value = source[property], length;
                    if (typeof value == "object" && value) {
                        // `forEach` can't be used to traverse an array in Opera <= 8.54
                        // because its `Object#hasOwnProperty` implementation returns `false`
                        // for array indices (e.g., `![1, 2, 3].hasOwnProperty("0")`).
                        if (getClass.call(value) == arrayClass) {
                            for (length = value.length; length--;) {
                                update(value, length, callback);
                            }
                        }
                        else {
                            forEach(value, function (property) {
                                update(value, property, callback);
                            });
                        }
                    }
                    return callback.call(source, property, value);
                };
                // Public: `JSON.parse`. See ES 5.1 section 15.12.2.
                exports.parse = function (source, callback) {
                    var result, value;
                    Index = 0;
                    Source = "" + source;
                    result = get(lex());
                    // If a JSON string contains multiple tokens, it is invalid.
                    if (lex() != "$") {
                        abort();
                    }
                    // Reset the parser state.
                    Index = Source = null;
                    return callback && getClass.call(callback) == functionClass ? walk((value = {}, value[""] = result, value), "", callback) : result;
                };
            }
        }
        exports["runInContext"] = runInContext;
        return exports;
    }
    if (freeExports && !isLoader) {
        // Export for CommonJS environments.
        runInContext(root, freeExports);
    }
    else {
        // Export for web browsers and JavaScript engines.
        var nativeJSON = root.JSON, previousJSON = root["JSON3"], isRestored = false;
        var JSON3 = runInContext(root, (root["JSON3"] = {
            // Public: Restores the original value of the global `JSON` object and
            // returns a reference to the `JSON3` object.
            "noConflict": function () {
                if (!isRestored) {
                    isRestored = true;
                    root.JSON = nativeJSON;
                    root["JSON3"] = previousJSON;
                    nativeJSON = previousJSON = null;
                }
                return JSON3;
            }
        }));
        root.JSON = {
            "parse": JSON3.parse,
            "stringify": JSON3.stringify
        };
    }
    // Export for asynchronous module loaders.
    if (isLoader) {
        define(function () {
            return JSON3;
        });
    }
}).call(this);
//##############################################################################
// DomUtils.js
//##############################################################################
(function () {
    /**
     * A few utilities for interacting with the dom.
     * @class DomUtils
     */
    var s = {};
    s.appendToHead = function (el) {
        s.getHead().appendChild(el);
    };
    s.getHead = function () {
        return document.head || document.getElementsByTagName("head")[0];
    };
    s.getBody = function () {
        return document.body || document.getElementsByTagName("body")[0];
    };
    createjs.DomUtils = s;
}());
//##############################################################################
// DataUtils.js
//##############################################################################
(function () {
    /**
     * A few data utilities for formatting different data types.
     * @class DataUtils
     */
    var s = {};
    // static methods
    /**
     * Parse XML using the DOM. This is required when preloading XML or SVG.
     * @method parseXML
     * @param {String} text The raw text or XML that is loaded by XHR.
     * @param {String} type The mime type of the XML. Use "text/xml" for XML, and  "image/svg+xml" for SVG parsing.
     * @return {XML} An XML document
     * @static
     */
    s.parseXML = function (text, type) {
        var xml = null;
        // CocoonJS does not support XML parsing with either method.
        // Most browsers will use DOMParser
        // IE fails on certain SVG files, so we have a fallback below.
        try {
            if (window.DOMParser) {
                var parser = new DOMParser();
                xml = parser.parseFromString(text, type);
            }
        }
        catch (e) {
        }
        // Fallback for IE support.
        if (!xml) {
            try {
                xml = new ActiveXObject("Microsoft.XMLDOM");
                xml.async = false;
                xml.loadXML(text);
            }
            catch (e) {
                xml = null;
            }
        }
        return xml;
    };
    /**
     * Parse a string into an Object.
     * @method parseJSON
     * @param {String} value The loaded JSON string
     * @returns {Object} A JavaScript object.
     */
    s.parseJSON = function (value) {
        if (value == null) {
            return null;
        }
        try {
            return JSON.parse(value);
        }
        catch (e) {
            // TODO; Handle this with a custom error?
            throw e;
        }
    };
    createjs.DataUtils = s;
}());
//##############################################################################
// LoadItem.js
//##############################################################################
this.createjs = this.createjs || {};
(function () {
    "use strict";
    /**
     * All loaders accept an item containing the properties defined in this class. If a raw object is passed instead,
     * it will not be affected, but it must contain at least a {{#crossLink "src:property"}}{{/crossLink}} property. A
     * string path or HTML tag is also acceptable, but it will be automatically converted to a LoadItem using the
     * {{#crossLink "create"}}{{/crossLink}} method by {{#crossLink "AbstractLoader"}}{{/crossLink}}
     * @class LoadItem
     * @constructor
     * @since 0.6.0
     */
    function LoadItem() {
        /**
         * The source of the file that is being loaded. This property is <b>required</b>. The source can either be a
         * string (recommended), or an HTML tag.
         * This can also be an object, but in that case it has to include a type and be handled by a plugin.
         * @property src
         * @type {String}
         * @default null
         */
        this.src = null;
        /**
         * The type file that is being loaded. The type of the file is usually inferred by the extension, but can also
         * be set manually. This is helpful in cases where a file does not have an extension.
         * @property type
         * @type {String}
         * @default null
         */
        this.type = null;
        /**
         * A string identifier which can be used to reference the loaded object. If none is provided, this will be
         * automatically set to the {{#crossLink "src:property"}}{{/crossLink}}.
         * @property id
         * @type {String}
         * @default null
         */
        this.id = null;
        /**
         * Determines if a manifest will maintain the order of this item, in relation to other items in the manifest
         * that have also set the `maintainOrder` property to `true`. This only applies when the max connections has
         * been set above 1 (using {{#crossLink "LoadQueue/setMaxConnections"}}{{/crossLink}}). Everything with this
         * property set to `false` will finish as it is loaded. Ordered items are combined with script tags loading in
         * order when {{#crossLink "LoadQueue/maintainScriptOrder:property"}}{{/crossLink}} is set to `true`.
         * @property maintainOrder
         * @type {Boolean}
         * @default false
         */
        this.maintainOrder = false;
        /**
         * A callback used by JSONP requests that defines what global method to call when the JSONP content is loaded.
         * @property callback
         * @type {String}
         * @default null
         */
        this.callback = null;
        /**
         * An arbitrary data object, which is included with the loaded object.
         * @property data
         * @type {Object}
         * @default null
         */
        this.data = null;
        /**
         * The request method used for HTTP calls. Both {{#crossLink "AbstractLoader/GET:property"}}{{/crossLink}} or
         * {{#crossLink "AbstractLoader/POST:property"}}{{/crossLink}} request types are supported, and are defined as
         * constants on {{#crossLink "AbstractLoader"}}{{/crossLink}}.
         * @property method
         * @type {String}
         * @default get
         */
        this.method = createjs.LoadItem.GET;
        /**
         * An object hash of name/value pairs to send to the server.
         * @property values
         * @type {Object}
         * @default null
         */
        this.values = null;
        /**
         * An object hash of headers to attach to an XHR request. PreloadJS will automatically attach some default
         * headers when required, including "Origin", "Content-Type", and "X-Requested-With". You may override the
         * default headers by including them in your headers object.
         * @property headers
         * @type {Object}
         * @default null
         */
        this.headers = null;
        /**
         * Enable credentials for XHR requests.
         * @property withCredentials
         * @type {Boolean}
         * @default false
         */
        this.withCredentials = false;
        /**
         * Set the mime type of XHR-based requests. This is automatically set to "text/plain; charset=utf-8" for text
         * based files (json, xml, text, css, js).
         * @property mimeType
         * @type {String}
         * @default null
         */
        this.mimeType = null;
        /**
         * Sets the crossOrigin attribute for CORS-enabled images loading cross-domain.
         * @property crossOrigin
         * @type {boolean}
         * @default Anonymous
         */
        this.crossOrigin = null;
        /**
         * The duration in milliseconds to wait before a request times out. This only applies to tag-based and and XHR
         * (level one) loading, as XHR (level 2) provides its own timeout event.
         * @property loadTimeout
         * @type {Number}
         * @default 8000 (8 seconds)
         */
        this.loadTimeout = s.LOAD_TIMEOUT_DEFAULT;
    }
    ;
    var p = LoadItem.prototype = {};
    var s = LoadItem;
    /**
     * Default duration in milliseconds to wait before a request times out. This only applies to tag-based and and XHR
     * (level one) loading, as XHR (level 2) provides its own timeout event.
     * @property LOAD_TIMEOUT_DEFAULT
     * @type {number}
     * @static
     */
    s.LOAD_TIMEOUT_DEFAULT = 8000;
    /**
     * Create a LoadItem.
     * <ul>
     *     <li>String-based items are converted to a LoadItem with a populated {{#crossLink "src:property"}}{{/crossLink}}.</li>
     *     <li>LoadItem instances are returned as-is</li>
     *     <li>Objects are returned with any needed properties added</li>
     * </ul>
     * @method create
     * @param {LoadItem|String|Object} value The load item value
     * @returns {LoadItem|Object}
     * @static
     */
    s.create = function (value) {
        if (typeof value == "string") {
            var item = new LoadItem();
            item.src = value;
            return item;
        }
        else if (value instanceof s) {
            return value;
        }
        else if (value instanceof Object && value.src) {
            if (value.loadTimeout == null) {
                value.loadTimeout = s.LOAD_TIMEOUT_DEFAULT;
            }
            return value;
        }
        else {
            throw new Error("Type not recognized.");
        }
    };
    /**
     * Provides a chainable shortcut method for setting a number of properties on the instance.
     *
     * <h4>Example</h4>
     *
     *      var loadItem = new createjs.LoadItem().set({src:"image.png", maintainOrder:true});
     *
     * @method set
     * @param {Object} props A generic object containing properties to copy to the LoadItem instance.
     * @return {LoadItem} Returns the instance the method is called on (useful for chaining calls.)
    */
    p.set = function (props) {
        for (var n in props) {
            this[n] = props[n];
        }
        return this;
    };
    createjs.LoadItem = s;
}());
//##############################################################################
// RequestUtils.js
//##############################################################################
(function () {
    /**
     * Utilities that assist with parsing load items, and determining file types, etc.
     * @class RequestUtils
     */
    var s = {};
    /**
     * The Regular Expression used to test file URLS for an absolute path.
     * @property ABSOLUTE_PATH
     * @type {RegExp}
     * @static
     */
    s.ABSOLUTE_PATT = /^(?:\w+:)?\/{2}/i;
    /**
     * The Regular Expression used to test file URLS for a relative path.
     * @property RELATIVE_PATH
     * @type {RegExp}
     * @static
     */
    s.RELATIVE_PATT = (/^[./]*?\//i);
    /**
     * The Regular Expression used to test file URLS for an extension. Note that URIs must already have the query string
     * removed.
     * @property EXTENSION_PATT
     * @type {RegExp}
     * @static
     */
    s.EXTENSION_PATT = /\/?[^/]+\.(\w{1,5})$/i;
    /**
     * Parse a file path to determine the information we need to work with it. Currently, PreloadJS needs to know:
     * <ul>
     *     <li>If the path is absolute. Absolute paths start with a protocol (such as `http://`, `file://`, or
     *     `//networkPath`)</li>
     *     <li>If the path is relative. Relative paths start with `../` or `/path` (or similar)</li>
     *     <li>The file extension. This is determined by the filename with an extension. Query strings are dropped, and
     *     the file path is expected to follow the format `name.ext`.</li>
     * </ul>
     * @method parseURI
     * @param {String} path
     * @returns {Object} An Object with an `absolute` and `relative` Boolean values, as well as an optional 'extension`
     * property, which is the lowercase extension.
     * @static
     */
    s.parseURI = function (path) {
        var info = { absolute: false, relative: false };
        if (path == null) {
            return info;
        }
        // Drop the query string
        var queryIndex = path.indexOf("?");
        if (queryIndex > -1) {
            path = path.substr(0, queryIndex);
        }
        // Absolute
        var match;
        if (s.ABSOLUTE_PATT.test(path)) {
            info.absolute = true;
            // Relative
        }
        else if (s.RELATIVE_PATT.test(path)) {
            info.relative = true;
        }
        // Extension
        if (match = path.match(s.EXTENSION_PATT)) {
            info.extension = match[1].toLowerCase();
        }
        return info;
    };
    /**
     * Formats an object into a query string for either a POST or GET request.
     * @method formatQueryString
     * @param {Object} data The data to convert to a query string.
     * @param {Array} [query] Existing name/value pairs to append on to this query.
     * @static
     */
    s.formatQueryString = function (data, query) {
        if (data == null) {
            throw new Error('You must specify data.');
        }
        var params = [];
        for (var n in data) {
            params.push(n + '=' + escape(data[n]));
        }
        if (query) {
            params = params.concat(query);
        }
        return params.join('&');
    };
    /**
     * A utility method that builds a file path using a source and a data object, and formats it into a new path.
     * @method buildPath
     * @param {String} src The source path to add values to.
     * @param {Object} [data] Object used to append values to this request as a query string. Existing parameters on the
     * path will be preserved.
     * @returns {string} A formatted string that contains the path and the supplied parameters.
     * @static
     */
    s.buildPath = function (src, data) {
        if (data == null) {
            return src;
        }
        var query = [];
        var idx = src.indexOf('?');
        if (idx != -1) {
            var q = src.slice(idx + 1);
            query = query.concat(q.split('&'));
        }
        if (idx != -1) {
            return src.slice(0, idx) + '?' + this.formatQueryString(data, query);
        }
        else {
            return src + '?' + this.formatQueryString(data, query);
        }
    };
    /**
     * @method isCrossDomain
     * @param {LoadItem|Object} item A load item with a `src` property.
     * @return {Boolean} If the load item is loading from a different domain than the current location.
     * @static
     */
    s.isCrossDomain = function (item) {
        var target = document.createElement("a");
        target.href = item.src;
        var host = document.createElement("a");
        host.href = location.href;
        var crossdomain = (target.hostname != "") &&
            (target.port != host.port ||
                target.protocol != host.protocol ||
                target.hostname != host.hostname);
        return crossdomain;
    };
    /**
     * @method isLocal
     * @param {LoadItem|Object} item A load item with a `src` property
     * @return {Boolean} If the load item is loading from the "file:" protocol. Assume that the host must be local as
     * well.
     * @static
     */
    s.isLocal = function (item) {
        var target = document.createElement("a");
        target.href = item.src;
        return target.hostname == "" && target.protocol == "file:";
    };
    /**
     * Determine if a specific type should be loaded as a binary file. Currently, only images and items marked
     * specifically as "binary" are loaded as binary. Note that audio is <b>not</b> a binary type, as we can not play
     * back using an audio tag if it is loaded as binary. Plugins can change the item type to binary to ensure they get
     * a binary result to work with. Binary files are loaded using XHR2. Types are defined as static constants on
     * {{#crossLink "AbstractLoader"}}{{/crossLink}}.
     * @method isBinary
     * @param {String} type The item type.
     * @return {Boolean} If the specified type is binary.
     * @static
     */
    s.isBinary = function (type) {
        switch (type) {
            case createjs.AbstractLoader.IMAGE:
            case createjs.AbstractLoader.BINARY:
                return true;
            default:
                return false;
        }
    };
    /**
     * Check if item is a valid HTMLImageElement
     * @method isImageTag
     * @param {Object} item
     * @returns {Boolean}
     * @static
     */
    s.isImageTag = function (item) {
        return item instanceof HTMLImageElement;
    };
    /**
     * Check if item is a valid HTMLAudioElement
     * @method isAudioTag
     * @param {Object} item
     * @returns {Boolean}
     * @static
     */
    s.isAudioTag = function (item) {
        if (window.HTMLAudioElement) {
            return item instanceof HTMLAudioElement;
        }
        else {
            return false;
        }
    };
    /**
     * Check if item is a valid HTMLVideoElement
     * @method isVideoTag
     * @param {Object} item
     * @returns {Boolean}
     * @static
     */
    s.isVideoTag = function (item) {
        if (window.HTMLVideoElement) {
            return item instanceof HTMLVideoElement;
        }
        else {
            return false;
        }
    };
    /**
     * Determine if a specific type is a text-based asset, and should be loaded as UTF-8.
     * @method isText
     * @param {String} type The item type.
     * @return {Boolean} If the specified type is text.
     * @static
     */
    s.isText = function (type) {
        switch (type) {
            case createjs.AbstractLoader.TEXT:
            case createjs.AbstractLoader.JSON:
            case createjs.AbstractLoader.MANIFEST:
            case createjs.AbstractLoader.XML:
            case createjs.AbstractLoader.CSS:
            case createjs.AbstractLoader.SVG:
            case createjs.AbstractLoader.JAVASCRIPT:
            case createjs.AbstractLoader.SPRITESHEET:
                return true;
            default:
                return false;
        }
    };
    /**
     * Determine the type of the object using common extensions. Note that the type can be passed in with the load item
     * if it is an unusual extension.
     * @method getTypeByExtension
     * @param {String} extension The file extension to use to determine the load type.
     * @return {String} The determined load type (for example, <code>AbstractLoader.IMAGE</code>). Will return `null` if
     * the type can not be determined by the extension.
     * @static
     */
    s.getTypeByExtension = function (extension) {
        if (extension == null) {
            return createjs.AbstractLoader.TEXT;
        }
        switch (extension.toLowerCase()) {
            case "jpeg":
            case "jpg":
            case "gif":
            case "png":
            case "webp":
            case "bmp":
                return createjs.AbstractLoader.IMAGE;
            case "ogg":
            case "mp3":
            case "webm":
                return createjs.AbstractLoader.SOUND;
            case "mp4":
            case "webm":
            case "ts":
                return createjs.AbstractLoader.VIDEO;
            case "json":
                return createjs.AbstractLoader.JSON;
            case "xml":
                return createjs.AbstractLoader.XML;
            case "css":
                return createjs.AbstractLoader.CSS;
            case "js":
                return createjs.AbstractLoader.JAVASCRIPT;
            case 'svg':
                return createjs.AbstractLoader.SVG;
            default:
                return createjs.AbstractLoader.TEXT;
        }
    };
    createjs.RequestUtils = s;
}());
//##############################################################################
// AbstractLoader.js
//##############################################################################
this.createjs = this.createjs || {};
(function () {
    "use strict";
    // constructor
    /**
     * The base loader, which defines all the generic methods, properties, and events. All loaders extend this class,
     * including the {{#crossLink "LoadQueue"}}{{/crossLink}}.
     * @class AbstractLoader
     * @param {LoadItem|object|string} loadItem The item to be loaded.
     * @param {Boolean} [preferXHR] Determines if the LoadItem should <em>try</em> and load using XHR, or take a
     * tag-based approach, which can be better in cross-domain situations. Not all loaders can load using one or the
     * other, so this is a suggested directive.
     * @param {String} [type] The type of loader. Loader types are defined as constants on the AbstractLoader class,
     * such as {{#crossLink "IMAGE:property"}}{{/crossLink}}, {{#crossLink "CSS:property"}}{{/crossLink}}, etc.
     * @extends EventDispatcher
     */
    function AbstractLoader(loadItem, preferXHR, type) {
        this.EventDispatcher_constructor();
        // public properties
        /**
         * If the loader has completed loading. This provides a quick check, but also ensures that the different approaches
         * used for loading do not pile up resulting in more than one `complete` {{#crossLink "Event"}}{{/crossLink}}.
         * @property loaded
         * @type {Boolean}
         * @default false
         */
        this.loaded = false;
        /**
         * Determine if the loader was canceled. Canceled loads will not fire complete events. Note that this property
         * is readonly, so {{#crossLink "LoadQueue"}}{{/crossLink}} queues should be closed using {{#crossLink "LoadQueue/close"}}{{/crossLink}}
         * instead.
         * @property canceled
         * @type {Boolean}
         * @default false
         * @readonly
         */
        this.canceled = false;
        /**
         * The current load progress (percentage) for this item. This will be a number between 0 and 1.
         *
         * <h4>Example</h4>
         *
         *     var queue = new createjs.LoadQueue();
         *     queue.loadFile("largeImage.png");
         *     queue.on("progress", function() {
         *         console.log("Progress:", queue.progress, event.progress);
         *     });
         *
         * @property progress
         * @type {Number}
         * @default 0
         */
        this.progress = 0;
        /**
         * The type of item this loader will load. See {{#crossLink "AbstractLoader"}}{{/crossLink}} for a full list of
         * supported types.
         * @property type
         * @type {String}
         */
        this.type = type;
        /**
         * A formatter function that converts the loaded raw result into the final result. For example, the JSONLoader
         * converts a string of text into a JavaScript object. Not all loaders have a resultFormatter, and this property
         * can be overridden to provide custom formatting.
         *
         * Optionally, a resultFormatter can return a callback function in cases where the formatting needs to be
         * asynchronous, such as creating a new image. The callback function is passed 2 parameters, which are callbacks
         * to handle success and error conditions in the resultFormatter. Note that the resultFormatter method is
         * called in the current scope, as well as the success and error callbacks.
         *
         * <h4>Example asynchronous resultFormatter</h4>
         *
         * 	function _formatResult(loader) {
         * 		return function(success, error) {
         * 			if (errorCondition) { error(errorDetailEvent); }
         * 			success(result);
         * 		}
         * 	}
         * @property resultFormatter
         * @type {Function}
         * @default null
         */
        this.resultFormatter = null;
        // protected properties
        /**
         * The {{#crossLink "LoadItem"}}{{/crossLink}} this loader represents. Note that this is null in a {{#crossLink "LoadQueue"}}{{/crossLink}},
         * but will be available on loaders such as {{#crossLink "XMLLoader"}}{{/crossLink}} and {{#crossLink "ImageLoader"}}{{/crossLink}}.
         * @property _item
         * @type {LoadItem|Object}
         * @private
         */
        if (loadItem) {
            this._item = createjs.LoadItem.create(loadItem);
        }
        else {
            this._item = null;
        }
        /**
         * Whether the loader will try and load content using XHR (true) or HTML tags (false).
         * @property _preferXHR
         * @type {Boolean}
         * @private
         */
        this._preferXHR = preferXHR;
        /**
         * The loaded result after it is formatted by an optional {{#crossLink "resultFormatter"}}{{/crossLink}}. For
         * items that are not formatted, this will be the same as the {{#crossLink "_rawResult:property"}}{{/crossLink}}.
         * The result is accessed using the {{#crossLink "getResult"}}{{/crossLink}} method.
         * @property _result
         * @type {Object|String}
         * @private
         */
        this._result = null;
        /**
         * The loaded result before it is formatted. The rawResult is accessed using the {{#crossLink "getResult"}}{{/crossLink}}
         * method, and passing `true`.
         * @property _rawResult
         * @type {Object|String}
         * @private
         */
        this._rawResult = null;
        /**
         * A list of items that loaders load behind the scenes. This does not include the main item the loader is
         * responsible for loading. Examples of loaders that have sub-items include the {{#crossLink "SpriteSheetLoader"}}{{/crossLink}} and
         * {{#crossLink "ManifestLoader"}}{{/crossLink}}.
         * @property _loadItems
         * @type {null}
         * @protected
         */
        this._loadedItems = null;
        /**
         * The attribute the items loaded using tags use for the source.
         * @type {string}
         * @default null
         * @private
         */
        this._tagSrcAttribute = null;
        /**
         * An HTML tag (or similar) that a loader may use to load HTML content, such as images, scripts, etc.
         * @property _tag
         * @type {Object}
         * @private
         */
        this._tag = null;
    }
    ;
    var p = createjs.extend(AbstractLoader, createjs.EventDispatcher);
    var s = AbstractLoader;
    // TODO: deprecated
    // p.initialize = function() {}; // searchable for devs wondering where it is. REMOVED. See docs for details.
    /**
     * Defines a POST request, use for a method value when loading data.
     * @property POST
     * @type {string}
     * @default post
     * @static
     */
    s.POST = "POST";
    /**
     * Defines a GET request, use for a method value when loading data.
     * @property GET
     * @type {string}
     * @default get
     * @static
     */
    s.GET = "GET";
    /**
     * The preload type for generic binary types. Note that images are loaded as binary files when using XHR.
     * @property BINARY
     * @type {String}
     * @default binary
     * @static
     * @since 0.6.0
     */
    s.BINARY = "binary";
    /**
     * The preload type for css files. CSS files are loaded using a &lt;link&gt; when loaded with XHR, or a
     * &lt;style&gt; tag when loaded with tags.
     * @property CSS
     * @type {String}
     * @default css
     * @static
     * @since 0.6.0
     */
    s.CSS = "css";
    /**
     * The preload type for image files, usually png, gif, or jpg/jpeg. Images are loaded into an &lt;image&gt; tag.
     * @property IMAGE
     * @type {String}
     * @default image
     * @static
     * @since 0.6.0
     */
    s.IMAGE = "image";
    /**
     * The preload type for javascript files, usually with the "js" file extension. JavaScript files are loaded into a
     * &lt;script&gt; tag.
     *
     * Since version 0.4.1+, due to how tag-loaded scripts work, all JavaScript files are automatically injected into
     * the body of the document to maintain parity between XHR and tag-loaded scripts. In version 0.4.0 and earlier,
     * only tag-loaded scripts are injected.
     * @property JAVASCRIPT
     * @type {String}
     * @default javascript
     * @static
     * @since 0.6.0
     */
    s.JAVASCRIPT = "javascript";
    /**
     * The preload type for json files, usually with the "json" file extension. JSON data is loaded and parsed into a
     * JavaScript object. Note that if a `callback` is present on the load item, the file will be loaded with JSONP,
     * no matter what the {{#crossLink "LoadQueue/preferXHR:property"}}{{/crossLink}} property is set to, and the JSON
     * must contain a matching wrapper function.
     * @property JSON
     * @type {String}
     * @default json
     * @static
     * @since 0.6.0
     */
    s.JSON = "json";
    /**
     * The preload type for jsonp files, usually with the "json" file extension. JSON data is loaded and parsed into a
     * JavaScript object. You are required to pass a callback parameter that matches the function wrapper in the JSON.
     * Note that JSONP will always be used if there is a callback present, no matter what the {{#crossLink "LoadQueue/preferXHR:property"}}{{/crossLink}}
     * property is set to.
     * @property JSONP
     * @type {String}
     * @default jsonp
     * @static
     * @since 0.6.0
     */
    s.JSONP = "jsonp";
    /**
     * The preload type for json-based manifest files, usually with the "json" file extension. The JSON data is loaded
     * and parsed into a JavaScript object. PreloadJS will then look for a "manifest" property in the JSON, which is an
     * Array of files to load, following the same format as the {{#crossLink "LoadQueue/loadManifest"}}{{/crossLink}}
     * method. If a "callback" is specified on the manifest object, then it will be loaded using JSONP instead,
     * regardless of what the {{#crossLink "LoadQueue/preferXHR:property"}}{{/crossLink}} property is set to.
     * @property MANIFEST
     * @type {String}
     * @default manifest
     * @static
     * @since 0.6.0
     */
    s.MANIFEST = "manifest";
    /**
     * The preload type for sound files, usually mp3, ogg, or wav. When loading via tags, audio is loaded into an
     * &lt;audio&gt; tag.
     * @property SOUND
     * @type {String}
     * @default sound
     * @static
     * @since 0.6.0
     */
    s.SOUND = "sound";
    /**
     * The preload type for video files, usually mp4, ts, or ogg. When loading via tags, video is loaded into an
     * &lt;video&gt; tag.
     * @property VIDEO
     * @type {String}
     * @default video
     * @static
     * @since 0.6.0
     */
    s.VIDEO = "video";
    /**
     * The preload type for SpriteSheet files. SpriteSheet files are JSON files that contain string image paths.
     * @property SPRITESHEET
     * @type {String}
     * @default spritesheet
     * @static
     * @since 0.6.0
     */
    s.SPRITESHEET = "spritesheet";
    /**
     * The preload type for SVG files.
     * @property SVG
     * @type {String}
     * @default svg
     * @static
     * @since 0.6.0
     */
    s.SVG = "svg";
    /**
     * The preload type for text files, which is also the default file type if the type can not be determined. Text is
     * loaded as raw text.
     * @property TEXT
     * @type {String}
     * @default text
     * @static
     * @since 0.6.0
     */
    s.TEXT = "text";
    /**
     * The preload type for xml files. XML is loaded into an XML document.
     * @property XML
     * @type {String}
     * @default xml
     * @static
     * @since 0.6.0
     */
    s.XML = "xml";
    // Events
    /**
     * The {{#crossLink "ProgressEvent"}}{{/crossLink}} that is fired when the overall progress changes. Prior to
     * version 0.6.0, this was just a regular {{#crossLink "Event"}}{{/crossLink}}.
     * @event progress
     * @since 0.3.0
     */
    /**
     * The {{#crossLink "Event"}}{{/crossLink}} that is fired when a load starts.
     * @event loadstart
     * @param {Object} target The object that dispatched the event.
     * @param {String} type The event type.
     * @since 0.3.1
     */
    /**
     * The {{#crossLink "Event"}}{{/crossLink}} that is fired when the entire queue has been loaded.
     * @event complete
     * @param {Object} target The object that dispatched the event.
     * @param {String} type The event type.
     * @since 0.3.0
     */
    /**
     * The {{#crossLink "ErrorEvent"}}{{/crossLink}} that is fired when the loader encounters an error. If the error was
     * encountered by a file, the event will contain the item that caused the error. Prior to version 0.6.0, this was
     * just a regular {{#crossLink "Event"}}{{/crossLink}}.
     * @event error
     * @since 0.3.0
     */
    /**
     * The {{#crossLink "Event"}}{{/crossLink}} that is fired when the loader encounters an internal file load error.
     * This enables loaders to maintain internal queues, and surface file load errors.
     * @event fileerror
     * @param {Object} target The object that dispatched the event.
     * @param {String} type The even type ("fileerror")
     * @param {LoadItem|object} The item that encountered the error
     * @since 0.6.0
     */
    /**
     * The {{#crossLink "Event"}}{{/crossLink}} that is fired when a loader internally loads a file. This enables
     * loaders such as {{#crossLink "ManifestLoader"}}{{/crossLink}} to maintain internal {{#crossLink "LoadQueue"}}{{/crossLink}}s
     * and notify when they have loaded a file. The {{#crossLink "LoadQueue"}}{{/crossLink}} class dispatches a
     * slightly different {{#crossLink "LoadQueue/fileload:event"}}{{/crossLink}} event.
     * @event fileload
     * @param {Object} target The object that dispatched the event.
     * @param {String} type The event type ("fileload")
     * @param {Object} item The file item which was specified in the {{#crossLink "LoadQueue/loadFile"}}{{/crossLink}}
     * or {{#crossLink "LoadQueue/loadManifest"}}{{/crossLink}} call. If only a string path or tag was specified, the
     * object will contain that value as a `src` property.
     * @param {Object} result The HTML tag or parsed result of the loaded item.
     * @param {Object} rawResult The unprocessed result, usually the raw text or binary data before it is converted
     * to a usable object.
     * @since 0.6.0
     */
    /**
     * The {{#crossLink "Event"}}{{/crossLink}} that is fired after the internal request is created, but before a load.
     * This allows updates to the loader for specific loading needs, such as binary or XHR image loading.
     * @event initialize
     * @param {Object} target The object that dispatched the event.
     * @param {String} type The event type ("initialize")
     * @param {AbstractLoader} loader The loader that has been initialized.
     */
    /**
     * Get a reference to the manifest item that is loaded by this loader. In some cases this will be the value that was
     * passed into {{#crossLink "LoadQueue"}}{{/crossLink}} using {{#crossLink "LoadQueue/loadFile"}}{{/crossLink}} or
     * {{#crossLink "LoadQueue/loadManifest"}}{{/crossLink}}. However if only a String path was passed in, then it will
     * be a {{#crossLink "LoadItem"}}{{/crossLink}}.
     * @method getItem
     * @return {Object} The manifest item that this loader is responsible for loading.
     * @since 0.6.0
     */
    p.getItem = function () {
        return this._item;
    };
    /**
     * Get a reference to the content that was loaded by the loader (only available after the {{#crossLink "complete:event"}}{{/crossLink}}
     * event is dispatched.
     * @method getResult
     * @param {Boolean} [raw=false] Determines if the returned result will be the formatted content, or the raw loaded
     * data (if it exists).
     * @return {Object}
     * @since 0.6.0
     */
    p.getResult = function (raw) {
        return raw ? this._rawResult : this._result;
    };
    /**
     * Return the `tag` this object creates or uses for loading.
     * @method getTag
     * @return {Object} The tag instance
     * @since 0.6.0
     */
    p.getTag = function () {
        return this._tag;
    };
    /**
     * Set the `tag` this item uses for loading.
     * @method setTag
     * @param {Object} tag The tag instance
     * @since 0.6.0
     */
    p.setTag = function (tag) {
        this._tag = tag;
    };
    /**
     * Begin loading the item. This method is required when using a loader by itself.
     *
     * <h4>Example</h4>
     *
     *      var queue = new createjs.LoadQueue();
     *      queue.on("complete", handleComplete);
     *      queue.loadManifest(fileArray, false); // Note the 2nd argument that tells the queue not to start loading yet
     *      queue.load();
     *
     * @method load
     */
    p.load = function () {
        this._createRequest();
        this._request.on("complete", this, this);
        this._request.on("progress", this, this);
        this._request.on("loadStart", this, this);
        this._request.on("abort", this, this);
        this._request.on("timeout", this, this);
        this._request.on("error", this, this);
        var evt = new createjs.Event("initialize");
        evt.loader = this._request;
        this.dispatchEvent(evt);
        this._request.load();
    };
    /**
     * Close the the item. This will stop any open requests (although downloads using HTML tags may still continue in
     * the background), but events will not longer be dispatched.
     * @method cancel
     */
    p.cancel = function () {
        this.canceled = true;
        this.destroy();
    };
    /**
     * Clean up the loader.
     * @method destroy
     */
    p.destroy = function () {
        if (this._request) {
            this._request.removeAllEventListeners();
            this._request.destroy();
        }
        this._request = null;
        this._item = null;
        this._rawResult = null;
        this._result = null;
        this._loadItems = null;
        this.removeAllEventListeners();
    };
    /**
     * Get any items loaded internally by the loader. The enables loaders such as {{#crossLink "ManifestLoader"}}{{/crossLink}}
     * to expose items it loads internally.
     * @method getLoadedItems
     * @return {Array} A list of the items loaded by the loader.
     * @since 0.6.0
     */
    p.getLoadedItems = function () {
        return this._loadedItems;
    };
    // Private methods
    /**
     * Create an internal request used for loading. By default, an {{#crossLink "XHRRequest"}}{{/crossLink}} or
     * {{#crossLink "TagRequest"}}{{/crossLink}} is created, depending on the value of {{#crossLink "preferXHR:property"}}{{/crossLink}}.
     * Other loaders may override this to use different request types, such as {{#crossLink "ManifestLoader"}}{{/crossLink}},
     * which uses {{#crossLink "JSONLoader"}}{{/crossLink}} or {{#crossLink "JSONPLoader"}}{{/crossLink}} under the hood.
     * @method _createRequest
     * @protected
     */
    p._createRequest = function () {
        if (!this._preferXHR) {
            this._request = new createjs.TagRequest(this._item, this._tag || this._createTag(), this._tagSrcAttribute);
        }
        else {
            this._request = new createjs.XHRRequest(this._item);
        }
    };
    /**
     * Create the HTML tag used for loading. This method does nothing by default, and needs to be implemented
     * by loaders that require tag loading.
     * @method _createTag
     * @param {String} src The tag source
     * @return {HTMLElement} The tag that was created
     * @protected
     */
    p._createTag = function (src) { return null; };
    /**
     * Dispatch a loadstart {{#crossLink "Event"}}{{/crossLink}}. Please see the {{#crossLink "AbstractLoader/loadstart:event"}}{{/crossLink}}
     * event for details on the event payload.
     * @method _sendLoadStart
     * @protected
     */
    p._sendLoadStart = function () {
        if (this._isCanceled()) {
            return;
        }
        this.dispatchEvent("loadstart");
    };
    /**
     * Dispatch a {{#crossLink "ProgressEvent"}}{{/crossLink}}.
     * @method _sendProgress
     * @param {Number | Object} value The progress of the loaded item, or an object containing <code>loaded</code>
     * and <code>total</code> properties.
     * @protected
     */
    p._sendProgress = function (value) {
        if (this._isCanceled()) {
            return;
        }
        var event = null;
        if (typeof (value) == "number") {
            this.progress = value;
            event = new createjs.ProgressEvent(this.progress);
        }
        else {
            event = value;
            this.progress = value.loaded / value.total;
            event.progress = this.progress;
            if (isNaN(this.progress) || this.progress == Infinity) {
                this.progress = 0;
            }
        }
        this.hasEventListener("progress") && this.dispatchEvent(event);
    };
    /**
     * Dispatch a complete {{#crossLink "Event"}}{{/crossLink}}. Please see the {{#crossLink "AbstractLoader/complete:event"}}{{/crossLink}} event
     * @method _sendComplete
     * @protected
     */
    p._sendComplete = function () {
        if (this._isCanceled()) {
            return;
        }
        this.loaded = true;
        var event = new createjs.Event("complete");
        event.rawResult = this._rawResult;
        if (this._result != null) {
            event.result = this._result;
        }
        this.dispatchEvent(event);
    };
    /**
     * Dispatch an error {{#crossLink "Event"}}{{/crossLink}}. Please see the {{#crossLink "AbstractLoader/error:event"}}{{/crossLink}}
     * event for details on the event payload.
     * @method _sendError
     * @param {ErrorEvent} event The event object containing specific error properties.
     * @protected
     */
    p._sendError = function (event) {
        if (this._isCanceled() || !this.hasEventListener("error")) {
            return;
        }
        if (event == null) {
            event = new createjs.ErrorEvent("PRELOAD_ERROR_EMPTY"); // TODO: Populate error
        }
        this.dispatchEvent(event);
    };
    /**
     * Determine if the load has been canceled. This is important to ensure that method calls or asynchronous events
     * do not cause issues after the queue has been cleaned up.
     * @method _isCanceled
     * @return {Boolean} If the loader has been canceled.
     * @protected
     */
    p._isCanceled = function () {
        if (window.createjs == null || this.canceled) {
            return true;
        }
        return false;
    };
    /**
     * A custom result formatter function, which is called just before a request dispatches its complete event. Most
     * loader types already have an internal formatter, but this can be user-overridden for custom formatting. The
     * formatted result will be available on Loaders using {{#crossLink "getResult"}}{{/crossLink}}, and passing `true`.
     * @property resultFormatter
     * @type Function
     * @return {Object} The formatted result
     * @since 0.6.0
     */
    p.resultFormatter = null;
    /**
     * Handle events from internal requests. By default, loaders will handle, and redispatch the necessary events, but
     * this method can be overridden for custom behaviours.
     * @method handleEvent
     * @param {Event} event The event that the internal request dispatches.
     * @protected
     * @since 0.6.0
     */
    p.handleEvent = function (event) {
        switch (event.type) {
            case "complete":
                this._rawResult = event.target._response;
                var result = this.resultFormatter && this.resultFormatter(this);
                if (result instanceof Function) {
                    result.call(this, createjs.proxy(this._resultFormatSuccess, this), createjs.proxy(this._resultFormatFailed, this));
                }
                else {
                    this._result = result || this._rawResult;
                    this._sendComplete();
                }
                break;
            case "progress":
                this._sendProgress(event);
                break;
            case "error":
                this._sendError(event);
                break;
            case "loadstart":
                this._sendLoadStart();
                break;
            case "abort":
            case "timeout":
                if (!this._isCanceled()) {
                    this.dispatchEvent(new createjs.ErrorEvent("PRELOAD_" + event.type.toUpperCase() + "_ERROR"));
                }
                break;
        }
    };
    /**
     * The "success" callback passed to {{#crossLink "AbstractLoader/resultFormatter"}}{{/crossLink}} asynchronous
     * functions.
     * @method _resultFormatSuccess
     * @param {Object} result The formatted result
     * @private
     */
    p._resultFormatSuccess = function (result) {
        this._result = result;
        this._sendComplete();
    };
    /**
     * The "error" callback passed to {{#crossLink "AbstractLoader/resultFormatter"}}{{/crossLink}} asynchronous
     * functions.
     * @method _resultFormatSuccess
     * @param {Object} error The error event
     * @private
     */
    p._resultFormatFailed = function (event) {
        this._sendError(event);
    };
    /**
     * @method buildPath
     * @protected
     * @deprecated Use the {{#crossLink "RequestUtils"}}{{/crossLink}} method {{#crossLink "RequestUtils/buildPath"}}{{/crossLink}}
     * instead.
     */
    p.buildPath = function (src, data) {
        return createjs.RequestUtils.buildPath(src, data);
    };
    /**
     * @method toString
     * @return {String} a string representation of the instance.
     */
    p.toString = function () {
        return "[PreloadJS AbstractLoader]";
    };
    createjs.AbstractLoader = createjs.promote(AbstractLoader, "EventDispatcher");
}());
//##############################################################################
// AbstractMediaLoader.js
//##############################################################################
this.createjs = this.createjs || {};
(function () {
    "use strict";
    // constructor
    /**
     * The AbstractMediaLoader is a base class that handles some of the shared methods and properties of loaders that
     * handle HTML media elements, such as Video and Audio.
     * @class AbstractMediaLoader
     * @param {LoadItem|Object} loadItem
     * @param {Boolean} preferXHR
     * @param {String} type The type of media to load. Usually "video" or "audio".
     * @extends AbstractLoader
     * @constructor
     */
    function AbstractMediaLoader(loadItem, preferXHR, type) {
        this.AbstractLoader_constructor(loadItem, preferXHR, type);
        // public properties
        this.resultFormatter = this._formatResult;
        // protected properties
        this._tagSrcAttribute = "src";
        this.on("initialize", this._updateXHR, this);
    }
    ;
    var p = createjs.extend(AbstractMediaLoader, createjs.AbstractLoader);
    // static properties
    // public methods
    p.load = function () {
        // TagRequest will handle most of this, but Sound / Video need a few custom properties, so just handle them here.
        if (!this._tag) {
            this._tag = this._createTag(this._item.src);
        }
        this._tag.preload = "auto";
        this._tag.load();
        this.AbstractLoader_load();
    };
    // protected methods
    /**
     * Creates a new tag for loading if it doesn't exist yet.
     * @method _createTag
     * @private
     */
    p._createTag = function () { };
    p._createRequest = function () {
        if (!this._preferXHR) {
            this._request = new createjs.MediaTagRequest(this._item, this._tag || this._createTag(), this._tagSrcAttribute);
        }
        else {
            this._request = new createjs.XHRRequest(this._item);
        }
    };
    // protected methods
    /**
     * Before the item loads, set its mimeType and responseType.
     * @property _updateXHR
     * @param {Event} event
     * @private
     */
    p._updateXHR = function (event) {
        // Only exists for XHR
        if (event.loader.setResponseType) {
            event.loader.setResponseType("blob");
        }
    };
    /**
     * The result formatter for media files.
     * @method _formatResult
     * @param {AbstractLoader} loader
     * @returns {HTMLVideoElement|HTMLAudioElement}
     * @private
     */
    p._formatResult = function (loader) {
        this._tag.removeEventListener && this._tag.removeEventListener("canplaythrough", this._loadedHandler);
        this._tag.onstalled = null;
        if (this._preferXHR) {
            var URL = window.URL || window.webkitURL;
            var result = loader.getResult(true);
            loader.getTag().src = URL.createObjectURL(result);
        }
        return loader.getTag();
    };
    createjs.AbstractMediaLoader = createjs.promote(AbstractMediaLoader, "AbstractLoader");
}());
//##############################################################################
// AbstractRequest.js
//##############################################################################
this.createjs = this.createjs || {};
(function () {
    "use strict";
    /**
     * A base class for actual data requests, such as {{#crossLink "XHRRequest"}}{{/crossLink}}, {{#crossLink "TagRequest"}}{{/crossLink}},
     * and {{#crossLink "MediaRequest"}}{{/crossLink}}. PreloadJS loaders will typically use a data loader under the
     * hood to get data.
     * @class AbstractRequest
     * @param {LoadItem} item
     * @constructor
     */
    var AbstractRequest = function (item) {
        this._item = item;
    };
    var p = createjs.extend(AbstractRequest, createjs.EventDispatcher);
    // public methods
    /**
     * Begin a load.
     * @method load
     */
    p.load = function () { };
    /**
     * Clean up a request.
     * @method destroy
     */
    p.destroy = function () { };
    /**
     * Cancel an in-progress request.
     * @method cancel
     */
    p.cancel = function () { };
    createjs.AbstractRequest = createjs.promote(AbstractRequest, "EventDispatcher");
}());
//##############################################################################
// TagRequest.js
//##############################################################################
this.createjs = this.createjs || {};
(function () {
    "use strict";
    // constructor
    /**
     * An {{#crossLink "AbstractRequest"}}{{/crossLink}} that loads HTML tags, such as images and scripts.
     * @class TagRequest
     * @param {LoadItem} loadItem
     * @param {HTMLElement} tag
     * @param {String} srcAttribute The tag attribute that specifies the source, such as "src", "href", etc.
     */
    function TagRequest(loadItem, tag, srcAttribute) {
        this.AbstractRequest_constructor(loadItem);
        // protected properties
        /**
         * The HTML tag instance that is used to load.
         * @property _tag
         * @type {HTMLElement}
         * @protected
         */
        this._tag = tag;
        /**
         * The tag attribute that specifies the source, such as "src", "href", etc.
         * @property _tagSrcAttribute
         * @type {String}
         * @protected
         */
        this._tagSrcAttribute = srcAttribute;
        /**
         * A method closure used for handling the tag load event.
         * @property _loadedHandler
         * @type {Function}
         * @private
         */
        this._loadedHandler = createjs.proxy(this._handleTagComplete, this);
        /**
         * Determines if the element was added to the DOM automatically by PreloadJS, so it can be cleaned up after.
         * @property _addedToDOM
         * @type {Boolean}
         * @private
         */
        this._addedToDOM = false;
        /**
         * Determines what the tags initial style.visibility was, so we can set it correctly after a load.
         *
         * @type {null}
         * @private
         */
        this._startTagVisibility = null;
    }
    ;
    var p = createjs.extend(TagRequest, createjs.AbstractRequest);
    // public methods
    p.load = function () {
        this._tag.onload = createjs.proxy(this._handleTagComplete, this);
        this._tag.onreadystatechange = createjs.proxy(this._handleReadyStateChange, this);
        this._tag.onerror = createjs.proxy(this._handleError, this);
        var evt = new createjs.Event("initialize");
        evt.loader = this._tag;
        this.dispatchEvent(evt);
        this._hideTag();
        this._loadTimeout = setTimeout(createjs.proxy(this._handleTimeout, this), this._item.loadTimeout);
        this._tag[this._tagSrcAttribute] = this._item.src;
        // wdg:: Append the tag AFTER setting the src, or SVG loading on iOS will fail.
        if (this._tag.parentNode == null) {
            window.document.body.appendChild(this._tag);
            this._addedToDOM = true;
        }
    };
    p.destroy = function () {
        this._clean();
        this._tag = null;
        this.AbstractRequest_destroy();
    };
    // private methods
    /**
     * Handle the readyStateChange event from a tag. We need this in place of the `onload` callback (mainly SCRIPT
     * and LINK tags), but other cases may exist.
     * @method _handleReadyStateChange
     * @private
     */
    p._handleReadyStateChange = function () {
        clearTimeout(this._loadTimeout);
        // This is strictly for tags in browsers that do not support onload.
        var tag = this._tag;
        // Complete is for old IE support.
        if (tag.readyState == "loaded" || tag.readyState == "complete") {
            this._handleTagComplete();
        }
    };
    /**
     * Handle any error events from the tag.
     * @method _handleError
     * @protected
     */
    p._handleError = function () {
        this._clean();
        this.dispatchEvent("error");
    };
    /**
     * Handle the tag's onload callback.
     * @method _handleTagComplete
     * @private
     */
    p._handleTagComplete = function () {
        this._rawResult = this._tag;
        this._result = this.resultFormatter && this.resultFormatter(this) || this._rawResult;
        this._clean();
        this._showTag();
        this.dispatchEvent("complete");
    };
    /**
     * The tag request has not loaded within the time specified in loadTimeout.
     * @method _handleError
     * @param {Object} event The XHR error event.
     * @private
     */
    p._handleTimeout = function () {
        this._clean();
        this.dispatchEvent(new createjs.Event("timeout"));
    };
    /**
     * Remove event listeners, but don't destroy the request object
     * @method _clean
     * @private
     */
    p._clean = function () {
        this._tag.onload = null;
        this._tag.onreadystatechange = null;
        this._tag.onerror = null;
        if (this._addedToDOM && this._tag.parentNode != null) {
            this._tag.parentNode.removeChild(this._tag);
        }
        clearTimeout(this._loadTimeout);
    };
    p._hideTag = function () {
        this._startTagVisibility = this._tag.style.visibility;
        this._tag.style.visibility = "hidden";
    };
    p._showTag = function () {
        this._tag.style.visibility = this._startTagVisibility;
    };
    /**
     * Handle a stalled audio event. The main place this happens is with HTMLAudio in Chrome when playing back audio
     * that is already in a load, but not complete.
     * @method _handleStalled
     * @private
     */
    p._handleStalled = function () {
        //Ignore, let the timeout take care of it. Sometimes its not really stopped.
    };
    createjs.TagRequest = createjs.promote(TagRequest, "AbstractRequest");
}());
//##############################################################################
// MediaTagRequest.js
//##############################################################################
this.createjs = this.createjs || {};
(function () {
    "use strict";
    // constructor
    /**
     * An {{#crossLink "TagRequest"}}{{/crossLink}} that loads HTML tags for video and audio.
     * @class MediaTagRequest
     * @param {LoadItem} loadItem
     * @param {HTMLAudioElement|HTMLVideoElement} tag
     * @param {String} srcAttribute The tag attribute that specifies the source, such as "src", "href", etc.
     * @constructor
     */
    function MediaTagRequest(loadItem, tag, srcAttribute) {
        this.AbstractRequest_constructor(loadItem);
        // protected properties
        this._tag = tag;
        this._tagSrcAttribute = srcAttribute;
        this._loadedHandler = createjs.proxy(this._handleTagComplete, this);
    }
    ;
    var p = createjs.extend(MediaTagRequest, createjs.TagRequest);
    var s = MediaTagRequest;
    // public methods
    p.load = function () {
        var sc = createjs.proxy(this._handleStalled, this);
        this._stalledCallback = sc;
        var pc = createjs.proxy(this._handleProgress, this);
        this._handleProgress = pc;
        this._tag.addEventListener("stalled", sc);
        this._tag.addEventListener("progress", pc);
        // This will tell us when audio is buffered enough to play through, but not when its loaded.
        // The tag doesn't keep loading in Chrome once enough has buffered, and we have decided that behaviour is sufficient.
        this._tag.addEventListener && this._tag.addEventListener("canplaythrough", this._loadedHandler, false); // canplaythrough callback doesn't work in Chrome, so we use an event.
        this.TagRequest_load();
    };
    // private methods
    p._handleReadyStateChange = function () {
        clearTimeout(this._loadTimeout);
        // This is strictly for tags in browsers that do not support onload.
        var tag = this._tag;
        // Complete is for old IE support.
        if (tag.readyState == "loaded" || tag.readyState == "complete") {
            this._handleTagComplete();
        }
    };
    p._handleStalled = function () {
        //Ignore, let the timeout take care of it. Sometimes its not really stopped.
    };
    /**
     * An XHR request has reported progress.
     * @method _handleProgress
     * @param {Object} event The XHR progress event.
     * @private
     */
    p._handleProgress = function (event) {
        if (!event || event.loaded > 0 && event.total == 0) {
            return; // Sometimes we get no "total", so just ignore the progress event.
        }
        var newEvent = new createjs.ProgressEvent(event.loaded, event.total);
        this.dispatchEvent(newEvent);
    };
    // protected methods
    p._clean = function () {
        this._tag.removeEventListener && this._tag.removeEventListener("canplaythrough", this._loadedHandler);
        this._tag.removeEventListener("stalled", this._stalledCallback);
        this._tag.removeEventListener("progress", this._progressCallback);
        this.TagRequest__clean();
    };
    createjs.MediaTagRequest = createjs.promote(MediaTagRequest, "TagRequest");
}());
//##############################################################################
// XHRRequest.js
//##############################################################################
this.createjs = this.createjs || {};
(function () {
    "use strict";
    // constructor
    /**
     * A preloader that loads items using XHR requests, usually XMLHttpRequest. However XDomainRequests will be used
     * for cross-domain requests if possible, and older versions of IE fall back on to ActiveX objects when necessary.
     * XHR requests load the content as text or binary data, provide progress and consistent completion events, and
     * can be canceled during load. Note that XHR is not supported in IE 6 or earlier, and is not recommended for
     * cross-domain loading.
     * @class XHRRequest
     * @constructor
     * @param {Object} item The object that defines the file to load. Please see the {{#crossLink "LoadQueue/loadFile"}}{{/crossLink}}
     * for an overview of supported file properties.
     * @extends AbstractLoader
     */
    function XHRRequest(item) {
        this.AbstractRequest_constructor(item);
        // protected properties
        /**
         * A reference to the XHR request used to load the content.
         * @property _request
         * @type {XMLHttpRequest | XDomainRequest | ActiveX.XMLHTTP}
         * @private
         */
        this._request = null;
        /**
         * A manual load timeout that is used for browsers that do not support the onTimeout event on XHR (XHR level 1,
         * typically IE9).
         * @property _loadTimeout
         * @type {Number}
         * @private
         */
        this._loadTimeout = null;
        /**
         * The browser's XHR (XMLHTTPRequest) version. Supported versions are 1 and 2. There is no official way to detect
         * the version, so we use capabilities to make a best guess.
         * @property _xhrLevel
         * @type {Number}
         * @default 1
         * @private
         */
        this._xhrLevel = 1;
        /**
         * The response of a loaded file. This is set because it is expensive to look up constantly. This property will be
         * null until the file is loaded.
         * @property _response
         * @type {mixed}
         * @private
         */
        this._response = null;
        /**
         * The response of the loaded file before it is modified. In most cases, content is converted from raw text to
         * an HTML tag or a formatted object which is set to the <code>result</code> property, but the developer may still
         * want to access the raw content as it was loaded.
         * @property _rawResponse
         * @type {String|Object}
         * @private
         */
        this._rawResponse = null;
        this._canceled = false;
        // Setup our event handlers now.
        this._handleLoadStartProxy = createjs.proxy(this._handleLoadStart, this);
        this._handleProgressProxy = createjs.proxy(this._handleProgress, this);
        this._handleAbortProxy = createjs.proxy(this._handleAbort, this);
        this._handleErrorProxy = createjs.proxy(this._handleError, this);
        this._handleTimeoutProxy = createjs.proxy(this._handleTimeout, this);
        this._handleLoadProxy = createjs.proxy(this._handleLoad, this);
        this._handleReadyStateChangeProxy = createjs.proxy(this._handleReadyStateChange, this);
        if (!this._createXHR(item)) {
            //TODO: Throw error?
        }
    }
    ;
    var p = createjs.extend(XHRRequest, createjs.AbstractRequest);
    // static properties
    /**
     * A list of XMLHTTP object IDs to try when building an ActiveX object for XHR requests in earlier versions of IE.
     * @property ACTIVEX_VERSIONS
     * @type {Array}
     * @since 0.4.2
     * @private
     */
    XHRRequest.ACTIVEX_VERSIONS = [
        "Msxml2.XMLHTTP.6.0",
        "Msxml2.XMLHTTP.5.0",
        "Msxml2.XMLHTTP.4.0",
        "MSXML2.XMLHTTP.3.0",
        "MSXML2.XMLHTTP",
        "Microsoft.XMLHTTP"
    ];
    // Public methods
    /**
     * Look up the loaded result.
     * @method getResult
     * @param {Boolean} [raw=false] Return a raw result instead of a formatted result. This applies to content
     * loaded via XHR such as scripts, XML, CSS, and Images. If there is no raw result, the formatted result will be
     * returned instead.
     * @return {Object} A result object containing the content that was loaded, such as:
     * <ul>
     *      <li>An image tag (&lt;image /&gt;) for images</li>
     *      <li>A script tag for JavaScript (&lt;script /&gt;). Note that scripts loaded with tags may be added to the
     *      HTML head.</li>
     *      <li>A style tag for CSS (&lt;style /&gt;)</li>
     *      <li>Raw text for TEXT</li>
     *      <li>A formatted JavaScript object defined by JSON</li>
     *      <li>An XML document</li>
     *      <li>An binary arraybuffer loaded by XHR</li>
     * </ul>
     * Note that if a raw result is requested, but not found, the result will be returned instead.
     */
    p.getResult = function (raw) {
        if (raw && this._rawResponse) {
            return this._rawResponse;
        }
        return this._response;
    };
    // Overrides abstract method in AbstractRequest
    p.cancel = function () {
        this.canceled = true;
        this._clean();
        this._request.abort();
    };
    // Overrides abstract method in AbstractLoader
    p.load = function () {
        if (this._request == null) {
            this._handleError();
            return;
        }
        //Events
        if (this._request.addEventListener != null) {
            this._request.addEventListener("loadstart", this._handleLoadStartProxy, false);
            this._request.addEventListener("progress", this._handleProgressProxy, false);
            this._request.addEventListener("abort", this._handleAbortProxy, false);
            this._request.addEventListener("error", this._handleErrorProxy, false);
            this._request.addEventListener("timeout", this._handleTimeoutProxy, false);
            // Note: We don't get onload in all browsers (earlier FF and IE). onReadyStateChange handles these.
            this._request.addEventListener("load", this._handleLoadProxy, false);
            this._request.addEventListener("readystatechange", this._handleReadyStateChangeProxy, false);
        }
        else {
            // IE9 support
            this._request.onloadstart = this._handleLoadStartProxy;
            this._request.onprogress = this._handleProgressProxy;
            this._request.onabort = this._handleAbortProxy;
            this._request.onerror = this._handleErrorProxy;
            this._request.ontimeout = this._handleTimeoutProxy;
            // Note: We don't get onload in all browsers (earlier FF and IE). onReadyStateChange handles these.
            this._request.onload = this._handleLoadProxy;
            this._request.onreadystatechange = this._handleReadyStateChangeProxy;
        }
        // Set up a timeout if we don't have XHR2
        if (this._xhrLevel == 1) {
            this._loadTimeout = setTimeout(createjs.proxy(this._handleTimeout, this), this._item.loadTimeout);
        }
        // Sometimes we get back 404s immediately, particularly when there is a cross origin request.  // note this does not catch in Chrome
        try {
            if (!this._item.values || this._item.method == createjs.AbstractLoader.GET) {
                this._request.send();
            }
            else if (this._item.method == createjs.AbstractLoader.POST) {
                this._request.send(createjs.RequestUtils.formatQueryString(this._item.values));
            }
        }
        catch (error) {
            this.dispatchEvent(new createjs.ErrorEvent("XHR_SEND", null, error));
        }
    };
    p.setResponseType = function (type) {
        // Some old browsers doesn't support blob, so we convert arraybuffer to blob after response is downloaded
        if (type === 'blob') {
            type = window.URL ? 'blob' : 'arraybuffer';
            this._responseType = type;
        }
        this._request.responseType = type;
    };
    /**
     * Get all the response headers from the XmlHttpRequest.
     *
     * <strong>From the docs:</strong> Return all the HTTP headers, excluding headers that are a case-insensitive match
     * for Set-Cookie or Set-Cookie2, as a single string, with each header line separated by a U+000D CR U+000A LF pair,
     * excluding the status line, and with each header name and header value separated by a U+003A COLON U+0020 SPACE
     * pair.
     * @method getAllResponseHeaders
     * @return {String}
     * @since 0.4.1
     */
    p.getAllResponseHeaders = function () {
        if (this._request.getAllResponseHeaders instanceof Function) {
            return this._request.getAllResponseHeaders();
        }
        else {
            return null;
        }
    };
    /**
     * Get a specific response header from the XmlHttpRequest.
     *
     * <strong>From the docs:</strong> Returns the header field value from the response of which the field name matches
     * header, unless the field name is Set-Cookie or Set-Cookie2.
     * @method getResponseHeader
     * @param {String} header The header name to retrieve.
     * @return {String}
     * @since 0.4.1
     */
    p.getResponseHeader = function (header) {
        if (this._request.getResponseHeader instanceof Function) {
            return this._request.getResponseHeader(header);
        }
        else {
            return null;
        }
    };
    // protected methods
    /**
     * The XHR request has reported progress.
     * @method _handleProgress
     * @param {Object} event The XHR progress event.
     * @private
     */
    p._handleProgress = function (event) {
        if (!event || event.loaded > 0 && event.total == 0) {
            return; // Sometimes we get no "total", so just ignore the progress event.
        }
        var newEvent = new createjs.ProgressEvent(event.loaded, event.total);
        this.dispatchEvent(newEvent);
    };
    /**
     * The XHR request has reported a load start.
     * @method _handleLoadStart
     * @param {Object} event The XHR loadStart event.
     * @private
     */
    p._handleLoadStart = function (event) {
        clearTimeout(this._loadTimeout);
        this.dispatchEvent("loadstart");
    };
    /**
     * The XHR request has reported an abort event.
     * @method handleAbort
     * @param {Object} event The XHR abort event.
     * @private
     */
    p._handleAbort = function (event) {
        this._clean();
        this.dispatchEvent(new createjs.ErrorEvent("XHR_ABORTED", null, event));
    };
    /**
     * The XHR request has reported an error event.
     * @method _handleError
     * @param {Object} event The XHR error event.
     * @private
     */
    p._handleError = function (event) {
        this._clean();
        this.dispatchEvent(new createjs.ErrorEvent(event.message));
    };
    /**
     * The XHR request has reported a readyState change. Note that older browsers (IE 7 & 8) do not provide an onload
     * event, so we must monitor the readyStateChange to determine if the file is loaded.
     * @method _handleReadyStateChange
     * @param {Object} event The XHR readyStateChange event.
     * @private
     */
    p._handleReadyStateChange = function (event) {
        if (this._request.readyState == 4) {
            this._handleLoad();
        }
    };
    /**
     * The XHR request has completed. This is called by the XHR request directly, or by a readyStateChange that has
     * <code>request.readyState == 4</code>. Only the first call to this method will be processed.
     * @method _handleLoad
     * @param {Object} event The XHR load event.
     * @private
     */
    p._handleLoad = function (event) {
        if (this.loaded) {
            return;
        }
        this.loaded = true;
        var error = this._checkError();
        if (error) {
            this._handleError(error);
            return;
        }
        this._response = this._getResponse();
        // Convert arraybuffer back to blob
        if (this._responseType === 'arraybuffer') {
            try {
                this._response = new Blob([this._response]);
            }
            catch (e) {
                // Fallback to use BlobBuilder if Blob constructor is not supported
                // Tested on Android 2.3 ~ 4.2 and iOS5 safari
                window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
                if (e.name === 'TypeError' && window.BlobBuilder) {
                    var builder = new BlobBuilder();
                    builder.append(this._response);
                    this._response = builder.getBlob();
                }
            }
        }
        this._clean();
        this.dispatchEvent(new createjs.Event("complete"));
    };
    /**
     * The XHR request has timed out. This is called by the XHR request directly, or via a <code>setTimeout</code>
     * callback.
     * @method _handleTimeout
     * @param {Object} [event] The XHR timeout event. This is occasionally null when called by the backup setTimeout.
     * @private
     */
    p._handleTimeout = function (event) {
        this._clean();
        this.dispatchEvent(new createjs.ErrorEvent("PRELOAD_TIMEOUT", null, event));
    };
    // Protected
    /**
     * Determine if there is an error in the current load. This checks the status of the request for problem codes. Note
     * that this does not check for an actual response. Currently, it only checks for 404 or 0 error code.
     * @method _checkError
     * @return {int} If the request status returns an error code.
     * @private
     */
    p._checkError = function () {
        //LM: Probably need additional handlers here, maybe 501
        var status = parseInt(this._request.status);
        switch (status) {
            case 404: // Not Found
            case 0:
                return new Error(status);
        }
        return null;
    };
    /**
     * Validate the response. Different browsers have different approaches, some of which throw errors when accessed
     * in other browsers. If there is no response, the <code>_response</code> property will remain null.
     * @method _getResponse
     * @private
     */
    p._getResponse = function () {
        if (this._response != null) {
            return this._response;
        }
        if (this._request.response != null) {
            return this._request.response;
        }
        // Android 2.2 uses .responseText
        try {
            if (this._request.responseText != null) {
                return this._request.responseText;
            }
        }
        catch (e) {
        }
        // When loading XML, IE9 does not return .response, instead it returns responseXML.xml
        try {
            if (this._request.responseXML != null) {
                return this._request.responseXML;
            }
        }
        catch (e) {
        }
        return null;
    };
    /**
     * Create an XHR request. Depending on a number of factors, we get totally different results.
     * <ol><li>Some browsers get an <code>XDomainRequest</code> when loading cross-domain.</li>
     *      <li>XMLHttpRequest are created when available.</li>
     *      <li>ActiveX.XMLHTTP objects are used in older IE browsers.</li>
     *      <li>Text requests override the mime type if possible</li>
     *      <li>Origin headers are sent for crossdomain requests in some browsers.</li>
     *      <li>Binary loads set the response type to "arraybuffer"</li></ol>
     * @method _createXHR
     * @param {Object} item The requested item that is being loaded.
     * @return {Boolean} If an XHR request or equivalent was successfully created.
     * @private
     */
    p._createXHR = function (item) {
        // Check for cross-domain loads. We can't fully support them, but we can try.
        var crossdomain = createjs.RequestUtils.isCrossDomain(item);
        var headers = {};
        // Create the request. Fallback to whatever support we have.
        var req = null;
        if (window.XMLHttpRequest) {
            req = new XMLHttpRequest();
            // This is 8 or 9, so use XDomainRequest instead.
            if (crossdomain && req.withCredentials === undefined && window.XDomainRequest) {
                req = new XDomainRequest();
            }
        }
        else {
            for (var i = 0, l = s.ACTIVEX_VERSIONS.length; i < l; i++) {
                var axVersion = s.ACTIVEX_VERSIONS[i];
                try {
                    req = new ActiveXObject(axVersion);
                    break;
                }
                catch (e) {
                }
            }
            if (req == null) {
                return false;
            }
        }
        // Default to utf-8 for Text requests.
        if (item.mimeType == null && createjs.RequestUtils.isText(item.type)) {
            item.mimeType = "text/plain; charset=utf-8";
        }
        // IE9 doesn't support overrideMimeType(), so we need to check for it.
        if (item.mimeType && req.overrideMimeType) {
            req.overrideMimeType(item.mimeType);
        }
        // Determine the XHR level
        this._xhrLevel = (typeof req.responseType === "string") ? 2 : 1;
        var src = null;
        if (item.method == createjs.AbstractLoader.GET) {
            src = createjs.RequestUtils.buildPath(item.src, item.values);
        }
        else {
            src = item.src;
        }
        // Open the request.  Set cross-domain flags if it is supported (XHR level 1 only)
        req.open(item.method || createjs.AbstractLoader.GET, src, true);
        if (crossdomain && req instanceof XMLHttpRequest && this._xhrLevel == 1) {
            headers["Origin"] = location.origin;
        }
        // To send data we need to set the Content-type header)
        if (item.values && item.method == createjs.AbstractLoader.POST) {
            headers["Content-Type"] = "application/x-www-form-urlencoded";
        }
        if (!crossdomain && !headers["X-Requested-With"]) {
            headers["X-Requested-With"] = "XMLHttpRequest";
        }
        if (item.headers) {
            for (var n in item.headers) {
                headers[n] = item.headers[n];
            }
        }
        for (n in headers) {
            req.setRequestHeader(n, headers[n]);
        }
        if (req instanceof XMLHttpRequest && item.withCredentials !== undefined) {
            req.withCredentials = item.withCredentials;
        }
        this._request = req;
        return true;
    };
    /**
     * A request has completed (or failed or canceled), and needs to be disposed.
     * @method _clean
     * @private
     */
    p._clean = function () {
        clearTimeout(this._loadTimeout);
        if (this._request.removeEventListener != null) {
            this._request.removeEventListener("loadstart", this._handleLoadStartProxy);
            this._request.removeEventListener("progress", this._handleProgressProxy);
            this._request.removeEventListener("abort", this._handleAbortProxy);
            this._request.removeEventListener("error", this._handleErrorProxy);
            this._request.removeEventListener("timeout", this._handleTimeoutProxy);
            this._request.removeEventListener("load", this._handleLoadProxy);
            this._request.removeEventListener("readystatechange", this._handleReadyStateChangeProxy);
        }
        else {
            this._request.onloadstart = null;
            this._request.onprogress = null;
            this._request.onabort = null;
            this._request.onerror = null;
            this._request.ontimeout = null;
            this._request.onload = null;
            this._request.onreadystatechange = null;
        }
    };
    p.toString = function () {
        return "[PreloadJS XHRRequest]";
    };
    createjs.XHRRequest = createjs.promote(XHRRequest, "AbstractRequest");
}());
//##############################################################################
// LoadQueue.js
//##############################################################################
this.createjs = this.createjs || {};
/*
 TODO: WINDOWS ISSUES
 * No error for HTML audio in IE 678
 * SVG no failure error in IE 67 (maybe 8) TAGS AND XHR
 * No script complete handler in IE 67 TAGS (XHR is fine)
 * No XML/JSON in IE6 TAGS
 * Need to hide loading SVG in Opera TAGS
 * No CSS onload/readystatechange in Safari or Android TAGS (requires rule checking)
 * SVG no load or failure in Opera XHR
 * Reported issues with IE7/8
 */
(function () {
    "use strict";
    // constructor
    /**
     * The LoadQueue class is the main API for preloading content. LoadQueue is a load manager, which can preload either
     * a single file, or queue of files.
     *
     * <b>Creating a Queue</b><br />
     * To use LoadQueue, create a LoadQueue instance. If you want to force tag loading where possible, set the preferXHR
     * argument to false.
     *
     *      var queue = new createjs.LoadQueue(true);
     *
     * <b>Listening for Events</b><br />
     * Add any listeners you want to the queue. Since PreloadJS 0.3.0, the {{#crossLink "EventDispatcher"}}{{/crossLink}}
     * lets you add as many listeners as you want for events. You can subscribe to the following events:<ul>
     *     <li>{{#crossLink "AbstractLoader/complete:event"}}{{/crossLink}}: fired when a queue completes loading all
     *     files</li>
     *     <li>{{#crossLink "AbstractLoader/error:event"}}{{/crossLink}}: fired when the queue encounters an error with
     *     any file.</li>
     *     <li>{{#crossLink "AbstractLoader/progress:event"}}{{/crossLink}}: Progress for the entire queue has
     *     changed.</li>
     *     <li>{{#crossLink "LoadQueue/fileload:event"}}{{/crossLink}}: A single file has completed loading.</li>
     *     <li>{{#crossLink "LoadQueue/fileprogress:event"}}{{/crossLink}}: Progress for a single file has changes. Note
     *     that only files loaded with XHR (or possibly by plugins) will fire progress events other than 0 or 100%.</li>
     * </ul>
     *
     *      queue.on("fileload", handleFileLoad, this);
     *      queue.on("complete", handleComplete, this);
     *
     * <b>Adding files and manifests</b><br />
     * Add files you want to load using {{#crossLink "LoadQueue/loadFile"}}{{/crossLink}} or add multiple files at a
     * time using a list or a manifest definition using {{#crossLink "LoadQueue/loadManifest"}}{{/crossLink}}. Files are
     * appended to the end of the active queue, so you can use these methods as many times as you like, whenever you
     * like.
     *
     *      queue.loadFile("filePath/file.jpg");
     *      queue.loadFile({id:"image", src:"filePath/file.jpg"});
     *      queue.loadManifest(["filePath/file.jpg", {id:"image", src:"filePath/file.jpg"}]);
     *
     *      // Use an external manifest
     *      queue.loadManifest("path/to/manifest.json");
     *      queue.loadManifest({src:"manifest.json", type:"manifest"});
     *
     * If you pass `false` as the `loadNow` parameter, the queue will not kick of the load of the files, but it will not
     * stop if it has already been started. Call the {{#crossLink "AbstractLoader/load"}}{{/crossLink}} method to begin
     * a paused queue. Note that a paused queue will automatically resume when new files are added to it with a
     * `loadNow` argument of `true`.
     *
     *      queue.load();
     *
     * <b>File Types</b><br />
     * The file type of a manifest item is auto-determined by the file extension. The pattern matching in PreloadJS
     * should handle the majority of standard file and url formats, and works with common file extensions. If you have
     * either a non-standard file extension, or are serving the file using a proxy script, then you can pass in a
     * <code>type</code> property with any manifest item.
     *
     *      queue.loadFile({src:"path/to/myFile.mp3x", type:createjs.AbstractLoader.SOUND});
     *
     *      // Note that PreloadJS will not read a file extension from the query string
     *      queue.loadFile({src:"http://server.com/proxy?file=image.jpg", type:createjs.AbstractLoader.IMAGE});
     *
     * Supported types are defined on the {{#crossLink "AbstractLoader"}}{{/crossLink}} class, and include:
     * <ul>
     *     <li>{{#crossLink "AbstractLoader/BINARY:property"}}{{/crossLink}}: Raw binary data via XHR</li>
     *     <li>{{#crossLink "AbstractLoader/CSS:property"}}{{/crossLink}}: CSS files</li>
     *     <li>{{#crossLink "AbstractLoader/IMAGE:property"}}{{/crossLink}}: Common image formats</li>
     *     <li>{{#crossLink "AbstractLoader/JAVASCRIPT:property"}}{{/crossLink}}: JavaScript files</li>
     *     <li>{{#crossLink "AbstractLoader/JSON:property"}}{{/crossLink}}: JSON data</li>
     *     <li>{{#crossLink "AbstractLoader/JSONP:property"}}{{/crossLink}}: JSON files cross-domain</li>
     *     <li>{{#crossLink "AbstractLoader/MANIFEST:property"}}{{/crossLink}}: A list of files to load in JSON format, see
     *     {{#crossLink "AbstractLoader/loadManifest"}}{{/crossLink}}</li>
     *     <li>{{#crossLink "AbstractLoader/SOUND:property"}}{{/crossLink}}: Audio file formats</li>
     *     <li>{{#crossLink "AbstractLoader/SPRITESHEET:property"}}{{/crossLink}}: JSON SpriteSheet definitions. This
     *     will also load sub-images, and provide a {{#crossLink "SpriteSheet"}}{{/crossLink}} instance.</li>
     *     <li>{{#crossLink "AbstractLoader/SVG:property"}}{{/crossLink}}: SVG files</li>
     *     <li>{{#crossLink "AbstractLoader/TEXT:property"}}{{/crossLink}}: Text files - XHR only</li>
     *     <li>{{#crossLink "AbstractLoader/VIDEO:property"}}{{/crossLink}}: Video objects</li>
     *     <li>{{#crossLink "AbstractLoader/XML:property"}}{{/crossLink}}: XML data</li>
     * </ul>
     *
     * <em>Note: Loader types used to be defined on LoadQueue, but have been moved to AbstractLoader for better
     * portability of loader classes, which can be used individually now. The properties on LoadQueue still exist, but
     * are deprecated.</em>
     *
     * <b>Handling Results</b><br />
     * When a file is finished downloading, a {{#crossLink "LoadQueue/fileload:event"}}{{/crossLink}} event is
     * dispatched. In an example above, there is an event listener snippet for fileload. Loaded files are usually a
     * formatted object that can be used immediately, including:
     * <ul>
     *     <li>Binary: The binary loaded result</li>
     *     <li>CSS: A &lt;link /&gt; tag</li>
     *     <li>Image: An &lt;img /&gt; tag</li>
     *     <li>JavaScript: A &lt;script /&gt; tag</li>
     *     <li>JSON/JSONP: A formatted JavaScript Object</li>
     *     <li>Manifest: A JavaScript object.
     *     <li>Sound: An &lt;audio /&gt; tag</a>
     *     <li>SpriteSheet: A {{#crossLink "SpriteSheet"}}{{/crossLink}} instance, containing loaded images.
     *     <li>SVG: An &lt;object /&gt; tag</li>
     *     <li>Text: Raw text</li>
     *     <li>Video: A Video DOM node</li>
     *     <li>XML: An XML DOM node</li>
     * </ul>
     *
     *      function handleFileLoad(event) {
     *          var item = event.item; // A reference to the item that was passed in to the LoadQueue
     *          var type = item.type;
     *
     *          // Add any images to the page body.
     *          if (type == createjs.LoadQueue.IMAGE) {
     *              document.body.appendChild(event.result);
     *          }
     *      }
     *
     * At any time after the file has been loaded (usually after the queue has completed), any result can be looked up
     * via its "id" using {{#crossLink "LoadQueue/getResult"}}{{/crossLink}}. If no id was provided, then the
     * "src" or file path can be used instead, including the `path` defined by a manifest, but <strong>not including</strong>
     * a base path defined on the LoadQueue. It is recommended to always pass an id if you want to look up content.
     *
     *      var image = queue.getResult("image");
     *      document.body.appendChild(image);
     *
     * Raw loaded content can be accessed using the <code>rawResult</code> property of the {{#crossLink "LoadQueue/fileload:event"}}{{/crossLink}}
     * event, or can be looked up using {{#crossLink "LoadQueue/getResult"}}{{/crossLink}}, passing `true` as the 2nd
     * argument. This is only applicable for content that has been parsed for the browser, specifically: JavaScript,
     * CSS, XML, SVG, and JSON objects, or anything loaded with XHR.
     *
     *      var image = queue.getResult("image", true); // load the binary image data loaded with XHR.
     *
     * <b>Plugins</b><br />
     * LoadQueue has a simple plugin architecture to help process and preload content. For example, to preload audio,
     * make sure to install the <a href="http://soundjs.com">SoundJS</a> Sound class, which will help load HTML audio,
     * Flash audio, and WebAudio files. This should be installed <strong>before</strong> loading any audio files.
     *
     *      queue.installPlugin(createjs.Sound);
     *
     * <h4>Known Browser Issues</h4>
     * <ul>
     *     <li>Browsers without audio support can not load audio files.</li>
     *     <li>Safari on Mac OS X can only play HTML audio if QuickTime is installed</li>
     *     <li>HTML Audio tags will only download until their <code>canPlayThrough</code> event is fired. Browsers other
     *     than Chrome will continue to download in the background.</li>
     *     <li>When loading scripts using tags, they are automatically added to the document.</li>
     *     <li>Scripts loaded via XHR may not be properly inspectable with browser tools.</li>
     *     <li>IE6 and IE7 (and some other browsers) may not be able to load XML, Text, or JSON, since they require
     *     XHR to work.</li>
     *     <li>Content loaded via tags will not show progress, and will continue to download in the background when
     *     canceled, although no events will be dispatched.</li>
     * </ul>
     *
     * @class LoadQueue
     * @param {Boolean} [preferXHR=true] Determines whether the preload instance will favor loading with XHR (XML HTTP
     * Requests), or HTML tags. When this is `false`, the queue will use tag loading when possible, and fall back on XHR
     * when necessary.
     * @param {String} [basePath=""] A path that will be prepended on to the source parameter of all items in the queue
     * before they are loaded.  Sources beginning with a protocol such as `http://` or a relative path such as `../`
     * will not receive a base path.
     * @param {String|Boolean} [crossOrigin=""] An optional flag to support images loaded from a CORS-enabled server. To
     * use it, set this value to `true`, which will default the crossOrigin property on images to "Anonymous". Any
     * string value will be passed through, but only "" and "Anonymous" are recommended. <strong>Note: The crossOrigin
     * parameter is deprecated. Use LoadItem.crossOrigin instead</strong>
     *
     * @constructor
     * @extends AbstractLoader
     */
    function LoadQueue(preferXHR, basePath, crossOrigin) {
        this.AbstractLoader_constructor();
        /**
         * An array of the plugins registered using {{#crossLink "LoadQueue/installPlugin"}}{{/crossLink}}.
         * @property _plugins
         * @type {Array}
         * @private
         * @since 0.6.1
         */
        this._plugins = [];
        /**
         * An object hash of callbacks that are fired for each file type before the file is loaded, giving plugins the
         * ability to override properties of the load. Please see the {{#crossLink "LoadQueue/installPlugin"}}{{/crossLink}}
         * method for more information.
         * @property _typeCallbacks
         * @type {Object}
         * @private
         */
        this._typeCallbacks = {};
        /**
         * An object hash of callbacks that are fired for each file extension before the file is loaded, giving plugins the
         * ability to override properties of the load. Please see the {{#crossLink "LoadQueue/installPlugin"}}{{/crossLink}}
         * method for more information.
         * @property _extensionCallbacks
         * @type {null}
         * @private
         */
        this._extensionCallbacks = {};
        /**
         * The next preload queue to process when this one is complete. If an error is thrown in the current queue, and
         * {{#crossLink "LoadQueue/stopOnError:property"}}{{/crossLink}} is `true`, the next queue will not be processed.
         * @property next
         * @type {LoadQueue}
         * @default null
         */
        this.next = null;
        /**
         * Ensure loaded scripts "complete" in the order they are specified. Loaded scripts are added to the document head
         * once they are loaded. Scripts loaded via tags will load one-at-a-time when this property is `true`, whereas
         * scripts loaded using XHR can load in any order, but will "finish" and be added to the document in the order
         * specified.
         *
         * Any items can be set to load in order by setting the {{#crossLink "maintainOrder:property"}}{{/crossLink}}
         * property on the load item, or by ensuring that only one connection can be open at a time using
         * {{#crossLink "LoadQueue/setMaxConnections"}}{{/crossLink}}. Note that when the `maintainScriptOrder` property
         * is set to `true`, scripts items are automatically set to `maintainOrder=true`, and changing the
         * `maintainScriptOrder` to `false` during a load will not change items already in a queue.
         *
         * <h4>Example</h4>
         *
         *      var queue = new createjs.LoadQueue();
         *      queue.setMaxConnections(3); // Set a higher number to load multiple items at once
         *      queue.maintainScriptOrder = true; // Ensure scripts are loaded in order
         *      queue.loadManifest([
         *          "script1.js",
         *          "script2.js",
         *          "image.png", // Load any time
         *          {src: "image2.png", maintainOrder: true} // Will wait for script2.js
         *          "image3.png",
         *          "script3.js" // Will wait for image2.png before loading (or completing when loading with XHR)
         *      ]);
         *
         * @property maintainScriptOrder
         * @type {Boolean}
         * @default true
         */
        this.maintainScriptOrder = true;
        /**
         * Determines if the LoadQueue will stop processing the current queue when an error is encountered.
         * @property stopOnError
         * @type {Boolean}
         * @default false
         */
        this.stopOnError = false;
        /**
         * The number of maximum open connections that a loadQueue tries to maintain. Please see
         * {{#crossLink "LoadQueue/setMaxConnections"}}{{/crossLink}} for more information.
         * @property _maxConnections
         * @type {Number}
         * @default 1
         * @private
         */
        this._maxConnections = 1;
        /**
         * An internal list of all the default Loaders that are included with PreloadJS. Before an item is loaded, the
         * available loader list is iterated, in the order they are included, and as soon as a loader indicates it can
         * handle the content, it will be selected. The default loader, ({{#crossLink "TextLoader"}}{{/crossLink}} is
         * last in the list, so it will be used if no other match is found. Typically, loaders will match based on the
         * {{#crossLink "LoadItem/type"}}{{/crossLink}}, which is automatically determined using the file extension of
         * the {{#crossLink "LoadItem/src:property"}}{{/crossLink}}.
         *
         * Loaders can be removed from PreloadJS by simply not including them.
         *
         * Custom loaders installed using {{#crossLink "registerLoader"}}{{/crossLink}} will be prepended to this list
         * so that they are checked first.
         * @property _availableLoaders
         * @type {Array}
         * @private
         * @since 0.6.0
         */
        this._availableLoaders = [
            createjs.ImageLoader,
            createjs.JavaScriptLoader,
            createjs.CSSLoader,
            createjs.JSONLoader,
            createjs.JSONPLoader,
            createjs.SoundLoader,
            createjs.ManifestLoader,
            createjs.SpriteSheetLoader,
            createjs.XMLLoader,
            createjs.SVGLoader,
            createjs.BinaryLoader,
            createjs.VideoLoader,
            createjs.TextLoader
        ];
        /**
         * The number of built in loaders, so they can't be removed by {{#crossLink "unregisterLoader"}}{{/crossLink}.
                 * @property _defaultLoaderLength
         * @type {Number}
         * @private
         * @since 0.6.0
         */
        this._defaultLoaderLength = this._availableLoaders.length;
        this.init(preferXHR, basePath, crossOrigin);
    }
    var p = createjs.extend(LoadQueue, createjs.AbstractLoader);
    var s = LoadQueue;
    /**
     * <strong>REMOVED</strong>. Removed in favor of using `MySuperClass_constructor`.
     * See {{#crossLink "Utility Methods/extend"}}{{/crossLink}} and {{#crossLink "Utility Methods/promote"}}{{/crossLink}}
     * for details.
     *
     * There is an inheritance tutorial distributed with EaselJS in /tutorials/Inheritance.
     *
     * @method initialize
     * @protected
     * @deprecated
     */
    // p.initialize = function() {}; // searchable for devs wondering where it is.
    /**
     * An internal initialization method, which is used for initial set up, but also to reset the LoadQueue.
     * @method init
     * @param preferXHR
     * @param basePath
     * @param crossOrigin
     * @private
     */
    p.init = function (preferXHR, basePath, crossOrigin) {
        // public properties
        /**
         * @property useXHR
         * @type {Boolean}
         * @readonly
         * @default true
         * @deprecated Use preferXHR instead.
         */
        this.useXHR = true;
        /**
         * Try and use XMLHttpRequest (XHR) when possible. Note that LoadQueue will default to tag loading or XHR
         * loading depending on the requirements for a media type. For example, HTML audio can not be loaded with XHR,
         * and plain text can not be loaded with tags, so it will default the the correct type instead of using the
         * user-defined type.
         * @type {Boolean}
         * @default true
         * @since 0.6.0
         */
        this.preferXHR = true; //TODO: Get/Set
        this._preferXHR = true;
        this.setPreferXHR(preferXHR);
        // protected properties
        /**
         * Whether the queue is currently paused or not.
         * @property _paused
         * @type {boolean}
         * @private
         */
        this._paused = false;
        /**
         * A path that will be prepended on to the item's {{#crossLink "LoadItem/src:property"}}{{/crossLink}}. The
         * `_basePath` property will only be used if an item's source is relative, and does not include a protocol such
         * as `http://`, or a relative path such as `../`.
         * @property _basePath
         * @type {String}
         * @private
         * @since 0.3.1
         */
        this._basePath = basePath;
        /**
         * An optional flag to set on images that are loaded using PreloadJS, which enables CORS support. Images loaded
         * cross-domain by servers that support CORS require the crossOrigin flag to be loaded and interacted with by
         * a canvas. When loading locally, or with a server with no CORS support, this flag can cause other security issues,
         * so it is recommended to only set it if you are sure the server supports it. Currently, supported values are ""
         * and "Anonymous".
         * @property _crossOrigin
         * @type {String}
         * @default ""
         * @private
         * @since 0.4.1
         */
        this._crossOrigin = crossOrigin;
        /**
         * Determines if the loadStart event was dispatched already. This event is only fired one time, when the first
         * file is requested.
         * @property _loadStartWasDispatched
         * @type {Boolean}
         * @default false
         * @private
         */
        this._loadStartWasDispatched = false;
        /**
         * Determines if there is currently a script loading. This helps ensure that only a single script loads at once when
         * using a script tag to do preloading.
         * @property _currentlyLoadingScript
         * @type {Boolean}
         * @private
         */
        this._currentlyLoadingScript = null;
        /**
         * An array containing the currently downloading files.
         * @property _currentLoads
         * @type {Array}
         * @private
         */
        this._currentLoads = [];
        /**
         * An array containing the queued items that have not yet started downloading.
         * @property _loadQueue
         * @type {Array}
         * @private
         */
        this._loadQueue = [];
        /**
         * An array containing downloads that have not completed, so that the LoadQueue can be properly reset.
         * @property _loadQueueBackup
         * @type {Array}
         * @private
         */
        this._loadQueueBackup = [];
        /**
         * An object hash of items that have finished downloading, indexed by the {{#crossLink "LoadItem"}}{{/crossLink}}
         * id.
         * @property _loadItemsById
         * @type {Object}
         * @private
         */
        this._loadItemsById = {};
        /**
         * An object hash of items that have finished downloading, indexed by {{#crossLink "LoadItem"}}{{/crossLink}}
         * source.
         * @property _loadItemsBySrc
         * @type {Object}
         * @private
         */
        this._loadItemsBySrc = {};
        /**
         * An object hash of loaded items, indexed by the ID of the {{#crossLink "LoadItem"}}{{/crossLink}}.
         * @property _loadedResults
         * @type {Object}
         * @private
         */
        this._loadedResults = {};
        /**
         * An object hash of un-parsed loaded items, indexed by the ID of the {{#crossLink "LoadItem"}}{{/crossLink}}.
         * @property _loadedRawResults
         * @type {Object}
         * @private
         */
        this._loadedRawResults = {};
        /**
         * The number of items that have been requested. This helps manage an overall progress without knowing how large
         * the files are before they are downloaded. This does not include items inside of loaders such as the
         * {{#crossLink "ManifestLoader"}}{{/crossLink}}.
         * @property _numItems
         * @type {Number}
         * @default 0
         * @private
         */
        this._numItems = 0;
        /**
         * The number of items that have completed loaded. This helps manage an overall progress without knowing how large
         * the files are before they are downloaded.
         * @property _numItemsLoaded
         * @type {Number}
         * @default 0
         * @private
         */
        this._numItemsLoaded = 0;
        /**
         * A list of scripts in the order they were requested. This helps ensure that scripts are "completed" in the right
         * order.
         * @property _scriptOrder
         * @type {Array}
         * @private
         */
        this._scriptOrder = [];
        /**
         * A list of scripts that have been loaded. Items are added to this list as <code>null</code> when they are
         * requested, contain the loaded item if it has completed, but not been dispatched to the user, and <code>true</true>
         * once they are complete and have been dispatched.
         * @property _loadedScripts
         * @type {Array}
         * @private
         */
        this._loadedScripts = [];
        /**
         * The last progress amount. This is used to suppress duplicate progress events.
         * @property _lastProgress
         * @type {Number}
         * @private
         * @since 0.6.0
         */
        this._lastProgress = NaN;
    };
    // static properties
    /**
     * The time in milliseconds to assume a load has failed. An {{#crossLink "AbstractLoader/error:event"}}{{/crossLink}}
     * event is dispatched if the timeout is reached before any data is received.
     * @property loadTimeout
     * @type {Number}
     * @default 8000
     * @static
     * @since 0.4.1
     * @deprecated In favour of {{#crossLink "LoadItem/LOAD_TIMEOUT_DEFAULT:property}}{{/crossLink}} property.
     */
    s.loadTimeout = 8000;
    /**
     * The time in milliseconds to assume a load has failed.
     * @property LOAD_TIMEOUT
     * @type {Number}
     * @default 0
     * @deprecated in favor of the {{#crossLink "LoadQueue/loadTimeout:property"}}{{/crossLink}} property.
     */
    s.LOAD_TIMEOUT = 0;
    // Preload Types
    /**
     * @property BINARY
     * @type {String}
     * @default binary
     * @static
     * @deprecated Use the AbstractLoader {{#crossLink "AbstractLoader/BINARY:property"}}{{/crossLink}} instead.
     */
    s.BINARY = createjs.AbstractLoader.BINARY;
    /**
     * @property CSS
     * @type {String}
     * @default css
     * @static
     * @deprecated Use the AbstractLoader {{#crossLink "AbstractLoader/CSS:property"}}{{/crossLink}} instead.
     */
    s.CSS = createjs.AbstractLoader.CSS;
    /**
     * @property IMAGE
     * @type {String}
     * @default image
     * @static
     * @deprecated Use the AbstractLoader {{#crossLink "AbstractLoader/CSS:property"}}{{/crossLink}} instead.
     */
    s.IMAGE = createjs.AbstractLoader.IMAGE;
    /**
     * @property JAVASCRIPT
     * @type {String}
     * @default javascript
     * @static
     * @deprecated Use the AbstractLoader {{#crossLink "AbstractLoader/JAVASCRIPT:property"}}{{/crossLink}} instead.
     */
    s.JAVASCRIPT = createjs.AbstractLoader.JAVASCRIPT;
    /**
     * @property JSON
     * @type {String}
     * @default json
     * @static
     * @deprecated Use the AbstractLoader {{#crossLink "AbstractLoader/JSON:property"}}{{/crossLink}} instead.
     */
    s.JSON = createjs.AbstractLoader.JSON;
    /**
     * @property JSONP
     * @type {String}
     * @default jsonp
     * @static
     * @deprecated Use the AbstractLoader {{#crossLink "AbstractLoader/JSONP:property"}}{{/crossLink}} instead.
     */
    s.JSONP = createjs.AbstractLoader.JSONP;
    /**
     * @property MANIFEST
     * @type {String}
     * @default manifest
     * @static
     * @since 0.4.1
     * @deprecated Use the AbstractLoader {{#crossLink "AbstractLoader/MANIFEST:property"}}{{/crossLink}} instead.
     */
    s.MANIFEST = createjs.AbstractLoader.MANIFEST;
    /**
     * @property SOUND
     * @type {String}
     * @default sound
     * @static
     * @deprecated Use the AbstractLoader {{#crossLink "AbstractLoader/JAVASCRIPT:property"}}{{/crossLink}} instead.
     */
    s.SOUND = createjs.AbstractLoader.SOUND;
    /**
     * @property VIDEO
     * @type {String}
     * @default video
     * @static
     * @deprecated Use the AbstractLoader {{#crossLink "AbstractLoader/JAVASCRIPT:property"}}{{/crossLink}} instead.
     */
    s.VIDEO = createjs.AbstractLoader.VIDEO;
    /**
     * @property SVG
     * @type {String}
     * @default svg
     * @static
     * @deprecated Use the AbstractLoader {{#crossLink "AbstractLoader/SVG:property"}}{{/crossLink}} instead.
     */
    s.SVG = createjs.AbstractLoader.SVG;
    /**
     * @property TEXT
     * @type {String}
     * @default text
     * @static
     * @deprecated Use the AbstractLoader {{#crossLink "AbstractLoader/TEXT:property"}}{{/crossLink}} instead.
     */
    s.TEXT = createjs.AbstractLoader.TEXT;
    /**
     * @property XML
     * @type {String}
     * @default xml
     * @static
     * @deprecated Use the AbstractLoader {{#crossLink "AbstractLoader/XML:property"}}{{/crossLink}} instead.
     */
    s.XML = createjs.AbstractLoader.XML;
    /**
     * @property POST
     * @type {string}
     * @deprecated Use the AbstractLoader {{#crossLink "AbstractLoader/POST:property"}}{{/crossLink}} instead.
     */
    s.POST = createjs.AbstractLoader.POST;
    /**
     * @property GET
     * @type {string}
     * @deprecated Use the AbstractLoader {{#crossLink "AbstractLoader/GET:property"}}{{/crossLink}} instead.
     */
    s.GET = createjs.AbstractLoader.GET;
    // events
    /**
     * This event is fired when an individual file has loaded, and been processed.
     * @event fileload
     * @param {Object} target The object that dispatched the event.
     * @param {String} type The event type.
     * @param {Object} item The file item which was specified in the {{#crossLink "LoadQueue/loadFile"}}{{/crossLink}}
     * or {{#crossLink "LoadQueue/loadManifest"}}{{/crossLink}} call. If only a string path or tag was specified, the
     * object will contain that value as a `src` property.
     * @param {Object} result The HTML tag or parsed result of the loaded item.
     * @param {Object} rawResult The unprocessed result, usually the raw text or binary data before it is converted
     * to a usable object.
     * @since 0.3.0
     */
    /**
     * This {{#crossLink "ProgressEvent"}}{{/crossLink}} that is fired when an an individual file's progress changes.
     * @event fileprogress
     * @since 0.3.0
     */
    /**
     * This event is fired when an individual file starts to load.
     * @event filestart
     * @param {Object} The object that dispatched the event.
     * @param {String} type The event type.
     * @param {Object} item The file item which was specified in the {{#crossLink "LoadQueue/loadFile"}}{{/crossLink}}
     * or {{#crossLink "LoadQueue/loadManifest"}}{{/crossLink}} call. If only a string path or tag was specified, the
     * object will contain that value as a property.
     */
    /**
     * Although it extends {{#crossLink "AbstractLoader"}}{{/crossLink}}, the `initialize` event is never fired from
     * a LoadQueue instance.
     * @event initialize
     * @private
     */
    // public methods
    /**
     * Register a custom loaders class. New loaders are given precedence over loaders added earlier and default loaders.
     * It is recommended that loaders extend {{#crossLink "AbstractLoader"}}{{/crossLink}}. Loaders can only be added
     * once, and will be prepended to the list of available loaders.
     * @method registerLoader
     * @param {Function|AbstractLoader} loader The AbstractLoader class to add.
     * @since 0.6.0
     */
    p.registerLoader = function (loader) {
        if (!loader || !loader.canLoadItem) {
            throw new Error("loader is of an incorrect type.");
        }
        else if (this._availableLoaders.indexOf(loader) != -1) {
            throw new Error("loader already exists."); //LM: Maybe just silently fail here
        }
        this._availableLoaders.unshift(loader);
    };
    /**
     * Remove a custom loader added using {{#crossLink "registerLoader"}}{{/crossLink}}. Only custom loaders can be
     * unregistered, the default loaders will always be available.
     * @method unregisterLoader
     * @param {Function|AbstractLoader} loader The AbstractLoader class to remove
     */
    p.unregisterLoader = function (loader) {
        var idx = this._availableLoaders.indexOf(loader);
        if (idx != -1 && idx < this._defaultLoaderLength - 1) {
            this._availableLoaders.splice(idx, 1);
        }
    };
    /**
     * @method setUseXHR
     * @param {Boolean} value The new useXHR value to set.
     * @return {Boolean} The new useXHR value. If XHR is not supported by the browser, this will return false, even if
     * the provided value argument was true.
     * @since 0.3.0
     * @deprecated use the {{#crossLink "LoadQueue/preferXHR:property"}}{{/crossLink}} property, or the
     * {{#crossLink "LoadQueue/setUseXHR"}}{{/crossLink}} method instead.
     */
    p.setUseXHR = function (value) {
        return this.setPreferXHR(value);
    };
    /**
     * Change the {{#crossLink "preferXHR:property"}}{{/crossLink}} value. Note that if this is set to `true`, it may
     * fail, or be ignored depending on the browser's capabilities and the load type.
     * @method setPreferXHR
     * @param {Boolean} value
     * @returns {Boolean} The value of {{#crossLink "preferXHR"}}{{/crossLink}} that was successfully set.
     * @since 0.6.0
     */
    p.setPreferXHR = function (value) {
        // Determine if we can use XHR. XHR defaults to TRUE, but the browser may not support it.
        //TODO: Should we be checking for the other XHR types? Might have to do a try/catch on the different types similar to createXHR.
        this.preferXHR = (value != false && window.XMLHttpRequest != null);
        return this.preferXHR;
    };
    /**
     * Stops all queued and loading items, and clears the queue. This also removes all internal references to loaded
     * content, and allows the queue to be used again.
     * @method removeAll
     * @since 0.3.0
     */
    p.removeAll = function () {
        this.remove();
    };
    /**
     * Stops an item from being loaded, and removes it from the queue. If nothing is passed, all items are removed.
     * This also removes internal references to loaded item(s).
     *
     * <h4>Example</h4>
     *
     *      queue.loadManifest([
     *          {src:"test.png", id:"png"},
     *          {src:"test.jpg", id:"jpg"},
     *          {src:"test.mp3", id:"mp3"}
     *      ]);
     *      queue.remove("png"); // Single item by ID
     *      queue.remove("png", "test.jpg"); // Items as arguments. Mixed id and src.
     *      queue.remove(["test.png", "jpg"]); // Items in an Array. Mixed id and src.
     *
     * @method remove
     * @param {String | Array} idsOrUrls* The id or ids to remove from this queue. You can pass an item, an array of
     * items, or multiple items as arguments.
     * @since 0.3.0
     */
    p.remove = function (idsOrUrls) {
        var args = null;
        if (idsOrUrls && !Array.isArray(idsOrUrls)) {
            args = [idsOrUrls];
        }
        else if (idsOrUrls) {
            args = idsOrUrls;
        }
        else if (arguments.length > 0) {
            return;
        }
        var itemsWereRemoved = false;
        // Destroy everything
        if (!args) {
            this.close();
            for (var n in this._loadItemsById) {
                this._disposeItem(this._loadItemsById[n]);
            }
            this.init(this.preferXHR, this._basePath);
            // Remove specific items
        }
        else {
            while (args.length) {
                var item = args.pop();
                var r = this.getResult(item);
                //Remove from the main load Queue
                for (i = this._loadQueue.length - 1; i >= 0; i--) {
                    loadItem = this._loadQueue[i].getItem();
                    if (loadItem.id == item || loadItem.src == item) {
                        this._loadQueue.splice(i, 1)[0].cancel();
                        break;
                    }
                }
                //Remove from the backup queue
                for (i = this._loadQueueBackup.length - 1; i >= 0; i--) {
                    loadItem = this._loadQueueBackup[i].getItem();
                    if (loadItem.id == item || loadItem.src == item) {
                        this._loadQueueBackup.splice(i, 1)[0].cancel();
                        break;
                    }
                }
                if (r) {
                    this._disposeItem(this.getItem(item));
                }
                else {
                    for (var i = this._currentLoads.length - 1; i >= 0; i--) {
                        var loadItem = this._currentLoads[i].getItem();
                        if (loadItem.id == item || loadItem.src == item) {
                            this._currentLoads.splice(i, 1)[0].cancel();
                            itemsWereRemoved = true;
                            break;
                        }
                    }
                }
            }
            // If this was called during a load, try to load the next item.
            if (itemsWereRemoved) {
                this._loadNext();
            }
        }
    };
    /**
     * Stops all open loads, destroys any loaded items, and resets the queue, so all items can
     * be reloaded again by calling {{#crossLink "AbstractLoader/load"}}{{/crossLink}}. Items are not removed from the
     * queue. To remove items use the {{#crossLink "LoadQueue/remove"}}{{/crossLink}} or
     * {{#crossLink "LoadQueue/removeAll"}}{{/crossLink}} method.
     * @method reset
     * @since 0.3.0
     */
    p.reset = function () {
        this.close();
        for (var n in this._loadItemsById) {
            this._disposeItem(this._loadItemsById[n]);
        }
        //Reset the queue to its start state
        var a = [];
        for (var i = 0, l = this._loadQueueBackup.length; i < l; i++) {
            a.push(this._loadQueueBackup[i].getItem());
        }
        this.loadManifest(a, false);
    };
    /**
     * Register a plugin. Plugins can map to load types (sound, image, etc), or specific extensions (png, mp3, etc).
     * Currently, only one plugin can exist per type/extension.
     *
     * When a plugin is installed, a <code>getPreloadHandlers()</code> method will be called on it. For more information
     * on this method, check out the {{#crossLink "SamplePlugin/getPreloadHandlers"}}{{/crossLink}} method in the
     * {{#crossLink "SamplePlugin"}}{{/crossLink}} class.
     *
     * Before a file is loaded, a matching plugin has an opportunity to modify the load. If a `callback` is returned
     * from the {{#crossLink "SamplePlugin/getPreloadHandlers"}}{{/crossLink}} method, it will be invoked first, and its
     * result may cancel or modify the item. The callback method can also return a `completeHandler` to be fired when
     * the file is loaded, or a `tag` object, which will manage the actual download. For more information on these
     * methods, check out the {{#crossLink "SamplePlugin/preloadHandler"}}{{/crossLink}} and {{#crossLink "SamplePlugin/fileLoadHandler"}}{{/crossLink}}
     * methods on the {{#crossLink "SamplePlugin"}}{{/crossLink}}.
     *
     * @method installPlugin
     * @param {Function} plugin The plugin class to install.
     */
    p.installPlugin = function (plugin) {
        if (plugin == null) {
            return;
        }
        if (plugin.getPreloadHandlers != null) {
            this._plugins.push(plugin);
            var map = plugin.getPreloadHandlers();
            map.scope = plugin;
            if (map.types != null) {
                for (var i = 0, l = map.types.length; i < l; i++) {
                    this._typeCallbacks[map.types[i]] = map;
                }
            }
            if (map.extensions != null) {
                for (i = 0, l = map.extensions.length; i < l; i++) {
                    this._extensionCallbacks[map.extensions[i]] = map;
                }
            }
        }
    };
    /**
     * Set the maximum number of concurrent connections. Note that browsers and servers may have a built-in maximum
     * number of open connections, so any additional connections may remain in a pending state until the browser
     * opens the connection. When loading scripts using tags, and when {{#crossLink "LoadQueue/maintainScriptOrder:property"}}{{/crossLink}}
     * is `true`, only one script is loaded at a time due to browser limitations.
     *
     * <h4>Example</h4>
     *
     *      var queue = new createjs.LoadQueue();
     *      queue.setMaxConnections(10); // Allow 10 concurrent loads
     *
     * @method setMaxConnections
     * @param {Number} value The number of concurrent loads to allow. By default, only a single connection per LoadQueue
     * is open at any time.
     */
    p.setMaxConnections = function (value) {
        this._maxConnections = value;
        if (!this._paused && this._loadQueue.length > 0) {
            this._loadNext();
        }
    };
    /**
     * Load a single file. To add multiple files at once, use the {{#crossLink "LoadQueue/loadManifest"}}{{/crossLink}}
     * method.
     *
     * Files are always appended to the current queue, so this method can be used multiple times to add files.
     * To clear the queue first, use the {{#crossLink "AbstractLoader/close"}}{{/crossLink}} method.
     * @method loadFile
     * @param {LoadItem|Object|String} file The file object or path to load. A file can be either
     * <ul>
     *     <li>A {{#crossLink "LoadItem"}}{{/crossLink}} instance</li>
     *     <li>An object containing properties defined by {{#crossLink "LoadItem"}}{{/crossLink}}</li>
     *     <li>OR A string path to a resource. Note that this kind of load item will be converted to a {{#crossLink "LoadItem"}}{{/crossLink}}
     *     in the background.</li>
     * </ul>
     * @param {Boolean} [loadNow=true] Kick off an immediate load (true) or wait for a load call (false). The default
     * value is true. If the queue is paused using {{#crossLink "LoadQueue/setPaused"}}{{/crossLink}}, and the value is
     * `true`, the queue will resume automatically.
     * @param {String} [basePath] A base path that will be prepended to each file. The basePath argument overrides the
     * path specified in the constructor. Note that if you load a manifest using a file of type {{#crossLink "AbstractLoader/MANIFEST:property"}}{{/crossLink}},
     * its files will <strong>NOT</strong> use the basePath parameter. <strong>The basePath parameter is deprecated.</strong>
     * This parameter will be removed in a future version. Please either use the `basePath` parameter in the LoadQueue
     * constructor, or a `path` property in a manifest definition.
     */
    p.loadFile = function (file, loadNow, basePath) {
        if (file == null) {
            var event = new createjs.ErrorEvent("PRELOAD_NO_FILE");
            this._sendError(event);
            return;
        }
        this._addItem(file, null, basePath);
        if (loadNow !== false) {
            this.setPaused(false);
        }
        else {
            this.setPaused(true);
        }
    };
    /**
     * Load an array of files. To load a single file, use the {{#crossLink "LoadQueue/loadFile"}}{{/crossLink}} method.
     * The files in the manifest are requested in the same order, but may complete in a different order if the max
     * connections are set above 1 using {{#crossLink "LoadQueue/setMaxConnections"}}{{/crossLink}}. Scripts will load
     * in the right order as long as {{#crossLink "LoadQueue/maintainScriptOrder"}}{{/crossLink}} is true (which is
     * default).
     *
     * Files are always appended to the current queue, so this method can be used multiple times to add files.
     * To clear the queue first, use the {{#crossLink "AbstractLoader/close"}}{{/crossLink}} method.
     * @method loadManifest
     * @param {Array|String|Object} manifest An list of files to load. The loadManifest call supports four types of
     * manifests:
     * <ol>
     *     <li>A string path, which points to a manifest file, which is a JSON file that contains a "manifest" property,
     *     which defines the list of files to load, and can optionally contain a "path" property, which will be
     *     prepended to each file in the list.</li>
     *     <li>An object which defines a "src", which is a JSON or JSONP file. A "callback" can be defined for JSONP
     *     file. The JSON/JSONP file should contain a "manifest" property, which defines the list of files to load,
     *     and can optionally contain a "path" property, which will be prepended to each file in the list.</li>
     *     <li>An object which contains a "manifest" property, which defines the list of files to load, and can
     *     optionally contain a "path" property, which will be prepended to each file in the list.</li>
     *     <li>An Array of files to load.</li>
     * </ol>
     *
     * Each "file" in a manifest can be either:
     * <ul>
     *     <li>A {{#crossLink "LoadItem"}}{{/crossLink}} instance</li>
     *     <li>An object containing properties defined by {{#crossLink "LoadItem"}}{{/crossLink}}</li>
     *     <li>OR A string path to a resource. Note that this kind of load item will be converted to a {{#crossLink "LoadItem"}}{{/crossLink}}
     *     in the background.</li>
     * </ul>
     *
     * @param {Boolean} [loadNow=true] Kick off an immediate load (true) or wait for a load call (false). The default
     * value is true. If the queue is paused using {{#crossLink "LoadQueue/setPaused"}}{{/crossLink}} and this value is
     * `true`, the queue will resume automatically.
     * @param {String} [basePath] A base path that will be prepended to each file. The basePath argument overrides the
     * path specified in the constructor. Note that if you load a manifest using a file of type {{#crossLink "LoadQueue/MANIFEST:property"}}{{/crossLink}},
     * its files will <strong>NOT</strong> use the basePath parameter. <strong>The basePath parameter is deprecated.</strong>
     * This parameter will be removed in a future version. Please either use the `basePath` parameter in the LoadQueue
     * constructor, or a `path` property in a manifest definition.
     */
    p.loadManifest = function (manifest, loadNow, basePath) {
        var fileList = null;
        var path = null;
        // Array-based list of items
        if (Array.isArray(manifest)) {
            if (manifest.length == 0) {
                var event = new createjs.ErrorEvent("PRELOAD_MANIFEST_EMPTY");
                this._sendError(event);
                return;
            }
            fileList = manifest;
            // String-based. Only file manifests can be specified this way. Any other types will cause an error when loaded.
        }
        else if (typeof (manifest) === "string") {
            fileList = [
                {
                    src: manifest,
                    type: s.MANIFEST
                }
            ];
        }
        else if (typeof (manifest) == "object") {
            // An object that defines a manifest path
            if (manifest.src !== undefined) {
                if (manifest.type == null) {
                    manifest.type = s.MANIFEST;
                }
                else if (manifest.type != s.MANIFEST) {
                    var event = new createjs.ErrorEvent("PRELOAD_MANIFEST_TYPE");
                    this._sendError(event);
                }
                fileList = [manifest];
                // An object that defines a manifest
            }
            else if (manifest.manifest !== undefined) {
                fileList = manifest.manifest;
                path = manifest.path;
            }
            // Unsupported. This will throw an error.
        }
        else {
            var event = new createjs.ErrorEvent("PRELOAD_MANIFEST_NULL");
            this._sendError(event);
            return;
        }
        for (var i = 0, l = fileList.length; i < l; i++) {
            this._addItem(fileList[i], path, basePath);
        }
        if (loadNow !== false) {
            this.setPaused(false);
        }
        else {
            this.setPaused(true);
        }
    };
    /**
     * Start a LoadQueue that was created, but not automatically started.
     * @method load
     */
    p.load = function () {
        this.setPaused(false);
    };
    /**
     * Look up a {{#crossLink "LoadItem"}}{{/crossLink}} using either the "id" or "src" that was specified when loading it. Note that if no "id" was
     * supplied with the load item, the ID will be the "src", including a `path` property defined by a manifest. The
     * `basePath` will not be part of the ID.
     * @method getItem
     * @param {String} value The <code>id</code> or <code>src</code> of the load item.
     * @return {Object} The load item that was initially requested using {{#crossLink "LoadQueue/loadFile"}}{{/crossLink}}
     * or {{#crossLink "LoadQueue/loadManifest"}}{{/crossLink}}. This object is also returned via the {{#crossLink "LoadQueue/fileload:event"}}{{/crossLink}}
     * event as the `item` parameter.
     */
    p.getItem = function (value) {
        return this._loadItemsById[value] || this._loadItemsBySrc[value];
    };
    /**
     * Look up a loaded result using either the "id" or "src" that was specified when loading it. Note that if no "id"
     * was supplied with the load item, the ID will be the "src", including a `path` property defined by a manifest. The
     * `basePath` will not be part of the ID.
     * @method getResult
     * @param {String} value The <code>id</code> or <code>src</code> of the load item.
     * @param {Boolean} [rawResult=false] Return a raw result instead of a formatted result. This applies to content
     * loaded via XHR such as scripts, XML, CSS, and Images. If there is no raw result, the formatted result will be
     * returned instead.
     * @return {Object} A result object containing the content that was loaded, such as:
     * <ul>
     *      <li>An image tag (&lt;image /&gt;) for images</li>
     *      <li>A script tag for JavaScript (&lt;script /&gt;). Note that scripts are automatically added to the HTML
     *      DOM.</li>
     *      <li>A style tag for CSS (&lt;style /&gt; or &lt;link &gt;)</li>
     *      <li>Raw text for TEXT</li>
     *      <li>A formatted JavaScript object defined by JSON</li>
     *      <li>An XML document</li>
     *      <li>A binary arraybuffer loaded by XHR</li>
     *      <li>An audio tag (&lt;audio &gt;) for HTML audio. Note that it is recommended to use SoundJS APIs to play
     *      loaded audio. Specifically, audio loaded by Flash and WebAudio will return a loader object using this method
     *      which can not be used to play audio back.</li>
     * </ul>
     * This object is also returned via the {{#crossLink "LoadQueue/fileload:event"}}{{/crossLink}} event as the 'item`
     * parameter. Note that if a raw result is requested, but not found, the result will be returned instead.
     */
    p.getResult = function (value, rawResult) {
        var item = this._loadItemsById[value] || this._loadItemsBySrc[value];
        if (item == null) {
            return null;
        }
        var id = item.id;
        if (rawResult && this._loadedRawResults[id]) {
            return this._loadedRawResults[id];
        }
        return this._loadedResults[id];
    };
    /**
     * Generate an list of items loaded by this queue.
     * @method getItems
     * @param {Boolean} loaded Determines if only items that have been loaded should be returned. If false, in-progress
     * and failed load items will also be included.
     * @returns {Array} A list of objects that have been loaded. Each item includes the {{#crossLink "LoadItem"}}{{/crossLink}},
     * result, and rawResult.
     * @since 0.6.0
     */
    p.getItems = function (loaded) {
        var arr = [];
        for (var n in this._loadItemsById) {
            var item = this._loadItemsById[n];
            var result = this.getResult(n);
            if (loaded === true && result == null) {
                continue;
            }
            arr.push({
                item: item,
                result: result,
                rawResult: this.getResult(n, true)
            });
        }
        return arr;
    };
    /**
     * Pause or resume the current load. Active loads will not be cancelled, but the next items in the queue will not
     * be processed when active loads complete. LoadQueues are not paused by default.
     *
     * Note that if new items are added to the queue using {{#crossLink "LoadQueue/loadFile"}}{{/crossLink}} or
     * {{#crossLink "LoadQueue/loadManifest"}}{{/crossLink}}, a paused queue will be resumed, unless the `loadNow`
     * argument is `false`.
     * @method setPaused
     * @param {Boolean} value Whether the queue should be paused or not.
     */
    p.setPaused = function (value) {
        this._paused = value;
        if (!this._paused) {
            this._loadNext();
        }
    };
    /**
     * Close the active queue. Closing a queue completely empties the queue, and prevents any remaining items from
     * starting to download. Note that currently any active loads will remain open, and events may be processed.
     *
     * To stop and restart a queue, use the {{#crossLink "LoadQueue/setPaused"}}{{/crossLink}} method instead.
     * @method close
     */
    p.close = function () {
        while (this._currentLoads.length) {
            this._currentLoads.pop().cancel();
        }
        this._scriptOrder.length = 0;
        this._loadedScripts.length = 0;
        this.loadStartWasDispatched = false;
        this._itemCount = 0;
        this._lastProgress = NaN;
    };
    // protected methods
    /**
     * Add an item to the queue. Items are formatted into a usable object containing all the properties necessary to
     * load the content. The load queue is populated with the loader instance that handles preloading, and not the load
     * item that was passed in by the user. To look up the load item by id or src, use the {{#crossLink "LoadQueue.getItem"}}{{/crossLink}}
     * method.
     * @method _addItem
     * @param {String|Object} value The item to add to the queue.
     * @param {String} [path] An optional path prepended to the `src`. The path will only be prepended if the src is
     * relative, and does not start with a protocol such as `http://`, or a path like `../`. If the LoadQueue was
     * provided a {{#crossLink "_basePath"}}{{/crossLink}}, then it will optionally be prepended after.
     * @param {String} [basePath] <strong>Deprecated</strong>An optional basePath passed into a {{#crossLink "LoadQueue/loadManifest"}}{{/crossLink}}
     * or {{#crossLink "LoadQueue/loadFile"}}{{/crossLink}} call. This parameter will be removed in a future tagged
     * version.
     * @private
     */
    p._addItem = function (value, path, basePath) {
        var item = this._createLoadItem(value, path, basePath); // basePath and manifest path are added to the src.
        if (item == null) {
            return;
        } // Sometimes plugins or types should be skipped.
        var loader = this._createLoader(item);
        if (loader != null) {
            if ("plugins" in loader) {
                loader.plugins = this._plugins;
            }
            item._loader = loader;
            this._loadQueue.push(loader);
            this._loadQueueBackup.push(loader);
            this._numItems++;
            this._updateProgress();
            // Only worry about script order when using XHR to load scripts. Tags are only loading one at a time.
            if ((this.maintainScriptOrder
                && item.type == createjs.LoadQueue.JAVASCRIPT)
                || item.maintainOrder === true) {
                this._scriptOrder.push(item);
                this._loadedScripts.push(null);
            }
        }
    };
    /**
     * Create a refined {{#crossLink "LoadItem"}}{{/crossLink}}, which contains all the required properties. The type of
     * item is determined by browser support, requirements based on the file type, and developer settings. For example,
     * XHR is only used for file types that support it in new browsers.
     *
     * Before the item is returned, any plugins registered to handle the type or extension will be fired, which may
     * alter the load item.
     * @method _createLoadItem
     * @param {String | Object | HTMLAudioElement | HTMLImageElement} value The item that needs to be preloaded.
     * @param {String} [path] A path to prepend to the item's source. Sources beginning with http:// or similar will
     * not receive a path. Since PreloadJS 0.4.1, the src will be modified to include the `path` and {{#crossLink "LoadQueue/_basePath:property"}}{{/crossLink}}
     * when it is added.
     * @param {String} [basePath] <strong>Deprectated</strong> A base path to prepend to the items source in addition to
     * the path argument.
     * @return {Object} The loader instance that will be used.
     * @private
     */
    p._createLoadItem = function (value, path, basePath) {
        var item = createjs.LoadItem.create(value);
        if (item == null) {
            return null;
        }
        var bp = ""; // Store the generated basePath
        var useBasePath = basePath || this._basePath;
        if (item.src instanceof Object) {
            if (!item.type) {
                return null;
            } // the the src is an object, type is required to pass off to plugin
            if (path) {
                bp = path;
                var pathMatch = createjs.RequestUtils.parseURI(path);
                // Also append basePath
                if (useBasePath != null && !pathMatch.absolute && !pathMatch.relative) {
                    bp = useBasePath + bp;
                }
            }
            else if (useBasePath != null) {
                bp = useBasePath;
            }
        }
        else {
            // Determine Extension, etc.
            var match = createjs.RequestUtils.parseURI(item.src);
            if (match.extension) {
                item.ext = match.extension;
            }
            if (item.type == null) {
                item.type = createjs.RequestUtils.getTypeByExtension(item.ext);
            }
            // Inject path & basePath
            var autoId = item.src;
            if (!match.absolute && !match.relative) {
                if (path) {
                    bp = path;
                    var pathMatch = createjs.RequestUtils.parseURI(path);
                    autoId = path + autoId;
                    // Also append basePath
                    if (useBasePath != null && !pathMatch.absolute && !pathMatch.relative) {
                        bp = useBasePath + bp;
                    }
                }
                else if (useBasePath != null) {
                    bp = useBasePath;
                }
            }
            item.src = bp + item.src;
        }
        item.path = bp;
        // If there's no id, set one now.
        if (item.id === undefined || item.id === null || item.id === "") {
            item.id = autoId;
        }
        // Give plugins a chance to modify the loadItem:
        var customHandler = this._typeCallbacks[item.type] || this._extensionCallbacks[item.ext];
        if (customHandler) {
            // Plugins are now passed both the full source, as well as a combined path+basePath (appropriately)
            var result = customHandler.callback.call(customHandler.scope, item, this);
            // The plugin will handle the load, or has canceled it. Ignore it.
            if (result === false) {
                return null;
                // Load as normal:
            }
            else if (result === true) {
                // Do Nothing
                // Result is a loader class:
            }
            else if (result != null) {
                item._loader = result;
            }
            // Update the extension in case the type changed:
            match = createjs.RequestUtils.parseURI(item.src);
            if (match.extension != null) {
                item.ext = match.extension;
            }
        }
        // Store the item for lookup. This also helps clean-up later.
        this._loadItemsById[item.id] = item;
        this._loadItemsBySrc[item.src] = item;
        if (item.crossOrigin == null) {
            item.crossOrigin = this._crossOrigin;
        }
        return item;
    };
    /**
     * Create a loader for a load item.
     * @method _createLoader
     * @param {Object} item A formatted load item that can be used to generate a loader.
     * @return {AbstractLoader} A loader that can be used to load content.
     * @private
     */
    p._createLoader = function (item) {
        if (item._loader != null) {
            return item._loader;
        }
        // Initially, try and use the provided/supported XHR mode:
        var preferXHR = this.preferXHR;
        for (var i = 0; i < this._availableLoaders.length; i++) {
            var loader = this._availableLoaders[i];
            if (loader && loader.canLoadItem(item)) {
                return new loader(item, preferXHR);
            }
        }
        // TODO: Log error (requires createjs.log)
        return null;
    };
    /**
     * Load the next item in the queue. If the queue is empty (all items have been loaded), then the complete event
     * is processed. The queue will "fill up" any empty slots, up to the max connection specified using
     * {{#crossLink "LoadQueue.setMaxConnections"}}{{/crossLink}} method. The only exception is scripts that are loaded
     * using tags, which have to be loaded one at a time to maintain load order.
     * @method _loadNext
     * @private
     */
    p._loadNext = function () {
        if (this._paused) {
            return;
        }
        // Only dispatch loadstart event when the first file is loaded.
        if (!this._loadStartWasDispatched) {
            this._sendLoadStart();
            this._loadStartWasDispatched = true;
        }
        // The queue has completed.
        if (this._numItems == this._numItemsLoaded) {
            this.loaded = true;
            this._sendComplete();
            // Load the next queue, if it has been defined.
            if (this.next && this.next.load) {
                this.next.load();
            }
        }
        else {
            this.loaded = false;
        }
        // Must iterate forwards to load in the right order.
        for (var i = 0; i < this._loadQueue.length; i++) {
            if (this._currentLoads.length >= this._maxConnections) {
                break;
            }
            var loader = this._loadQueue[i];
            // Determine if we should be only loading one tag-script at a time:
            // Note: maintainOrder items don't do anything here because we can hold onto their loaded value
            if (!this._canStartLoad(loader)) {
                continue;
            }
            this._loadQueue.splice(i, 1);
            i--;
            this._loadItem(loader);
        }
    };
    /**
     * Begin loading an item. Event listeners are not added to the loaders until the load starts.
     * @method _loadItem
     * @param {AbstractLoader} loader The loader instance to start. Currently, this will be an XHRLoader or TagLoader.
     * @private
     */
    p._loadItem = function (loader) {
        loader.on("fileload", this._handleFileLoad, this);
        loader.on("progress", this._handleProgress, this);
        loader.on("complete", this._handleFileComplete, this);
        loader.on("error", this._handleError, this);
        loader.on("fileerror", this._handleFileError, this);
        this._currentLoads.push(loader);
        this._sendFileStart(loader.getItem());
        loader.load();
    };
    /**
     * The callback that is fired when a loader loads a file. This enables loaders like {{#crossLink "ManifestLoader"}}{{/crossLink}}
     * to maintain internal queues, but for this queue to dispatch the {{#crossLink "fileload:event"}}{{/crossLink}}
     * events.
     * @param {Event} event The {{#crossLink "AbstractLoader/fileload:event"}}{{/crossLink}} event from the loader.
     * @private
     * @since 0.6.0
     */
    p._handleFileLoad = function (event) {
        event.target = null;
        this.dispatchEvent(event);
    };
    /**
     * The callback that is fired when a loader encounters an error from an internal file load operation. This enables
     * loaders like M
     * @param event
     * @private
     */
    p._handleFileError = function (event) {
        var newEvent = new createjs.ErrorEvent("FILE_LOAD_ERROR", null, event.item);
        this._sendError(newEvent);
    };
    /**
     * The callback that is fired when a loader encounters an error. The queue will continue loading unless {{#crossLink "LoadQueue/stopOnError:property"}}{{/crossLink}}
     * is set to `true`.
     * @method _handleError
     * @param {ErrorEvent} event The error event, containing relevant error information.
     * @private
     */
    p._handleError = function (event) {
        var loader = event.target;
        this._numItemsLoaded++;
        this._finishOrderedItem(loader, true);
        this._updateProgress();
        var newEvent = new createjs.ErrorEvent("FILE_LOAD_ERROR", null, loader.getItem());
        // TODO: Propagate actual error message.
        this._sendError(newEvent);
        if (!this.stopOnError) {
            this._removeLoadItem(loader);
            this._cleanLoadItem(loader);
            this._loadNext();
        }
        else {
            this.setPaused(true);
        }
    };
    /**
     * An item has finished loading. We can assume that it is totally loaded, has been parsed for immediate use, and
     * is available as the "result" property on the load item. The raw text result for a parsed item (such as JSON, XML,
     * CSS, JavaScript, etc) is available as the "rawResult" property, and can also be looked up using {{#crossLink "LoadQueue/getResult"}}{{/crossLink}}.
     * @method _handleFileComplete
     * @param {Event} event The event object from the loader.
     * @private
     */
    p._handleFileComplete = function (event) {
        var loader = event.target;
        var item = loader.getItem();
        var result = loader.getResult();
        this._loadedResults[item.id] = result;
        var rawResult = loader.getResult(true);
        if (rawResult != null && rawResult !== result) {
            this._loadedRawResults[item.id] = rawResult;
        }
        this._saveLoadedItems(loader);
        // Remove the load item
        this._removeLoadItem(loader);
        if (!this._finishOrderedItem(loader)) {
            // The item was NOT managed, so process it now
            this._processFinishedLoad(item, loader);
        }
        // Clean up the load item
        this._cleanLoadItem(loader);
    };
    /**
     * Some loaders might load additional content, other than the item they were passed (such as {{#crossLink "ManifestLoader"}}{{/crossLink}}).
     * Any items exposed by the loader using {{#crossLink "AbstractLoader/getLoadItems"}}{{/crossLink}} are added to the
     * LoadQueue's look-ups, including {{#crossLink "getItem"}}{{/crossLink}} and {{#crossLink "getResult"}}{{/crossLink}}
     * methods.
     * @method _saveLoadedItems
     * @param {AbstractLoader} loader
     * @protected
     * @since 0.6.0
     */
    p._saveLoadedItems = function (loader) {
        // TODO: Not sure how to handle this. Would be nice to expose the items.
        // Loaders may load sub-items. This adds them to this queue
        var list = loader.getLoadedItems();
        if (list === null) {
            return;
        }
        for (var i = 0; i < list.length; i++) {
            var item = list[i].item;
            // Store item lookups
            this._loadItemsBySrc[item.src] = item;
            this._loadItemsById[item.id] = item;
            // Store loaded content
            this._loadedResults[item.id] = list[i].result;
            this._loadedRawResults[item.id] = list[i].rawResult;
        }
    };
    /**
     * Flag an item as finished. If the item's order is being managed, then ensure that it is allowed to finish, and if
     * so, trigger prior items to trigger as well.
     * @method _finishOrderedItem
     * @param {AbstractLoader} loader
     * @param {Boolean} loadFailed
     * @return {Boolean} If the item's order is being managed. This allows the caller to take an alternate
     * behaviour if it is.
     * @private
     */
    p._finishOrderedItem = function (loader, loadFailed) {
        var item = loader.getItem();
        if ((this.maintainScriptOrder && item.type == createjs.LoadQueue.JAVASCRIPT)
            || item.maintainOrder) {
            //TODO: Evaluate removal of the _currentlyLoadingScript
            if (loader instanceof createjs.JavaScriptLoader) {
                this._currentlyLoadingScript = false;
            }
            var index = createjs.indexOf(this._scriptOrder, item);
            if (index == -1) {
                return false;
            } // This loader no longer exists
            this._loadedScripts[index] = (loadFailed === true) ? true : item;
            this._checkScriptLoadOrder();
            return true;
        }
        return false;
    };
    /**
     * Ensure the scripts load and dispatch in the correct order. When using XHR, scripts are stored in an array in the
     * order they were added, but with a "null" value. When they are completed, the value is set to the load item,
     * and then when they are processed and dispatched, the value is set to `true`. This method simply
     * iterates the array, and ensures that any loaded items that are not preceded by a `null` value are
     * dispatched.
     * @method _checkScriptLoadOrder
     * @private
     */
    p._checkScriptLoadOrder = function () {
        var l = this._loadedScripts.length;
        for (var i = 0; i < l; i++) {
            var item = this._loadedScripts[i];
            if (item === null) {
                break;
            } // This is still loading. Do not process further.
            if (item === true) {
                continue;
            } // This has completed, and been processed. Move on.
            var loadItem = this._loadedResults[item.id];
            if (item.type == createjs.LoadQueue.JAVASCRIPT) {
                // Append script tags to the head automatically.
                createjs.DomUtils.appendToHead(loadItem);
            }
            var loader = item._loader;
            this._processFinishedLoad(item, loader);
            this._loadedScripts[i] = true;
        }
    };
    /**
     * A file has completed loading, and the LoadQueue can move on. This triggers the complete event, and kick-starts
     * the next item.
     * @method _processFinishedLoad
     * @param {LoadItem|Object} item
     * @param {AbstractLoader} loader
     * @protected
     */
    p._processFinishedLoad = function (item, loader) {
        this._numItemsLoaded++;
        // Since LoadQueue needs maintain order, we can't append scripts in the loader.
        // So we do it here instead. Or in _checkScriptLoadOrder();
        if (!this.maintainScriptOrder && item.type == createjs.LoadQueue.JAVASCRIPT) {
            var tag = loader.getTag();
            createjs.DomUtils.appendToHead(tag);
        }
        this._updateProgress();
        this._sendFileComplete(item, loader);
        this._loadNext();
    };
    /**
     * Ensure items with `maintainOrder=true` that are before the specified item have loaded. This only applies to
     * JavaScript items that are being loaded with a TagLoader, since they have to be loaded and completed <strong>before</strong>
     * the script can even be started, since it exist in the DOM while loading.
     * @method _canStartLoad
     * @param {AbstractLoader} loader The loader for the item
     * @return {Boolean} Whether the item can start a load or not.
     * @private
     */
    p._canStartLoad = function (loader) {
        if (!this.maintainScriptOrder || loader.preferXHR) {
            return true;
        }
        var item = loader.getItem();
        if (item.type != createjs.LoadQueue.JAVASCRIPT) {
            return true;
        }
        if (this._currentlyLoadingScript) {
            return false;
        }
        var index = this._scriptOrder.indexOf(item);
        var i = 0;
        while (i < index) {
            var checkItem = this._loadedScripts[i];
            if (checkItem == null) {
                return false;
            }
            i++;
        }
        this._currentlyLoadingScript = true;
        return true;
    };
    /**
     * A load item is completed or was canceled, and needs to be removed from the LoadQueue.
     * @method _removeLoadItem
     * @param {AbstractLoader} loader A loader instance to remove.
     * @private
     */
    p._removeLoadItem = function (loader) {
        var l = this._currentLoads.length;
        for (var i = 0; i < l; i++) {
            if (this._currentLoads[i] == loader) {
                this._currentLoads.splice(i, 1);
                break;
            }
        }
    };
    /**
     * Remove unneeded references from a loader.
     *
     * @param loader
     * @private
     */
    p._cleanLoadItem = function (loader) {
        var item = loader.getItem();
        if (item) {
            delete item._loader;
        }
    };
    /**
     * An item has dispatched progress. Propagate that progress, and update the LoadQueue's overall progress.
     * @method _handleProgress
     * @param {ProgressEvent} event The progress event from the item.
     * @private
     */
    p._handleProgress = function (event) {
        var loader = event.target;
        this._sendFileProgress(loader.getItem(), loader.progress);
        this._updateProgress();
    };
    /**
     * Overall progress has changed, so determine the new progress amount and dispatch it. This changes any time an
     * item dispatches progress or completes. Note that since we don't always know the actual filesize of items before
     * they are loaded. In this case, we define a "slot" for each item (1 item in 10 would get 10%), and then append
     * loaded progress on top of the already-loaded items.
     *
     * For example, if 5/10 items have loaded, and item 6 is 20% loaded, the total progress would be:
     * <ul>
     *      <li>5/10 of the items in the queue (50%)</li>
     *      <li>plus 20% of item 6's slot (2%)</li>
     *      <li>equals 52%</li>
     * </ul>
     * @method _updateProgress
     * @private
     */
    p._updateProgress = function () {
        var loaded = this._numItemsLoaded / this._numItems; // Fully Loaded Progress
        var remaining = this._numItems - this._numItemsLoaded;
        if (remaining > 0) {
            var chunk = 0;
            for (var i = 0, l = this._currentLoads.length; i < l; i++) {
                chunk += this._currentLoads[i].progress;
            }
            loaded += (chunk / remaining) * (remaining / this._numItems);
        }
        if (this._lastProgress != loaded) {
            this._sendProgress(loaded);
            this._lastProgress = loaded;
        }
    };
    /**
     * Clean out item results, to free them from memory. Mainly, the loaded item and results are cleared from internal
     * hashes.
     * @method _disposeItem
     * @param {LoadItem|Object} item The item that was passed in for preloading.
     * @private
     */
    p._disposeItem = function (item) {
        delete this._loadedResults[item.id];
        delete this._loadedRawResults[item.id];
        delete this._loadItemsById[item.id];
        delete this._loadItemsBySrc[item.src];
    };
    /**
     * Dispatch a "fileprogress" {{#crossLink "Event"}}{{/crossLink}}. Please see the LoadQueue {{#crossLink "LoadQueue/fileprogress:event"}}{{/crossLink}}
     * event for details on the event payload.
     * @method _sendFileProgress
     * @param {LoadItem|Object} item The item that is being loaded.
     * @param {Number} progress The amount the item has been loaded (between 0 and 1).
     * @protected
     */
    p._sendFileProgress = function (item, progress) {
        if (this._isCanceled() || this._paused) {
            return;
        }
        if (!this.hasEventListener("fileprogress")) {
            return;
        }
        //LM: Rework ProgressEvent to support this?
        var event = new createjs.Event("fileprogress");
        event.progress = progress;
        event.loaded = progress;
        event.total = 1;
        event.item = item;
        this.dispatchEvent(event);
    };
    /**
     * Dispatch a fileload {{#crossLink "Event"}}{{/crossLink}}. Please see the {{#crossLink "LoadQueue/fileload:event"}}{{/crossLink}} event for
     * details on the event payload.
     * @method _sendFileComplete
     * @param {LoadItemObject} item The item that is being loaded.
     * @param {AbstractLoader} loader
     * @protected
     */
    p._sendFileComplete = function (item, loader) {
        if (this._isCanceled() || this._paused) {
            return;
        }
        var event = new createjs.Event("fileload");
        event.loader = loader;
        event.item = item;
        event.result = this._loadedResults[item.id];
        event.rawResult = this._loadedRawResults[item.id];
        // This calls a handler specified on the actual load item. Currently, the SoundJS plugin uses this.
        if (item.completeHandler) {
            item.completeHandler(event);
        }
        this.hasEventListener("fileload") && this.dispatchEvent(event);
    };
    /**
     * Dispatch a filestart {{#crossLink "Event"}}{{/crossLink}} immediately before a file starts to load. Please see
     * the {{#crossLink "LoadQueue/filestart:event"}}{{/crossLink}} event for details on the event payload.
     * @method _sendFileStart
     * @param {LoadItem|Object} item The item that is being loaded.
     * @protected
     */
    p._sendFileStart = function (item) {
        var event = new createjs.Event("filestart");
        event.item = item;
        this.hasEventListener("filestart") && this.dispatchEvent(event);
    };
    p.toString = function () {
        return "[PreloadJS LoadQueue]";
    };
    createjs.LoadQueue = createjs.promote(LoadQueue, "AbstractLoader");
}());
//##############################################################################
// TextLoader.js
//##############################################################################
this.createjs = this.createjs || {};
(function () {
    "use strict";
    // constructor
    /**
     * A loader for Text files.
     * @class TextLoader
     * @param {LoadItem|Object} loadItem
     * @extends AbstractLoader
     * @constructor
     */
    function TextLoader(loadItem) {
        this.AbstractLoader_constructor(loadItem, true, createjs.AbstractLoader.TEXT);
    }
    ;
    var p = createjs.extend(TextLoader, createjs.AbstractLoader);
    var s = TextLoader;
    // static methods
    /**
     * Determines if the loader can load a specific item. This loader loads items that are of type {{#crossLink "AbstractLoader/TEXT:property"}}{{/crossLink}},
     * but is also the default loader if a file type can not be determined.
     * @method canLoadItem
     * @param {LoadItem|Object} item The LoadItem that a LoadQueue is trying to load.
     * @returns {Boolean} Whether the loader can load the item.
     * @static
     */
    s.canLoadItem = function (item) {
        return item.type == createjs.AbstractLoader.TEXT;
    };
    createjs.TextLoader = createjs.promote(TextLoader, "AbstractLoader");
}());
//##############################################################################
// BinaryLoader.js
//##############################################################################
this.createjs = this.createjs || {};
(function () {
    "use strict";
    // constructor
    /**
     * A loader for binary files. This is useful for loading web audio, or content that requires an ArrayBuffer.
     * @class BinaryLoader
     * @param {LoadItem|Object} loadItem
     * @extends AbstractLoader
     * @constructor
     */
    function BinaryLoader(loadItem) {
        this.AbstractLoader_constructor(loadItem, true, createjs.AbstractLoader.BINARY);
        this.on("initialize", this._updateXHR, this);
    }
    ;
    var p = createjs.extend(BinaryLoader, createjs.AbstractLoader);
    var s = BinaryLoader;
    // static methods
    /**
     * Determines if the loader can load a specific item. This loader can only load items that are of type
     * {{#crossLink "AbstractLoader/BINARY:property"}}{{/crossLink}}
     * @method canLoadItem
     * @param {LoadItem|Object} item The LoadItem that a LoadQueue is trying to load.
     * @returns {Boolean} Whether the loader can load the item.
     * @static
     */
    s.canLoadItem = function (item) {
        return item.type == createjs.AbstractLoader.BINARY;
    };
    // private methods
    /**
     * Before the item loads, set the response type to "arraybuffer"
     * @property _updateXHR
     * @param {Event} event
     * @private
     */
    p._updateXHR = function (event) {
        event.loader.setResponseType("arraybuffer");
    };
    createjs.BinaryLoader = createjs.promote(BinaryLoader, "AbstractLoader");
}());
//##############################################################################
// CSSLoader.js
//##############################################################################
this.createjs = this.createjs || {};
(function () {
    "use strict";
    // constructor
    /**
     * A loader for CSS files.
     * @class CSSLoader
     * @param {LoadItem|Object} loadItem
     * @param {Boolean} preferXHR
     * @extends AbstractLoader
     * @constructor
     */
    function CSSLoader(loadItem, preferXHR) {
        this.AbstractLoader_constructor(loadItem, preferXHR, createjs.AbstractLoader.CSS);
        // public properties
        this.resultFormatter = this._formatResult;
        // protected properties
        this._tagSrcAttribute = "href";
        if (preferXHR) {
            this._tag = document.createElement("style");
        }
        else {
            this._tag = document.createElement("link");
        }
        this._tag.rel = "stylesheet";
        this._tag.type = "text/css";
    }
    ;
    var p = createjs.extend(CSSLoader, createjs.AbstractLoader);
    var s = CSSLoader;
    // static methods
    /**
     * Determines if the loader can load a specific item. This loader can only load items that are of type
     * {{#crossLink "AbstractLoader/CSS:property"}}{{/crossLink}}.
     * @method canLoadItem
     * @param {LoadItem|Object} item The LoadItem that a LoadQueue is trying to load.
     * @returns {Boolean} Whether the loader can load the item.
     * @static
     */
    s.canLoadItem = function (item) {
        return item.type == createjs.AbstractLoader.CSS;
    };
    // protected methods
    /**
     * The result formatter for CSS files.
     * @method _formatResult
     * @param {AbstractLoader} loader
     * @returns {HTMLLinkElement|HTMLStyleElement}
     * @private
     */
    p._formatResult = function (loader) {
        if (this._preferXHR) {
            var tag = loader.getTag();
            if (tag.styleSheet) {
                tag.styleSheet.cssText = loader.getResult(true);
            }
            else {
                var textNode = document.createTextNode(loader.getResult(true));
                tag.appendChild(textNode);
            }
        }
        else {
            tag = this._tag;
        }
        createjs.DomUtils.appendToHead(tag);
        return tag;
    };
    createjs.CSSLoader = createjs.promote(CSSLoader, "AbstractLoader");
}());
//##############################################################################
// ImageLoader.js
//##############################################################################
this.createjs = this.createjs || {};
(function () {
    "use strict";
    // constructor
    /**
     * A loader for image files.
     * @class ImageLoader
     * @param {LoadItem|Object} loadItem
     * @param {Boolean} preferXHR
     * @extends AbstractLoader
     * @constructor
     */
    function ImageLoader(loadItem, preferXHR) {
        this.AbstractLoader_constructor(loadItem, preferXHR, createjs.AbstractLoader.IMAGE);
        // public properties
        this.resultFormatter = this._formatResult;
        // protected properties
        this._tagSrcAttribute = "src";
        // Check if the preload item is already a tag.
        if (createjs.RequestUtils.isImageTag(loadItem)) {
            this._tag = loadItem;
        }
        else if (createjs.RequestUtils.isImageTag(loadItem.src)) {
            this._tag = loadItem.src;
        }
        else if (createjs.RequestUtils.isImageTag(loadItem.tag)) {
            this._tag = loadItem.tag;
        }
        if (this._tag != null) {
            this._preferXHR = false;
        }
        else {
            this._tag = document.createElement("img");
        }
        this.on("initialize", this._updateXHR, this);
    }
    ;
    var p = createjs.extend(ImageLoader, createjs.AbstractLoader);
    var s = ImageLoader;
    // static methods
    /**
     * Determines if the loader can load a specific item. This loader can only load items that are of type
     * {{#crossLink "AbstractLoader/IMAGE:property"}}{{/crossLink}}.
     * @method canLoadItem
     * @param {LoadItem|Object} item The LoadItem that a LoadQueue is trying to load.
     * @returns {Boolean} Whether the loader can load the item.
     * @static
     */
    s.canLoadItem = function (item) {
        return item.type == createjs.AbstractLoader.IMAGE;
    };
    // public methods
    p.load = function () {
        if (this._tag.src != "" && this._tag.complete) {
            this._sendComplete();
            return;
        }
        var crossOrigin = this._item.crossOrigin;
        if (crossOrigin == true) {
            crossOrigin = "Anonymous";
        }
        if (crossOrigin != null && !createjs.RequestUtils.isLocal(this._item.src)) {
            this._tag.crossOrigin = crossOrigin;
        }
        this.AbstractLoader_load();
    };
    // protected methods
    /**
     * Before the item loads, set its mimeType and responseType.
     * @property _updateXHR
     * @param {Event} event
     * @private
     */
    p._updateXHR = function (event) {
        event.loader.mimeType = 'text/plain; charset=x-user-defined-binary';
        // Only exists for XHR
        if (event.loader.setResponseType) {
            event.loader.setResponseType("blob");
        }
    };
    /**
     * The result formatter for Image files.
     * @method _formatResult
     * @param {AbstractLoader} loader
     * @returns {HTMLImageElement}
     * @private
     */
    p._formatResult = function (loader) {
        return this._formatImage;
    };
    /**
     * The asynchronous image formatter function. This is required because images have
     * a short delay before they are ready.
     * @method _formatImage
     * @param {Function} successCallback The method to call when the result has finished formatting
     * @param {Function} errorCallback The method to call if an error occurs during formatting
     * @private
     */
    p._formatImage = function (successCallback, errorCallback) {
        var tag = this._tag;
        var URL = window.URL || window.webkitURL;
        if (!this._preferXHR) {
            //document.body.removeChild(tag);
        }
        else if (URL) {
            var objURL = URL.createObjectURL(this.getResult(true));
            tag.src = objURL;
            tag.addEventListener("load", this._cleanUpURL, false);
            tag.addEventListener("error", this._cleanUpURL, false);
        }
        else {
            tag.src = this._item.src;
        }
        if (tag.complete) {
            successCallback(tag);
        }
        else {
            tag.onload = createjs.proxy(function () {
                successCallback(this._tag);
            }, this);
            tag.onerror = createjs.proxy(function () {
                errorCallback(_this._tag);
            }, this);
        }
    };
    /**
     * Clean up the ObjectURL, the tag is done with it. Note that this function is run
     * as an event listener without a proxy/closure, as it doesn't require it - so do not
     * include any functionality that requires scope without changing it.
     * @method _cleanUpURL
     * @param event
     * @private
     */
    p._cleanUpURL = function (event) {
        var URL = window.URL || window.webkitURL;
        URL.revokeObjectURL(event.target.src);
    };
    createjs.ImageLoader = createjs.promote(ImageLoader, "AbstractLoader");
}());
//##############################################################################
// JavaScriptLoader.js
//##############################################################################
this.createjs = this.createjs || {};
(function () {
    "use strict";
    // constructor
    /**
     * A loader for JavaScript files.
     * @class JavaScriptLoader
     * @param {LoadItem|Object} loadItem
     * @param {Boolean} preferXHR
     * @extends AbstractLoader
     * @constructor
     */
    function JavaScriptLoader(loadItem, preferXHR) {
        this.AbstractLoader_constructor(loadItem, preferXHR, createjs.AbstractLoader.JAVASCRIPT);
        // public properties
        this.resultFormatter = this._formatResult;
        // protected properties
        this._tagSrcAttribute = "src";
        this.setTag(document.createElement("script"));
    }
    ;
    var p = createjs.extend(JavaScriptLoader, createjs.AbstractLoader);
    var s = JavaScriptLoader;
    // static methods
    /**
     * Determines if the loader can load a specific item. This loader can only load items that are of type
     * {{#crossLink "AbstractLoader/JAVASCRIPT:property"}}{{/crossLink}}
     * @method canLoadItem
     * @param {LoadItem|Object} item The LoadItem that a LoadQueue is trying to load.
     * @returns {Boolean} Whether the loader can load the item.
     * @static
     */
    s.canLoadItem = function (item) {
        return item.type == createjs.AbstractLoader.JAVASCRIPT;
    };
    // protected methods
    /**
     * The result formatter for JavaScript files.
     * @method _formatResult
     * @param {AbstractLoader} loader
     * @returns {HTMLLinkElement|HTMLStyleElement}
     * @private
     */
    p._formatResult = function (loader) {
        var tag = loader.getTag();
        if (this._preferXHR) {
            tag.text = loader.getResult(true);
        }
        return tag;
    };
    createjs.JavaScriptLoader = createjs.promote(JavaScriptLoader, "AbstractLoader");
}());
//##############################################################################
// JSONLoader.js
//##############################################################################
this.createjs = this.createjs || {};
(function () {
    "use strict";
    // constructor
    /**
     * A loader for JSON files. To load JSON cross-domain, use JSONP and the {{#crossLink "JSONPLoader"}}{{/crossLink}}
     * instead. To load JSON-formatted manifests, use {{#crossLink "ManifestLoader"}}{{/crossLink}}, and to
     * load EaselJS SpriteSheets, use {{#crossLink "SpriteSheetLoader"}}{{/crossLink}}.
     * @class JSONLoader
     * @param {LoadItem|Object} loadItem
     * @extends AbstractLoader
     * @constructor
     */
    function JSONLoader(loadItem) {
        this.AbstractLoader_constructor(loadItem, true, createjs.AbstractLoader.JSON);
        // public properties
        this.resultFormatter = this._formatResult;
    }
    ;
    var p = createjs.extend(JSONLoader, createjs.AbstractLoader);
    var s = JSONLoader;
    // static methods
    /**
     * Determines if the loader can load a specific item. This loader can only load items that are of type
     * {{#crossLink "AbstractLoader/JSON:property"}}{{/crossLink}}.
     * @method canLoadItem
     * @param {LoadItem|Object} item The LoadItem that a LoadQueue is trying to load.
     * @returns {Boolean} Whether the loader can load the item.
     * @static
     */
    s.canLoadItem = function (item) {
        return item.type == createjs.AbstractLoader.JSON;
    };
    // protected methods
    /**
     * The result formatter for JSON files.
     * @method _formatResult
     * @param {AbstractLoader} loader
     * @returns {HTMLLinkElement|HTMLStyleElement}
     * @private
     */
    p._formatResult = function (loader) {
        var json = null;
        try {
            json = createjs.DataUtils.parseJSON(loader.getResult(true));
        }
        catch (e) {
            var event = new createjs.ErrorEvent("JSON_FORMAT", null, e);
            this._sendError(event);
            return e;
        }
        return json;
    };
    createjs.JSONLoader = createjs.promote(JSONLoader, "AbstractLoader");
}());
//##############################################################################
// JSONPLoader.js
//##############################################################################
this.createjs = this.createjs || {};
(function () {
    "use strict";
    // constructor
    /**
     * A loader for JSONP files, which are JSON-formatted text files, wrapped in a callback. To load regular JSON
     * without a callback use the {{#crossLink "JSONLoader"}}{{/crossLink}} instead. To load JSON-formatted manifests,
     * use {{#crossLink "ManifestLoader"}}{{/crossLink}}, and to load EaselJS SpriteSheets, use
     * {{#crossLink "SpriteSheetLoader"}}{{/crossLink}}.
     *
     * JSONP is a format that provides a solution for loading JSON files cross-domain <em>without</em> requiring CORS.
     * JSONP files are loaded as JavaScript, and the "callback" is executed once they are loaded. The callback in the
     * JSONP must match the callback passed to the loadItem.
     *
     * <h4>Example JSONP</h4>
     *
     * 		callbackName({
     * 			"name": "value",
     *	 		"num": 3,
     *			"obj": { "bool":true }
     * 		});
     *
     * <h4>Example</h4>
     *
     * 		var loadItem = {id:"json", type:"jsonp", src:"http://server.com/text.json", callback:"callbackName"}
     * 		var queue = new createjs.LoadQueue();
     * 		queue.on("complete", handleComplete);
     * 		queue.loadItem(loadItem);
     *
     * 		function handleComplete(event) }
     * 			var json = queue.getResult("json");
     * 			console.log(json.obj.bool); // true
     * 		}
     *
     * Note that JSONP files loaded concurrently require a <em>unique</em> callback. To ensure JSONP files are loaded
     * in order, either use the {{#crossLink "LoadQueue/setMaxConnections"}}{{/crossLink}} method (set to 1),
     * or set {{#crossLink "LoadItem/maintainOrder:property"}}{{/crossLink}} on items with the same callback.
     *
     * @class JSONPLoader
     * @param {LoadItem|Object} loadItem
     * @extends AbstractLoader
     * @constructor
     */
    function JSONPLoader(loadItem) {
        this.AbstractLoader_constructor(loadItem, false, createjs.AbstractLoader.JSONP);
        this.setTag(document.createElement("script"));
        this.getTag().type = "text/javascript";
    }
    ;
    var p = createjs.extend(JSONPLoader, createjs.AbstractLoader);
    var s = JSONPLoader;
    // static methods
    /**
     * Determines if the loader can load a specific item. This loader can only load items that are of type
     * {{#crossLink "AbstractLoader/JSONP:property"}}{{/crossLink}}.
     * @method canLoadItem
     * @param {LoadItem|Object} item The LoadItem that a LoadQueue is trying to load.
     * @returns {Boolean} Whether the loader can load the item.
     * @static
     */
    s.canLoadItem = function (item) {
        return item.type == createjs.AbstractLoader.JSONP;
    };
    // public methods
    p.cancel = function () {
        this.AbstractLoader_cancel();
        this._dispose();
    };
    /**
     * Loads the JSONp file.  Because of the unique loading needs of JSONp
     * we don't use the AbstractLoader.load() method.
     *
     * @method load
     *
     */
    p.load = function () {
        if (this._item.callback == null) {
            throw new Error('callback is required for loading JSONP requests.');
        }
        // TODO: Look into creating our own iFrame to handle the load
        // In the first attempt, FF did not get the result
        //   result instanceof Object did not work either
        //   so we would need to clone the result.
        if (window[this._item.callback] != null) {
            throw new Error("JSONP callback '" +
                this._item.callback +
                "' already exists on window. You need to specify a different callback or re-name the current one.");
        }
        window[this._item.callback] = createjs.proxy(this._handleLoad, this);
        window.document.body.appendChild(this._tag);
        this._loadTimeout = setTimeout(createjs.proxy(this._handleTimeout, this), this._item.loadTimeout);
        // Load the tag
        this._tag.src = this._item.src;
    };
    // private methods
    /**
     * Handle the JSONP callback, which is a public method defined on `window`.
     * @method _handleLoad
     * @param {Object} data The formatted JSON data.
     * @private
     */
    p._handleLoad = function (data) {
        this._result = this._rawResult = data;
        this._sendComplete();
        this._dispose();
    };
    /**
     * The tag request has not loaded within the time specfied in loadTimeout.
     * @method _handleError
     * @param {Object} event The XHR error event.
     * @private
     */
    p._handleTimeout = function () {
        this._dispose();
        this.dispatchEvent(new createjs.ErrorEvent("timeout"));
    };
    /**
     * Clean up the JSONP load. This clears out the callback and script tag that this loader creates.
     * @method _dispose
     * @private
     */
    p._dispose = function () {
        window.document.body.removeChild(this._tag);
        delete window[this._item.callback];
        clearTimeout(this._loadTimeout);
    };
    createjs.JSONPLoader = createjs.promote(JSONPLoader, "AbstractLoader");
}());
//##############################################################################
// ManifestLoader.js
//##############################################################################
this.createjs = this.createjs || {};
(function () {
    "use strict";
    // constructor
    /**
     * A loader for JSON manifests. Items inside the manifest are loaded before the loader completes. To load manifests
     * using JSONP, specify a {{#crossLink "LoadItem/callback:property"}}{{/crossLink}} as part of the
     * {{#crossLink "LoadItem"}}{{/crossLink}}.
     *
     * The list of files in the manifest must be defined on the top-level JSON object in a `manifest` property. This
     * example shows a sample manifest definition, as well as how to to include a sub-manifest.
     *
     * 		{
     * 			"path": "assets/",
     *	 	    "manifest": [
     *				"image.png",
     *				{"src": "image2.png", "id":"image2"},
     *				{"src": "sub-manifest.json", "type":"manifest", "callback":"jsonCallback"}
     *	 	    ]
     *	 	}
     *
     * When a ManifestLoader has completed loading, the parent loader (usually a {{#crossLink "LoadQueue"}}{{/crossLink}},
     * but could also be another ManifestLoader) will inherit all the loaded items, so you can access them directly.
     *
     * Note that the {{#crossLink "JSONLoader"}}{{/crossLink}} and {{#crossLink "JSONPLoader"}}{{/crossLink}} are
     * higher priority loaders, so manifests <strong>must</strong> set the {{#crossLink "LoadItem"}}{{/crossLink}}
     * {{#crossLink "LoadItem/type:property"}}{{/crossLink}} property to {{#crossLink "AbstractLoader/MANIFEST:property"}}{{/crossLink}}.
     * @class ManifestLoader
     * @param {LoadItem|Object} loadItem
     * @extends AbstractLoader
     * @constructor
     */
    function ManifestLoader(loadItem) {
        this.AbstractLoader_constructor(loadItem, null, createjs.AbstractLoader.MANIFEST);
        // Public Properties
        /**
         * An array of the plugins registered using {{#crossLink "LoadQueue/installPlugin"}}{{/crossLink}},
         * used to pass plugins to new LoadQueues that may be created.
         * @property _plugins
         * @type {Array}
         * @private
         * @since 0.6.1
         */
        this.plugins = null;
        // Protected Properties
        /**
         * An internal {{#crossLink "LoadQueue"}}{{/crossLink}} that loads the contents of the manifest.
         * @property _manifestQueue
         * @type {LoadQueue}
         * @private
         */
        this._manifestQueue = null;
    }
    ;
    var p = createjs.extend(ManifestLoader, createjs.AbstractLoader);
    var s = ManifestLoader;
    // static properties
    /**
     * The amount of progress that the manifest itself takes up.
     * @property MANIFEST_PROGRESS
     * @type {number}
     * @default 0.25 (25%)
     * @private
     * @static
     */
    s.MANIFEST_PROGRESS = 0.25;
    // static methods
    /**
     * Determines if the loader can load a specific item. This loader can only load items that are of type
     * {{#crossLink "AbstractLoader/MANIFEST:property"}}{{/crossLink}}
     * @method canLoadItem
     * @param {LoadItem|Object} item The LoadItem that a LoadQueue is trying to load.
     * @returns {Boolean} Whether the loader can load the item.
     * @static
     */
    s.canLoadItem = function (item) {
        return item.type == createjs.AbstractLoader.MANIFEST;
    };
    // public methods
    p.load = function () {
        this.AbstractLoader_load();
    };
    // protected methods
    p._createRequest = function () {
        var callback = this._item.callback;
        if (callback != null) {
            this._request = new createjs.JSONPLoader(this._item);
        }
        else {
            this._request = new createjs.JSONLoader(this._item);
        }
    };
    p.handleEvent = function (event) {
        switch (event.type) {
            case "complete":
                this._rawResult = event.target.getResult(true);
                this._result = event.target.getResult();
                this._sendProgress(s.MANIFEST_PROGRESS);
                this._loadManifest(this._result);
                return;
            case "progress":
                event.loaded *= s.MANIFEST_PROGRESS;
                this.progress = event.loaded / event.total;
                if (isNaN(this.progress) || this.progress == Infinity) {
                    this.progress = 0;
                }
                this._sendProgress(event);
                return;
        }
        this.AbstractLoader_handleEvent(event);
    };
    p.destroy = function () {
        this.AbstractLoader_destroy();
        this._manifestQueue.close();
    };
    /**
     * Create and load the manifest items once the actual manifest has been loaded.
     * @method _loadManifest
     * @param {Object} json
     * @private
     */
    p._loadManifest = function (json) {
        if (json && json.manifest) {
            var queue = this._manifestQueue = new createjs.LoadQueue();
            queue.on("fileload", this._handleManifestFileLoad, this);
            queue.on("progress", this._handleManifestProgress, this);
            queue.on("complete", this._handleManifestComplete, this, true);
            queue.on("error", this._handleManifestError, this, true);
            for (var i = 0, l = this.plugins.length; i < l; i++) {
                queue.installPlugin(this.plugins[i]);
            }
            queue.loadManifest(json);
        }
        else {
            this._sendComplete();
        }
    };
    /**
     * An item from the {{#crossLink "_manifestQueue:property"}}{{/crossLink}} has completed.
     * @method _handleManifestFileLoad
     * @param {Event} event
     * @private
     */
    p._handleManifestFileLoad = function (event) {
        event.target = null;
        this.dispatchEvent(event);
    };
    /**
     * The manifest has completed loading. This triggers the {{#crossLink "AbstractLoader/complete:event"}}{{/crossLink}}
     * {{#crossLink "Event"}}{{/crossLink}} from the ManifestLoader.
     * @method _handleManifestComplete
     * @param {Event} event
     * @private
     */
    p._handleManifestComplete = function (event) {
        this._loadedItems = this._manifestQueue.getItems(true);
        this._sendComplete();
    };
    /**
     * The manifest has reported progress.
     * @method _handleManifestProgress
     * @param {ProgressEvent} event
     * @private
     */
    p._handleManifestProgress = function (event) {
        this.progress = event.progress * (1 - s.MANIFEST_PROGRESS) + s.MANIFEST_PROGRESS;
        this._sendProgress(this.progress);
    };
    /**
     * The manifest has reported an error with one of the files.
     * @method _handleManifestError
     * @param {ErrorEvent} event
     * @private
     */
    p._handleManifestError = function (event) {
        var newEvent = new createjs.Event("fileerror");
        newEvent.item = event.data;
        this.dispatchEvent(newEvent);
    };
    createjs.ManifestLoader = createjs.promote(ManifestLoader, "AbstractLoader");
}());
//##############################################################################
// SoundLoader.js
//##############################################################################
this.createjs = this.createjs || {};
(function () {
    "use strict";
    // constructor
    /**
     * A loader for HTML audio files. PreloadJS can not load WebAudio files, as a WebAudio context is required, which
     * should be created by either a library playing the sound (such as <a href="http://soundjs.com">SoundJS</a>, or an
     * external framework that handles audio playback. To load content that can be played by WebAudio, use the
     * {{#crossLink "BinaryLoader"}}{{/crossLink}}, and handle the audio context decoding manually.
     * @class SoundLoader
     * @param {LoadItem|Object} loadItem
     * @param {Boolean} preferXHR
     * @extends AbstractMediaLoader
     * @constructor
     */
    function SoundLoader(loadItem, preferXHR) {
        this.AbstractMediaLoader_constructor(loadItem, preferXHR, createjs.AbstractLoader.SOUND);
        // protected properties
        if (createjs.RequestUtils.isAudioTag(loadItem)) {
            this._tag = loadItem;
        }
        else if (createjs.RequestUtils.isAudioTag(loadItem.src)) {
            this._tag = loadItem;
        }
        else if (createjs.RequestUtils.isAudioTag(loadItem.tag)) {
            this._tag = createjs.RequestUtils.isAudioTag(loadItem) ? loadItem : loadItem.src;
        }
        if (this._tag != null) {
            this._preferXHR = false;
        }
    }
    ;
    var p = createjs.extend(SoundLoader, createjs.AbstractMediaLoader);
    var s = SoundLoader;
    // static methods
    /**
     * Determines if the loader can load a specific item. This loader can only load items that are of type
     * {{#crossLink "AbstractLoader/SOUND:property"}}{{/crossLink}}.
     * @method canLoadItem
     * @param {LoadItem|Object} item The LoadItem that a LoadQueue is trying to load.
     * @returns {Boolean} Whether the loader can load the item.
     * @static
     */
    s.canLoadItem = function (item) {
        return item.type == createjs.AbstractLoader.SOUND;
    };
    // protected methods
    p._createTag = function (src) {
        var tag = document.createElement("audio");
        tag.autoplay = false;
        tag.preload = "none";
        //LM: Firefox fails when this the preload="none" for other tags, but it needs to be "none" to ensure PreloadJS works.
        tag.src = src;
        return tag;
    };
    createjs.SoundLoader = createjs.promote(SoundLoader, "AbstractMediaLoader");
}());
//##############################################################################
// VideoLoader.js
//##############################################################################
this.createjs = this.createjs || {};
(function () {
    "use strict";
    // constructor
    /**
     * A loader for video files.
     * @class VideoLoader
     * @param {LoadItem|Object} loadItem
     * @param {Boolean} preferXHR
     * @extends AbstractMediaLoader
     * @constructor
     */
    function VideoLoader(loadItem, preferXHR) {
        this.AbstractMediaLoader_constructor(loadItem, preferXHR, createjs.AbstractLoader.VIDEO);
        if (createjs.RequestUtils.isVideoTag(loadItem) || createjs.RequestUtils.isVideoTag(loadItem.src)) {
            this.setTag(createjs.RequestUtils.isVideoTag(loadItem) ? loadItem : loadItem.src);
            // We can't use XHR for a tag that's passed in.
            this._preferXHR = false;
        }
        else {
            this.setTag(this._createTag());
        }
    }
    ;
    var p = createjs.extend(VideoLoader, createjs.AbstractMediaLoader);
    var s = VideoLoader;
    /**
     * Create a new video tag
     *
     * @returns {HTMLElement}
     * @private
     */
    p._createTag = function () {
        return document.createElement("video");
    };
    // static methods
    /**
     * Determines if the loader can load a specific item. This loader can only load items that are of type
     * {{#crossLink "AbstractLoader/VIDEO:property"}}{{/crossLink}}.
     * @method canLoadItem
     * @param {LoadItem|Object} item The LoadItem that a LoadQueue is trying to load.
     * @returns {Boolean} Whether the loader can load the item.
     * @static
     */
    s.canLoadItem = function (item) {
        return item.type == createjs.AbstractLoader.VIDEO;
    };
    createjs.VideoLoader = createjs.promote(VideoLoader, "AbstractMediaLoader");
}());
//##############################################################################
// SpriteSheetLoader.js
//##############################################################################
this.createjs = this.createjs || {};
(function () {
    "use strict";
    // constructor
    /**
     * A loader for EaselJS SpriteSheets. Images inside the spritesheet definition are loaded before the loader
     * completes. To load SpriteSheets using JSONP, specify a {{#crossLink "LoadItem/callback:property"}}{{/crossLink}}
     * as part of the {{#crossLink "LoadItem"}}{{/crossLink}}. Note that the {{#crossLink "JSONLoader"}}{{/crossLink}}
     * and {{#crossLink "JSONPLoader"}}{{/crossLink}} are higher priority loaders, so SpriteSheets <strong>must</strong>
     * set the {{#crossLink "LoadItem"}}{{/crossLink}} {{#crossLink "LoadItem/type:property"}}{{/crossLink}} property
     * to {{#crossLink "AbstractLoader/SPRITESHEET:property"}}{{/crossLink}}.
     *
     * The {{#crossLink "LoadItem"}}{{/crossLink}} {{#crossLink "LoadItem/crossOrigin:property"}}{{/crossLink}} as well
     * as the {{#crossLink "LoadQueue's"}}{{/crossLink}} `basePath` argument and {{#crossLink "LoadQueue/_preferXHR"}}{{/crossLink}}
     * property supplied to the {{#crossLink "LoadQueue"}}{{/crossLink}} are passed on to the sub-manifest that loads
     * the SpriteSheet images.
     *
     * Note that the SpriteSheet JSON does not respect the {{#crossLink "LoadQueue/_preferXHR:property"}}{{/crossLink}}
     * property, which should instead be determined by the presence of a {{#crossLink "LoadItem/callback:property"}}{{/crossLink}}
     * property on the SpriteSheet load item. This is because the JSON loaded will have a different format depending on
     * if it is loaded as JSON, so just changing `preferXHR` is not enough to change how it is loaded.
     * @class SpriteSheetLoader
     * @param {LoadItem|Object} loadItem
     * @extends AbstractLoader
     * @constructor
     */
    function SpriteSheetLoader(loadItem, preferXHR) {
        this.AbstractLoader_constructor(loadItem, preferXHR, createjs.AbstractLoader.SPRITESHEET);
        // protected properties
        /**
         * An internal queue which loads the SpriteSheet's images.
         * @method _manifestQueue
         * @type {LoadQueue}
         * @private
         */
        this._manifestQueue = null;
    }
    var p = createjs.extend(SpriteSheetLoader, createjs.AbstractLoader);
    var s = SpriteSheetLoader;
    // static properties
    /**
     * The amount of progress that the manifest itself takes up.
     * @property SPRITESHEET_PROGRESS
     * @type {number}
     * @default 0.25 (25%)
     * @private
     * @static
     */
    s.SPRITESHEET_PROGRESS = 0.25;
    // static methods
    /**
     * Determines if the loader can load a specific item. This loader can only load items that are of type
     * {{#crossLink "AbstractLoader/SPRITESHEET:property"}}{{/crossLink}}
     * @method canLoadItem
     * @param {LoadItem|Object} item The LoadItem that a LoadQueue is trying to load.
     * @returns {Boolean} Whether the loader can load the item.
     * @static
     */
    s.canLoadItem = function (item) {
        return item.type == createjs.AbstractLoader.SPRITESHEET;
    };
    // public methods
    p.destroy = function () {
        this.AbstractLoader_destroy;
        this._manifestQueue.close();
    };
    // protected methods
    p._createRequest = function () {
        var callback = this._item.callback;
        if (callback != null) {
            this._request = new createjs.JSONPLoader(this._item);
        }
        else {
            this._request = new createjs.JSONLoader(this._item);
        }
    };
    p.handleEvent = function (event) {
        switch (event.type) {
            case "complete":
                this._rawResult = event.target.getResult(true);
                this._result = event.target.getResult();
                this._sendProgress(s.SPRITESHEET_PROGRESS);
                this._loadManifest(this._result);
                return;
            case "progress":
                event.loaded *= s.SPRITESHEET_PROGRESS;
                this.progress = event.loaded / event.total;
                if (isNaN(this.progress) || this.progress == Infinity) {
                    this.progress = 0;
                }
                this._sendProgress(event);
                return;
        }
        this.AbstractLoader_handleEvent(event);
    };
    /**
     * Create and load the images once the SpriteSheet JSON has been loaded.
     * @method _loadManifest
     * @param {Object} json
     * @private
     */
    p._loadManifest = function (json) {
        if (json && json.images) {
            var queue = this._manifestQueue = new createjs.LoadQueue(this._preferXHR, this._item.path, this._item.crossOrigin);
            queue.on("complete", this._handleManifestComplete, this, true);
            queue.on("fileload", this._handleManifestFileLoad, this);
            queue.on("progress", this._handleManifestProgress, this);
            queue.on("error", this._handleManifestError, this, true);
            queue.loadManifest(json.images);
        }
    };
    /**
     * An item from the {{#crossLink "_manifestQueue:property"}}{{/crossLink}} has completed.
     * @method _handleManifestFileLoad
     * @param {Event} event
     * @private
     */
    p._handleManifestFileLoad = function (event) {
        var image = event.result;
        if (image != null) {
            var images = this.getResult().images;
            var pos = images.indexOf(event.item.src);
            images[pos] = image;
        }
    };
    /**
     * The images have completed loading. This triggers the {{#crossLink "AbstractLoader/complete:event"}}{{/crossLink}}
     * {{#crossLink "Event"}}{{/crossLink}} from the SpriteSheetLoader.
     * @method _handleManifestComplete
     * @param {Event} event
     * @private
     */
    p._handleManifestComplete = function (event) {
        this._result = new createjs.SpriteSheet(this._result);
        this._loadedItems = this._manifestQueue.getItems(true);
        this._sendComplete();
    };
    /**
     * The images {{#crossLink "LoadQueue"}}{{/crossLink}} has reported progress.
     * @method _handleManifestProgress
     * @param {ProgressEvent} event
     * @private
     */
    p._handleManifestProgress = function (event) {
        this.progress = event.progress * (1 - s.SPRITESHEET_PROGRESS) + s.SPRITESHEET_PROGRESS;
        this._sendProgress(this.progress);
    };
    /**
     * An image has reported an error.
     * @method _handleManifestError
     * @param {ErrorEvent} event
     * @private
     */
    p._handleManifestError = function (event) {
        var newEvent = new createjs.Event("fileerror");
        newEvent.item = event.data;
        this.dispatchEvent(newEvent);
    };
    createjs.SpriteSheetLoader = createjs.promote(SpriteSheetLoader, "AbstractLoader");
}());
//##############################################################################
// SVGLoader.js
//##############################################################################
this.createjs = this.createjs || {};
(function () {
    "use strict";
    // constructor
    /**
     * A loader for SVG files.
     * @class SVGLoader
     * @param {LoadItem|Object} loadItem
     * @param {Boolean} preferXHR
     * @extends AbstractLoader
     * @constructor
     */
    function SVGLoader(loadItem, preferXHR) {
        this.AbstractLoader_constructor(loadItem, preferXHR, createjs.AbstractLoader.SVG);
        // public properties
        this.resultFormatter = this._formatResult;
        // protected properties
        this._tagSrcAttribute = "data";
        if (preferXHR) {
            this.setTag(document.createElement("svg"));
        }
        else {
            this.setTag(document.createElement("object"));
            this.getTag().type = "image/svg+xml";
        }
    }
    ;
    var p = createjs.extend(SVGLoader, createjs.AbstractLoader);
    var s = SVGLoader;
    // static methods
    /**
     * Determines if the loader can load a specific item. This loader can only load items that are of type
     * {{#crossLink "AbstractLoader/SVG:property"}}{{/crossLink}}
     * @method canLoadItem
     * @param {LoadItem|Object} item The LoadItem that a LoadQueue is trying to load.
     * @returns {Boolean} Whether the loader can load the item.
     * @static
     */
    s.canLoadItem = function (item) {
        return item.type == createjs.AbstractLoader.SVG;
    };
    // protected methods
    /**
     * The result formatter for SVG files.
     * @method _formatResult
     * @param {AbstractLoader} loader
     * @returns {Object}
     * @private
     */
    p._formatResult = function (loader) {
        // mime should be image/svg+xml, but Opera requires text/xml
        var xml = createjs.DataUtils.parseXML(loader.getResult(true), "text/xml");
        var tag = loader.getTag();
        if (!this._preferXHR && document.body.contains(tag)) {
            document.body.removeChild(tag);
        }
        if (xml.documentElement != null) {
            tag.appendChild(xml.documentElement);
            tag.style.visibility = "visible";
            return tag;
        }
        else {
            return xml;
        }
    };
    createjs.SVGLoader = createjs.promote(SVGLoader, "AbstractLoader");
}());
//##############################################################################
// XMLLoader.js
//##############################################################################
this.createjs = this.createjs || {};
(function () {
    "use strict";
    // constructor
    /**
     * A loader for CSS files.
     * @class XMLLoader
     * @param {LoadItem|Object} loadItem
     * @extends AbstractLoader
     * @constructor
     */
    function XMLLoader(loadItem) {
        this.AbstractLoader_constructor(loadItem, true, createjs.AbstractLoader.XML);
        // public properties
        this.resultFormatter = this._formatResult;
    }
    ;
    var p = createjs.extend(XMLLoader, createjs.AbstractLoader);
    var s = XMLLoader;
    // static methods
    /**
     * Determines if the loader can load a specific item. This loader can only load items that are of type
     * {{#crossLink "AbstractLoader/XML:property"}}{{/crossLink}}.
     * @method canLoadItem
     * @param {LoadItem|Object} item The LoadItem that a LoadQueue is trying to load.
     * @returns {Boolean} Whether the loader can load the item.
     * @static
     */
    s.canLoadItem = function (item) {
        return item.type == createjs.AbstractLoader.XML;
    };
    // protected methods
    /**
     * The result formatter for XML files.
     * @method _formatResult
     * @param {AbstractLoader} loader
     * @returns {XMLDocument}
     * @private
     */
    p._formatResult = function (loader) {
        return createjs.DataUtils.parseXML(loader.getResult(true), "text/xml");
    };
    createjs.XMLLoader = createjs.promote(XMLLoader, "AbstractLoader");
}());
var Animyst;
(function (Animyst) {
    var SpriteSheetAnimation = (function () {
        function SpriteSheetAnimation(id, framerate) {
            if (framerate === void 0) { framerate = 60; }
            this.time = 0;
            this.playTime = 0;
            this.currentFrame = 0;
            this.id = id;
            this.animations = {};
            this.spritesheets = {};
            this.framerate = framerate;
        }
        SpriteSheetAnimation.prototype.addSheet = function (sheetData) {
            this.spritesheets[sheetData.name] = sheetData;
        };
        SpriteSheetAnimation.prototype.getSheet = function (sheetID) {
            return this.spritesheets[sheetID];
        };
        ;
        SpriteSheetAnimation.prototype.addAnimation = function (name, prefix, sheetID, params) {
            if (params === void 0) { params = {}; }
            var anim = {};
            var spritesheet = this.getSheet(sheetID);
            anim.name = name;
            anim.prefix = prefix;
            anim.sheetID = sheetID;
            anim.useFrames = params.useFrames || false;
            anim.frames = spritesheet.getFrames(anim.prefix);
            anim.currentFrameIndex = 0;
            anim.totalFrames = anim.frames.length;
            anim.duration = params.duration || anim.useFrames ? anim.totalFrames * (this.framerate / 60) : 1000 / this.framerate * anim.totalFrames;
            anim.loop = params.loop || false;
            anim.repeat = params.repeat || 0;
            anim.elapsed = 0;
            anim.framecount = 0;
            this.animations[anim.name] = anim;
        };
        SpriteSheetAnimation.prototype.getAnimation = function (name) {
            return this.animations[name];
        };
        ;
        SpriteSheetAnimation.prototype.play = function (name) {
            if (this.currentAnim == name)
                return;
            var anim = this.getAnimation(name);
            this.currentAnim = name;
            this.playing = true;
        };
        ;
        SpriteSheetAnimation.prototype.stop = function () {
        };
        SpriteSheetAnimation.prototype.pause = function () {
        };
        SpriteSheetAnimation.prototype.resume = function () {
        };
        SpriteSheetAnimation.prototype.setIdle = function (name) {
            // body...  
        };
        ;
        SpriteSheetAnimation.prototype.animate = function (delta) {
            if (delta === void 0) { delta = 0; }
            if (this.playing) {
                //console.log(delta, time, this.time, this.playTime, this.currentFrame, this.sourceFile)
                var anim = this.getAnimation(this.currentAnim);
                if (anim.useFrames) {
                }
                else {
                }
                //TODO: Finish...
                /*if(this.time >= this.playTime){

                    if(this.loop){
                        this.time = 0;
                    } else {
                        this.playing = false;
                    }
                } else {

                    this.time += delta;
                    this.currentFrame = Math.round((this.time / this.playTime) * (this.frames.length - 1))
                    if(this.currentFrame >= this.frames.length) this.currentFrame = this.frames.length - 1;
                }*/
            }
        };
        ;
        return SpriteSheetAnimation;
    }());
    Animyst.SpriteSheetAnimation = SpriteSheetAnimation;
})(Animyst || (Animyst = {}));
var Animyst;
(function (Animyst) {
    var SpriteSheetData = (function (_super) {
        __extends(SpriteSheetData, _super);
        function SpriteSheetData(name, data) {
            var _this = _super.call(this) || this;
            _this.name = name;
            _this.data = data;
            _this.parse();
            return _this;
        }
        SpriteSheetData.prototype.parse = function () {
            for (var k in this.data.frames) {
                this.addFrame(k, this.data.frames[k]);
            }
        };
        SpriteSheetData.prototype.addFrame = function (frameID, data) {
            var frame = new FrameData(frameID, data);
            this.create(frame, frameID, data);
        };
        SpriteSheetData.prototype.getFrame = function (frameID) {
            return this.get(frameID);
        };
        SpriteSheetData.prototype.getFrames = function (framePrefix) {
            if (!this.hasCategory(framePrefix)) {
                var ctx = {};
                ctx.framePrefix = framePrefix;
                this.addCategory(framePrefix, function (frame) {
                    return frame.id.indexOf(this.framePrefix) == 0;
                }, FrameData, ctx);
            }
            var frames = this.getFromCategory(framePrefix);
            frames.sort(this._sortCaseInsensitive);
            return frames;
        };
        SpriteSheetData.prototype._sortCaseInsensitive = function (a, b) {
            if (a.toLowerCase() < b.toLowerCase())
                return -1;
            if (a.toLowerCase() > b.toLowerCase())
                return 1;
            return 0;
        };
        return SpriteSheetData;
    }(Animyst.Database));
    Animyst.SpriteSheetData = SpriteSheetData;
    var FrameData = (function (_super) {
        __extends(FrameData, _super);
        function FrameData(id, params) {
            return _super.call(this, id, params) || this;
        }
        FrameData.prototype.setup = function (params) {
            this.frame = params.frame;
            this.rotated = params.rotated;
            this.trimmed = params.trimmed;
            this.spriteSourceSize = params.spriteSourceSize;
            this.sourceSize = params.sourceSize;
            this.pivot = params.pivot;
            _super.prototype.setup.call(this, params);
        };
        ;
        return FrameData;
    }(Animyst.Item));
    Animyst.FrameData = FrameData;
})(Animyst || (Animyst = {}));
var Animyst;
(function (Animyst) {
    var CoreProcess = (function (_super) {
        __extends(CoreProcess, _super);
        function CoreProcess(id) {
            return _super.call(this, id) || this;
        }
        CoreProcess.prototype.setup = function () {
            Animyst.Log.output("[CoreProcess] Core Process Initialize");
            _super.prototype.setup.call(this);
            this._inputData = new Animyst.InputData();
            var config = this.appScope.config;
            var input = new Animyst.Input(this._inputData);
            input.startup({ element: document.body, keyboardSettings: config.settings.keyboard });
            this.addSystem("input", input);
            this.appScope.addDatabase(CoreProcess.INPUT, this._inputData);
        };
        CoreProcess.prototype.start = function () {
            Animyst.Log.output("[CoreProcess] Start");
            _super.prototype.start.call(this);
        };
        CoreProcess.prototype.fixedUpdate = function (delta, time) {
            //console.log("[Game] Updating...")
            _super.prototype.fixedUpdate.call(this, delta, time);
        };
        CoreProcess.prototype.pause = function () {
            _super.prototype.pause.call(this);
        };
        CoreProcess.prototype.resume = function () {
            _super.prototype.resume.call(this);
        };
        CoreProcess.prototype.kill = function () {
            _super.prototype.kill.call(this);
        };
        CoreProcess.prototype.restart = function () {
            _super.prototype.restart.call(this);
        };
        return CoreProcess;
    }(Animyst.AppState));
    CoreProcess.ID = "core";
    CoreProcess.INPUT = "input";
    Animyst.CoreProcess = CoreProcess;
})(Animyst || (Animyst = {}));
var Animyst;
(function (Animyst) {
    var ArrayUtil = (function () {
        function ArrayUtil(argument) {
            // code...
        }
        /**
        * Searches through any array for an element with a specific property
        * @param  {any} property Property to check
        * @param  {any} value    Value of the property
        * @param  {any} array    Array of elements
        * @return {any}          First element found with given property value. Returns null if nothing is found
        */
        ArrayUtil.search = function (property, value, array) {
            for (var i = 0; i < array.length; i++) {
                var obj = array[i];
                if (obj[property] && obj[property] === value) {
                    return obj;
                }
            }
            return null;
        };
        /**
        * Searches through any array for all elements with a specific property
        * @param  {any} property Property to check
        * @param  {any} value    Value of the property
        * @param  {any} array    Array of elements
        * @return {any}          First element found with given property value. Returns null if nothing is found
        */
        ArrayUtil.searchAll = function (property, value, array, output) {
            if (output === void 0) { output = []; }
            for (var i = 0; i < array.length; i++) {
                var obj = array[i];
                if (obj[property] && obj[property] === value) {
                    output.push(obj);
                }
            }
            return output;
        };
        /**
        * Pushes an element to an array as long as it is not already included in the array
        * @param {any}   element [description]
        * @param {any[]} array   [description]
        */
        ArrayUtil.include = function (element, array) {
            if (array.indexOf(element) == -1)
                array.push(element);
        };
        /**
        * Splices an element out of an array
        * @param {any}   element [description]
        * @param {any[]} array   [description]
        */
        ArrayUtil.remove = function (element, array) {
            var index = array.indexOf(element);
            if (index >= 0)
                array.splice(index, 1);
        };
        /**
        * Traverses array and executes a call on each element
        * @param {any[]}     array   [description]
        * @param {any}       command [description]
        * @param {number =       0}           startIndex [description]
        * @param {number =       1}           inc        [description]
        * @param {any}       ctx     [description]
        */
        ArrayUtil.traverse = function (array, command, startIndex, inc, ctx) {
            if (startIndex === void 0) { startIndex = 0; }
            if (inc === void 0) { inc = 1; }
            if (ctx === void 0) { ctx = null; }
            for (var i = startIndex; i < array.length; i += inc) {
                command.call(ctx, array[i]);
            }
        };
        return ArrayUtil;
    }());
    Animyst.ArrayUtil = ArrayUtil;
})(Animyst || (Animyst = {}));
var Animyst;
(function (Animyst) {
    var MathUtil = (function () {
        function MathUtil() {
        }
        MathUtil.loopSum = function (v, inc, max, min) {
            if (min === void 0) { min = 0; }
            var result = (v + inc) % (max + 1) + min;
            if (result < min)
                result = (max + 1) - Math.abs(result - min);
            return result;
        };
        MathUtil.constrain = function (v, min, max) {
            return Math.max(min, Math.min(v, max));
        };
        MathUtil.findClosestDivisable = function (value, divisor) {
            if (value <= divisor)
                return divisor;
            if (value % divisor > divisor / 2) {
                return value + (divisor - (value % divisor));
            }
            else {
                return value - (value % divisor);
            }
        };
        MathUtil.findNextDivisable = function (value, divisor) {
            if (value <= divisor)
                return divisor;
            return value + (divisor - (value % divisor));
        };
        MathUtil.interpolate = function (a, b, percent) {
            return a + (b - a) * percent;
        };
        return MathUtil;
    }());
    Animyst.MathUtil = MathUtil;
})(Animyst || (Animyst = {}));
var Animyst;
(function (Animyst) {
    var ObjectUtil = (function () {
        function ObjectUtil() {
        }
        /**
         * Inverts the properties and keys of an object
         * @param  {any} object Object to invert
         * @return {any}        Inverted copy of object
         */
        ObjectUtil.invert = function (object) {
            var obj = {};
            for (var k in object) {
                obj[object[k]] = k;
            }
            return obj;
        };
        /**
         * Returns copy of an object
         * @param  {any} obj    Object to copy
         * @param  {any} target Target object to copy to
         * @return {any}        [description]
         */
        ObjectUtil.copy = function (obj, target) {
            target = target || {};
            for (var k in obj) {
                if (obj[k] instanceof Object) {
                    if (Array.isArray(obj[k])) {
                        target[k] = obj[k].concat();
                    }
                    else {
                        target[k] = ObjectUtil.copy(obj[k]);
                    }
                }
                else {
                    target[k] = obj[k];
                }
            }
            return target;
        };
        return ObjectUtil;
    }());
    Animyst.ObjectUtil = ObjectUtil;
})(Animyst || (Animyst = {}));

//# sourceMappingURL=animyst.js.map
