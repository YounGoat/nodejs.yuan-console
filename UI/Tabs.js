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
var Tabs = function(OPT) {
	this.tabs = OPT.tabs;
	this.tabs.forEach(function(tab) {
		if (!tab.alt) {
			if (/^[a-zA-Z]/.test(tab.text)) tab.alt = tab.text.charAt(0);
		}
	});

	this.selectedIndex = 0;

	this.onkeypress = this.onkeypress.bind(this);
};

util.inherits(Tabs, EventEmitter);

Tabs.prototype.display = function() {
	_on_display(this);
	_core.clear();
	this.render('display');
};

Tabs.prototype.close = function() {
	readline.cursorTo(_STDOUT, 0, 0);
	readline.clearScreenDown(_STDOUT);

	_on_close(this);
	this.emit('close', this.tabs[this.selectedIndex], this.selectedIndex);
};

Tabs.prototype.render = function(action) {
	var that = this;

	readline.cursorTo(_STDOUT, 0, 0);
	readline.clearScreenDown(_STDOUT);

	readline.cursorTo(_STDOUT, 0, _STDOUT.rows);
	_write('Press LEFT, RIGHT, TAB to change tab, ENTER to exit');
	readline.cursorTo(_STDOUT, 0, 0);

	_writeline('');
	_write('  ');

	this.tabs.forEach(function(tab, index) {
		if (index > 0) {
			_write(' | ');
		}

		var selected = (index == that.selectedIndex);

		if (tab.alt) {
			_write(colors.green('[' + tab.alt + '] '));
		}

		var text = tab.text;
		if (selected) {
			text = colors.bold(text);
		}
		_write(text);
	});

	_writeline('');
	_writeline(yuan.string.repeat('-', process.stdout.columns));

	this.emit('change', this.tabs[this.selectedIndex]);
};

Tabs.prototype.movePrevious = function() {
	this.selectedIndex--;
	if (this.selectedIndex < 0) this.selectedIndex = this.tabs.length - 1;
	this.render();
};

Tabs.prototype.moveNext = function() {
	this.selectedIndex++;
	if (this.selectedIndex >= this.tabs.length) this.selectedIndex = 0;
	this.render();
};

Tabs.prototype.onkeypress = function(char, keyinfo) {
	// Erase the keypress output.
	readline.clearLine(_STDOUT, 0);
	readline.cursorTo(_STDOUT, 0);

	if (!keyinfo) return;

	switch (keyinfo.name) {
		case 'left':
			this.movePrevious();
			break;

		case 'right':
			this.moveNext();

		case 'tab':
			keyinfo.shift ? this.movePrevious() : this.moveNext();
			break;

		case 'return':
		case 'escape':
			this.close();
			break;

		default:
			if (this.tabs.length > 1) {
				var cursor = this.selectedIndex + 1;
				do {
					if (cursor == this.tabs.length) cursor = 0;
					var alt = this.tabs[cursor].alt;
					if (alt && alt.toLowerCase() == keyinfo.name) {
						this.selectedIndex = cursor;
						this.render();
						break;
					}
				} while(cursor++ != this.selectedIndex)
			}
	}
};

Tabs.prototype.ondata = function(chunk) {
	if (chunk.toString() == '\u0003') {
		this.close();
	}
};

module.exports = Tabs;
