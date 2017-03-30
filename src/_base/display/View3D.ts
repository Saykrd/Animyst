module Animyst {
    export class View3D extends Database {
    	
    	public viewAngle:number;
    	public near:number;
    	public far:number;
    	
    	private _scene:THREE.Scene;
    	private _renderer:THREE.WebGLRenderer;
    	private _camera:THREE.Camera;
    	private _container:any;
    	private _settings:any;
    	private _resize:boolean;
    	private _ui:any;
    	private _view:any;
    	private _context2d:CanvasRenderingContext2D;

    	public get aspect():number{ return this.width / this.height};


    	public width:number;
    	public height:number;



    	constructor() {
    		super();
    	}

		public clear():void{

			Database.prototype.clear.call(this);
		}

		public destroy():void{

			Database.prototype.destroy.call(this);
		}

		public initDisplay(params:any):void{
			if(!params){
				Log.error("[View3D] No initialization params specified");
			 	return;	
			} 

			Log.output("[View3D] Initializing Viewport..");

			this.viewAngle = params.viewAngle || this.viewAngle;
			this.near = params.near || this.near;
			this.far = params.far || this.far;

			this.width = params.width || Window.width;
			this.height = params.height || Window.height;

			this._resize = params.resize;

			this._scene    = this._scene || new THREE.Scene();
			this._renderer = new THREE.WebGLRenderer();
			this._camera   = new THREE.PerspectiveCamera(this.viewAngle, this.aspect, this.near, this.far);

			this._scene.add(this._camera);

			this._camera.lookAt(this._scene.position);

			var container:any;
			if(params.container){
				container = document.getElementById(params.container);
				if(!container)	{
					Log.error("[View3D] Container ID", params.container, "doesn't exist");
					
				} else {
					container.appendChild(this._renderer.domElement);
				}
			} else {
				document.body.appendChild(this._renderer.domElement);
			}

			this._camera.position.x = params.cameraX || 500;
			this._camera.position.y = params.cameraY || 500;
			this._camera.position.z = params.cameraZ || 500;

			this._camera.lookAt(this._scene.position);

			this._renderer.setClearColor(params.rendererColor || 0x888888);
			this._renderer.setSize(this.width, this.height);
			//this._renderer.shadowMapEnabled = false;

			/*var geom = new THREE.PlaneGeometry(this.width, this.height, 32 );
			var texture = new PIXITexture(new PIXI.Stage(0xFFFFFF), new PIXI.WebGLRenderer(this.width, this.height, {transparent : true}));
			var matr = new THREE.MeshBasicMaterial({map:texture, side:THREE.DoubleSide});
			matr.transparent = true;
			this.ui = new THREE.Mesh( geom, matr);

			let vFOV = this.camera.fov * (Math.PI / 180);
			let distance =  this.height / (2 * Math.tan(vFOV / 2));

			this.ui.position.set(0,0, -distance);
			this.scene.add(this.ui);

			this.camera.add(this.ui);*/


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
				this._scene.add(axis);
			}

			if(params.debugControls){
				var controls = new THREE.OrbitControls(this._camera);

				if(GUI){
					var displayControls = GUI.addFolder("View3D");
					var c_folder = displayControls.addFolder("camera");

					c_folder.add(this._camera.position, "x", -1000, 1000).listen();
					c_folder.add(this._camera.position, "y", -1000, 1000).listen();
					c_folder.add(this._camera.position, "z", -1000, 1000).listen();
				}
			}
			

			if(params.resize){
				Animyst.Window.resizeSignal.add(this.onResize, this);
			}

			this._view = document.createElement('canvas');
			this._view.width = this.width;
			this._view.height = this.height;
			this._context2d = this._view.getContext('2d');

		}


		public append(containerID?:string):void{

			if(!containerID){
				document.body.appendChild(this._renderer.domElement);
				//document.body.appendChild(this.view);
			} else {
				var container = document.getElementById(containerID);
				if(container)	{
					container.appendChild(this._renderer.domElement);
					//container.appendChild(this.view);
				} else {
					Log.error("[Viewport3D] Container ID", containerID, "doesn't exist");
				}	
			}
			
		}


		public render():void{
			this._renderer.render(this._scene, this._camera);

			//this.context2d.clearRect(0,0, this.view.width, this.view.height);
			//this.context2d.drawImage(this.renderer.domElement, 0, 0)
			//this.context2d.drawImage(this.uiRenderer.view, 0, 0);
		}

		public update():void{
		}

		public onResize():void{
			//this.renderer.setSize(Animyst.)
		}


    }
}