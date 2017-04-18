module Animyst {
    export interface IDisplayBuilder {
        makeSprite(name:string, params:any):any;
        makeButton(name:string, params:any):any;
        makeElement(name:string, type:string, params:any):any;
    }
}