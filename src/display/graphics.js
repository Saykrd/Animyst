Animyst.Graphics = {}

Animyst.Graphics.initialize = function (){
	console.log("[Graphics] Initalizing...")
	//Animyst.Graphics.PLAYER = new Shape.Circle(new Point(), 50)//new Shape.Rectangle(new Point(-25,-25), new Size(50,50));
	Animyst.Graphics.PLAYER = new Shape.Rectangle(new Point(), new Size(50,50));
	Animyst.Graphics.PLAYER.strokeColor = "#FF0011";
	Animyst.Graphics.PLAYER.visible     =  false;

	//
	Animyst.Graphics.ENEMY  = new Shape.Circle(new Point(), 50)//new Shape.Rectangle(new Rectangle(new Point(20, 20)), 5);
	Animyst.Graphics.ENEMY.strokeColor = "00FF11";
	Animyst.Graphics.ENEMY.visible     = false;
}

Animyst.Graphics.getGraphic = function(key, visible){
	visible = visible == null ? true : visible;
	var g = Animyst.Graphics.hasOwnProperty(key) ? Animyst.Graphics[key] : null;
	if(g){
		g.visible = visible;
		return g;
	}

	return null
}