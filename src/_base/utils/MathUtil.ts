module Animyst {
    export class MathUtil {

		static loopSum(v:number, inc:number, max:number, min:number = 0):number {
			var result = (v + inc) % (max + 1) + min;
			if(result < min) result = (max + 1) - Math.abs(result - min);
			return result;
		}

		static constrain(v:number, min:number, max:number):number {
			return Math.max(min, Math.min(v, max));
		}

		static findClosestDivisable(value, divisor):number {
			if (value <= divisor) return divisor;

			if (value % divisor > divisor / 2) {
				return value + (divisor - (value % divisor));
			} else {
				return value - (value % divisor);
			}
		}

		static findNextDivisable(value, divisor):number {
			if (value <= divisor) return divisor;
			return value + (divisor - (value % divisor));
		}

		static interpolate(a, b, percent):number{
			return a + (b - a) * percent
		}

		static toRadians(degrees:number):number{
			return degrees * (Math.PI / 180);
		}

		static toDegrees(radians:number):number{
			return radians * (180 / Math.PI);
		}

    }
}	