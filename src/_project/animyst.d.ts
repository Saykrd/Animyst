/// <reference types="preloadjs" />
/// <reference types="three" />
/// <reference types="pixi.js" />
declare module Animyst {
    class Application {
        private _appStateList;
        private _appStateLib;
        private _stats;
        private _startParams;
        private _lastFrame;
        private _framerate;
        readonly framerate: number;
        private _framecount;
        readonly framecount: number;
        private _timestep;
        timestep: number;
        appScope: AppScope;
        initSignal: Signal;
        bootSignal: Signal;
        config: any;
        runtime: number;
        constructor();
        startup(params: any): void;
        private onLoading(type, evt);
        private init();
        private initFrame();
        run(appState: AppState): void;
        halt(appStateID: string): void;
        resume(appStateID: string): void;
        end(appStateID: any): void;
        endAll(): void;
        fixedUpdate(): void;
        frameUpdate(event?: any): void;
    }
}
declare module Animyst {
    class AppScope {
        databases: any;
        config: any;
        constructor();
        addDatabase(id: string, database: Database): void;
        getDatabase(id: string): Database;
    }
}
declare module Animyst {
    class AppState {
        private _id;
        readonly id: string;
        private _systemList;
        private _systemLib;
        active: boolean;
        paused: boolean;
        appScope: AppScope;
        private _framerate;
        framerate: number;
        _timestep: number;
        timestep: number;
        setScope(appScope: any): void;
        clearScope(): void;
        setup(): void;
        start(): void;
        stop(): void;
        frameUpdate(delta: number, framecount: number): void;
        fixedUpdate(timestep: number, time: number): void;
        pause(): void;
        resume(): void;
        kill(): void;
        restart(): void;
        addSystem(id: any, system: any): void;
        getSystem(id: any): void;
        constructor(id: string);
    }
}
declare module Animyst {
    class Database {
        static ADDED: string;
        static REMOVED: string;
        private _itemCount;
        private _items;
        private _itemList;
        private _categoryLists;
        private _categoryChecks;
        signal: Signal;
        constructor();
        /**
         * Adds an item category list to keep track of specific items
         * @param {string} name    Name of category
         * @param {function} check   A function evaluating the item. Ex: "function (item) { if(shouldBeInList) return true; return false}"
         * @param {class} cls     The class type the item should belong to
         * @param {ctx} context The 'this' variable to be used with the check
         */
        addCategory(name: string, check: any, cls?: any, context?: any): void;
        /**
         * Checks if a category exists
         * @param {string} name [description]
         */
        hasCategory(name: string): boolean;
        /**
         * Adds item into all category lists that it belongs to
         * @param {Item} item [description]
         */
        list(item: Item): void;
        /**
         * Removes item from all categories
         * @param {string} itemID [description]
         */
        unlist(itemID: string): void;
        /**
         * Returns the list of item ID's in a given category
         * @param {string} category [description]
         */
        getItemsInCategory(category: string): any;
        /**
         * Evaluates whether an item is listed in a specific category
         * @param  {string}  itemID   [description]
         * @param  {string}  category [description]
         */
        isInCategory(itemID: string, category: string): boolean;
        /**
         * Traverses a category of items or all items in this database and executes a command on all of them
         * @param  {function} command  Command to execute on all items ("function(item){//...}")
         * @param  {object} context  'this' variable for the command
         * @param  {string} category Category to traverse. Traverses entire database if no category is specified
         */
        traverse(command: any, context: any, category?: string): void;
        /**
         * Creates an item and adds it to the database
         * @param {object} cls   Class of the item
         * @param {string} id     Item ID
         * @param {object} params Params to initialize the item
         * @return {object} Returns the item that was added
         */
        create(cls: any, id: string, params?: any): Item;
        /**
         * Removes item from database
         * @param {string} itemID [description]
         */
        remove(itemID: string): void;
        /**
         * Removes all items in database
         */
        removeAll(): void;
        /**
         * Returns item in database
         * @param {string} itemID [description]
         */
        getItem(itemID: string): any;
        clear(): void;
        destroy(): void;
    }
}
declare module Animyst {
    class DataLoad {
        static LOAD_INITIALIZE: number;
        static LOAD_STARTED: number;
        static LOAD_PROGRESS: number;
        static LOAD_COMPLETE: number;
        static LOAD_ERROR: number;
        static FILE_STARTED: number;
        static FILE_PROGRESS: number;
        static FILE_LOADED: number;
        static FILE_ERROR: number;
        static _assetList: any;
        static _weakHandlers: any[];
        static _loadQueue: createjs.LoadQueue;
        static _loadSignal: Signal;
        static _fileStartedSignal: Signal;
        static _fileProgressSignal: Signal;
        static _fileLoadedSignal: Signal;
        static _fileErrorSignal: Signal;
        static _queueStartedSignal: Signal;
        static _queueProgressSignal: Signal;
        static _queueLoadedSignal: Signal;
        static _queueErrorSignal: Signal;
        static _busy: boolean;
        static LoadQueue: any;
        static startup(params: any): void;
        static listAssets(manifest: any): void;
        static loadFromManifest(value: any, loadHandler?: any, persistant?: boolean): void;
        static loadAsset(value: any, loadHandler?: any, persistant?: boolean): void;
        static getAsset(id: any): any;
        static getData(id: any): any;
        static addLoadHandler(handler: any, persistant?: boolean): void;
        static removeLoadHandler(handler: any): void;
        static removeWeakHandlers(handlers: any[]): void;
        static addCommand(commandID: number, command: any, addOnce?: boolean): void;
        static removeCommand(commandID: number, command: any): void;
        static handleLoadInitialize(event: any): void;
        static handleLoadStart(event: any): void;
        static handleFileStart(event: any): void;
        static handleFileLoaded(event: any): void;
        static handleLoadComplete(event: any): void;
        static handleFileProgress(event: any): void;
        static handleOverallProgress(event: any): void;
        static handleFileError(event: any): void;
        static handleLoaderError(event: any): void;
        constructor(argument: any);
    }
}
declare module Animyst {
    class Environment {
        static isDesktop: boolean;
        static isMobile: boolean;
        static isIOS: boolean;
        static isAndroid: boolean;
        static isChromeOS: boolean;
        static isMacOS: boolean;
        static isWindows: boolean;
        static isLinux: boolean;
        static platformName: string;
        static pixelRatio: number;
        static colorDepth: number;
        static screenWidth: number;
        static screenHeight: number;
        static isChrome: boolean;
        static isFirefox: boolean;
        static isIE: boolean;
        static isEdge: boolean;
        static isSafari: boolean;
        static isWebApp: boolean;
        static isCocoonJS: boolean;
        static browserVersion: string;
        static browserName: string;
        static browserDetails: any;
        static url: string;
        static host: string;
        static path: string;
        static port: string;
        static queryString: string;
        static _setup(): void;
        static _checkPlatform(): void;
        static _checkDevice(): void;
        static _checkBrowser(): void;
        static getURLParameterByName(name: string, escapeSpaces?: boolean): string;
        constructor(argument: any);
    }
}
declare module Animyst {
    class Item {
        id: string;
        startParams: any;
        constructor(id: string, params: any);
        setup(params: any): void;
        reset(): void;
        destroy(): void;
    }
}
declare module Animyst {
    class Log {
        static output(...args: any[]): void;
        static error(...args: any[]): void;
        constructor();
    }
}
declare module Animyst {
    class SignalBinding {
        /**
        * Handler function bound to the signal.
        * @type Function
        * @private
        */
        private _listener;
        /**
        * If binding should be executed just once.
        * @type boolean
        * @private
        */
        private _isOnce;
        /**
        * Context on which listener will be executed (object that should represent the `this` variable inside listener function).
        * @memberOf SignalBinding.prototype
        * @name context
        * @type Object|undefined|null
        */
        context: any;
        /**
        * Reference to Signal object that listener is currently bound to.
        * @type Signal
        * @private
        */
        private _signal;
        /**
        * Listener priority
        * @type Number
        */
        priority: number;
        /**
        * If binding is active and should be executed.
        * @type boolean
        */
        active: boolean;
        /**
        * Default parameters passed to listener during `Signal.dispatch` and `SignalBinding.execute`. (curried parameters)
        * @type Array|null
        */
        params: any[];
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
        constructor(signal: Signal, listener: any, isOnce: boolean, listenerContext: any, priority?: number);
        /**
        * Call listener passing arbitrary parameters.
        * <p>If binding was added using `Signal.addOnce()` it will be automatically removed from signal dispatch queue, this method is used internally for the signal dispatch.</p>
        * @param {Array} [paramsArr] Array of parameters that should be passed to the listener
        * @return {*} Value returned by the listener.
        */
        execute(paramsArr?: any[]): any;
        /**
        * Detach binding from signal.
        * - alias to:mySignal.remove(myBinding.getListener());
        * @return {Function|null} Handler function bound to the signal or `null` if binding was previously detached.
        */
        detach(): any;
        /**
        * @return {Boolean} `true` if binding is still bound to the signal and have a listener.
        */
        isBound(): boolean;
        /**
        * @return {boolean} If SignalBinding will only be executed once.
        */
        isOnce(): boolean;
        /**
        * @return {Function} Handler function bound to the signal.
        */
        getListener(): any;
        /**
        * @return {Signal} Signal that listener is currently bound to.
        */
        getSignal(): any;
        /**
        * Delete instance properties
        * @private
        */
        _destroy(): void;
        /**
        * @return {string} String representation of the object.
        */
        toString(): string;
    }
}
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
declare module Animyst {
    class Signal {
        /**
        * @property _bindings
        * @type Array
        * @private
        */
        private _bindings;
        /**
        * @property _prevParams
        * @type Any
        * @private
        */
        private _prevParams;
        /**
        * Signals Version Number
        * @property VERSION
        * @type String
        * @const
        */
        static VERSION: string;
        /**
        * If Signal should keep record of previously dispatched parameters and
        * automatically execute listener during `add()`/`addOnce()` if Signal was
        * already dispatched before.
        * @type boolean
        */
        memorize: boolean;
        /**
        * @type boolean
        * @private
        */
        private _shouldPropagate;
        /**
        * If Signal is active and should broadcast events.
        * <p><strong>IMPORTANT:</strong> Setting this property during a dispatch will only affect the next dispatch, if you want to stop the propagation of a signal use `halt()` instead.</p>
        * @type boolean
        */
        active: boolean;
        /**
        * @method validateListener
        * @param {Any} listener
        * @param {Any} fnName
        */
        validateListener(listener: any, fnName: any): void;
        /**
        * @param {Function} listener
        * @param {boolean} isOnce
        * @param {Object} [listenerContext]
        * @param {Number} [priority]
        * @return {SignalBinding}
        * @private
        */
        private _registerListener(listener, isOnce, listenerContext, priority);
        /**
        * @method _addBinding
        * @param {SignalBinding} binding
        * @private
        */
        private _addBinding(binding);
        /**
        * @method _indexOfListener
        * @param {Function} listener
        * @return {number}
        * @private
        */
        private _indexOfListener(listener, context);
        /**
        * Check if listener was attached to Signal.
        * @param {Function} listener
        * @param {Object} [context]
        * @return {boolean} if Signal has the specified listener.
        */
        has(listener: any, context?: any): boolean;
        /**
        * Add a listener to the signal.
        * @param {Function} listener Signal handler function.
        * @param {Object} [listenerContext] Context on which listener will be executed (object that should represent the `this` variable inside listener function).
        * @param {Number} [priority] The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added. (default = 0)
        * @return {SignalBinding} An Object representing the binding between the Signal and listener.
        */
        add(listener: any, listenerContext?: any, priority?: number): SignalBinding;
        /**
        * Add listener to the signal that should be removed after first execution (will be executed only once).
        * @param {Function} listener Signal handler function.
        * @param {Object} [listenerContext] Context on which listener will be executed (object that should represent the `this` variable inside listener function).
        * @param {Number} [priority] The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added. (default = 0)
        * @return {SignalBinding} An Object representing the binding between the Signal and listener.
        */
        addOnce(listener: any, listenerContext?: any, priority?: number): SignalBinding;
        /**
        * Remove a single listener from the dispatch queue.
        * @param {Function} listener Handler function that should be removed.
        * @param {Object} [context] Execution context (since you can add the same handler multiple times if executing in a different context).
        * @return {Function} Listener handler function.
        */
        remove(listener: any, context?: any): any;
        /**
        * Remove all listeners from the Signal.
        */
        removeAll(): void;
        /**
        * @return {number} Number of listeners attached to the Signal.
        */
        getNumListeners(): number;
        /**
        * Stop propagation of the event, blocking the dispatch to next listeners on the queue.
        * <p><strong>IMPORTANT:</strong> should be called only during signal dispatch, calling it before/after dispatch won't affect signal broadcast.</p>
        * @see Signal.prototype.disable
        */
        halt(): void;
        /**
        * Dispatch/Broadcast Signal to all listeners added to the queue.
        * @param {...*} [params] Parameters that should be passed to each handler.
        */
        dispatch(...paramsArr: any[]): void;
        /**
        * Forget memorized arguments.
        * @see Signal.memorize
        */
        forget(): void;
        /**
        * Remove all bindings from signal and destroy any reference to external objects (destroy Signal object).
        * <p><strong>IMPORTANT:</strong> calling any method on the signal instance after calling dispose will throw errors.</p>
        */
        dispose(): void;
        /**
        * @return {string} String representation of the object.
        */
        toString(): string;
    }
}
declare module Animyst {
    class System {
        protected _paused: boolean;
        readonly paused: boolean;
        protected _started: boolean;
        readonly started: boolean;
        private _startupParams;
        startup(params?: any): void;
        shutdown(): void;
        update(delta: number, framecount: number): void;
        fixedUpdate(timestep: number, time: number): void;
        constructor();
    }
}
declare module Animyst {
    class Window {
        static readonly orientation: any;
        static readonly isLandscape: boolean;
        static readonly isPortrait: boolean;
        static readonly width: number;
        static readonly height: number;
        static resizeSignal: Signal;
        static _onResize(evt: any): void;
        static _onWindowLoad(evt: any): void;
        static _setup(): void;
    }
}
declare module Animyst {
    var LOGGING: boolean;
    var DEBUG: boolean;
    var GUI: any;
    var MAJOR: number;
    var MINOR: number;
    var BUILD: number;
    var DATA: string;
    var VERSION: string;
}
declare module Animyst {
    class Sound {
        constructor();
    }
}
declare module Animyst {
    class PIXITexture extends THREE.Texture {
        stage: any;
        renderer: any;
        shouldUpdate: boolean;
        width: number;
        height: number;
        _init(): void;
        invalidate(): void;
        update(): void;
        constructor(stage: any, renderer: any);
    }
}
declare module Animyst {
    class SpriteSheetTexture extends THREE.Texture {
        atlas: any;
        frames: any[];
        stage: PIXI.Container;
        renderer: any;
        playTime: number;
        time: number;
        loop: boolean;
        currentFrame: number;
        currentFrameID: string;
        sprite: any;
        renderWidth: number;
        renderHeight: number;
        sourceFile: string;
        playing: boolean;
        timePassed: number;
        constructor(atlas: any);
        private _initSprite(startFrame);
        addSheet(atlas: any): void;
        showFrame(frame?: number): void;
        play(time: number, loop: boolean): void;
        stop(): void;
        animate(delta: number, runtime?: number): void;
    }
}
declare module Animyst {
    class View3D extends Database {
        viewAngle: number;
        near: number;
        far: number;
        private _scene;
        private _renderer;
        private _camera;
        private _container;
        private _settings;
        private _resize;
        private _ui;
        private _view;
        private _context2d;
        readonly aspect: number;
        width: number;
        height: number;
        constructor();
        clear(): void;
        destroy(): void;
        initDisplay(params: any): void;
        append(containerID?: string): void;
        render(): void;
        update(): void;
        onResize(): void;
    }
}
declare module Animyst {
    class Input extends System {
        static LOGGING: boolean;
        static KEY_DOWN: number;
        static KEY_UP: number;
        static TOUCH_START: number;
        static TOUCH_MOVE: number;
        static TOUCH_RELEASE: number;
        static TOUCH_ENTER: number;
        static TOUCH_LEAVE: number;
        static MOUSE_DOWN: number;
        static MOUSE_UP: number;
        static MOUSE_DRAG: number;
        static MOUSE_MOVE: number;
        static MOUSE_ENTER: number;
        static MOUSE_LEAVE: number;
        static MOUSE_CLICK: number;
        inputData: Animyst.InputData;
        keyboardSettings: any;
        constructor(inputData: any);
        startup(params: any): void;
        shutdown(): void;
        update(delta: number, runtime: number): void;
        onTouchStart(evt: any): void;
        onTouchMove(evt: any): void;
        onTouchRelease(evt: any): void;
        onTouchEnter(evt: any): void;
        onTouchLeave(evt: any): void;
        onClick(evt: any): void;
        onMouseDown(evt: any): void;
        onMouseDrag(evt: any): void;
        onMouseMove(evt: any): void;
        onMouseUp(evt: any): void;
        onMouseEnter(evt: any): void;
        onMouseLeave(evt: any): void;
        onKeyUp(evt: any): void;
        onKeyDown(evt: any): void;
        handleMouseInput(type: number, evt: any): void;
        handleKeyInput(type: number, keyCode: number): void;
        handleTouchInput(type: number, evt: any): void;
    }
}
declare module Animyst {
    class InputData extends Database {
        static LOGGING: boolean;
        static TOUCH_HISTORY_LIMIT: number;
        static TOUCH_PROPERTIES: any[];
        static MOUSE_PROPERTIES: any[];
        static KEY_CODES: any;
        static __KEY_NAMES: any;
        static readonly KEY_NAMES: any;
        static MOUSE: number;
        static TOUCH: number;
        static KEY: number;
        static TOUCH_ADDED: number;
        static TOUCH_REMOVED: number;
        static TOUCH_UPDATED: number;
        static MOUSE_DOWN: number;
        static MOUSE_UP: number;
        static MOUSE_MOVE: number;
        static KEY_ACTIVE: number;
        static KEY_INACTIVE: number;
        map: any;
        touches: any[];
        touchHistory: any[];
        mouse: any;
        mouseHistory: any[];
        totalTouchCount: number;
        time: number;
        constructor();
        clear(): void;
        destroy(): void;
        onTick(delta: number): void;
        isKeyDown(keyName: string): boolean;
        setKeyInput(keyCode: number, active?: boolean): void;
        setMouseInput(evt: any, down?: boolean): void;
        getTouches(): any;
        addTouches(touches: any[]): void;
        removeTouches(touches: any[]): void;
        updateTouches(touches: any[]): void;
    }
}
declare module Animyst {
    class SpriteSheetAnimation {
        id: string;
        idle: string;
        currentAnim: string;
        animations: any;
        spritesheets: any;
        framerate: number;
        playing: boolean;
        time: number;
        playTime: number;
        currentFrame: number;
        constructor(id: string, framerate?: number);
        addSheet(sheetData: SpriteSheetData): void;
        getSheet(sheetID: any): SpriteSheetData;
        addAnimation(name: string, prefix: string, sheetID: string, params?: any): void;
        getAnimation(name: string): any;
        play(name: string): void;
        stop(): void;
        pause(): void;
        resume(): void;
        setIdle(name: string): void;
        animate(delta?: number): void;
    }
}
declare module Animyst {
    class SpriteSheetData extends Database {
        name: string;
        data: any;
        constructor(name: string, data: any);
        parse(): void;
        addFrame(frameID: any, data: any): void;
        getFrame(frameID: any): void;
        getFrames(framePrefix: any): void;
        private _sortCaseInsensitive(a, b);
    }
    class FrameData extends Item {
        frame: any;
        rotated: boolean;
        trimmed: boolean;
        spriteSourceSize: any;
        sourceSize: any;
        pivot: any;
        constructor(id: string, params: any);
        setup(params: any): void;
    }
}
declare module Animyst {
    class CoreProcess extends AppState {
        static ID: string;
        static INPUT: string;
        private _inputData;
        constructor(id: string);
        setup(): void;
        start(): void;
        fixedUpdate(delta: any, time: any): void;
        pause(): void;
        resume(): void;
        kill(): void;
        restart(): void;
    }
}
declare module Animyst {
    class ArrayUtil {
        /**
        * Searches through any array for an element with a specific property
        * @param  {any} property Property to check
        * @param  {any} value    Value of the property
        * @param  {any} array    Array of elements
        * @return {any}          First element found with given property value. Returns null if nothing is found
        */
        static search(property: any, value: any, array: any): any;
        /**
        * Searches through any array for all elements with a specific property
        * @param  {any} property Property to check
        * @param  {any} value    Value of the property
        * @param  {any} array    Array of elements
        * @return {any}          First element found with given property value. Returns null if nothing is found
        */
        static searchAll(property: any, value: any, array: any, output?: any[]): any[];
        /**
        * Pushes an element to an array as long as it is not already included in the array
        * @param {any}   element [description]
        * @param {any[]} array   [description]
        */
        static include(element: any, array: any): void;
        /**
        * Splices an element out of an array
        * @param {any}   element [description]
        * @param {any[]} array   [description]
        */
        static remove(element: any, array: any): void;
        /**
        * Traverses array and executes a call on each element
        * @param {any[]}     array   [description]
        * @param {any}       command [description]
        * @param {number =       0}           startIndex [description]
        * @param {number =       1}           inc        [description]
        * @param {any}       ctx     [description]
        */
        static traverse(array: any, command: any, startIndex?: number, inc?: number, ctx?: any): void;
        constructor(argument: any);
    }
}
declare module Animyst {
    class MathUtil {
        static loopSum(v: number, inc: number, max: number, min?: number): number;
        static constrain(v: number, min: number, max: number): number;
        static findClosestDivisable(value: any, divisor: any): number;
        static findNextDivisable(value: any, divisor: any): number;
        static interpolate(a: any, b: any, percent: any): number;
    }
}
declare module Animyst {
    class ObjectUtil {
        /**
         * Inverts the properties and keys of an object
         * @param  {any} object Object to invert
         * @return {any}        Inverted copy of object
         */
        static invert(object: any): any;
        /**
         * Returns copy of an object
         * @param  {any} obj    Object to copy
         * @param  {any} target Target object to copy to
         * @return {any}        [description]
         */
        static copy(obj: any, target?: any): any;
    }
}
