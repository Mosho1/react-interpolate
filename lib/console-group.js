var util = require( 'util' );
var originalLog = console.log;
var prefix = '', suffix = '';

const line = String.fromCharCode(0x2502);
const open = String.fromCharCode(0x250C);
const close = String.fromCharCode(0x2514);

function format ( args ) {
	return util.format.apply( null, args )
		.replace( /^/gm, prefix )
		.replace( /$/gm, suffix );
}

function consoleLog () {
	this._stdout.write( format( arguments ) + '\n' );
}

function consoleGroup () {
	suffix = '\n' + prefix + open;
	process.stderr.write( '\u001b[1m' + format( arguments ) + '\u001b[22m\n' );
	suffix = '';
	prefix += line;
}

function consoleGroupEnd () {
	prefix = prefix.slice( 0, -1 );
	console.log( prefix.slice(0, -2) + close );
}

module.exports = {
	install: function () {
		console.log = consoleLog;
		console.group = consoleGroup;
		console.groupEnd = consoleGroupEnd;
	},

	teardown: function () {
		console.log = originalLog;
		delete console.group;
		delete console.groupEnd;
	}
};
