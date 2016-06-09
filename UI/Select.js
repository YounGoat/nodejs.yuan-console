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

var _selected = function(option, index, selected) {
	if (!selected)
	 	return false;

	if (util.isFunction(selected))
		return selected(option, index);

	if (selected.index && util.isNumber(selected.index))
		return selected.index == index;

	if (selected.value)
		return selected.value == option;

	return false;
};

/**
 * @param {String}   title
 * @param {Array}    options
 * @param {Function} formatter
 *
 * 参数选项 selected 用于区分哪些选项是默认选中的。
 * @param {Function} selected
 * @param {Object}   selected
 * @param {Array}    selected.indexes
 * @param {Number}   selected.index
 * @param {Array}    selected.values
 * @param {*}        selected.value
 */
var Select = function(OPT) {
	this.onkeypress = this.onkeypress.bind(this);
	this.ondata = this.ondata.bind(this);

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

	var selectedIndex = 0;
	this.options.forEach(function(option, index) {
		if (_selected(option, index, OPT.selected)) selectedIndex = index;
	});
	this.selectedIndex = selectedIndex;
	this.position = (selectedIndex >= 0) ? selectedIndex : 0;
};

util.inherits(Select, EventEmitter);

Select.prototype.display = function() {
	_on_display(this);

	if (this.title) {
		readline.cursorTo(_STDOUT, 0);
		readline.clearLine(_STDOUT);
		_STDOUT.write(this.title + '\n');
	}

	this.render('display');
};

Select.prototype.close = function() {
	_on_close(this);
	this.emit('select', this.options[this.selectedIndex], this.selectedIndex);
	this.emit('close', this.options[this.selectedIndex], this.selectedIndex);
};

Select.prototype.render = function(action) {
	var that = this;

	readline.cursorTo(_STDOUT, 0);
	if (!action) {
		readline.moveCursor(_STDOUT, 0, - this.options.length - 1);
		readline.clearScreenDown(_STDOUT);
	}

	this.options.forEach(function(option, index) {
		var text = '> ' + that.formatter(option) + '\n';

		if (index == that.position) {
			text = colors.inverse(text);
		}
		_STDOUT.write(text);
	});

	_STDOUT.write('Press J, K, UP, DOWN to move, ENTER to select\n');
};

Select.prototype.toggle = function() {
	if (this.position < 0) return;
	this.selectedIndex = this.position;
	this.render();
};

Select.prototype.movePrevious = function() {
	this.position--;
	if (this.position < 0) this.position = this.options.length - 1;
	this.selectedIndex = this.position;
	this.render();
};

Select.prototype.moveNext = function() {
	this.position++;
	if (this.position >= this.options.length) this.position = 0;
	this.selectedIndex = this.position;
	this.render();
};

Select.prototype.onkeypress = function(char, keyinfo) {
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

		case 'return':
			this.close();
			break;

		default:
	}
};

Select.prototype.ondata = function(chunk) {
	if (chunk.toString() == '\u0003') {
		this.close();
	}
};

module.exports = Select;
