module Animyst {
    export class SpriteSheetData extends Database {
    	
    	public name:string;
    	public data:any;

    	constructor(name:string, data:any) {
    		super();

    		this.name  = name;
    		this.data = data;
    		this.parse();
    	}

    	public parse():void{
			for(var k in this.data.frames){
				this.addFrame(k, this.data.frames[k]);	
			} 
		}

		public addFrame(frameID, data):void{
			var frame = new FrameData(frameID, data);
			this.create(frame, frameID, data); 
		}

		public getFrame(frameID):void{
			return this.get(frameID);
		}

		public getFrames(framePrefix):void{
			if(!this.hasCategory(framePrefix)){
				let ctx:any = {}
				ctx.framePrefix = framePrefix;
				this.addCategory(framePrefix, function(frame){
					return frame.id.indexOf(this.framePrefix) == 0;
				}, FrameData, ctx);
			} 

			let frames = this.getFromCategory(framePrefix);
			frames.sort(this._sortCaseInsensitive);
			return frames;
		}

		private _sortCaseInsensitive(a,b):number{
			if (a.toLowerCase() < b.toLowerCase()) return -1;
			if (a.toLowerCase() > b.toLowerCase()) return 1;

			return 0;
		}
    }

    export class FrameData extends Item {

    	public frame:any;
    	public rotated:boolean;
    	public trimmed:boolean;
    	public spriteSourceSize:any;
    	public sourceSize:any;
    	public pivot:any;

    	constructor(id:string, params:any) {
    		super(id, params);
    	}

    	public setup(params:any):void{
			this.frame = params.frame;
			this.rotated = params.rotated;
			this.trimmed = params.trimmed;
			this.spriteSourceSize = params.spriteSourceSize;
			this.sourceSize = params.sourceSize;
			this.pivot = params.pivot;

			super.setup(params);
		};
    }
}