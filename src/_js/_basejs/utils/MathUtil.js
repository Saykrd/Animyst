var MathUtil = module.exports = {};

MathUtil.loopSum = function(v, inc, max, min = 0) {
	var result = v + inc;
	while (result > max)
		result = min + (result - max);
	while (result <= min)
		result = max + (result - min);
	return result;
}

MathUtil.constrain = function(v, min, max) {
	return Math.max(min, Math.min(v, max));
}

MathUtil.findClosestDivisable = function(value, divisor) {
	if (value <= divisor) return divisor;

	if (value % divisor > divisor / 2) {
		return value + (divisor - (value % divisor));
	} else {
		return value - (value % divisor);
	}
}

MathUtil.findNextDivisable = function(value, divisor) {
	if (value <= divisor) return divisor;
	return value + (divisor - (value % divisor));
}

MathUtil.interpolate = function(a, b, percent){
	return a + (b - a) * percent
}