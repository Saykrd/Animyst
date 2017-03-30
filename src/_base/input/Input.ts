module Animyst {
    export class Input extends System {
    	static LOGGING:boolean = false;

		static KEY_DOWN:number      = 0;
		static KEY_UP:number        = 1;

		static TOUCH_START:number   = 0;
		static TOUCH_MOVE:number    = 1;
		static TOUCH_RELEASE:number = 2;
		static TOUCH_ENTER:number   = 3;
		static TOUCH_LEAVE:number   = 4;

		static MOUSE_DOWN:number    = 5;
		static MOUSE_UP:number      = 6;
		static MOUSE_DRAG:number    = 7;
		static MOUSE_MOVE:number    = 8;
		static MOUSE_ENTER:number   = 9;
		static MOUSE_LEAVE:number   = 10;
		static MOUSE_CLICK:number   = 11;
    	
    	public inputData:Animyst.InputData;
    	public keyboardSettings:any;

    	constructor(inputData:any) {
    		super();
    		this.inputData = inputData;
    	}

    	public startup(params){
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

		public shutdown():void{
			this.inputData = null;
			System.prototype.shutdown.call(this);
		}

		public update(delta:number, runtime:number):void{
			this.inputData.onTick(delta);
		}

		//=============== TOUCH EVENTS ======================//

		public onTouchStart(evt):void{
			if(Input.LOGGING && Animyst.LOGGING) console.log("[Input] Touch Start!");
			this.handleTouchInput(Input.TOUCH_START, evt);
		}

		public onTouchMove(evt):void{
			if(Input.LOGGING && Animyst.LOGGING) console.log("[Input] Touch Move!");
			this.handleTouchInput(Input.TOUCH_MOVE, evt);
		}

		public onTouchRelease(evt):void{
			if(Input.LOGGING && Animyst.LOGGING) console.log("[Input] Touch Release!");
			this.handleTouchInput(Input.TOUCH_RELEASE, evt);
		}

		public onTouchEnter(evt):void{
			if(Input.LOGGING && Animyst.LOGGING) console.log("[Input] Touch Enter!");
			this.handleTouchInput(Input.TOUCH_ENTER, evt);
		}

		public onTouchLeave(evt):void{
			if(Input.LOGGING && Animyst.LOGGING) console.log("[Input] Touch Leave!");
			this.handleTouchInput(Input.TOUCH_LEAVE, evt);
		}


		//================= MOUSE EVENTS =====================//

		public onClick(evt:any):void{
			if(Input.LOGGING && Animyst.LOGGING) console.log("[Input] Mouse Click!");
			this.handleMouseInput(Input.MOUSE_CLICK, evt);
		}

		public onMouseDown(evt:any):void{
			if(Input.LOGGING && Animyst.LOGGING) console.log("[Input] Mouse Down!");
			this.handleMouseInput(Input.MOUSE_DOWN, evt);
		}

		public onMouseDrag(evt:any):void{
			if(Input.LOGGING && Animyst.LOGGING) console.log("[Input] Mouse Drag!");
			this.handleMouseInput(Input.MOUSE_DRAG, evt);
		}

		public onMouseMove(evt:any):void{
			if(Input.LOGGING && Animyst.LOGGING) console.log("[Input] Mouse Move!");
			this.handleMouseInput(Input.MOUSE_MOVE, evt);
		}

		public onMouseUp(evt:any):void{
			if(Input.LOGGING && Animyst.LOGGING) console.log("[Input] Mouse Up!");
			this.handleMouseInput(Input.MOUSE_UP, evt);
		}

		public onMouseEnter(evt:any):void{
			if(Input.LOGGING && Animyst.LOGGING) console.log("[Input] Mouse Enter!");
			this.handleMouseInput(Input.MOUSE_ENTER, evt);
		}

		public onMouseLeave(evt:any):void{
			if(Input.LOGGING && Animyst.LOGGING) console.log("[Input] Mouse Leave!");
			this.handleMouseInput(Input.MOUSE_LEAVE, evt);
		}

		//================ KEYBOARD EVENTS ===================//

		public onKeyUp(evt:any):void{
			if(Input.LOGGING && Animyst.LOGGING) console.log("[Input] Released Key:", evt.key || InputData.KEY_NAMES[evt.keyCode]);
			if(!this.keyboardSettings.allowDefault[evt.key || InputData.KEY_NAMES[evt.keyCode]]){
				evt.preventDefault();
			}
			this.handleKeyInput(Input.KEY_UP, evt.keyCode || InputData.KEY_CODES[evt.key]);
		}


		public onKeyDown(evt:any):void{
			if(Input.LOGGING && Animyst.LOGGING) console.log("[Input] Pressed Key:", evt.key || InputData.KEY_NAMES[evt.keyCode]);
			if(!this.keyboardSettings.allowDefault[evt.key || InputData.KEY_NAMES[evt.keyCode]]){
				evt.preventDefault();
			}

			this.handleKeyInput(Input.KEY_DOWN, evt.keyCode || InputData.KEY_CODES[evt.key]);
		}

		//====================================================//

		public handleMouseInput(type:number, evt:any):void{
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

		public handleKeyInput(type:number, keyCode:number):void{
			this.inputData.setKeyInput(keyCode, type == Input.KEY_DOWN)
		}

		public handleTouchInput(type:number, evt:any){
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


    }
}