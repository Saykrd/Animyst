module Animyst {
    export class SpriteSheetTexture extends THREE.Texture {
    	
    	public atlas:any;
    	public frames:any[];
    	public stage:PIXI.Container;
    	public renderer:any;
    	public playTime:number = 0;
    	public time:number = 0;
    	public loop:boolean;
    	public currentFrame:number = 0;
    	public currentFrameID:string = "";
    	public sprite:any = null;
    	public renderWidth:number = 0;
    	public renderHeight:number = 0;
    	public sourceFile:string = "";
    	public playing:boolean;
    	public timePassed:number = 0;

    	constructor(atlas:any) {
    		super();

			this.addSheet(atlas); 
    	}

    	private _initSprite(startFrame):void{

			this.stage    = new PIXI.Container();
			this.renderer = PIXI.autoDetectRenderer(256, 256, {transparent : true});
			this.sprite   = new PIXI.Sprite(PIXI.Texture.fromFrame(startFrame));

			this.image = this.renderer.view;

			this.stage.addChild(this.sprite);
			this.renderer.render(this.stage);

			this.needsUpdate = true;
		} 

		public addSheet(atlas:any):void{
			this.atlas = atlas;
			this.frames = [];


			for(var k in atlas.frames){
				var frame = atlas.frames[k];

				if(frame.frame.w > this.renderWidth){
					this.renderWidth = frame.frame.w % 2 == 0 ? frame.frame.w : frame.frame.w + 1;

				} 

				if(frame.frame.h > this.renderHeight){
					this.renderHeight = frame.frame.h % 2 == 0 ? frame.frame.h : frame.frame.h + 1;
				} 

				this.frames.push(k);
			}

			if(!this.sprite){
				this._initSprite(this.frames[0]);
				this.currentFrameID = this.frames[0];
				this.currentFrame = 0;
			} 
		}

		public showFrame(frame?:number):void{
			if(this.frames.length <= 0) return;
			if(!frame) frame = this.currentFrame || 0;

			var thisFrame

			if(typeof frame == "string"){
				thisFrame = frame;
			} else if(typeof frame == "number"){
				thisFrame = this.frames[frame];
			}

			this.sprite.setTexture(PIXI.Texture.fromFrame(thisFrame));
			this.renderer.render(this.stage);
			this.needsUpdate = true;
			
		}

		public play(time:number, loop:boolean):void{
			if(this.frames.length <= 0) return;
			this.playing  = true;
			this.loop     = loop;
			this.playTime = time;
			this.time     = 0;

		}

		public stop():void{
			this.playing = false;
			this.timePassed = 0;
		}

		public animate(delta:number, runtime?:number):void{
			if(this.playing){
				//console.log(delta, time, this.time, this.playTime, this.currentFrame, this.sourceFile)
				if(this.time >= this.playTime){

					if(this.loop){
						this.time = 0;
					} else {
						this.playing = false;
					}
				} else {

					this.time += delta;
					this.currentFrame = Math.round((this.time / this.playTime) * (this.frames.length - 1))
					if(this.currentFrame >= this.frames.length) this.currentFrame = this.frames.length - 1;

					this.showFrame();
				}
			}
		}
    }
}