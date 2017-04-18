module Animyst {
    export class SceneItem extends Item {
        static BUTTON:string = 'button';
        static SPRITE:string = 'sprite';
        static SPINE:string  = 'spine';

        public type:string;

        constructor(id:string, params:any) {
        	super(id, params);
        }

        public setup(params:any):void{
        	super.setup(params);

        	this.type = params.type;
        }

    }
}