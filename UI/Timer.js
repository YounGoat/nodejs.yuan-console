var MODULE_REQUIRE
	, EventEmitter = require('events')
	, readline = require('readline')
	, util = require('util')
	, colors = require('colors')
	, yuan = require('yuan')
	, _core = require('../lib/core')
	, _print = require('../lib/print')
	, _string = require('../lib/string')
	;


var Timer = function(OPT) {
	var that = this;
	OPT = yuan.object.extend({
		interval: 1000
	}, OPT);

	this.interval = OPT.interval;
	this.title = OPT.title;
	this.ms = 0;

	this.handler = global.setInterval(function() {
		that.ms += that.interval;
		that.render();
	}, this.interval);
};

util.inherits(Timer, EventEmitter);

Timer.prototype.display = function() {
	this.render();
};

Timer.prototype.render = function(action) {
	_print.clearline();
	if (action != 'close') {
		var dots = yuan.string.repeat('.', parseInt(this.ms / this.interval) % 7);
		_print.text(this.title);
		_print.text(yuan.string.format(' %-6s', dots));
		if (this.interval >= 1000) {
			_print.text(yuan.string.format(' %3d s', parseInt(this.ms / 1000)));
		}
		else {
			_print.text(yuan.string.format(' %6d ms', this.ms));
		}

	}
};

Timer.prototype.close = function() {
	this.render('close');
	this.handler.close();
};

module.exports = Timer;
