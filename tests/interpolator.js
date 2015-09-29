import {dummy, spy, describe, assertEqual, assert, it, itAsync} from '../lib/unit-tester';
import Interpolator from '../lib/interpolator';
import Promise from 'bluebird';

doTests();

async function doTests() {
	await describe('Expression interpolator - unit tests', async () => {
		await it('should set and emit state, and return this', () => {
			let interpolator = new Interpolator(), state;
			interpolator.on('stateChange', s => state = s);
			assertEqual(interpolator.setState(), interpolator);
			assertEqual(interpolator.state, undefined);
			assertEqual(state, undefined);

			assertEqual(interpolator.setState(1), interpolator);
			assertEqual(interpolator.state, 1);
			assertEqual(state, 1);

			assertEqual(interpolator.setState({a: 1}), interpolator);
			assertEqual(interpolator.state, {a: 1});
			assertEqual(state, {a: 1});
		});

		await it('should set default options', () => {
			let interpolator = new Interpolator();
			const defaultOptions = {
				resultVariable: 'v',
				durationVariable: 'd',
				timeVariable: 't',
				endVariable: 'e',
				startTime: 0
			};

			assertEqual(interpolator.setProps(), interpolator);
			assertEqual(interpolator.props, defaultOptions);

			assertEqual(interpolator.setProps({a: 1}), interpolator);
			assertEqual(interpolator.props, Object.assign({a: 1}, defaultOptions));

			assertEqual(interpolator.setProps({startTime: 1}), interpolator);
			assertEqual(interpolator.props, Object.assign({}, defaultOptions, {startTime: 1}));

		});

		await it('should interpolate values', async () => {
			let interpolator = new Interpolator();
			let results, duration;
			interpolator.handleResults = r => results = r;
			interpolator.interpolate({v: 't / 2'});
			assert(interpolator.isRunning);
			duration = 300;
			await Promise.delay(duration).then(interpolator.cancel);
			assert(!interpolator.isRunning);
			assert(Math.abs(results.v - results.t / 2) < 1);

			interpolator.interpolate({v: 't * 2'});
			assert(interpolator.isRunning);
			await Promise.delay(duration).then(interpolator.cancel);
			assert(!interpolator.isRunning);
			assert(Math.abs(results.v - results.t * 2) < 1);

			interpolator.interpolate({v: 't * f', f: '2'});
			await Promise.delay(duration).then(interpolator.cancel);
			assert(Math.abs(results.v - results.t * 2) < 1);

			interpolator.interpolate({v: 't * f', f: 2});
			await Promise.delay(duration).then(interpolator.cancel);
			assert(Math.abs(results.v - results.t * 2) < 1);

			interpolator.interpolate({v: 't * f', f: 'a + 1', a: 1});
			await Promise.delay(duration).then(interpolator.cancel);
			assert(Math.abs(results.v - results.t * 2) < 1);
		});

		await it('should handle results', () => {
			let interpolator = new Interpolator();
			interpolator.cancel = dummy();
			interpolator.handleResults({});
			assertEqual(interpolator.state, {});
			assertEqual(interpolator.cancel.calls, 0);
			assertEqual(interpolator.cancel.args, undefined);

			interpolator.handleResults({t: 2}, {duration: 1, timeVariable: 't'});
			assertEqual(interpolator.state, {t: 2});
			assertEqual(interpolator.cancel.calls, 1);
			assertEqual(interpolator.cancel.args, []);
		});
	});


	await describe('Expression interpolator - e2e tests', async () => {

		let state;
		let duration = 100;
		let interpolator = new Interpolator({
			expressions: {
				v: '2 * t + 100'
			},
			duration: 100
		});
		interpolator.on('stateChange', s => state = s);
		interpolator.cancel = spy(interpolator.cancel);
		interpolator.handleResults = spy(interpolator.handleResults.bind(interpolator));

		await it('should interpolate expressions, use preset duration', async () => {
			interpolator.interpolate();
			assert(interpolator.isRunning);
			await Promise.delay(duration + 50);
			assert(!interpolator.isRunning);
			assert(Math.abs(state.v - (2 * state.t + 100)) < 1);
		});

		await it('should override default expressions, use variable duration', async () => {
			interpolator.init({duration: null});
			interpolator.interpolate({v: '900 - 2 * t', d: 'v'});
			assert(interpolator.isRunning);
			await Promise.delay(250);
			assert(interpolator.isRunning);
			await Promise.delay(100);
			assert(!interpolator.isRunning);
			assert(Math.abs(state.v - 300) < 10);
		});

		await it('should use previous values prefixed with p_', async () => {
			interpolator.init({duration: null});
			interpolator.interpolate({
				v: '-(e - b)/2 * (cos(PI * t / d) - 1) + b',
				d: '1000',
				b: 'p_v'
			});
			assert(interpolator.isRunning);
			await Promise.delay(250);
			assert(interpolator.isRunning);
			await Promise.delay(100);
			assert(!interpolator.isRunning);
			assert(Math.abs(state.v - 300) < 10);
		});

	});
}
