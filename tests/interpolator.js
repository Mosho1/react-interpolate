import {describe, assertEqual, it} from '../lib/unit-tester';
import Simplifier from '../lib/simplifier';
import {Parser} from '../lib/parser';
import {mapValues} from '../lib/utils';

const stringifyObjectValues = obj => mapValues(obj, v => v.toString());

describe('Expression simplifier', () => {
	const simplifier = new Simplifier();
	it('should simplify an expression', () => {
		assertEqual(simplifier.simplifyExpression('a + b').toString(), '(a+b)');
		assertEqual(simplifier.simplifyExpression('a + b', {a: 1}).toString(), '(1+b)');
		assertEqual(simplifier.simplifyExpression('a + b', {a: 1, b: 1}).toString(), '2');
		assertEqual(simplifier.simplifyExpression('2 * a - b', {a: 10, b: 5}).toString(), '15');
		assertEqual(simplifier.simplifyExpression('1000', {a: 10, b: 5}).toString(), '1000');
		assertEqual(simplifier.simplifyExpression(1000, {a: 10, b: 5}).toString(), '1000');
	});

	let result;
	it('should simplify an object with one expression', () => {

		result = simplifier.simplify({v: 'a + b'});
		assertEqual(result.expressions.v.toString(), '(a+b)');
		assertEqual(result.constants, {});

		result = simplifier.simplify({v: 'a + b'}, {a: 1});
		assertEqual(stringifyObjectValues(result.expressions), {v: '(1+b)'});
		assertEqual(result.constants, {a: 1});

		result = simplifier.simplify({v: 'a + b'}, {a: 1, b: 2});
		assertEqual(result.expressions, {});
		assertEqual(result.constants, {a: 1, b: 2, v: 3});

	});

	it('should simplify an object with two independent expressions', () => {
		result = simplifier.simplify({v: 'a + b', d: 1000}, {a: 1, b: 2});
		assertEqual(result.expressions, {});
		assertEqual(result.constants, {a: 1, b: 2, v: 3, d: 1000});

		result = simplifier.simplify({v: 'a + b', d: 't + 1'}, {a: 1, b: 2});
		assertEqual(stringifyObjectValues(result.expressions), {d: '(t+1)'});
		assertEqual(result.constants, {a: 1, b: 2, v: 3});
	});

	it('should simplify an object with two dependent expressions', () => {
		result = simplifier.simplify({v: 'a + b', d: 'v'}, {a: 1, b: 2});
		assertEqual(result.expressions, {});
		assertEqual(result.constants, {a: 1, b: 2, v: 3, d: 3});

		result = simplifier.simplify({v: 'a + b', d: 'v + t'}, {a: 1, b: 2});
		assertEqual(stringifyObjectValues(result.expressions), {d: '(3+t)'});
		assertEqual(result.constants, {a: 1, b: 2, v: 3});
	});

	it('should simplify an object with many dependent expressions', () => {

		result = simplifier.simplify({
			t: 'v + a + x',
			v: 'a + b',
			d: '1 + t',
			w: 'v + 2',
			z: 'w + v'
		}, {
			a: 1,
			b: 2
		});

		assertEqual(stringifyObjectValues(result.expressions), {t: '(4+x)', d: '(1+t)'});
		assertEqual(result.constants, {a: 1, b: 2, v: 3, w: 5, z: 8});
	});

});
