var MODULE_REQUIRE
	, EventEmitter = require('events')
	, readline = require('readline')
	, util = require('util')
	, colors = require('colors')
	, yuan = require('yuan')
	, _print = require('../lib/print')
	, _string = require('../lib/string')
	;

var _STDOUT = process.stdout;
var _STDIN  = process.stdin;
var _readline;

var _on_display = function(instance) {
	// --1--
	// 启用 readline 之后，_STDIN 即支持 keypress 事件。
	// 也可以使用第三方模块 keypress。
	_readline = readline.createInterface({
		input: _STDIN,
		output: _STDOUT
	});
	_readline.prompt(false);

	// --2--
	// Hide cursor.
	// The numbers after 0x1b represent characters '[?25l'.
	_STDOUT.write(new Buffer([ 0x1b, 91, 63, 50, 53, 108 ]));
	_STDOUT.cursorTo(0);

	// --3--
	_STDIN.on('keypress', instance.onkeypress);
	_STDIN.on('data', instance.ondata);
};

var _on_close = function(instance) {
	// --3--
	_STDIN.removeListener('keypress', instance.onkeypress);
	_STDIN.removeListener('data', instance.ondata);

	// --2--
	// Show cursor.
	// The numbers after 0x1b represent characters '[?25h'.
	_STDOUT.write(new Buffer([ 0x1b, 91, 63, 50, 53, 104 ]));

	// --1--
	_readline.close();
};

var _writeline = function(text) {
	_STDOUT.write(text + '\n');
};

var _write = function(text) {
	_STDOUT.write(text);
};

var _checked = function(option, index, checked) {
	if (!checked)
	 	return false;

	if (util.isFunction(checked))
		return checked(option, index);

	if (checked.index && util.isNumber(checked.index))
		return checked.index == index;

	if (checked.value)
		return checked.value == option;

	return false;
};

/**
 * @param {String}   title
 * @param {Array}    options
 * @param {Function} formatter
 *
 * 参数选项 checked 用于区分哪些选项是默认选中的。
 * @param {Function} checked
 * @param {Object}   checked
 * @param {Array}    checked.indexes
 * @param {Number}   checked.index
 * @param {Array}    checked.values
 * @param {*}        checked.value
 */
var RadioGroup = function(OPT) {
	this.onkeypress = this.onkeypress.bind(this);

	this.title     = OPT.title;
	this.options   = OPT.options;

	if (OPT.formatter) {
		this.formatter = function(option) {
			var text = OPT.formatter(option);
			return text.replace(/[\r\n]+/g, '[NEWLINE]');
		};
	}
	else {
		this.formatter = function(option) {
			var text = yuan.ifUndefined(option.name, option);
			return text.replace(/[\r\n]+/g, '[NEWLINE]');
		};
	}

	var checkedIndex = -1;
	this.options.forEach(function(option, index) {
		if (_checked(option, index, OPT.checked)) checkedIndex = index;
	});
	this.checkedIndex = checkedIndex;
	this.position = 0;

	this.onkeypress = this.onkeypress.bind(this);
};

util.inherits(RadioGroup, EventEmitter);

RadioGroup.prototype.display = function() {
	_on_display(this);

	if (this.title) {
		readline.cursorTo(_STDOUT, 0);
		readline.clearLine(_STDOUT);
		_STDOUT.write(this.title + '\n');
	}

	this.render('display');
};

RadioGroup.prototype.close = function() {
	_on_close(this);
	this.emit('close', this.options[this.checkedIndex], this.checkedIndex);
};

RadioGroup.prototype.render = function(action) {
	var that = this;

	readline.cursorTo(_STDOUT, 0);
	if (!action) {
		readline.moveCursor(_STDOUT, 0, - this.options.length - 1);
		readline.clearScreenDown(_STDOUT);
	}

	this.options.forEach(function(option, index) {
		var checked = (index == that.checkedIndex);

		var signal = checked ? '(*)' : '( )';
		var text = signal + ' ' + that.formatter(option) + '\n';

		if (index == that.position) {
			text = colors.inverse(text);
		}
		if (checked) {
			text = colors.bold(text);
		}
		_STDOUT.write(text);
	});

	_STDOUT.write('Press J, K, UP, DOWN to move, SPACE to toggle, ENTER to exit\n');
};

RadioGroup.prototype.toggle = function() {
	if (this.position < 0) return;

	var checked = (this.checkedIndex == this.position);
	this.checkedIndex = checked ? -1 : this.position;

	this.render();
};

RadioGroup.prototype.movePrevious = function() {
	this.position--;
	if (this.position < 0) this.position = this.options.length - 1;
	this.render();
};

RadioGroup.prototype.moveNext = function() {
	this.position++;
	if (this.position >= this.options.length) this.position = 0;
	this.render();
};

RadioGroup.prototype.onkeypress = function(char, keyinfo) {
	// Erase the keypress output.
	readline.clearLine(_STDOUT, 0);
	readline.cursorTo(_STDOUT, 0);

	switch (keyinfo.name) {
		case 'up':
		case 'k':
			this.movePrevious();
			break;

		case 'down':
		case 'j':
			this.moveNext();
			break;

		case 'space':
			this.toggle();
			break;

		case 'return':
			this.close();
			break;

		default:
	}
};

RadioGroup.prototype.ondata = function(chunk) {
	if (chunk.toString() == '\u0003') {
		this.close();
	}
};

module.exports = RadioGroup;
