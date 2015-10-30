Animyst.Input = function(inputData){
	Animyst.System.call(this);

	this.inputData = inputData;
	this.keyboardSettings = null;
}

Animyst.Input.KEY_DOWN      = 0;
Animyst.Input.KEY_UP        = 1;

Animyst.Input.TOUCH_START   = 0;
Animyst.Input.TOUCH_MOVE    = 1;
Animyst.Input.TOUCH_RELEASE = 2;
Animyst.Input.TOUCH_ENTER   = 3;
Animyst.Input.TOUCH_LEAVE   = 4;

Animyst.Input.MOUSE_DOWN    = 5;
Animyst.Input.MOUSE_UP      = 6;
Animyst.Input.MOUSE_DRAG    = 7;
Animyst.Input.MOUSE_MOVE    = 8;
Animyst.Input.MOUSE_ENTER   = 9;
Animyst.Input.MOUSE_LEAVE   = 10;
Animyst.Input.MOUSE_CLICK   = 11;



Animyst.Input.prototype = Object.create(Animyst.System.prototype);
Animyst.Input.prototype.startup = function(params){
	var element = params.element;
	var tool    = params.tool;
	this.keyboardSettings = params.keyboardSettings;

	if(tool){
		tool.onKeyUp     = this.onKeyUp.bind(this);
		tool.onKeyDown   = this.onKeyDown.bind(this);
		tool.onMouseDown = this.onMouseDown.bind(this);
		tool.onMouseUp   = this.onMouseUp.bind(this);	
		tool.onMouseDrag = this.onMouseDrag.bind(this);
		tool.onMouseMove = this.onMouseMove.bind(this);		
	}

	if(element){
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
}

Animyst.Input.prototype.shutdown = function(){
	this.inputData = null;
	Animyst.System.prototype.shutdown.call(this);
}

Animyst.Input.prototype.update = function(delta, time){
	this.inputData.onTick(delta);
}


//=============== TOUCH EVENTS ======================//

Animyst.Input.prototype.onTouchStart= function(evt){
	if(Animyst.LOGGING) console.log("[Input] Touch Start!");
	this.handleTouchInput(Animyst.Input.TOUCH_START, evt);
}

Animyst.Input.prototype.onTouchMove= function(evt){
	if(Animyst.LOGGING) console.log("[Input] Touch Move!");
	this.handleTouchInput(Animyst.Input.TOUCH_MOVE, evt);
}

Animyst.Input.prototype.onTouchRelease= function(evt){
	if(Animyst.LOGGING) console.log("[Input] Touch Release!");
	this.handleTouchInput(Animyst.Input.TOUCH_RELEASE, evt);
}

Animyst.Input.prototype.onTouchEnter= function(evt){
	if(Animyst.LOGGING) console.log("[Input] Touch Enter!");
	this.handleTouchInput(Animyst.Input.TOUCH_ENTER, evt);
}

Animyst.Input.prototype.onTouchLeave= function(evt){
	if(Animyst.LOGGING) console.log("[Input] Touch Leave!");
	this.handleTouchInput(Animyst.Input.TOUCH_LEAVE, evt);
}


//================= MOUSE EVENTS =====================//

Animyst.Input.prototype.onClick = function(evt){
	if(Animyst.LOGGING) console.log("[Input] Mouse Click!");
	this.handleMouseInput(Animyst.Input.MOUSE_CLICK, evt);
}

Animyst.Input.prototype.onMouseDown = function(evt){
	if(Animyst.LOGGING) console.log("[Input] Mouse Down!");
	this.handleMouseInput(Animyst.Input.MOUSE_DOWN, evt);
}

Animyst.Input.prototype.onMouseDrag = function(evt){
	if(Animyst.LOGGING) console.log("[Input] Mouse Drag!");
	this.handleMouseInput(Animyst.Input.MOUSE_DRAG, evt);
}

Animyst.Input.prototype.onMouseMove = function(evt){
	if(Animyst.LOGGING) console.log("[Input] Mouse Move!");
	this.handleMouseInput(Animyst.Input.MOUSE_MOVE, evt);
}

Animyst.Input.prototype.onMouseUp = function(evt){
	if(Animyst.LOGGING) console.log("[Input] Mouse Up!");
	this.handleMouseInput(Animyst.Input.MOUSE_UP, evt);
}

Animyst.Input.prototype.onMouseEnter = function(evt){
	if(Animyst.LOGGING) console.log("[Input] Mouse Enter!");
	this.handleMouseInput(Animyst.Input.MOUSE_ENTER, evt);
}

Animyst.Input.prototype.onMouseLeave = function(evt){
	if(Animyst.LOGGING) console.log("[Input] Mouse Leave!");
	this.handleMouseInput(Animyst.Input.MOUSE_LEAVE, evt);
}

//================ KEYBOARD EVENTS ===================//

Animyst.Input.prototype.onKeyUp= function(evt){
	if(Animyst.LOGGING) console.log("[Animyst.Input] Released Key:", evt.key || Animyst.InputData.KEY_NAMES[evt.keyCode]);
	if(!this.keyboardSettings.allowDefault[evt.key || Animyst.InputData.KEY_NAMES[evt.keyCode]]){
		evt.preventDefault();
	}
	this.handleKeyInput(Animyst.Input.KEY_UP, evt.keyCode || Animyst.InputData.KEY_CODES[evt.key]);
}


Animyst.Input.prototype.onKeyDown= function(evt){
	if(Animyst.LOGGING) console.log("[Animyst.Input] Pressed Key:", evt.key || Animyst.InputData.KEY_NAMES[evt.keyCode]);
	if(!this.keyboardSettings.allowDefault[evt.key || Animyst.InputData.KEY_NAMES[evt.keyCode]]){
		evt.preventDefault();
	}

	this.handleKeyInput(Animyst.Input.KEY_DOWN, evt.keyCode || Animyst.InputData.KEY_CODES[evt.key]);
}

//====================================================//

Animyst.Input.prototype.handleMouseInput = function(type, evt){
 	//console.log(evt);
 	var down;

 	if(type == Animyst.Input.MOUSE_DOWN || type == Animyst.Input.MOUSE_DRAG){
 		down = true;
 	}

 	if(type == Animyst.Input.MOUSE_UP || type == Animyst.Input.MOUSE_LEAVE){
 		down = false;
 	}

 	this.inputData.setMouseInput(evt, down);
}

Animyst.Input.prototype.handleKeyInput = function(type, keyCode){
	this.inputData.setKeyInput(keyCode, type == Animyst.Input.KEY_DOWN)
}

Animyst.Input.prototype.handleTouchInput = function(type, evt){
	switch(type){
		case Animyst.Input.TOUCH_START:
			this.inputData.addTouches(evt.changedTouches);
			break;
		case Animyst.Input.TOUCH_MOVE:
			break;
		case Animyst.Input.TOUCH_RELEASE:
			this.inputData.removeTouches(evt.touches);
			break;
		case Animyst.Input.TOUCH_ENTER:
			break;
		case Animyst.Input.TOUCH_LEAVE:
			break;
	}

	this.inputData.updateTouches(evt.changedTouches);
}

