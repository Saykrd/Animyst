module Animyst{

    export class ScenePIXICategory {
        static INTERACTABLES:string = 'interact';
        static BUTTONS:string = 'buttons';
    }
    export class ScenePIXI extends Item implements IScene {

        public container:PIXI.Container;
        public root:PIXI.Container;
        public input:Signal;
        private viewport:IViewport;
        private elements:Database;

        constructor(id:string, params:any) {
            super(id, params);
        }

        public setup(params:any):void{
            this.container = new PIXI.Container;
            this.root = params.stage;
            this.input = new Signal();
            this.viewport = params.viewport as IViewport;

            this.root.addChild(this.container);
            this.elements = new Database();

            this.elements.addCategory(ScenePIXICategory.BUTTONS, function(elm:SceneItem){return elm.type == SceneItem.BUTTON});
            this.elements.addCategory(ScenePIXICategory.INTERACTABLES, function(elm:SceneItem){return elm.props.display.hasOwnProperty("enableInteract")});


            super.setup(params);
        }

        public destroy():void{
            this.elements.traverse((elm:Item) => this.removeChild(elm.id));
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

        public makeElements(elements:Object[]):void{
            for (var i = 0; i < elements.length; ++i) {
                var element:any = elements[i];
                this.makeElement(element.name, element.type, element);
            }
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
                case 'group':
                    element = this.makeGroup(name, params);
                    break;
            }

            if(params.group){
                var group = this.getChild(params.group);
                if(group) { 
                    group.addChild(element);
                } else {
                    Log.error("[!ScenePIXI] No group found with name", params.group);
                }
            }

            return element;
        }

        public makeGroup(name:string, params:any):any{
            var group:PIXI.Container = new PIXI.Container();

            group.name = name;
            this.setProperties(group, params);
            this.addChild(group);
            return group;
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

        public setProperties(obj:any, params:any):void{
            
            if(typeof params.x == 'string'){
                this.setToExpression(params.x, obj, "x");
            } else {
                obj.x = params.x || 0;
            }

            if(typeof params.y == 'string'){
                this.setToExpression(params.y, obj, "y");
            } else {
                obj.y = params.y || 0;
            }
            
            if(params.scaleX) obj.scale.x = params.scaleX;
            if(params.scaleY) obj.scale.y = params.scaleY;
            if(params.scale){
                if(typeof params.scale == 'object') obj.scale.set(params.scale.x, params.scale.y);
                if(typeof params.scale == 'number') obj.scale.set(params.scale, params.scale);
            }

            if(params.anchorX && obj.anchor) obj.anchor.x = params.anchorX;
            if(params.anchorY && obj.anchor) obj.anchor.y = params.anchorY;
            if(params.anchor && obj.anchor) obj.anchor.set(params.anchor, params.anchor);


            obj.rotation = MathUtil.toRadians(params.rotation) || 0;
            obj.visible = params.visible == undefined ? true : params.visible;
            obj.alpha = params.alpha || 1;
        }

        private setToExpression(expression:string, object:any, property:string):void{
            var pos:string = expression.split(/[+=-]+\d+/)[0];
            var oper:string = expression.split(/\w+/)[1];
            var value:number = parseInt(expression.split(/\D+/)[1]);
            var base:number

            if(isNaN(value)) value = 0; 

            switch(pos){
                //"top" and "left" are 0
                case "right":
                    base = this.viewport.width
                    break;
                case "bottom":
                    base = this.viewport.height
                    break;
                case "centerX":
                    base = this.viewport.width / 2;
                    break;
                case "centerY":
                    base = this.viewport.height / 2;
                    break;
                default:
                    base = 0;
                    break;
            }

            if(oper == "+="){
              object[property] = base + value;  
            } else if(oper == "-=") {
              object[property] = base - value;  
            } else if(oper == "*="){
              object[property] = base * value;
            } else if(oper == "/="){
              object[property] = base / value;
            } else {
              object[property] = base;
            }
        }

        public enableInteractable(interactable:string):void{
            var element:SceneItem = this.elements.get(interactable);
            var b:IInteractable = <IInteractable> element.props.display;
            b.enableInteract();
        }

        public disableInteractable(interactable:string):void{
            var element:SceneItem = this.elements.get(interactable);
            var b:IInteractable = element.props.display;
            b.disableInteract();
        }

        public enableInteract(interactables?:any):void{
            interactables = interactables || this.elements.getFromCategory('buttons');

            if(Array.isArray(interactables)){
                for(var i = 0; i < interactables.length; i++){
                    this.enableInteractable(interactables[i]);
                }
            } else if(typeof interactables === 'string'){
                this.enableInteractable(interactables);
            }
        }

        public disableInteract(interactables?:any):void{
            interactables = interactables || this.elements.getFromCategory('interactables');

            if(Array.isArray(interactables)){
                for(var i = 0; i < interactables.length; i++){
                    this.disableInteractable(interactables[i]);
                }
            } else if(typeof interactables === 'string'){
                this.disableInteractable(interactables);
            }
        }
    }
}