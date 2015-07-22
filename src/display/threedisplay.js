Animyst.ThreeDisplay = function(){
	Animyst.Database.call(this);

	this.W    = 800;
	this.H    = 600;
	this.VIEW_ANGLE = 45;
	this.ASPECT = this.W / this.H;
	this.NEAR = 0.1;
	this.FAR  = 10000;

	this.scene    = null;
	this.renderer = null;
	this.camera   = null;
	this.container = null;
	this.settings  = null;

}

Animyst.ThreeDisplay.prototype = Object.create(Animyst.Database.prototype);
Animyst.ThreeDisplay.prototype.clear = function(){

	Animyst.Database.prototype.clear.call(this);
}

Animyst.ThreeDisplay.prototype.destroy = function(){

	Animyst.Database.prototype.destroy.call(this);
}

Animyst.ThreeDisplay.prototype.initDisplay = function(params){
	if(!params){
		Animyst.LOG.error("[ThreeDisplay] No initialization params specified");
	 	return;	
	} 

	this.W = params.width || this.W;
	this.H = params.height || this.H;
	this.VIEW_ANGLE = params.viewAngle || this.VIEW_ANGLE;
	this.ASPECT = this.W / this.H;
	this.NEAR = params.near || this.NEAR;
	this.FAR = params.far || this.far;

	this.scene    = new THREE.Scene();
	this.renderer = new THREE.WebGLRenderer();
	this.camera   = new THREE.PerspectiveCamera(this.VIEW_ANGLE, this.ASPECT, this.NEAR, this.FAR);

	this.scene.add(this.camera);

	this.camera.lookAt(this.scene.position);

	if(params.container){
		var container = document.getElementById(params.container);
		if(container)	{
			container.appendChild(this.renderer.domElement)
		} else {
			Animyst.LOG.error("[ThreeDisplay] Container ID", params.container, "doesn't exist");
		}
	}

	this.camera.position.x = params.cameraX || 0;
	this.camera.position.y = params.cameraY || 0;
	this.camera.position.z = params.cameraZ || 0;

	this.camera.lookAt(this.scene.position);

	this.renderer.setClearColor(params.rendererColor || 0x000000);
	this.renderer.setSize(this.W, this.H);
	this.renderer.shadowMapEnabled = true;

	if(params.addAxis){
		var axis = new THREE.AxisHelper(20);
		this.scene.add(axis);
	}

	if(params.debugControls){
		var controls = THREE.OrbitControls(this.camera);

		if(Animyst.datGUI){
			var displayControls = Animyst.datGUI.addFolder("ThreeDisplay");
			var c_folder = displayControls.addFolder("camera");

			c_folder.add(this.camera.position, "x", -1000, 1000).listen();
			c_folder.add(this.camera.position, "y", -1000, 1000).listen();
			c_folder.add(this.camera.position, "z", -1000, 1000).listen();
		}
	}
	



}

Animyst.ThreeDisplay.prototype.render = function(){
	this.renderer.render(this.scene, this.camera);
}

