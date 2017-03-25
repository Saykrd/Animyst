module Animyst {
    export class PIXITexture extends THREE.Texture {

    	public stage:any;
    	public renderer:any;
    	public shouldUpdate:boolean;
    	public width:number;
    	public height:number

    	public _init(){
			this.image = this.renderer.view;

			let graphics = new PIXI.Graphics();
			graphics.lineStyle(2, 0xFF00FF, 1);
			graphics.beginFill(0xFF00BB, 0.25);
			graphics.drawCircle(this.width/2, this.height/2, 100);
			graphics.endFill();

			let texture = PIXI.Texture.fromCanvas(DataLoad.getAsset('samusftilt'));
			let sprite = new PIXI.Sprite(texture);
			this.stage.addChild(sprite);

			this.stage.addChild(graphics);

			this.invalidate();
			this.update();
		}

		public invalidate(){
			 this.shouldUpdate = true; 
		};

		public update(){
			 if(this.shouldUpdate){
			 	this.renderer.render(this.stage);
			 	this.needsUpdate = true;
			 	this.shouldUpdate = false;
			 } 
		};

    	
    	constructor(stage:any, renderer:any) {
    		super();

    		this.stage = stage;
    		this.renderer = renderer;

    		this.width = renderer.view.width;
    		this.height = renderer.view.height;
    		this._init();
    	}
    }
}