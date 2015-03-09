// Under construction, will probably change drastically, as in probably wont be a system but a module instead
Animyst.Sound = function(){
	
}

Animyst.Sound.prototype = Object.create(Animyst.System.prototype);
Animyst.Sound.prototype.startup = function(params){

	Animyst.DataLoad.loadAsset("music", function(type, evt){
		//console.log("MUSIC LOADING...", type);
		if(type == Animyst.DataLoad.FILE_LOADED){
			//console.log("MUSIC LOADED");
			var sound = new Howl({"urls" : [Animyst.DataLoad.getData("music").src]});
			sound.play();
		}
	});
	/*var sound = new Howl({
		urls: ["media/audio/bgm_01.mp3"]
	});

	sound.play();*/


	Animyst.System.prototype.startup.call(this, params);
}

Animyst.Sound.prototype.shutdown = function(){

	Animyst.System.prototype.shutdown.call(this);

}

Animyst.Sound.prototype.update = function(delta, time){

}