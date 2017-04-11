module App {
	export class View3DTests extends Animyst.AppState {
		

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

			this.viewport.create(Animyst.Scene3D, 'ui', {
				addAxis : true,
				debugControls: false,
				cameras : [
					{	
						name:"camera0", type:"orthographic", 
						x:this.viewport.width/2, y:-this.viewport.height/2, z:10, 
						left : - this.viewport.width / 2, right: this.viewport.width / 2, 
						top: this.viewport.height / 2, bottom: -this.viewport.height / 2,
					 	near: 1, far: 2000, main:true, lookAtScene:false
					 }
				]
			});

			var base:Animyst.Scene3D = <Animyst.Scene3D> this.viewport.get('base');
			var ui:Animyst.Scene3D   = <Animyst.Scene3D> this.viewport.get('ui');

			var texture0:THREE.CanvasTexture = new THREE.CanvasTexture(Animyst.DataLoad.getAsset("redball1"));
			var texture1:THREE.CanvasTexture = new THREE.CanvasTexture(Animyst.DataLoad.getAsset("greenball2"));

			var smatr0:THREE.SpriteMaterial = new THREE.SpriteMaterial({map: texture0, color: 0xffffff});
			var smatr1:THREE.SpriteMaterial = new THREE.SpriteMaterial({map: texture1, color: 0xffffff});

			var spriteBase:THREE.Sprite = new THREE.Sprite(smatr1);
			var spriteUI:THREE.Sprite = new THREE.Sprite(smatr0);



			var twidth = spriteUI.material.map.image.width;
			var theight = spriteUI.material.map.image.height;

			console.log(twidth, theight, this.viewport.width, this.viewport.height);

			
			spriteUI.scale.set(twidth, theight, 1);
			spriteUI.position.set(178, -18, 0);

			spriteBase.position.set(100, 100, 100);
			spriteBase.scale.set(twidth / 2, theight / 2, 1);


			base.scene.add(spriteBase);
			ui.scene.add(spriteUI);
		}

		public frameUpdate(delta:number, framecount:number):void{
			super.frameUpdate(delta, framecount);
			if(this.viewport) this.viewport.render();
		}
	}
}