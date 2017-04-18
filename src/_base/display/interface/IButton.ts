module Animyst {
    export interface IButton extends IDisplay {
        down:Signal;
    	over:Signal;
    	up:Signal;
    	out:Signal;

    	enabled:boolean;

    	disable():void;
    	enable():void;
    }
}