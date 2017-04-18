module Animyst {
    export interface IInteractable extends IDisplay {
        down:Signal;
    	over:Signal;
    	up:Signal;
    	out:Signal;

    	enabled:boolean;

    	disableInteract():void;
    	enableInteract():void;
    }
}