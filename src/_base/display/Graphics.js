Graphics = module.exports = {}

Graphics.initialize = function (){
	console.log("[Graphics] Initalizing...")
	//Graphics.PLAYER = new Shape.Circle(new Point(), 50)//new Shape.Rectangle(new Point(-25,-25), new Size(50,50));
	Graphics.PLAYER = new Shape.Rectangle(new Point(), new Size(50,50));
	Graphics.PLAYER.strokeColor = "#FF0011";
	Graphics.PLAYER.visible     =  false;

	//
	Graphics.ENEMY  = new Shape.Circle(new Point(), 50)//new Shape.Rectangle(new Rectangle(new Point(20, 20)), 5);
	Graphics.ENEMY.strokeColor = "00FF11";
	Graphics.ENEMY.visible     = false;
}

Graphics.getGraphic = function(key, visible){
	visible = visible == null ? true : visible;
	var g = Graphics.hasOwnProperty(key) ? Graphics[key] : null;
	if(g){
		g.visible = visible;
		return g;
	}

	return null
}