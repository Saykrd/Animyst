module Animyst.PIXIModules {
    export class DisplayBuilder implements IDisplayBuilder {
    	
    	private scene:ScenePIXI;

    	constructor(scene:ScenePIXI) {
    		this.scene = scene;
    	}

    	public makeElement(name:string, type:string, params:any):any{
    		var element:any;
    		switch (type)
    		{
    		    case 'sprite': 
    		        // TODO: Implement case content
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

    		this.scene.container.addChild(sprite);
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

    		var button:Button = new Button(up, opt);
    		button.name = name;
    		
    		this.setProperties(button, params);
    		this.scene.container.addChild(button);
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
            this.scene.container.addChild(anim);

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