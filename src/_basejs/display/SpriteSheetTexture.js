var THREE = require('three');
var PIXI  = require('pixi');

var SpriteSheetTexture = function(sheetData){
	THREE.Texture.call(this);

	this.sheetData= null
	this.frames   = [];
	this.stage    = null;
	this.renderer = null;
	this.playTime = 0;
	this.time     = 0;
	this.loop     = true;
	this.currentFrame = 0;
	this.currentFrameID = "";
	this.sprite   = null;
	this.renderWidth = 0;
	this.renderHeight = 0;
	this.sourceFile = "";

	this.addSheet(sheetData); 

	
}

module.exports = SpriteSheetTexture;


if(THREE) SpriteSheetTexture.prototype = Object.create(THREE.Texture.prototype);
SpriteSheetTexture.prototype._initSprite = function(startFrame){

	this.stage    = new PIXI.Stage(0xFFFFFF);
	this.renderer = new PIXI.WebGLRenderer(256, 256, {transparent : true});
	this.sprite   = new PIXI.Sprite(PIXI.Texture.fromFrame(startFrame));

	this.image = this.renderer.view;

	this.stage.addChild(this.sprite);
	this.renderer.render(this.stage);

	this.needsUpdate = true;
} 

SpriteSheetTexture.prototype.addSheet = function(sheetData){
	this.sheetData = sheetData;
	this.frames = [];


	for(var k in sheetData.frames){
		var frame = sheetData.frames[k];

		if(frame.frame.w > this.renderWidth){
			this.renderWidth = frame.frame.w % 2 == 0 ? frame.frame.w : frame.frame.w + 1;

		} 

		if(frame.frame.h > this.renderHeight){
			this.renderHeight = frame.frame.h % 2 == 0 ? frame.frame.h : frame.frame.h + 1;
		} 

		this.frames.push(k);
	}

	if(!this.sprite){
		this._initSprite(this.frames[0]);
		this.currentFrameID = this.frames[0];
		this.currentFrame = 0;
	} 
}

SpriteSheetTexture.prototype.showFrame = function(frame){
	if(this.frames.length <= 0) return;
	if(!frame) frame = this.currentFrame || 0;

	var thisFrame

	if(typeof frame == "string"){
		thisFrame = frame;
	} else if(typeof frame == "number"){
		thisFrame = this.frames[frame];
	}

	this.sprite.setTexture(PIXI.Texture.fromFrame(thisFrame));
	this.renderer.render(this.stage);
	this.needsUpdate = true;
	
}

SpriteSheetTexture.prototype.play = function(time, loop){
	if(this.frames.length <= 0) return;
	this.playing  = true;
	this.loop     = loop;
	this.playTime = time;
	this.time     = 0;

}

SpriteSheetTexture.prototype.stop = function(){
	this.playing = false;
	this.timePassed = 0;
}

SpriteSheetTexture.prototype.animate = function(delta, time){
	if(this.playing){
		//console.log(delta, time, this.time, this.playTime, this.currentFrame, this.sourceFile)
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
}

