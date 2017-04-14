module Animyst.PIXIModules {

	export var BUTTON_DOWN:number = 0;
	export var BUTTON_UP:number   = 1;
	export var BUTTON_OVER:number = 2;
	export var BUTTON_OUT:number  = 3;

    export class Button extends PIXI.Sprite {

    	public down:Signal;
    	public over:Signal;
    	public up:Signal;
    	public out:Signal;

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

    		this.down = new Signal();
    		this.up = new Signal();
    		this.over = new Signal();
    		this.out = new Signal();

    		this.on('pointerdown', this.onDown);
    		this.on('pointerup', this.onUp);
    		this.on('pointerover', this.onOver)
    		this.on('pointerout', this.onOut);

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

    	public onDown():void{
    		this._isDown = true;
    		if(this.downTexture) this.texture = this.downTexture;


    		this.down.dispatch(BUTTON_DOWN, this);
    	}

    	public onUp():void{
    		this._isDown = false;
    		this.texture = this.upTexture;
    		this.up.dispatch(BUTTON_UP, this);
    	}

    	public onOver():void{
    		this._isOver = true;
    		if(this.overTexture) this.texture = this.overTexture;
    		this.over.dispatch(BUTTON_OVER, this);
    	}

    	public onOut():void{
    		this._isOver = false;
    		this.texture = this.upTexture;
    		this.out.dispatch(BUTTON_OUT, this);
    	}

    



    }
}