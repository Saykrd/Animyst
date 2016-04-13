var InputDisplay = function(inputData){
	System.call(this);

	this.inputData = inputData;
	this.layer = null;

	this.mouse = null;
	this.touches = {};
}

module.exports = InputDisplay;

InputDisplay.prototype = Object.create(System.prototype);
InputDisplay.prototype.startup = function(params){

	this.inputData.signal.add(this.inputHandler, this);

	this.layer = params.layer || new Layer({position: new Point()});

	System.prototype.startup.call(this, params);
}

InputDisplay.prototype.shutdown = function(){
	this.started = false;

	System.prototype.shutdown.call(this);
}

InputDisplay.prototype.update = function(delta, time){

}

InputDisplay.prototype.inputHandler = function(inputType, evtType, data) {
	switch(inputType){
		case InputData.MOUSE:
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

		case InputData.TOUCH:
			switch(evtType){
				case InputData.TOUCH_ADDED:
					var id = data.uid;
					var c = new Shape.Circle({radius:30, fillColor:"#FF0000", opacity:0.5});

					if(data.webkitForce) c.radius = 50 * (1 + data.webkitForce);

					c.position = new Point(data.pageX, data.pageY);

					this.touches[id] = c;
					break;
				case InputData.TOUCH_REMOVED:
					var id = data.uid;
					var c = this.touches[id];

					c.remove();
					this.touches[id] = null;
					delete this.touches[id];
					break;

				case InputData.TOUCH_UPDATED:
					var id = data.uid;
					var c = this.touches[id];

					if(data.webkitForce) c.radius = 50 * (1 + data.webkitForce);

					c.position = new Point(data.pageX, data.pageY);
					break;
			}

			break;

		case InputData.KEY:

			break;
	}
};