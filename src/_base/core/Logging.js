var Logging = module.exports = {};

Logging.output = function (){
	if(!Logging) return;

	let logData = [];

	logData.push("::[LOG]::");

	for(var i = 0; i < arguments.length; i++){
		logData.push(arguments[i]);
	}

	console.log.apply(console, logData);
}

Logging.error = function (){
	if(!Logging) return;


	var logData = [];

	logData.push("::[ERROR]::");

	for(var i = 0; i < arguments.length; i++){
		logData.push(arguments[i]);
	}

	console.error.apply(console, logData);
}