var System = require('../core/System'),
	InputData = require('./InputData'),
	Log = require('../core/Logging');



var Input = function(inputData){
	System.call(this);

	this.inputData = inputData;
	this.keyboardSettings = null;
}

module.exports = Input;

Input.KEY_DOWN      = 0;
Input.KEY_UP        = 1;

Input.TOUCH_START   = 0;
Input.TOUCH_MOVE    = 1;
Input.TOUCH_RELEASE = 2;
Input.TOUCH_ENTER   = 3;
Input.TOUCH_LEAVE   = 4;

Input.MOUSE_DOWN    = 5;
Input.MOUSE_UP      = 6;
Input.MOUSE_DRAG    = 7;
Input.MOUSE_MOVE    = 8;
Input.MOUSE_ENTER   = 9;
Input.MOUSE_LEAVE   = 10;
Input.MOUSE_CLICK   = 11;



Input.prototype = Object.create(System.prototype);
Input.prototype.startup = function(params){
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

	System.prototype.startup.call(this, params);
}

Input.prototype.shutdown = function(){
	this.inputData = null;
	System.prototype.shutdown.call(this);
}

Input.prototype.update = function(delta, time){
	this.inputData.onTick(delta);
}

//=============== TOUCH EVENTS ======================//

Input.prototype.onTouchStart= function(evt){
	if(Animyst.LOGGING) console.log("[Input] Touch Start!");
	this.handleTouchInput(Input.TOUCH_START, evt);
}

Input.prototype.onTouchMove= function(evt){
	if(Animyst.LOGGING) console.log("[Input] Touch Move!");
	this.handleTouchInput(Input.TOUCH_MOVE, evt);
}

Input.prototype.onTouchRelease= function(evt){
	if(Animyst.LOGGING) console.log("[Input] Touch Release!");
	this.handleTouchInput(Input.TOUCH_RELEASE, evt);
}

Input.prototype.onTouchEnter= function(evt){
	if(Animyst.LOGGING) console.log("[Input] Touch Enter!");
	this.handleTouchInput(Input.TOUCH_ENTER, evt);
}

Input.prototype.onTouchLeave= function(evt){
	if(Animyst.LOGGING) console.log("[Input] Touch Leave!");
	this.handleTouchInput(Input.TOUCH_LEAVE, evt);
}


//================= MOUSE EVENTS =====================//

Input.prototype.onClick = function(evt){
	if(Animyst.LOGGING) console.log("[Input] Mouse Click!");
	this.handleMouseInput(Input.MOUSE_CLICK, evt);
}

Input.prototype.onMouseDown = function(evt){
	if(Animyst.LOGGING) console.log("[Input] Mouse Down!");
	this.handleMouseInput(Input.MOUSE_DOWN, evt);
}

Input.prototype.onMouseDrag = function(evt){
	if(Animyst.LOGGING) console.log("[Input] Mouse Drag!");
	this.handleMouseInput(Input.MOUSE_DRAG, evt);
}

Input.prototype.onMouseMove = function(evt){
	if(Animyst.LOGGING) console.log("[Input] Mouse Move!");
	this.handleMouseInput(Input.MOUSE_MOVE, evt);
}

Input.prototype.onMouseUp = function(evt){
	if(Animyst.LOGGING) console.log("[Input] Mouse Up!");
	this.handleMouseInput(Input.MOUSE_UP, evt);
}

Input.prototype.onMouseEnter = function(evt){
	if(Animyst.LOGGING) console.log("[Input] Mouse Enter!");
	this.handleMouseInput(Input.MOUSE_ENTER, evt);
}

Input.prototype.onMouseLeave = function(evt){
	if(Animyst.LOGGING) console.log("[Input] Mouse Leave!");
	this.handleMouseInput(Input.MOUSE_LEAVE, evt);
}

//================ KEYBOARD EVENTS ===================//

Input.prototype.onKeyUp= function(evt){
	if(Animyst.LOGGING) console.log("[Input] Released Key:", evt.key || InputData.KEY_NAMES[evt.keyCode]);
	if(!this.keyboardSettings.allowDefault[evt.key || InputData.KEY_NAMES[evt.keyCode]]){
		evt.preventDefault();
	}
	this.handleKeyInput(Input.KEY_UP, evt.keyCode || InputData.KEY_CODES[evt.key]);
}


Input.prototype.onKeyDown= function(evt){
	if(Animyst.LOGGING) console.log("[Input] Pressed Key:", evt.key || InputData.KEY_NAMES[evt.keyCode]);
	if(!this.keyboardSettings.allowDefault[evt.key || InputData.KEY_NAMES[evt.keyCode]]){
		evt.preventDefault();
	}

	this.handleKeyInput(Input.KEY_DOWN, evt.keyCode || InputData.KEY_CODES[evt.key]);
}

//====================================================//

Input.prototype.handleMouseInput = function(type, evt){
 	//console.log(evt);
 	var down;

 	if(type == Input.MOUSE_DOWN || type == Input.MOUSE_DRAG){
 		down = true;
 	}

 	if(type == Input.MOUSE_UP || type == Input.MOUSE_LEAVE){
 		down = false;
 	}

 	this.inputData.setMouseInput(evt, down);
}

Input.prototype.handleKeyInput = function(type, keyCode){
	this.inputData.setKeyInput(keyCode, type == Input.KEY_DOWN)
}

Input.prototype.handleTouchInput = function(type, evt){
	switch(type){
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
}

