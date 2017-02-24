module Animyst {
    export class Environment {

    	//========================================
		//------------- Platform -----------------
		//========================================

		static isDesktop:boolean  = false;
		static isMobile:boolean   = false;
		static isIOS:boolean      = false;
		static isAndroid:boolean  = false;
		static isChromeOS:boolean = false;
		static isMacOS:boolean    = false;
		static isWindows:boolean  = false;
		static isLinux:boolean    = false;

		static platformName:string = "";



		//========================================
		//------------- Device -------------------
		//========================================

		static pixelRatio:number   = 1;
		static colorDepth:number   = -1;
		static screenWidth:number  = -1;
		static screenHeight:number = -1;

		//========================================
		//------------- Browser ------------------
		//========================================

		static isChrome:boolean   = false;
		static isFirefox:boolean  = false;
		static isIE:boolean       = false;
		static isEdge:boolean     = false;
		static isSafari:boolean   = false;
		static isWebApp:boolean   = false;
		static isCocoonJS:boolean = false;

		static browserVersion:string = "";
		static browserName:string    = "";
		static browserDetails:any    = {};

		static url:string         = "";
		static host:string        = "";
		static path:string        = "";
		static port:string        = "";
		static queryString:string = "";

		//========================================

		static _setup():void{
			Environment._checkBrowser();
			Environment._checkPlatform();
			Environment._checkDevice();
		}

		static _checkPlatform():void{
			var userAgent = navigator.userAgent;

			if(/Linux/.test(userAgent)){
				Environment.platformName = "Linux";
				Environment.isLinux = true;
			}

			if(/Android/.test(userAgent)){
				Environment.platformName = "Android";
				Environment.isAndroid = true;
			}

			if(/CrOS/.test(userAgent)){
				Environment.platformName = "ChromeOS";
				Environment.isChromeOS = true;
			}

			if(/iP[ao]d|iPhone/i.test(userAgent)){
				Environment.platformName = "iOS";
				Environment.isIOS = true;
			}

			if(/Mac OS/.test(userAgent)){
				Environment.platformName = "Mac";
				Environment.isMacOS = true;
			}

			if(/Windows/.test(userAgent)){
				Environment.platformName = "Windows";
				Environment.isWindows = true;
			}

			if(Environment.isWindows || Environment.isMacOS || Environment.isLinux){
				Environment.isDesktop = true;
			}

			if(Environment.isAndroid || Environment.isIOS || Environment.isWebApp){
				Environment.isMobile = true;
			}

		}

		static _checkDevice():void{
			Environment.pixelRatio = window.devicePixelRatio || 1;
			Environment.colorDepth = window.screen.colorDepth;

			if(Environment.isMobile){
				Environment.screenWidth  = window.screen.width  * Environment.pixelRatio;
				Environment.screenHeight = window.screen.height * Environment.pixelRatio;
			} else {
				Environment.screenWidth  = window.screen.width;
				Environment.screenHeight = window.screen.height;
			}
		}

		static _checkBrowswer():void{
			var userAgent = navigator.userAgent;

			if(/Safari/.test(userAgent)){
				Environment.browserName = "Safari";
				Environment.isSafari = true;
				Environment.browserVersion = (userAgent.indexOf("Version") !=-1) ? userAgent.substring(userAgent.indexOf("Version") + 8) : userAgent.substring(userAgent.indexOf("Safari") + 7);
			}

			if(/Mobile(.*)Safari/.test(userAgent)){
				Environment.browserName = "MobileSafari";
				Environment.isSafari = true;
				Environment.browserVersion = (userAgent.indexOf("Version") !=-1) ? userAgent.substring(userAgent.indexOf("Version") + 8) : userAgent.substring(userAgent.indexOf("Safari") + 7);
			}

			if(/Chrome/.test(userAgent)){
				Environment.browserName = "Chrome";
				Environment.isChrome = true;
				Environment.browserVersion = userAgent.substring(userAgent.indexOf("Chrome") + 7, userAgent.indexOf(" Safari") || null);
			}

			if(/Firefox/.test(userAgent)){
				Environment.browserName = "Firefox";
				Environment.isFirefox = true;
				Environment.browserVersion = userAgent.substring(userAgent.indexOf("Firefox") + 8);
			}

			if(/MSIE (\d+\.\d+);/.test(userAgent)){
				Environment.browserName = "MSIE";
				Environment.isIE = true;
				Environment.browserVersion = userAgent.substring(userAgent.indexOf("MSIE") + 5);
			}

			if(/Edge/.test(userAgent)){
				Environment.browserName = "MSEdge";
				Environment.isEdge = true;
				Environment.browserVersion = userAgent.substring(userAgent.indexOf("Edge") + 5);
			}

			if(navigator['standalone']){
				Environment.browserName = "WebApp";
				Environment.isWebApp = true;
			}

			if(navigator['isCocoonJS']){
				Environment.browserName = "CocoonJS";
				Environment.isCocoonJS = true;
			}


			Environment.url = window.location.href;
			Environment.queryString = window.location.search;
			Environment.host = window.location.hostname;
			Environment.path = window.location.pathname;
			Environment.port = window.location.port;

			var details = Environment.browserVersion.split(".");
			switch(details.length){
				case 1:
					Environment.browserDetails.major = parseInt(details[0]);

					break;
				case 2:
					Environment.browserDetails.major = parseInt(details[0]);
					Environment.browserDetails.minor = parseInt(details[1]);

					break;
				case 3:
					Environment.browserDetails.major = parseInt(details[0]);
					Environment.browserDetails.minor = parseInt(details[1]);
					Environment.browserDetails.build = parseInt(details[2]);

					break;
				case 4:
					Environment.browserDetails.major = parseInt(details[0]);
					Environment.browserDetails.minor = parseInt(details[1]);
					Environment.browserDetails.build = parseInt(details[2]);
					Environment.browserDetails.revision = parseInt(details[3]);
					break;
			}
		}

		static getURLParameterByName(name:string, escapeSpaces:boolean= false){
			if(escapeSpaces === null) escapeSpaces = true;
			var match = new RegExp('[?&]' + name + '=([^&]*)').exec(Environment.queryString);
			return (escapeSpaces) ? match && decodeURIComponent(match[1].replace(/\/+/g, '')) : match && decodeURIComponent(match[1]);
		}
    	
    	constructor(argument) {
    		// code...
    	}
    }
}