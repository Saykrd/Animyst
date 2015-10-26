Animyst.ThreeEngine = function (threeDisplay){
	Animyst.System.call(this);

	this.threeDisplay  = threeDisplay;
	this.sceneSettings = null;
	this.spriteSheetTexture = null
}

Animyst.ThreeEngine.prototype = Object.create(Animyst.System.prototype);
Animyst.ThreeEngine.prototype.startup = function(params){
	var settings = params.canvasSettings;

	this.threeDisplay.initDisplay({
		width: settings.minWidth || Animyst.Window.width,
		height: settings.minHeight || Animyst.Window.height,
		viewAngle: 45,
		near: params.near || 0.1,
		far: params.far || 10000,
		container: settings.container,

		cameraX: params.cameraX || 0,
		cameraY: params.cameraY || 0,
		cameraZ: params.cameraZ || 50,

		rendererColor: 0xEEEEEE,
		addAxis: true,
		debugControls: true

	})



	

	/*var planeGeometry = new THREE.PlaneBufferGeometry(60,20,1,1);
	var planeMaterial = new THREE.MeshLambertMaterial({color:0xffffff});
	var plane = new THREE.Mesh(planeGeometry, planeMaterial);

	plane.rotation.x = -0.5 * Math.PI;
	plane.position.x = 15;
	plane.position.y = 0;
	plane.position.z = 0;
	plane.receiveShadow = true;

	scene.add(plane);

	var cubeGeometry = new THREE.BoxGeometry(4,4,4);
	var cubeMaterial = new THREE.MeshLambertMaterial({color:0xFF0000});
	var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
	
	cube.position.x = -4;
	cube.position.y = 3;
	cube.position.z = 0;
	cube.castShadow = true;
	cube.receiveShadow = true;

	scene.add(cube);

	

	var spriteGeometry = new THREE.PlaneGeometry(4,4,1,1);
	var texture  = new Animyst.SpriteSheetTexture(Animyst.DataLoad.getAsset("run_data"));

	texture.needsUpdate = true;

	var material = new THREE.MeshLambertMaterial({map:texture});

	material.transparent = true;
	var sprite = new THREE.Mesh(spriteGeometry, material);

	sprite.position.x = -10;
	sprite.position.y = 3;
	sprite.position.z = 0;

	sprite.rotation.y = -0.5 * Math.PI;
	sprite.castShadow = true;

	scene.add(sprite);

	this.spriteSheetTexture = texture;
	this.spriteSheetTexture.play(500, true);


	var spotLight = new THREE.SpotLight(0xFFFFFF);
	spotLight.position.set(-40, 60, -10);
	spotLight.castShadow = true;

	scene.add(spotLight);*/


	this.sceneSettings = settings;


	Animyst.Window.resizeSignal.add(this.scaleCanvas.bind(this));
	Animyst.System.prototype.startup.call(this, params);
}

Animyst.ThreeEngine.prototype.shutdown = function(){

	Animyst.System.prototype.shutdown.call(this);
}

Animyst.ThreeEngine.prototype.update = function(delta, time){

	//this.spriteSheetTexture.animate(delta, time);
	this.threeDisplay.render();
	Animyst.System.prototype.update.call(this, delta, time);
}

Animyst.ThreeEngine.prototype.scaleCanvas = function(){
	Animyst.LOG.output("[ThreeEngine] Rescale Canvas!");
	var w, h, parentWidth, parentHeight

	parentWidth  = document.body.clientWidth;
	parentHeight = document.body.clientHeight;

	if(this.sceneSettings.scaleMode == "noBorder"){
		w = parentWidth  > (this.sceneSettings.minWidth  || 0)?   parentWidth  : this.sceneSettings.minWidth;
		h = parentHeight > (this.sceneSettings.minHeight || 0) ?  parentHeight : this.sceneSettings.minHeight;
	} else {
		w = this.sceneSettings.minWidth  || 0;
		h = this.sceneSettings.minHeight || 0;
	}

	this.threeDisplay.renderer.setSize(w,h);
}