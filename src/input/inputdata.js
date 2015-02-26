Animyst.InputData = function(){
	Animyst.Database.call(this);

	this.map             = {};
	this.touches         = [];
	this.touchHistory    = [];
	this.mouse           = {};
	this.mouseHistory    = [];
	this.totalTouchCount = 0;
	this.time            = 0;
}

Animyst.InputData.TOUCH_HISTORY_LIMIT = 12;
Animyst.InputData.TOUCH_PROPERTIES    = ["identifier", "screenX", "screenY", "clientX", "clientY",
										   "pageX", "pageY", "radiusX", "radiusY", "rotationAngle", 
										   "force", "webkitForce", "target"];
Animyst.InputData.MOUSE_PROPERTIES    = ["clientX", "clientY", "screenX", "screenY","type", "point", 
										 "lastPoint", "downPoint", "middlePoint", "count", "item", "modifiers"];

Animyst.InputData.MOUSE = 0;
Animyst.InputData.TOUCH = 1;
Animyst.InputData.KEY   = 2;

Animyst.InputData.TOUCH_ADDED   = 0;
Animyst.InputData.TOUCH_REMOVED = 1;
Animyst.InputData.TOUCH_UPDATED = 2;

Animyst.InputData.MOUSE_DOWN = 0;
Animyst.InputData.MOUSE_UP   = 1;
Animyst.InputData.MOUSE_MOVE = 2;

Animyst.InputData.KEY_ACTIVE   = 0;
Animyst.InputData.KEY_INACTIVE = 1;



Animyst.InputData.prototype = Object.create(Animyst.Database.prototype);
Animyst.InputData.prototype.clear = function(){

	this.map             = {};
	this.touches         = [];
	this.touchHistory    = [];
	this.totalTouchCount = 0;

	Animyst.Database.prototype.clear.call(this);
}

Animyst.InputData.prototype.destroy = function(){

	this.map             = null;
	this.touches         = null;
	this.touchHistory    = null;
	this.totalTouchCount = 0;

	Animyst.Database.prototype.destroy.call(this);
}

Animyst.InputData.prototype.onTick = function(delta){
	this.time += delta;

	if(this.mouse.down){
		this.mouse.clickTime += delta;
	}

	for(var k in this.map){
		var data = this.map[k];

		if(data.active){
			data.time = (data.time || 0) + delta;
		}
	}

	for(var i = 0; i < this.touches.length; i++){
		var touchData = this.touches[i];
		touchData.time += delta;
	}
}

Animyst.InputData.prototype.isKeyDown = function(key){
	return this.map[key] && this.map[key].active;
}

Animyst.InputData.prototype.setKeyInput = function(key, active){
	var data = this.map[key] || {};
	var evtType;

	if(active && !data.active){
		data.time = 0;
		evtType = Animyst.InputData.KEY_ACTIVE;
	}

	if(!active && data.active){
		data.lastInput = {};
		data.lastInput.endTime   = this.time;
		data.lastInput.duration  = data.time;
		data.lastInput.startTime = this.time - data.time;

		data.time = 0;
		evtType = Animyst.InputData.KEY_INACTIVE
	}

	data.active = active === true;

	if(!this.map[key]){
		this.map[key] = data;
	}

	if(evtType) this.signal.dispatch(Animyst.InputData.KEY, evtType, data);


}

