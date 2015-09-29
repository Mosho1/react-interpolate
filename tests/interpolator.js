import {dummy, spy, describe, assertEqual, assert, it, itAsync} from '../lib/unit-tester';
import Interpolator from '../lib/interpolator';
import Promise from 'bluebird';

export default async () => {
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
			assert(Math.abs(state.v - 300) < 40);
		});

		await it('should use previous values prefixed with p_', async () => {
			const values = [];
			const firstStop = 500;
			const duration = 1000;
			interpolator.init({
				expressions: {
					v: '-(e - b)/2 * (cos(PI * t / d) - 1) + b',
					d: '1000',
					e: 2,
					b: 'p_v'
				}, duration: null, startValue: 0});
			interpolator.on('stateChange', s => values.push(s.v));
			interpolator.cancel.reset();
			interpolator.handleResults.reset();
			interpolator.interpolate();
			assert(interpolator.isRunning);
			await Promise.delay(firstStop);
			assert(interpolator.isRunning);
			interpolator.interpolate({e: 0});
			await Promise.delay(1050);
			assert(!interpolator.isRunning);
			assert(Math.abs(state.v - 0) < 0.1);

			// one for each interpolate, one for finishing duration
			assertEqual(interpolator.cancel.calls, 3);

			// total run time divided by framerate, give or take 5% (never saw it less by more than 1)
			assert(interpolator.handleResults.calls >= (firstStop + duration) / 1000 * 60 * 0.95);

			// should have completed half way, then turned back.
			assert(Math.abs(Math.max(...values) - firstStop / duration * 2) < 1);

		});

	});
};
