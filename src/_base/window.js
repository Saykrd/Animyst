Animyst.Window = {};
Animyst.Window.resizeSignal = new signals.Signal();
Animyst.Window.width  = 0;
Animyst.Window.height = 0;

Animyst.Window._onResize = function(evt){
	Animyst.LOG.output("[Window] onResize!")
	Animyst.Window.width  = document.body.clientWidth;
	Animyst.Window.height = document.body.clientHeight;
	Animyst.Window.resizeSignal.dispatch(evt);
}

Animyst.Window._onWindowLoad = function(evt){
	Animyst.LOG.output("[Window] Window loaded:" , "w:", Animyst.Window.width, "h:", Animyst.Window.height)
	Animyst.Window.width  = document.body.clientWidth;
	Animyst.Window.height = document.body.clientHeight;
}


Animyst.Window._setup = function(){
	//window.onresize = Animyst.Window._onResize;
	window.addEventListener("resize", Animyst.Window._onResize);
	window.addEventListener("load", Animyst.Window._onWindowLoad);
}
Animyst.Window._setup();