module Animyst {
    export class SpritePIXI extends PIXI.Sprite implements IInteractable{
    	public down:Signal;
    	public over:Signal;
    	public up:Signal;
    	public out:Signal;

    	private _enabled:boolean;
    	public get enabled():boolean{return this._enabled};

    	constructor(texture?:PIXI.Texture) {
    		super(texture)

            this.down = new Signal();
            this.up = new Signal();
            this.over = new Signal();
            this.out = new Signal();
    	}

    	public disableInteract():void{
    		this.removeAllListeners();
    		this.interactive = false;
    		this._enabled = false;
    	}

    	public enableInteract():void{
    		this.on('pointerdown', this.onDown);
    		this.on('pointerup', this.onUp);
    		this.on('pointerover', this.onOver)
    		this.on('pointerout', this.onOut);

    		this.interactive = true;
    		this._enabled = true;
    	}

    	public onDown():void{
    		this.down.dispatch(Input.MOUSE_DOWN, this);
    	}

    	public onUp():void{
    		this.up.dispatch(Input.MOUSE_UP, this);
    	}

    	public onOver():void{
    		this.over.dispatch(Input.MOUSE_MOVE, this);
    	}

    	public onOut():void{
    		this.out.dispatch(Input.MOUSE_LEAVE, this);
    	}
    }
}