module Animyst {
    export class View3D extends Database implements IViewport {
    	
    	static CONTROLS:boolean = false;

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
			super.clear();
		}

		public destroy():void{
			super.destroy();
		}




		public init(params:any):void{
			if(!params){
				Log.error("[View3D] No initialization params specified");
			 	return;	
			} 

			Log.output("[View3D] Initializing Viewport..");

			this.width = params.width || Window.width;
			this.height = params.height || Window.height;

			this._resize = params.resize;
			this._renderer = new THREE.WebGLRenderer();

			this._renderer.setPixelRatio(window.devicePixelRatio);
			this._renderer.setClearColor(params.rendererColor || 0x888888);
			this._renderer.setSize(this.width, this.height);
			this._renderer.autoClear = false;

			

			if(params.debugControls){
				View3D.CONTROLS = params.debugControls;

				if(GUI){
					var displayControls = GUI.addFolder("View3D");
				}
			}
			

			if(params.resize){
				Animyst.Window.resizeSignal.add(this.onResize, this);
			}

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
			this._renderer.clear();
			this.traverse(this.renderScene3D, this);
		}

		public renderScene3D(scene3D:Scene3D):void{
			var camera:THREE.Camera = scene3D.getActiveCamera();
			this._renderer.clearDepth();
			this._renderer.render(scene3D.scene, camera);
		}

		public update():void{
		}

		public onResize():void{
			//this.renderer.setSize(Animyst.)
		}


    }

    export class CameraType {
    	static PERSPECTIVE:string = "perspective";
    	static ORTHOGRAPHIC:string = "orthographic"
    }

    export class Scene3D extends Item {

    	public scene:THREE.Scene;
    	public activeCamera:string;

    	constructor(id:string, params:any) {
    		super(id, params);
    	}

    	public setup(params:any):void{
    		super.setup(params);

    		this.scene = new THREE.Scene();

    		if(params.addAxis){
				var axis = new THREE.AxisHelper(20);
				this.scene.add(axis);
			}

    		if(params.cameras){
    			for (var i = 0; i < params.cameras.length; ++i) {
					var camera:THREE.Camera;
					var data:any = params.cameras[i];

					switch (data.type)						
					{
					    case CameraType.PERSPECTIVE: 
					        let pers:THREE.PerspectiveCamera = new THREE.PerspectiveCamera(data.fov, data.aspect, data.near, data.far);
					        //PerspectiveCamera specific code here...
					        //...

					        camera = pers;
					        break;
					    case CameraType.ORTHOGRAPHIC:
					    	let orth:THREE.OrthographicCamera = new THREE.OrthographicCamera(data.left, data.right, data.top, data.bottom, data.near, data.far);
					    	//OrthographicCamera specific code here...
					        //...

					    	camera = orth;
					    	break;
					}

					camera.name = data.name;

					if(data.main){
						this.activeCamera = camera.name;
						
						if(params.debugControls && View3D.CONTROLS && GUI) {
							var controls = new THREE.OrbitControls(camera);
							var displayControls = GUI.__folders['View3D'];
							var c_folder = displayControls.addFolder("camera");

							c_folder.add(camera.position, "x", -1000, 1000).listen();
							c_folder.add(camera.position, "y", -1000, 1000).listen();
							c_folder.add(camera.position, "z", -1000, 1000).listen();
						}	
					} 

					camera.position.x = data.x !== null ?  data.x : 500;
					camera.position.y = data.y !== null ?  data.y : 500;
					camera.position.z = data.z !== null ?  data.z : 500;

					this.scene.add(camera);

					if(data.lookAtScene === undefined || data.lookAtScene) {
						camera.lookAt(this.scene.position);
					}
    			}
    		}
    	}

    	public getActiveCamera():THREE.Camera{
    		return <THREE.Camera> this.scene.getObjectByName(this.activeCamera);
    	}
    }


}