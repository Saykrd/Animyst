module Animyst {
    export class Window {
    	static get orientation():any{return window.orientation};
    	static get isLandscape():boolean{return window.innerWidth > window.innerHeight};
    	static get isPortrait():boolean{return window.innerHeight > window.innerWidth};
    	static get width():number{return document.documentElement.clientWidth};
    	static get height():number{return document.documentElement.clientHeight};
    	static resizeSignal:Signal = new Signal();
    	static _onResize(evt:any):void{
    		Log.output("[Window] onResize!")
			Window.resizeSignal.dispatch(evt);
    	}

    	static _onWindowLoad(evt:any):void{
    		Log.output("[Window] Window loaded:" , "w:", Window.width, "h:", Window.height)
    	}

    	static _setup():void{
    		window.addEventListener("resize", Window._onResize);
			window.addEventListener("load", Window._onWindowLoad);
    	}
    }
}

Animyst.Window._setup();
