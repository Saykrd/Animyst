var ObjectUtil = module.exports = {};

/**
 * [Inverts the properties and keys of an object]
 * @param  {[type]} object [Object to invert]
 * @return {[type]}        [Inverted copy of object]
 */
ObjectUtil.invert = function (object){
	var obj = {};

	for(var k in object){
		obj[object[k]] = k;
	}

	return obj
}

ObjectUtil.copy = function(obj, target){
	target = target || {};
	for(var k in obj){
		if(obj[k] instanceof Object){
			if(Array.isArray(obj[k])){
				target[k] = obj[k].concat()
			} else {
				target[k] = ObjectUtil.copyProperties(obj[k]);
			}
		} else {
			target[k] = obj[k];
		}
	}

	return target;
}