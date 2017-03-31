module App {
	export class Game extends Animyst.AppState {
		

		public viewport:Animyst.View3D;

		constructor() {
			super("game");
			// code...
		}


		public setup():void{
			console.log("Setting up game");

			this.viewport = new Animyst.View3D();
			this.viewport.init({resize : true, debugControls : true});
			this.viewport.append();

			this.viewport.create(Animyst.Scene3D, 'base', {
				addAxis : true,
				debugControls: true,
				cameras : [
					{name:"camera0", type:"perspective", x: 500, y:500, z:500, fov:50, aspect: this.viewport.aspect, near: 0.1, far: 2000, main:true}
				]
			});

			var scene3D:Animyst.Scene3D = <Animyst.Scene3D> this.viewport.get('base');

/*			var geom:THREE.PlaneGeometry = new THREE.PlaneGeometry(5,5,32);
			var matr:THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00});

			var meshA:THREE.Mesh = new THREE.Mesh(geom, matr);
			var meshB:THREE.Mesh = new THREE.Mesh(geom, matr);

			meshA.position.set( 10, 10,0);
			meshB.position.set(-10,-10,0);

			var group:THREE.Group = new THREE.Group();
			group.add(meshA);
			group.add(meshB);

			let vFOV = (<THREE.PerspectiveCamera> this.viewport.camera).fov * (Math.PI / 180);
			let distance =  this.viewport.height / (2 * Math.tan(vFOV / 2)) ;

			group.position.set(0, 0, -distance);


			this.viewport.scene.add(group);
			this.viewport.camera.add(group);*/	
		}

		public frameUpdate(delta:number, framecount:number):void{
			super.frameUpdate(delta, framecount);
			if(this.viewport) this.viewport.render();
		}
	}
}