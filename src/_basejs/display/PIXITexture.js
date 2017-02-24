var THREE = require('three');
var PIXI = require('pixi');
var Window = require('../core/Window');
var DataLoad = require('../core/DataLoad');

var PIXITexture = function(stage, renderer){
	THREE.Texture.call(this);
	this.stage = stage;
	this.renderer = renderer;
	this.width = renderer.view.width;
	this.height = renderer.view.height;
	this.shouldUpdate = false;
	this._init();
}

module.exports = PIXITexture;
if(THREE) PIXITexture.prototype = Object.create(THREE.Texture.prototype);
PIXITexture.prototype._init = function(){
	this.image = this.renderer.view;

	let graphics = new PIXI.Graphics();
	graphics.lineStyle(2, 0xFF00FF, 1);
	graphics.beginFill(0xFF00BB, 0.25);
	graphics.drawCircle(this.width/2, this.height/2, 100, 100);
	graphics.endFill();

	let texture = PIXI.Texture.fromCanvas(DataLoad.getAsset('samusftilt'));
	let sprite = new PIXI.Sprite(texture);
	this.stage.addChild(sprite);

	this.stage.addChild(graphics);

	this.invalidate();
	this.update();
}

PIXITexture.prototype.invalidate = function(){
	 this.shouldUpdate = true; 
};

PIXITexture.prototype.update = function(){
	 if(this.shouldUpdate){
	 	this.renderer.render(this.stage);
	 	this.needsUpdate = true;
	 	this.shouldUpdate = false;
	 } 
};