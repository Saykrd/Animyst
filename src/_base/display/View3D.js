var THREE = require('three');
var PIXI = require('pixi');
var DataLoad = require('../core/DataLoad');
var Database = require('../core/Database'),
	Log = require('../core/Logging'),
	HUDTexture = require('../display/HUDTexture');


var View3D = function(scene, width, height){
	Database.call(this);

	if(!THREE){
		Log.error("[View3D] This view requires Three.js to be installed.");
		return;
	}

	this.width   = width  || 800;
	this.height  = height || 600;
	this.VIEW_ANGLE = 45;
	this.ASPECT = this.width / this.height;
	this.NEAR = 0.1;
	this.FAR  = 10000;

	this.scene    = null;
	this.renderer = null;
	this.camera   = null;
	this.container = null;
	this.settings  = null;
	this.resize = false;
	this.ui = null;
	this.view = null;
	this.context2d = null;

};

module.exports = View3D;

View3D.prototype = Object.create(Database.prototype);
View3D.prototype.clear = function(){

	Database.prototype.clear.call(this);
};

View3D.prototype.destroy = function(){

	Database.prototype.destroy.call(this);
};

View3D.prototype.initDisplay = function(params){
	if(!params){
		Log.error("[View3D] No initialization params specified");
	 	return;	
	} 

	this.VIEW_ANGLE = params.viewAngle || this.VIEW_ANGLE;
	this.ASPECT = this.width / this.height;
	this.NEAR = params.near || this.NEAR;
	this.FAR = params.far || this.far;
	this.resize = params.resize;

	this.scene    = this.scene || new THREE.Scene();
	this.renderer = new THREE.WebGLRenderer();
	this.camera   = new THREE.PerspectiveCamera(this.VIEW_ANGLE, this.ASPECT, this.NEAR, this.FAR);

	this.scene.add(this.camera);

	this.camera.lookAt(this.scene.position);

	if(params.container){
		var container = document.getElementById(params.container);
		if(container)	{
			container.appendChild(this.renderer.domElement);
		} else {
			Log.error("[Viewport3D] Container ID", params.container, "doesn't exist");
		}
	}

	this.camera.position.x = params.cameraX || 500;
	this.camera.position.y = params.cameraY || 500;
	this.camera.position.z = params.cameraZ || 500;

	this.camera.lookAt(this.scene.position);

	this.renderer.setClearColor(params.rendererColor || 0x888888);
	this.renderer.setSize(this.width, this.height);
	this.renderer.shadowMapEnabled = false;

	var geom = new THREE.PlaneGeometry(this.width, this.height, 32 );
	var texture = new HUDTexture(this.width, this.height);
	var matr = new THREE.MeshBasicMaterial({map:texture, side:THREE.DoubleSide});
	matr.transparent = true;
	this.ui = new THREE.Mesh( geom, matr);

	let vFOV = this.camera.fov * (Math.PI / 180);
	let distance =  this.height / (2 * Math.tan(vFOV / 2));

	this.ui.position.set(0,0, -distance);
	this.scene.add(this.ui);

	this.camera.add(this.ui);


	/*this.stage    = new PIXI.Stage(0xFFFFFF);
	this.uiRenderer = new PIXI.WebGLRenderer(this.width, this.height, {transparent : true});

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

 	this.uiRenderer.render(this.stage);*/

	if(params.addAxis){
		var axis = new THREE.AxisHelper(20);
		this.scene.add(axis);
	}

	if(params.debugControls){
		var controls = THREE.OrbitControls(this.camera);

		if(Animyst.datGUI){
			var displayControls = Animyst.datGUI.addFolder("Viewport3D");
			var c_folder = displayControls.addFolder("camera");

			c_folder.add(this.camera.position, "x", -1000, 1000).listen();
			c_folder.add(this.camera.position, "y", -1000, 1000).listen();
			c_folder.add(this.camera.position, "z", -1000, 1000).listen();
		}
	}
	

	if(params.resize){
		Animyst.Window.resizeSignal.add(this.onResize, this);
	}

	this.view = document.createElement('canvas');
	this.view.width = this.width;
	this.view.height = this.height;
	this.context2d = this.view.getContext('2d');

};


View3D.prototype.append = function(containerID){

	if(!containerID){
		document.body.appendChild(this.renderer.domElement);
		//document.body.appendChild(this.view);
	} else {
		var container = document.getElementById(containerID);
		if(container)	{
			container.appendChild(this.renderer.domElement);
			//container.appendChild(this.view);
		} else {
			Log.error("[Viewport3D] Container ID", containerID, "doesn't exist");
		}	
	}
	
};


View3D.prototype.render = function(){
	this.renderer.render(this.scene, this.camera);

	//this.context2d.clearRect(0,0, this.view.width, this.view.height);
	//this.context2d.drawImage(this.renderer.domElement, 0, 0);
	//this.context2d.drawImage(this.uiRenderer.view, 0, 0);
};

View3D.prototype.update = function(){
};

View3D.prototype.onResize = function(){
	//this.renderer.setSize(Animyst.)
}
