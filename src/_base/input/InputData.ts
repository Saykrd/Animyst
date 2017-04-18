module Animyst {
    export class InputData extends Database {
    	static LOGGING:boolean = false;

    	static TOUCH_HISTORY_LIMIT:number = 12;
		static TOUCH_PROPERTIES:any[]     = ["identifier", "screenX", "screenY", "clientX", "clientY",
												   "pageX", "pageY", "radiusX", "radiusY", "rotationAngle", 
												   "force", "webkitForce", "target"];
		static MOUSE_PROPERTIES:any[]     = ["clientX", "clientY", "screenX", "screenY","type", "point", 
												"lastPoint", "downPoint", "middlePoint", "count", "item", "modifiers"];

		static KEY_CODES:any =  {
		    'backspace': 8,
		    'tab': 9,
		    'enter': 13,
		    'shift': 16,
		    'ctrl': 17,
		    'alt': 18,
		    'pause': 19,
		    'capslock': 20,
		    'numlock': 144,
		    'esc': 27,
		    'pageup': 33,
		    'pagedown': 34,
		    'end': 35,
		    'home': 36,
		    'leftarrow': 37,
		    'uparrow': 38,
		    'rightarrow': 39,
		    'downarrow': 40,
		    'insert': 45,
		    'delete': 46,
		    'clear':12,
		    '0': 48,
		    '1': 49,
		    '2': 50,
		    '3': 51,
		    '4': 52,
		    '5': 53,
		    '6': 54,
		    '7': 55,
		    '8': 56,
		    '9': 57,
		    'a': 65,
		    'b': 66,
		    'c': 67,
		    'd': 68,
		    'e': 69,
		    'f': 70,
		    'g': 71,
		    'h': 72,
		    'i': 73,
		    'j': 74,
		    'k': 75,
		    'l': 76,
		    'm': 77,
		    'n': 78,
		    'o': 79,
		    'p': 80,
		    'q': 81,
		    'r': 82,
		    's': 83,
		    't': 84,
		    'u': 85,
		    'v': 86,
		    'w': 87,
		    'x': 88,
		    'y': 89,
		    'z': 90,
		    'numpad0': 96,
		    'numpad1': 97,
		    'numpad2': 98,
		    'numpad3': 99,
		    'numpad4': 100,
		    'numpad5': 101,
		    'numpad6': 102,
		    'numpad7': 103,
		    'numpad8': 104,
		    'numpad9': 105,
		    'multiply': 106,
		    'plus': 107,
		    'minus': 109,
		    'dot': 110,
		    'divide': 111,
		    'f1': 112,
		    'f2': 113,
		    'f3': 114,
		    'f4': 115,
		    'f5': 116,
		    'f6': 117,
		    'f7': 118,
		    'f8': 119,
		    'f9': 120,
		    'f10': 121,
		    'f11': 122,
		    'f12': 123,
		    '=': 187,
		    ',': 188,
		    '.': 190,
		    '/': 191,
		    'backslash': 220,
		    ";":186,
		    "'":222,
		    "[":219,
		    "]":221,
		    "-":189,
		    "space":32 ,
		    "~":192
		};

		static __KEY_NAMES:any;
		static get KEY_NAMES():any{
			if(!InputData.__KEY_NAMES){
				InputData.__KEY_NAMES = ObjectUtil.invert(InputData.KEY_CODES);
			}

			return InputData.__KEY_NAMES;
		};

		static MOUSE = 0;
		static TOUCH = 1;
		static KEY   = 2;

		static TOUCH_ADDED   = 0;
		static TOUCH_REMOVED = 1;
		static TOUCH_UPDATED = 2;

		static MOUSE_DOWN = 0;
		static MOUSE_UP   = 1;
		static MOUSE_MOVE = 2;
		static MOUSE_OUT  = 3;

		static KEY_ACTIVE   = 0;
		static KEY_INACTIVE = 1;

    	public map:any                = {};
		public touches:any[]          = [];
		public touchHistory:any[]     = [];
		public mouse:any              = {};
		public mouseHistory:any[]     = [];
		public totalTouchCount:number = 0;
		public time:number            = 0;
    	
    	constructor() {
    		super();
    	}

    	public clear():void{

			this.map             = {};
			this.touches         = [];
			this.touchHistory    = [];
			this.totalTouchCount = 0;

			super.clear();
		}

		public destroy():void{

			this.map             = null;
			this.touches         = null;
			this.touchHistory    = null;
			this.totalTouchCount = 0;

			super.destroy();
		}

		public onTick(delta:number):void{
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

		public isKeyDown(keyName:string):boolean{
			var keyCode = InputData.KEY_CODES[keyName];
			return (this.map[keyCode] && this.map[keyCode].active) ? true : false;
		}

		public setKeyInput(keyCode:number, active?:boolean):void{
			var data = this.map[keyCode] || {};
			var evtType;

			if(active && !data.active){
				data.time = 0;
				evtType = InputData.KEY_ACTIVE;
			}

			if(!active && data.active){
				data.lastInput = {};
				data.lastInput.endTime   = this.time;
				data.lastInput.duration  = data.time;
				data.lastInput.startTime = this.time - data.time;

				data.time = 0;
				evtType = InputData.KEY_INACTIVE
			}

			data.active = active === true;

			if(!this.map[keyCode]){
				this.map[keyCode] = data;
			}

			if(evtType) this.signal.dispatch(InputData.KEY, evtType, data);


		}

		public setMouseInput(evt:any, down?:boolean):void{
			if(this.touches.length > 0 && down) down = false;
			if(typeof(down) != "boolean") down = this.mouse.down;


			var lastClick  = this.mouse.down && !down ? this.mouse.lastClick || {} : null;
			var clickStart = !this.mouse.down && down ? {} : null;
			var evtType = InputData.MOUSE_MOVE;
			

			for(var i = 0; i < InputData.MOUSE_PROPERTIES.length; i++){
				var k = InputData.MOUSE_PROPERTIES[i];
				if(evt[k]){
					this.mouse[k] = evt[k];
					if(lastClick) lastClick[k] = evt[k];
					if(clickStart) clickStart[k] = evt[k];	
				}
			}

			if(clickStart){
				if(InputData.LOGGING && Animyst.LOGGING) console.log("[InputData] Click Start!");
				this.mouse.clickStart = clickStart
				this.mouse.clickTime = 0;
				evtType = InputData.MOUSE_DOWN;
			}

			if(lastClick){
				if(InputData.LOGGING && Animyst.LOGGING) console.log("[InputData] Click Ended!", this.mouse.clickTime);
				lastClick.clickStart = this.mouse.clickStart;
				lastClick.clickTime  = this.mouse.clickTime;
				
				this.mouse.clickStart = null;
				this.mouse.lastClick = lastClick;
				evtType = InputData.MOUSE_UP;
			}
			
			this.mouse.down = down;

			this.signal.dispatch(InputData.MOUSE, evtType, this.mouse);
		}

		public getTouches():any{
			return this.touches.concat();
		}

		public addTouches(touches:any[]):void{
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
					var data:any = {};
					var startData:any = {};

					for(var j = 0; j < InputData.TOUCH_PROPERTIES.length; j++){
						var k = InputData.TOUCH_PROPERTIES[j];
						data[k]      = (typeof touch[k] != "object" || k == "target") ? touch[k] : null;
						startData[k] = (typeof touch[k] != "object") ? touch[k] : null;
					} 

					data.time      = 0;        //Time Counter
					data.timestamp = this.time //When the touch began
					data.startData = startData //Data assosiated with the start of the touch
					data.uid       = data.identifier + "" + this.totalTouchCount //Unique identifier for this touch that seperates it from past touches

					this.touches.push(data);
					this.totalTouchCount++;
					if(InputData.LOGGING && Animyst.LOGGING) console.log("[InputData] Adding Touch:", data.uid);

					this.signal.dispatch(InputData.TOUCH, InputData.TOUCH_ADDED, data);
				}
			}

		}



		public removeTouches(touches:any[]):void{
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
					if(InputData.LOGGING && Animyst.LOGGING) console.log("[InputData] Removing Touch:", touchData.uid);
					this.touchHistory.unshift(touchData);
					this.touches.splice(i,1);
					if(this.touchHistory.length > InputData.TOUCH_HISTORY_LIMIT){
						this.touchHistory.pop();
					}

					this.signal.dispatch(InputData.TOUCH, InputData.TOUCH_REMOVED, touchData);
				}
			}
			
		}

		public updateTouches(touches:any[]):void{
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
					for(var j = 0; j < InputData.TOUCH_PROPERTIES.length; j++){
						var k = InputData.TOUCH_PROPERTIES[j];
						data[k] = touch[k];
					}

					if(InputData.LOGGING && Animyst.LOGGING) console.log("[InputData] Updated Touch:", data.uid, Math.round(data.pageX), Math.round(data.pageY), Math.round(data.screenX), Math.round(data.screenY), data.force || data.webkitForce);
					this.signal.dispatch(InputData.TOUCH, InputData.TOUCH_UPDATED, data);

				}
			}
		}



    }
}