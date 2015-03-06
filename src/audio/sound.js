Animyst.Sound = function(){
	
}

Animyst.Sound.prototype = Object.create(Animyst.System.prototype);
Animyst.Sound.prototype.startup = function(params){

	var sound = new Howl({
		urls: ["media/audio/bgm_01.mp3"]
	});

	sound.play();


	Animyst.System.prototype.startup.call(this, params);
}

Animyst.Sound.prototype.shutdown = function(){

	Animyst.System.prototype.shutdown.call(this);

}

Animyst.Sound.prototype.update = function(delta, time){

}