module Animyst{
    export class ScenePIXI extends Item implements IScene {

        public container:PIXI.Container;
        public root:PIXI.Container;
        public input:Signal;
        private elements:Database;

        constructor(id:string, params:any) {
            super(id, params);
        }

        public setup(params:any):void{
            this.container = new PIXI.Container;
            this.root = params.stage;
            this.input = new Signal();

            this.root.addChild(this.container);
            this.elements = new Database();

            this.elements.addCategory('buttons', function(elm:SceneItem){return elm.type == SceneItem.BUTTON});


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
            this.elements.create(SceneItem, child.name, {display:child});
        }

        public getChild(name:string):any{
            var element = this.elements.get(name);
            if(element) return element.props.display;
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

            var button:ButtonPIXI=  new ButtonPIXI(up, opt);
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

        public enableButton(button:string):void{
            var element:SceneItem = this.elements.get(button);
            if(element.type == SceneItem.BUTTON){
                var b:IInteractable = <IInteractable> element.props.display;
                b.enableInteract();

                //element.enable(); 
            }
        }

        public disableButton(button:string):void{
            var element:SceneItem = this.elements.get(button);
            if(element.type == SceneItem.BUTTON){
                var b:IInteractable = element.props.display;
                b.disableInteract();
                //element.disable(); 
            }
        }

        public enableButtons(buttons?:any):void{
            buttons = buttons || this.elements.getFromCategory('buttons');

            if(Array.isArray(buttons)){
                for(var i = 0; i < buttons.length; i++){
                    this.enableButton(buttons[i]);
                }
            } else if(typeof buttons === 'string'){
                this.enableButton(buttons);
            }
        }

        public disableButtons(buttons?:any):void{
            buttons = buttons || this.elements.getFromCategory('buttons');

            if(Array.isArray(buttons)){
                for(var i = 0; i < buttons.length; i++){
                    this.enableButton(buttons[i]);
                }
            } else if(typeof buttons === 'string'){
                this.enableButton(buttons);
            }
        }
    }
}