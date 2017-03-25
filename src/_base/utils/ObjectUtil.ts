module Animyst {
    export class ObjectUtil {

    	/**
    	 * Inverts the properties and keys of an object
    	 * @param  {any} object Object to invert
    	 * @return {any}        Inverted copy of object
    	 */
		static invert (object:any):any{
			var obj = {};

			for(var k in object){
				obj[object[k]] = k;
			}

			return obj
		}

		/**
		 * Returns copy of an object
		 * @param  {any} obj    Object to copy
		 * @param  {any} target Target object to copy to
		 * @return {any}        [description]
		 */
		static copy(obj:any, target?:any):any{
			target = target || {};
			for(var k in obj){
				if(obj[k] instanceof Object){
					if(Array.isArray(obj[k])){
						target[k] = obj[k].concat()
					} else {
						target[k] = ObjectUtil.copy(obj[k]);
					}
				} else {
					target[k] = obj[k];
				}
			}

			return target;
		}
    
    }
}	