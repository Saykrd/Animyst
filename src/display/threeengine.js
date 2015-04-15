Animyst.ThreeEngine = function (threeDisplay){
	this.threeDisplay  = threeDisplay;
	this.sceneSettings = null;
	this.spriteSheetTexture = null

}

Animyst.ThreeEngine.prototype = Object.create(Animyst.System.prototype);
Animyst.ThreeEngine.prototype.startup = function(params){
	var settings = params.canvasSettings;

	var W    = settings.minWidth || Animyst.Window.width;
	var H    = settings.minHeight || Animyst.Window.height;
	var VIEW_ANGLE = 45;
	var ASPECT = W / H;
	var NEAR = 0.1;
	var FAR  = 10000;


	var scene    = new THREE.Scene();
	var renderer = new THREE.WebGLRenderer();
	var camera   = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
	var container = document.getElementById(settings.container);

	
	scene.add(camera);
	
	camera.position.x = -30;
	camera.position.y = 40;
	camera.position.z = 30;

	camera.lookAt(scene.position);

	

	renderer.setClearColor(new THREE.Color(0xEEEEEE, 1.0));
	renderer.setSize(W, H);
	renderer.shadowMapEnabled = true;

	var axis = new THREE.AxisHelper(20);
	scene.add(axis);

	var planeGeometry = new THREE.PlaneBufferGeometry(60,20,1,1);
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

	

	/*var pixiStage    = new PIXI.Stage(0xFFFFFF)
	var pixiRenderer = new PIXI.WebGLRenderer(256, 256, {transparent:true});	
	var that = this;

	var pixiSprite = new PIXI.Sprite(PIXI.Texture.fromFrame("run0001.png"));
	pixiStage.addChild(pixiSprite);
	pixiRenderer.render(pixiStage);*/

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
	this.spriteSheetTexture.play(1000, true);

	/*var frames = [];
	var json = Animyst.DataLoad.getAsset("run_data");
	for(var k in json.frames){
		frames.push(k);
	}
	var count = 0;


	function animate(){
		var frame = frames[count];

		console.log("animate", frame)

		pixiSprite.setTexture(PIXI.Texture.fromFrame(frame));
		pixiRenderer.render(pixiStage);

		texture.needsUpdate = true;
		count++
		if(count >= frames.length) count = 0;
	}

	this.animate = animate.bind(this);*/




	var spotLight = new THREE.SpotLight(0xFFFFFF);
	spotLight.position.set(-40, 60, -10);
	spotLight.castShadow = true;

	scene.add(spotLight);


	//this.orbitControls = THREE.OrbitControls != null;
	//Animyst.datGUI.add(this, "orbitControls");

	var controls = THREE.OrbitControls(camera);



	if(container){
		container.appendChild(renderer.domElement)
		//container.appendChild(pixiRenderer.view)
	}

	this.threeDisplay.scene  = scene;
	this.threeDisplay.camera = camera;
	this.threeDisplay.renderer = renderer;

	this.sceneSettings = settings;


	Animyst.Window.resizeSignal.add(this.scaleCanvas.bind(this));
	Animyst.System.prototype.startup.call(this, params);
}

Animyst.ThreeEngine.prototype.shutdown = function(){

	Animyst.System.prototype.shutdown.call(this);
}

Animyst.ThreeEngine.prototype.update = function(delta, time){
	
	this.spriteSheetTexture.animate(delta, time);
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