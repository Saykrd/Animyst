module App {
    export class PIXITests extends Animyst.AppState {
    	
    	public viewport:Animyst.PIXIView;

    	constructor() {
    		super('PIXITests');
    	}

    	public setup():void{
    		this.viewport = new Animyst.PIXIView();
    		this.viewport.init({
    			backgroundColor: 0x555555 
    		});
    		this.viewport.append();

    		var t1:PIXI.Texture = PIXI.Texture.from(Animyst.DataLoad.getPath('redball1'));//PIXI.Texture.fromCanvas(Animyst.DataLoad.getAsset('redball1'));
    		var t2:PIXI.Texture = PIXI.Texture.from(Animyst.DataLoad.getPath('yellowball1'));//PIXI.Texture.fromCanvas(Animyst.DataLoad.getAsset('yellowball1'));
    		var t3:PIXI.Texture = PIXI.Texture.from(Animyst.DataLoad.getPath('greenball1'));//PIXI.Texture.fromCanvas(Animyst.DataLoad.getAsset('greenball1'));



    		var s1:PIXI.Sprite = new PIXI.Sprite(t1);//PIXI.Sprite.fromImage(Animyst.DataLoad.getData('redball1').src);
    		var s2:PIXI.Sprite = new PIXI.Sprite(t3);

            
            var atlas:any = new PIXI.spine.core.TextureAtlas(Animyst.DataLoad.getAsset('raptor_atlas'), function(line, callback){
                callback(PIXI.BaseTexture.from(Animyst.DataLoad.getPath('raptor_sheet')));
            });

            var rawSkelData:any = Animyst.DataLoad.getAsset('raptor_data');
            var spineJSONParser:any = new PIXI.spine.core.SkeletonJson(new PIXI.spine.core.AtlasAttachmentLoader(atlas));
            var skeletonData:any = spineJSONParser.readSkeletonData(rawSkelData);

            var anim:PIXI.spine.Spine = new PIXI.spine.Spine(skeletonData);

            this.viewport.stage.addChild(anim);

            if(anim.state.hasAnimation("walk")){
                anim.state.setAnimation(0, "walk", true);
            }

           
            anim.scale.set(0.75, 0.75);

            anim.x = this.viewport.halfWidth;
            anim.y = this.viewport.halfHeight + anim.height / 2;

    		

    		//this.viewport.stage.addChild(s1);
    		//this.viewport.stage.addChild(s2);
    		s1.x = 100;
    		s1.y = 100;

    		s2.x = this.viewport.width / 2;
    		s2.y = this.viewport.height / 2;

    		s1.interactive = true;
    	}

    	public frameUpdate(delta:number, framecount:number):void{
    		this.viewport.render();	
    	}
    }
}