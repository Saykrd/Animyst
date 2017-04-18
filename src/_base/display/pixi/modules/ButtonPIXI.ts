module Animyst {
    export class ButtonPIXI extends SpritePIXI {

    	public upTexture:PIXI.Texture;
    	public downTexture:PIXI.Texture;
    	public overTexture:PIXI.Texture;

    	public options:any;

    	private _isDown:boolean;
    	public get isDown():boolean{return this._isDown};

    	private _isOver:boolean;
    	public get isOver():boolean{return this._isOver};




    	constructor(upTexture:PIXI.Texture, options?:any) {
    		super(upTexture);

    		this.upTexture = upTexture;
    		this.options = options;



    		this.enableInteract();

    		this.interactive = true;
    		this.buttonMode = true;

    		this.setup(this.options);
    	}

		public setup(params?:any):void{
    		if(params){
    			this.downTexture = params.downTexture;
    			this.overTexture = params.overTexture;
    		}
    	}

    	public disableInteract():void{
    		this.buttonMode = false;
    		super.disableInteract();
    	}

    	public enableInteract():void{
    		this.buttonMode = true;
    		super.enableInteract();
    	}

    	public onDown():void{
    		this._isDown = true;
    		if(this.downTexture) this.texture = this.downTexture;


    		super.onDown();
    	}

    	public onUp():void{
    		this._isDown = false;
    		this.texture = this.upTexture;
    		super.onUp();
    	}

    	public onOver():void{
    		this._isOver = true;
    		if(this.overTexture) this.texture = this.overTexture;
    		super.onOver();
    	}

    	public onOut():void{
    		this._isOver = false;
    		this.texture = this.upTexture;
    		super.onOut()
    	}

    



    }
}