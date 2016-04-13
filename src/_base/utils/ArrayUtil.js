var ArrayUtil = module.exports = {};

/**
* Searches through any array for an element with a specific property
* @param  {any} property Property to check
* @param  {any} value    Value of the property
* @param  {any} array    Array of elements
* @return {any}          First element found with given property value. Returns null if nothing is found
*/
ArrayUtil.search = function (property, value, array){
	for (var i = 0; i < array.length; i++) {
		var obj = array[i];
		if (obj[property] && obj[property] === value) {
			return obj;
		}
	}

	return null;
}

/**
* Searches through any array for all elements with a specific property
* @param  {any} property Property to check
* @param  {any} value    Value of the property
* @param  {any} array    Array of elements
* @return {any}          First element found with given property value. Returns null if nothing is found
*/
ArrayUtil.searchAll = function (property, value, array, output = []) {
	for (var i = 0; i < array.length; i++) {
		var obj = array[i];
		if (obj[property] && obj[property] === value) {
			output.push(obj);
		}
	}

	return output;
}


/**
* Pushes an element to an array as long as it is not already included in the array
* @param {any}   element [description]
* @param {any[]} array   [description]
*/
ArrayUtil.include = function (element, array){
	if (array.indexOf(element) == -1) array.push(element);
}

/**
* Splices an element out of an array
* @param {any}   element [description]
* @param {any[]} array   [description]
*/
ArrayUtil.remove = function (element, array){
	var index = array.indexOf(element);
	if (index >= 0) array.splice(index, 1);
}

/**
* Traverses array and executes a call on each element
* @param {any[]}     array   [description]
* @param {any}       command [description]
* @param {number =       0}           startIndex [description]
* @param {number =       1}           inc        [description]
* @param {any}       ctx     [description]
*/
ArrayUtil.traverse = function (array, command, startIndex = 0, inc = 1, ctx = null){
	for (var i = startIndex; i < array.length; i+= inc){
		command.call(ctx, array[i]);
	}
}
