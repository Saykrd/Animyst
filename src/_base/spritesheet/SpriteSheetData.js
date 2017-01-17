var Database = require('../core/Database');
var Item = require('../core/Item');

var SpriteSheetData = function(name, data){
	Animyst.Database.call(this);

	this.name = name;
	this.data = data;
	this.parse();
}

module.exports = SpriteSheetData;

SpriteSheetData.prototype = Object.create(Database.prototype);

SpriteSheetData.prototype.parse = function(){
	for(var k in this.data.frames){
		this.addFrame(k, this.data.frames[k]);	
	} 
};

SpriteSheetData.prototype.addFrame = function(frameID, data){
	var frame = new SpriteSheetData.FrameData(frameID, data);
	this.addItem(frame, frameID, data); 
};

SpriteSheetData.prototype.getFrame = function(frameID){
	return this.getItem(frameID);
};

SpriteSheetData.prototype.getFrames = function(framePrefix){
	if(!this.hasCategory(framePrefix)){
		let ctx = {}
		ctx.framePrefix = framePrefix;
		this.addCategory(framePrefix, function(frame){
			return frame.id.indexOf(this.framePrefix) == 0;
		}, SpriteSheetData.FrameData, ctx);
	} 

	let frames = this.getItemsInCategory(framePrefix);
	frames.sort(this._sortCaseInsensitive);
	return frames;
};

SpriteSheetData.prototype._sortCaseInsensitive = function(a,b){
	if (a.toLowerCase() < b.toLowerCase()) return -1;
	if (a.toLowerCase() > b.toLowerCase()) return 1;

	return 0;
};

SpriteSheetData.FrameData = function(id, params){
	Item.call(this, id, params);
}

SpriteSheetData.FrameData.prototype = Object.create(Item.prototype);
SpriteSheetData.FrameData.prototype.setup = function(params){
	this.frame = params.frame;
	this.rotated = params.rotated;
	this.trimmed = params.trimmed;
	this.spriteSourceSize = params.spriteSourceSize;
	this.sourceSize = params.sourceSize;
	this.pivot = params.pivot;
};