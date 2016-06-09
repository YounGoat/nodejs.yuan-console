var path = require('path');
var core = require('./core');

var mypath = {};

mypath.equal = function(foo, bar) {
	foo = path.normalize(foo);
	bar = path.normalize(bar);

	if (core.isOS('windows')) {
		foo = foo.toLowerCase();
		bar = bar.toLowerCase();
	}

	return foo == bar;
};

module.exports = mypath;