Animyst.LOG = {};

Animyst.LOG.output = function (){
	if(!Animyst.LOGGING) return;

	var logData = [];

	logData.push("::[LOG]::");

	for(var i = 0; i < arguments.length; i++){
		logData.push(arguments[i]);
	}

	console.log.apply(console, logData);
}