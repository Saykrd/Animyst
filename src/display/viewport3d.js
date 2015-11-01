Animyst.Viewport3D = function(scene, width, height){
	Animyst.Database.call(this);

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

Animyst.Viewport3D.prototype = Object.create(Animyst.Database.prototype);
Animyst.Viewport3D.prototype.clear = function(){

	Animyst.Database.prototype.clear.call(this);
};

Animyst.Viewport3D.prototype.destroy = function(){

	Animyst.Database.prototype.destroy.call(this);
};

Animyst.Viewport3D.prototype.initDisplay = function(params){
	if(!params){
		Animyst.LOG.error("[Viewport3D] No initialization params specified");
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
			Animyst.LOG.error("[Viewport3D] Container ID", params.container, "doesn't exist");
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


Animyst.Viewport3D.prototype.append = function(containerID){

	if(!containerID){
		document.body.appendChild(this.renderer.domElement);
	} else {
		var container = document.getElementById(containerID);
		if(container)	{
			container.appendChild(this.renderer.domElement);
		} else {
			Animyst.LOG.error("[Viewport3D] Container ID", containerID, "doesn't exist");
		}	
	}
	
};


Animyst.Viewport3D.prototype.render = function(){
	this.renderer.render(this.scene, this.camera);
};

Animyst.Viewport3D.prototype.onResize = function(){
	//this.renderer.setSize(Animyst.)
}
