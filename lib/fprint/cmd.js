var path = require('path');

var colors = require('colors');
var yuan = require('yuan');

var _print = require('../print');

module.exports = function(cmd, OPT) {
	OPT = yuan.object.extend({
		cwd: process.cwd()
	}, OPT);

	var parts = yuan.string(cmd).trim().split(' ', '"', '\\').toString();

	_print
		// _print a space line.
		.spaceline().indent('push').indent(4)
		// _print 'Current Working Directory'.
		.line(colors.gray('[CWD:'), colors.green(OPT.cwd), colors.gray(']'))
		// _print command name.
		.line(colors.cyan(parts[0])).indent(8);

	// _print command params.
	for (var i = 1, part; i < parts.length; i++) {
		part = parts[i];
		if (part.substr(0, 2) == '--' && parts[i+1] && parts[i+1].charAt(0) != '-') {
			part += ' ' + parts[++i];
		}
		_print.line(colors.cyan(part));
	}

	// _print a space line.
	_print.spaceline().indent('pop');
};