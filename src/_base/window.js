Animyst.Window = {};
Animyst.Window.resizeSignal = new signals.Signal();

Object.defineProperty(Animyst.Window, "orientation", {get: function(){return window.orientation}});
Object.defineProperty(Animyst.Window, "isLandscape", {get: function(){return Animyst.Window.orientation == 90 || Animyst.Window.orientation == -90}});
Object.defineProperty(Animyst.Window, "isPortrait", {get: function(){return Animyst.Window.orientation == 0 || Animyst.Window.orientation == -180}});
Object.defineProperty(Animyst.Window, "width", {get: function(){return document.documentElement.clientWidth}});
Object.defineProperty(Animyst.Window, "height", {get: function(){return document.documentElement.clientHeight}});

Animyst.Window._onResize = function(evt){
	Animyst.LOG.output("[Window] onResize!")
	Animyst.Window.resizeSignal.dispatch(evt);
}

Animyst.Window._onWindowLoad = function(evt){
	Animyst.LOG.output("[Window] Window loaded:" , "w:", Animyst.Window.width, "h:", Animyst.Window.height)
}


Animyst.Window._setup = function(){
	//window.onresize = Animyst.Window._onResize;
	window.addEventListener("resize", Animyst.Window._onResize);
	window.addEventListener("load", Animyst.Window._onWindowLoad);
}
Animyst.Window._setup();