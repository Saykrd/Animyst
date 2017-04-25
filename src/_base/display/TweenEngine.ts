module Animyst {
	export class TweenEngine extends Database {

		private tweenTypes: any = {
			"Power1.easeIn": Power1.easeIn,
			"Power1.easeInOut": Power1.easeInOut,
			"Power2.easeIn": Power2.easeIn,
			"Power2.easeInOut": Power2.easeInOut,
			"Power3.easeIn": Power3.easeIn,
			"Power3.easeInOut": Power3.easeInOut,
			"Power4.easeIn": Power4.easeIn,
			"Power4.easeInOut": Power4.easeInOut,
			"Bounce.easeOut": Bounce.easeOut,
			"Bounce.easeIn": Bounce.easeIn,
			"Bounce.easeInOut": Bounce.easeInOut,
			"Back.easeIn": Back.easeIn,
			"Back.easeOut": Back.easeOut,
			"Back.easeInOut": Back.easeInOut,
			"Elastic.easeIn": Elastic.easeIn,
			"Elastic.easeOut": Elastic.easeOut,
			"Elastic.easeInOut": Elastic.easeInOut,
			"Linear.easeIn": Linear.easeIn,
			"Linear.easeOut": Linear.easeOut,
			"Linear.easeInOut": Linear.easeInOut,
		};
		
		constructor() {
			super();
		}

		public addAnimation(name:string, anim:any):void{
			this.create(Item, name, anim);
		}

		public animateElements(anim:any, elements:any[], callback?: any): void {
			var onEnd: any = () => { if (callback) callback() };

			var animations:any[];
			if(typeof anim == "string"){
				var animData:Item = this.get(name);

				if(!animData){
					console.warn("No anim found for:", anim);
					return;
				}
				animations = animData.props.anims;
			} else {
				animations = anim.anims;
			}

			var timeline = new TimelineMax({ onComplete: () => onEnd() })
			var tweenElements:any[] = [];



			for (var i = 0; i < animations.length; i++) {
				var transition = animations[i];

				switch(transition.element){
					case "all":
						elements.forEach(function(element){tweenElements.push(element)});
						break;
					default :
						ArrayUtil.searchAll("name", transition.element, elements, tweenElements);
						break;
				}

				//
				if (tweenElements.length == 0) continue;

				while(tweenElements.length){
					var graphic:any = tweenElements.shift();

					if(!graphic) continue;
					for (var j = 0; j < transition.tweens.length; j++) {
						var tween = transition.tweens[j];

						var params = {};
						for (var k in tween.params) {
							if (k == "ease") {
								params[k] = this.tweenTypes[tween.params[k]];
							} else {
								params[k] = tween.params[k];
							}
						}

						timeline.add(TweenMax[tween.type](graphic, tween.time, params));

					}
				
				}
			}
		}


	}
}