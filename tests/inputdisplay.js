Animyst.InputDisplay = function(inputData){
	Animyst.System.call(this);

	this.inputData = inputData;
	this.layer = null;

	this.mouse = null;
	this.touches = {};
}

Animyst.InputDisplay.prototype = Object.create(Animyst.System.prototype);
Animyst.InputDisplay.prototype.startup = function(params){

	this.inputData.signal.add(this.inputHandler, this);

	this.layer = new Layer({position: new Point()});

	Animyst.System.prototype.startup.call(this, params);
}

Animyst.InputDisplay.prototype.shutdown = function(){
	this.started = false;

	Animyst.System.prototype.shutdown.call(this);
}

Animyst.InputDisplay.prototype.update = function(delta, time){

}

Animyst.InputDisplay.prototype.inputHandler = function(inputType, evtType, data) {
	switch(inputType){
		case Animyst.InputData.MOUSE:
			if(!this.mouse){
				this.mouse = new Shape.Circle({radius:10, fillColor:"#00FFFF", opacity:0.5});
				this.layer.addChild(this.mouse);
			} 

			this.mouse.position = data.point;
			//console.log(data.point)

			if(data.down){
				this.mouse.fillColor = "#FF0000"
			} else {
				this.mouse.fillColor = "#00FFFF";
			}

			break;

		case Animyst.InputData.TOUCH:
			switch(evtType){
				case Animyst.InputData.TOUCH_ADDED:
					var id = data.uid;
					var c = new Shape.Circle({radius:30, fillColor:"#FF0000", opacity:0.5});

					if(data.webkitForce) c.radius = 50 * (1 + data.webkitForce);

					c.position = new Point(data.pageX, data.pageY);

					this.touches[id] = c;
					break;
				case Animyst.InputData.TOUCH_REMOVED:
					var id = data.uid;
					var c = this.touches[id];

					c.remove();
					this.touches[id] = null;
					delete this.touches[id];
					break;

				case Animyst.InputData.TOUCH_UPDATED:
					var id = data.uid;
					var c = this.touches[id];

					if(data.webkitForce) c.radius = 50 * (1 + data.webkitForce);

					c.position = new Point(data.pageX, data.pageY);
					break;
			}

			break;

		case Animyst.InputData.KEY:

			break;
	}
};