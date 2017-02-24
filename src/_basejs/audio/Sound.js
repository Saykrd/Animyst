// Under construction, will probably change drastically, as in probably wont be a system but a module instead
require('../../_libs/howler.min');
var System  = require('../core/System'),
	DataLoad = require('../core/DataLoad');

var Sound = function(){
	
}

module.exports = Sound;
Sound.prototype = Object.create(System.prototype);
Sound.prototype.startup = function(params){

	DataLoad.loadAsset("music", function(type, evt){
		//console.log("MUSIC LOADING...", type);
		if(type == Animyst.DataLoad.FILE_LOADED){
			//console.log("MUSIC LOADED");
			var sound = new Howl({"urls" : [DataLoad.getData("music").src]});
			sound.play();
		}
	});
	/*var sound = new Howl({
		urls: ["media/audio/bgm_01.mp3"]
	});

	sound.play();*/


	System.prototype.startup.call(this, params);
}

Sound.prototype.shutdown = function(){

	System.prototype.shutdown.call(this);

}

Sound.prototype.update = function(delta, time){

}