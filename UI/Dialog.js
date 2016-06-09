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

var Dialog = function(OPT) {
	OPT = yuan.object.extend({
		title   : 'DIALOG',
		message : '',
		buttons : { 0 : 'OK' },
		value   : 0
	}, OPT);

	this.title   = OPT.title;
	this.message = OPT.message;
	this.buttons = OPT.buttons;
	this.value   = OPT.value;

	this.onkeypress = this.onkeypress.bind(this);
	this.ondata = this.ondata.bind(this);
};

util.inherits(Dialog, EventEmitter);

Dialog.prototype.display = function() {
	_on_display(this);
	this.render('display');
};

Dialog.prototype.close = function() {
	this.render('clear');
	_on_close(this);
	this.emit('close', null);
};

Dialog.prototype.render = (function() {
	var columns;
	var buttonLineColumns;
	var linenum;
	var titleLines;
	var messageLines;

	return function(action) {
		if (action == 'display') {
			buttonLineColumns = 0;
			for (var i in this.buttons) {
				// 6 = 按钮修饰符及间隔的宽度
				buttonLineColumns += 6 + _string.getDisplayWidth(this.buttons[i]);
			}
			columns = buttonLineColumns;

			var maxColumns = _STDOUT.columns - 8;

			titleLines = _string.splitIntoLines(this.title, maxColumns);
			messageLines = _string.splitIntoLines(this.message, maxColumns);
			titleLines.concat(messageLines).forEach(function(line) {
				columns = Math.max(columns, _string.getDisplayWidth(line));
			});

			// 5 = 上制表线 + （标题） + 分隔线 + （消息） + 分隔线 + 按钮行 + 下制表符
			linenum = 5 + titleLines.length + messageLines.length;

			// 8 = 左右制表符号及留白的宽度
			columns += 8;

			// columns = 8 + Math.max(
			// 	  buttonLineColumns
			// 	, _string.getDisplayWidth(this.title)
			// 	, _string.getDisplayWidth(this.message)
			// );

			// 6 = 上制表线 + 标题 + 分隔线 + ... + 分隔线 + 按钮行 + 下制表符
			// linenum = 6 + _string.countLines(this.message);
		}

		if (action == 'clear' || !action) {
			readline.moveCursor(_STDOUT, 0, - linenum);
			readline.clearScreenDown(_STDOUT);
			readline.clearLine();
		}

		if (action == 'clear') return;

		var _lineIn = function foo(line, align, style) {
			if (util.isArray(line)) return line.forEach(function(line) {
				foo(line, align, style);
			});

			var body = '', dw = _string.getDisplayWidth(line), bw = columns - 8;
			if (align == 'center') {
				var leading = Math.floor((columns - dw - 8) / 2);
				body = yuan.Char.space(leading) + line + yuan.Char.space(bw - dw - leading);
			}
			else {
				body = line + yuan.Char.space(bw - dw);
			}
			if (style) body = colors[style](body);

			_writeline(colors.gray('│  ') + body + colors.gray('  │'));
		};

		// 为什么用连字符（dash）取代制表符号横？
		// 因为在某些非绝对等宽中文字体中，制表符号横的宽度为半角而非全角。
		_writeline(colors.gray('┌' + yuan.string.repeat('-', columns - 4) + '┐'));
		_lineIn(titleLines, null, 'blue');
		_lineIn('');
		_lineIn(messageLines);
		_lineIn('');

		// Render buttons.
		var buttonLine = '';
		for (var i in this.buttons) {
			var buttonText = this.buttons[i];
			if (i == this.value) {
				buttonText = colors.bold(buttonText);
			}
			buttonLine += colors.gray(' [ ') + buttonText + colors.gray(' ] ');
		}
		_lineIn(buttonLine, 'center');

		_writeline(colors.gray('└' + yuan.string.repeat('-', columns - 4) + '┘'));
	};
}());

Dialog.prototype.movePrevious = function() {
	this.value--;
	if (this.value == -1) this.value++;
	else this.render();
};

Dialog.prototype.moveNext = function() {
	this.value++;
	if (this.value == this.buttons.length) this.value--;
	else this.render();
};

Dialog.prototype.moveRound = function() {
	this.value++;
	if (this.value == this.buttons.length) this.value = 0;
	this.render();
};

Dialog.prototype.onkeypress = function(char, keyinfo) {
	// Erase the keypress output.
	readline.clearLine(_STDOUT, 0);
	readline.cursorTo(_STDOUT, 0);

	switch (keyinfo.name) {
		case 'left':
			this.movePrevious();
			break;

		case 'right':
			this.moveNext();
			break;

		case 'tab':
			this.moveRound();
			break;

		case 'return':
			readline.moveCursor(_STDOUT, 0, -1);
		case 'space':
			this.close();
			break;

		default:
	}
};

Dialog.prototype.ondata = function(chunk) {
	if (chunk.toString() == '\u0003') {
		this.close();
	}
};

module.exports = Dialog;
