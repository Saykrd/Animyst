var THREE = require('three');
var Database = require('../core/Database'),
	Log = require('../core/Logging');

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
	this.renderer.shadowMapEnabled = true;

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

};


View3D.prototype.append = function(containerID){

	if(!containerID){
		document.body.appendChild(this.renderer.domElement);
	} else {
		var container = document.getElementById(containerID);
		if(container)	{
			container.appendChild(this.renderer.domElement);
		} else {
			Log.error("[Viewport3D] Container ID", containerID, "doesn't exist");
		}	
	}
	
};


View3D.prototype.render = function(){
	this.renderer.render(this.scene, this.camera);
};

View3D.prototype.onResize = function(){
	//this.renderer.setSize(Animyst.)
}
