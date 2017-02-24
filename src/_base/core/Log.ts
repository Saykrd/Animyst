module Log {
    export class Log {
    	

    	static output():void{
			if(!Animyst.LOGGING) return;

			var logData = [];

			logData.push(":[LOG]:");

			for(var i = 0; i < arguments.length; i++){
				logData.push(arguments[i]);
			}

			console.log.apply(console, logData);
		}

		static error():void{
			if(!Animyst.LOGGING) return;


			var logData = [];

			logData.push(":[ERROR]:");

			for(var i = 0; i < arguments.length; i++){
				logData.push(arguments[i]);
			}

			console.error.apply(console, logData);
		}

    	constructor() {
    	}
    }
}