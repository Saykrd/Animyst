var THREE = require('three');
var PIXI = require('pixi');
var Window = require('../core/Window');
var DataLoad = require('../core/DataLoad');

var HUDTexture = function(width, height){
	THREE.Texture.call(this);
	this.stage = null;
	this.renderer = null;
	this.width = width || 256;
	this.height = height || 256;
	this.shouldUpdate = false;
	this._init();
}

module.exports = HUDTexture;
if(THREE) HUDTexture.prototype = Object.create(THREE.Texture.prototype);
HUDTexture.prototype._init = function(){

	this.stage    = new PIXI.Stage(0xFFFFFF);
	this.renderer = new PIXI.WebGLRenderer(this.width, this.height, {transparent : true});

	this.image = this.renderer.view;

	//document.body.appendChild(this.image);

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

HUDTexture.prototype.invalidate = function(){
	 this.shouldUpdate = true; 
};

HUDTexture.prototype.update = function(){
	 if(this.shouldUpdate){
	 	this.renderer.render(this.stage);
	 	this.needsUpdate = true;
	 	this.shouldUpdate = false;
	 } 
};