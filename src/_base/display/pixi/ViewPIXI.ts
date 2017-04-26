module Animyst {
    export class ViewPIXI extends Animyst.Database implements IViewport {
    	
    	public width:number = 0;
    	public height:number = 0;
    	public stage:PIXI.Container;
    	public renderer:any;

    	public get halfWidth():number{return this.width / 2};
    	public get halfHeight():number{return this.height / 2};

    	constructor() {
    		super();

    	}

    	public init(params:any):void{

    		this.width = params.width || Window.width;
    		this.height = params.height || Window.height;


    		this.renderer = PIXI.autoDetectRenderer(
    			this.width,
    			this.height,
    			params.options,
    			params.noWebGL
    		);


    		this.renderer.backgroundColor = params.backgroundColor || this.renderer.backgroundColor;
    		this.stage = new PIXI.Container();
    	}

    	public create(cls:any, id:string, params:any):Item{
    		if(!params.stage) params.stage = this.stage;
            if(!params.viewport) params.viewport = this;
    		return super.create(cls, id, params);
    	}

    	public append(containerID?:string):void{
    		if(!containerID){
				document.body.appendChild(this.renderer.view);
				//document.body.appendChild(this.view);
			} else {
				var container = document.getElementById(containerID);
				if(container)	{
					container.appendChild(this.renderer.view);
					//container.appendChild(this.view);
				} else {
					Log.error("[ViewPIXI] Container ID", containerID, "doesn't exist");
				}	
			}
    	}

    	public render():void{
    		this.renderer.render(this.stage);
    	}
    }

    
}