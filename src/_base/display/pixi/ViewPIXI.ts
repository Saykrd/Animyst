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

    export class ScenePIXI extends Item implements IScene {

    	public container:PIXI.Container;
    	public root:PIXI.Container;
    	private elements:Database;

    	constructor(id:string, params:any) {
    		super(id, params);
    	}

    	public setup(params:any):void{
    		this.container = new PIXI.Container;
    		this.root = params.stage;

    		this.root.addChild(this.container);
    		this.elements = new Database();
    		super.setup(params);
    	}

    	public destroy():void{
    		this.elements.traverse((elm:Item) => this.removeChild(elm.id), null);
    		this.container.removeChildren();
    		this.container.destroy();

    		this.root = null;
    		this.container = null;
    		this.elements = null;
    		super.destroy();
    	}

    	public addChild(child:PIXI.DisplayObject):void{
    		this.container.addChild(child);
    		this.elements.create(Item, child.name, {display:child});
    	}

    	public removeChild(child:any):void{
    		var display:PIXI.DisplayObject;
    		if(child instanceof PIXI.DisplayObject){
    			display = child;
    		} else if(typeof child == "string"){
    			let item:Item = this.elements.get(child);
    			if(!item) {
    				Log.error("[!ScenePIXI] No child found with the name", child);
    			} else {
    				display = item.props.display
    			}
    		}

    		this.elements.remove(display.name);
    		this.container.removeChild(display);
    	}

    	public makeElement(name:string, type:string, params:any):any{
    		var element:any;
    		switch (type)
    		{
    		    case 'sprite': 
    		        element = this.makeSprite(name, params);
    		        break;
    		    case 'button':
    		    	element = this.makeButton(name, params);
    		    	break;
    		    case 'spine':
    		    	element = this.makeSpine(name, params);
    		    	break;
    		}

    		return element;
    	}


    	public makeSprite(name:string, params:any):any{
    		var texture:PIXI.Texture;

    		if(params.path) {
    			texture = PIXI.Texture.from(params.path);
    		} else {
    			texture = PIXI.Texture.from(DataLoad.getPath(params.texture));
    		}

    		var sprite:PIXI.Sprite = new PIXI.Sprite(texture);
    		sprite.name = name;

    		this.setProperties(sprite, params);

    		this.addChild(sprite);
    		return sprite;
    	}

    	public makeButton(name:string, params:any):any{
    		var up:PIXI.Texture = PIXI.Texture.from(DataLoad.getPath(params.up));

    		var opt:any = {
    			downTexture : params.down ? PIXI.Texture.from(DataLoad.getPath(params.down)) : null,
    			overTexture : params.over ? PIXI.Texture.from(DataLoad.getPath(params.over)) : null
    		}

    		console.log(params.down, params.over, params.up);
    		console.log(opt);

    		var button:PIXIModules.Button = new PIXIModules.Button(up, opt);
    		button.name = name;
    		
    		this.setProperties(button, params);
    		this.addChild(button);
    		return button;
    	}

    	public makeSpine(name:string, params:any):any{
    		var atlas:any = new PIXI.spine.core.TextureAtlas(Animyst.DataLoad.getAsset(params.atlas), function(line, callback){
                callback(PIXI.BaseTexture.from(Animyst.DataLoad.getPath(params.sheet)));
            });

            var rawSkelData:any = Animyst.DataLoad.getAsset(params.data);
            var spineJSONParser:any = new PIXI.spine.core.SkeletonJson(new PIXI.spine.core.AtlasAttachmentLoader(atlas));
            var skeletonData:any = spineJSONParser.readSkeletonData(rawSkelData);

            var anim:PIXI.spine.Spine = new PIXI.spine.Spine(skeletonData);
            anim.name = name;

            if(params.anim && anim.state.hasAnimation(params.anim)){
            	anim.state.setAnimation(params.trackIndex || 0, params.anim, params.loop === undefined ? true : params.loop);
            }

            this.setProperties(anim, params);
            this.addChild(anim);

            return anim;
    	}

    	private setProperties(obj:PIXI.DisplayObject, params:any):void{
    		obj.x = params.x || 0;
    		obj.y = params.y || 0;
    		
    		if(params.scaleX) obj.scale.x = params.scaleX;
    		if(params.scaleY) obj.scale.y = params.scaleY;
    		if(params.scale){
    			if(typeof params.scale == 'object') obj.scale.set(params.scale.x, params.scale.y);
    			if(typeof params.scale == 'number') obj.scale.set(params.scale, params.scale);
    		}

    		obj.rotation = params.rotation || 0;
    	}
	}
}