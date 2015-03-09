Animyst.Window = {};
Animyst.Window.resizeSignal = new signals.Signal();

Animyst.Window._onResize = function(evt){
	console.log("[Window] onResize!")
	Animyst.Window.resizeSignal.dispatch(evt);
}


Animyst.Window._setup = function(){
	window.onresize = Animyst.Window._onResize
}
Animyst.Window._setup();