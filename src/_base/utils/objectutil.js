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