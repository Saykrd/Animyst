module Animyst {
    export class Log {
    	

    	static output(...args):void{
			if(!LOGGING) return;

			var logData = [];

			logData.push(":[LOG]:");

			for(var i = 0; i < args.length; i++){
				logData.push(args[i]);
			}

			console.log.apply(console, logData);
		}

		static error(...args):void{
			if(!LOGGING) return;


			var logData = [];

			logData.push(":[ERROR]:");

			for(var i = 0; i < args.length; i++){
				logData.push(args[i]);
			}

			console.error.apply(console, logData);
		}

    	constructor() {
    	}
    }
}