import {Parser} from './parser';
import {mapValues, omit, partition} from './utils';

const isString = arg => typeof arg === 'string';
const isNumber = arg => !isNaN(arg);
const isNullOrUndefined = arg => arg == null;

export default class Simplifier {
	simplify(expressions, constants = {}) {

		expressions = mapValues(expressions, expr => this.simplifyExpression(expr, constants));
		expressions = omit(expressions, isNullOrUndefined);

		const [_constants, _expressions] = partition(expressions, isNumber);

		expressions = _expressions;
		Object.assign(constants, _constants);

		const finished = Object.keys(_constants).length === 0;

		return finished
			? {expressions, constants}
			: this.simplify(expressions, constants);
	}

	simplifyExpression(expression, constants = {}) {

		if (isString(expression)) {
			expression = Parser.parse(expression);
		} else if (isNumber(expression)) {
			expression = Parser.parse(expression.toString());
		}

		if (expression instanceof Parser.Expression) {
			const simplified = Object.keys(constants)
				.reduce((expr, k) =>
					expr.substitute(k, constants[k]), expression)
				.simplify();

			const simplifiedString = simplified.toString();
			return isNumber(simplifiedString)
				? +simplifiedString
				: simplified;
		}
	}

}
