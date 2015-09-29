import simplifierTests from './tests/simplifier';
import utilsTests from './tests/utils';
import interpolatorTests from './tests/interpolator';

doTests();

async function doTests() {
	await simplifierTests();
	await utilsTests();
	await interpolatorTests();
}
