module Animyst {
    export class SpriteSheetAnimation {

    	public id:string ;
		public idle:string;
		public currentAnim:string;
		public animations:any;
		public spritesheets:any;
		public framerate:number;
		public playing:boolean;
		public time:number = 0;
		public playTime:number = 0;
		public currentFrame:number = 0;
    	
    	constructor(id:string, framerate:number = 60){
    		this.id = id;
			this.animations = {};
			this.spritesheets = {};
			this.framerate = framerate;
    	}

    	public addSheet(sheetData:SpriteSheetData):void{
			this.spritesheets[sheetData.name] = sheetData;
		}

		public getSheet(sheetID):SpriteSheetData{
			 return this.spritesheets[sheetID]; 
		};

		public addAnimation(name:string, prefix:string, sheetID:string, params:any = {}){
			var anim:any = {};
			var spritesheet = this.getSheet(sheetID);

			anim.name = name;
			anim.prefix = prefix;
			anim.sheetID = sheetID;
			anim.useFrames = params.useFrames || false;
			anim.frames = spritesheet.getFrames(anim.prefix);
			anim.currentFrameIndex = 0;
			anim.totalFrames = anim.frames.length;
			anim.duration = params.duration || anim.useFrames ? anim.totalFrames * (this.framerate / 60) : 1000 / this.framerate * anim.totalFrames;
			anim.loop = params.loop || false;
			anim.repeat = params.repeat || 0;
			anim.elapsed = 0;
			anim.framecount = 0;


			this.animations[anim.name] = anim;
		}

		public getAnimation(name:string):any{
			 return this.animations[name]; 
		};

		public play(name:string):void{
			if(this.currentAnim == name) return;

			var anim = this.getAnimation(name);
			this.currentAnim = name;
			this.playing = true;
		};

		public stop():void{
			
		}

		public pause():void{
			
		}

		public resume():void{
			
		}

		public setIdle(name:string):void{
			 // body...  
		};

		public animate(delta:number = 0):void{
			if(this.playing){
				//console.log(delta, time, this.time, this.playTime, this.currentFrame, this.sourceFile)
				var anim = this.getAnimation(this.currentAnim)

				if(anim.useFrames){

				} else {
				
				}

				//TODO: Finish...
				

				/*if(this.time >= this.playTime){

					if(this.loop){
						this.time = 0;
					} else {
						this.playing = false;
					}
				} else {

					this.time += delta;
					this.currentFrame = Math.round((this.time / this.playTime) * (this.frames.length - 1))
					if(this.currentFrame >= this.frames.length) this.currentFrame = this.frames.length - 1;
				}*/
			}
		};
    }
}