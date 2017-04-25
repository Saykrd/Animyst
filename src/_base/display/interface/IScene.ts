module Animyst {
    export interface IScene {
        makeElement(name:any, type:string, params:any):any;
        makeElements(elements:object[]):void;
        enableInteract(interactables?:any):void;
        disableInteract(interactables?:any):void;
        getChild(name:string):any;
        removeChild(child:any):void;
        setProperties(obj:any, params:any);
    }
}