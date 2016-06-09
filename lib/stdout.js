var MODULE_REQUIRE
	  yuan = require('yuan')
	;

var stdout = {};

var process_stdout_write = process.stdout.write;
var getZero = function() { return function() {}; };

stdout.block = function() {
	process.stdout.__defineGetter__('write', getZero);
};

stdout.unblock = function() {
	process.stdout.__defineGetter__('write', function() {
		return process_stdout_write;
	});
};

module.exports = stdout;