Animyst.InputData.prototype.setMouseInput = function(evt, down){
	if(this.touches.length > 0 && down) down = false;
	if(typeof(down) != "boolean") down = this.mouse.down;


	var lastClick  = this.mouse.down && !down ? this.mouse.lastClick || {} : null;
	var clickStart = !this.mouse.down && down ? {} : null;
	var evtType = Animyst.InputData.MOUSE_MOVE;
	

	for(var i = 0; i < Animyst.InputData.MOUSE_PROPERTIES.length; i++){
		var k = Animyst.InputData.MOUSE_PROPERTIES[i];
		if(evt[k]){
			this.mouse[k] = evt[k];
			if(lastClick) lastClick[k] = evt[k];
			if(clickStart) clickStart[k] = evt[k];	
		}
	}

	if(clickStart){
		console.log("[InputData] Click Start!");
		this.mouse.clickStart = clickStart
		this.mouse.clickTime = 0;
		evtType = Animyst.InputData.MOUSE_DOWN;
	}

	if(lastClick){
		console.log("[InputData] Click Ended!", this.mouse.clickTime);
		lastClick.clickStart = this.mouse.clickStart;
		lastClick.clickTime  = this.mouse.clickTime;
		
		this.mouse.clickStart = null;
		this.mouse.lastClick = lastClick;
		evtType = Animyst.InputData.MOUSE_UP;
	}
	
	this.mouse.down = down;

	this.signal.dispatch(Animyst.InputData.MOUSE, evtType, this.mouse);
}

Animyst.InputData.prototype.getTouches = function(){
	return this.touches.splice();
}

Animyst.InputData.prototype.addTouches= function(touches){
	for(var i = 0; i < touches.length; i++){
		var touch = touches[i];
		var isNew = true;

		for(var j = 0; j < this.touches.length; j++){
			if(this.touches[j].identifier == touch.identifier){
				isNew = false;
				break;
			}
		}

		if(isNew){
			var data = {};
			var startData = {};

			for(var j = 0; j < Animyst.InputData.TOUCH_PROPERTIES.length; j++){
				var k = Animyst.InputData.TOUCH_PROPERTIES[j];
				data[k]      = (typeof touch[k] != "object" || k == "target") ? touch[k] : null;
				startData[k] = (typeof touch[k] != "object") ? touch[k] : null;
			} 

			data.time      = 0;        //Time Counter
			data.timestamp = this.time //When the touch began
			data.startData = startData //Data assosiated with the start of the touch
			data.uid       = data.identifier + "" + this.totalTouchCount //Unique identifier for this touch that seperates it from past touches

			this.touches.push(data);
			this.totalTouchCount++;
			console.log("[InputData] Adding Touch:", data.uid);

			this.signal.dispatch(Animyst.InputData.TOUCH, Animyst.InputData.TOUCH_ADDED, data);
		}
	}

}



Animyst.InputData.prototype.removeTouches= function(touches){
	for(var i = this.touches.length - 1; i > -1 && this.touches.length > 0; i--){
		var touchData = this.touches[i];
		var isGone = true;

		for(var j = 0; j < touches.length; j++){
			if(touches[j].identifier == touchData.identifier){
				isGone = false;
				break;
			}
		}

		if(isGone){
			console.log("[InputData] Removing Touch:", touchData.uid);
			this.touchHistory.shift(touchData);
			this.touches.splice(i,1);
			if(this.touchHistory.length > Animyst.InputData.TOUCH_HISTORY_LIMIT){
				this.touchHistory.pop();
			}

			this.signal.dispatch(Animyst.InputData.TOUCH, Animyst.InputData.TOUCH_REMOVED, touchData);
		}
	}
	
}

Animyst.InputData.prototype.updateTouches= function(touches){
	for(var i = 0; i < touches.length; i++){
		var touch = touches[i];
		var data
		for(var j = 0; j < this.touches.length; j++){
			if(this.touches[j].identifier == touch.identifier){
				data = this.touches[j];
				break;
			}
		}

		if(data){
			for(var j = 0; j < Animyst.InputData.TOUCH_PROPERTIES.length; j++){
				var k = Animyst.InputData.TOUCH_PROPERTIES[j];
				data[k] = touch[k];
			}

			console.log("[InputData] Updated Touch:", data.uid, Math.round(data.pageX), Math.round(data.pageY), Math.round(data.screenX), Math.round(data.screenY), data.force || data.webkitForce);
			this.signal.dispatch(Animyst.InputData.TOUCH, Animyst.InputData.TOUCH_UPDATED, data);

		}
	}
}
