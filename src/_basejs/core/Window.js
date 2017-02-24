var Log = require('./Logging');

Window = module.exports = {};
Window.resizeSignal = new signals.Signal();

Object.defineProperty(Window, "orientation", {get: function(){return window.orientation}});
Object.defineProperty(Window, "isLandscape", {get: function(){return Window.orientation == 90 || Window.orientation == -90}});
Object.defineProperty(Window, "isPortrait",  {get: function(){return Window.orientation == 0 || Window.orientation == -180}});
Object.defineProperty(Window, "width", 		 {get: function(){return document.documentElement.clientWidth}});
Object.defineProperty(Window, "height",      {get: function(){return document.documentElement.clientHeight}});

Window._onResize = function(evt){
	Log.output("[Window] onResize!")
	Window.resizeSignal.dispatch(evt);
}

Window._onWindowLoad = function(evt){
	Log.output("[Window] Window loaded:" , "w:", Window.width, "h:", Window.height)
}


Window._setup = function(){
	//window.onresize = Window._onResize;
	window.addEventListener("resize", Window._onResize);
	window.addEventListener("load", Window._onWindowLoad);
}
Window._setup();