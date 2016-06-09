var
	  EventEmitter = require('events')
	, util = require('util')
	, colors = require('colors')
	, yuan = require('yuan')
	, _print = require('../lib/print')
	;

var _STDOUT = process.stdout;

var _on_display = function() {

	// Hide cursor.
	// The numbers after 0x1b represent characters '[?25l'.
	process.stdout.write(new Buffer([ 0x1b, 91, 63, 50, 53, 108 ]));
	process.stdout.cursorTo(0);
};

var _on_close = function() {

	// Show cursor.
	// The numbers after 0x1b represent characters '[?25h'.
	process.stdout.write(new Buffer([ 0x1b, 91, 63, 50, 53, 104 ]));
};

var ProgressBar = function(OPT) {
	OPT = yuan.object.extend({
		title   : '',
		message : '',
		value   : 0
	}, OPT);

	this.title = OPT.title;

	Object.defineProperty(this, 'value', {
		get: function() { return OPT.value;},
		set: function(v) { if (v != OPT.value) { OPT.value = v; this.render(); } }
	});

	Object.defineProperty(this, 'message', {
		get: function() { return OPT.message; },
		set: function(msg) { if (msg != OPT.message) { OPT.message = msg; this.render(); } }
	});
};

util.inherits(ProgressBar, EventEmitter);

ProgressBar.prototype.display = function() {
	_on_display();
	this.render();
};

ProgressBar.prototype.close = function() {
	_on_close();
};

ProgressBar.prototype.render = (function() {
	'use strict';
	var _bytes = 0;
	return function() {
		if (process.stdout.bytesWritten == _bytes) {
			process.stdout.cursorTo(0);
			process.stdout.moveCursor(0, -2);
		}

		process.stdout.clearLine();
		var na = Math.round(this.value / 2);
		var nb = 50 - na;
		var a = yuan.string.repeat('❘', na);
		var b = colors.gray(yuan.string.repeat('❘', nb));
		process.stdout.write(yuan.string.format('%s %3s%%  %s%s\n', this.title, this.value, a, b));
		process.stdout.clearLine();
		process.stdout.write(this.message + '\n');

		_bytes = process.stdout.bytesWritten;
	};
}());

module.exports = ProgressBar;
