var SpriteSheetData = require('./SpriteSheetData');
var signals = require('signals');

var SpriteSheetAnimation = function(id, framerate = 60){
	this.id = id;
	this.idle = null;
	this.currentAnim = null;
	this.animations = {};
	this.spritesheets = {};
	this.framerate = framerate;
	this.playing = false;
}

module.exports = SpriteSheetAnimation;


SpriteSheetAnimation.prototype.addSheet = function(sheetData){
	this.spritesheets[sheetData.name]
}

SpriteSheetAnimation.prototype.getSheet = function(sheetID){
	 return this.spritesheets[sheetID]; 
};

SpriteSheetAnimation.prototype.addAnimation = function(name, prefix, sheetID, params = {}){
	var anim = {};
	var spritesheet = this.getSheet(sheetID);

	anim.name = name;
	anim.prefix = prefix;
	anim.sheetID = sheetID;
	anim.useFrames = params.useFrames || false;
	anim.frames = spritesheet.getFrames(anim.prefix);
	anim.currentFrameIndex = 0;
	anim.totalFrames = anim.frames.length;
	anim.duration = params.duration || anim.useFrames ? anim.totalFrames * (this.framerate / 60) : 1000 / this.framerate * anim.totalFrames;
	anim.loop = params.loop || false;
	anim.repeat = params.repeat || 0;
	anim.elapsed = 0;
	anim.framecount = 0;


	this.animations[anim.name] = anim;
}

SpriteSheetAnimation.prototype.getAnimation = function(name){
	 return this.animations[name]; 
};

SpriteSheetAnimation.prototype.play = function(name){
	if(this.currentAnim == name) return;

	var anim = this.getAnimation
	this.currentAnim = name;
	this.playing = true;
};

SpriteSheetAnimation.prototype.stop = function(){
	
}

SpriteSheetAnimation.prototype.pause = function(){
	
}

SpriteSheetAnimation.prototype.resume = function(){
	
}

SpriteSheetAnimation.prototype.setIdle = function(name){
	 // body...  
};

SpriteSheetAnimation.prototype.animate = function(delta){
	if(this.playing){
		//console.log(delta, time, this.time, this.playTime, this.currentFrame, this.sourceFile)
		var anim = this.getAnimation(this.currentAnim)

		if(anim.useFrames){

		} else {
		
		}

		if(this.time >= this.playTime){

			if(this.loop){
				this.time = 0;
			} else {
				this.playing = false;
			}
		} else {

			this.time += delta;
			this.currentFrame = Math.round((this.time / this.playTime) * (this.frames.length - 1))
			if(this.currentFrame >= this.frames.length) this.currentFrame = this.frames.length - 1;

			this.showFrame();
		}
	}
};

