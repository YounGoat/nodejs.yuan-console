var
	  EventEmitter = require('events')
	, readline = require('readline')
	, util = require('util')
	, colors = require('colors')
	, yuan = require('yuan')
	;

// There wonnot be more than 1 instance of CheckboxGroup running simultaneously,
// so ...
var _readline;

var _checked = function(option, index, checked) {
	if (!checked)
	 	return false;

	if (util.isFunction(checked))
		return checked(option, index);

	if (checked.indexes && util.isArray(checked.indexes))
		return checked.indexes.indexOf(index) >= 0;

	if (checked.index && util.isNumber(checked.index))
		return checked.index == index;

	if (checked.values && util.isArray(checked.values))
		return checked.values.indexOf(option) >= 0;

	if (checked.value)
		return checked.value == option;

	return false;
};

var _hideCursor = function() {
	// The numbers after 0x1b represent characters '[?25l'.
	process.stdout.write(new Buffer([ 0x1b, 91, 63, 50, 53, 108 ]));
};

var _showCursor = function() {
	// The numbers after 0x1b represent characters '[?25h'.
	process.stdout.write(new Buffer([ 0x1b, 91, 63, 50, 53, 104 ]));
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
var CheckboxGroup = function(OPT) {
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

	var checkedIndexes = [];
	this.options.forEach(function(option, index) {
		if (_checked(option, index, OPT.checked)) checkedIndexes.push(index);
	});
	this.checkedIndexes = checkedIndexes;
	this.position = 0;
};

util.inherits(CheckboxGroup, EventEmitter);

CheckboxGroup.prototype.display = function() {
	_readline = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	_readline.prompt(false);

	if (this.title) {
		// @see [20151228.1]
		readline.cursorTo(process.stdout, 0);
		readline.clearLine(process.stdout);
		process.stdout.write(this.title + '\n');
	}

	this.render(1);
	process.stdin.on('keypress', this.onkeypress);
};

CheckboxGroup.prototype.close = function() {
	var that = this;

	// Reset the standard input & output.
	process.stdin.removeListener('keypress', this.onkeypress);
	_showCursor();

	// Clear the previous output if exists.
	// readline.cursorTo(process.stdin, 0, 0);
	// readline.clearScreenDown(process.stdin);
	_readline.close();

	var checkedOptions = [];
	this.checkedIndexes.sort();
	this.checkedIndexes.forEach(function(index) {
		checkedOptions.push(that.options[index]);
	});
	this.emit('close', checkedOptions, this.checkedIndexes);
};

CheckboxGroup.prototype.render = function(noclear) {
	var that = this;

	// Clear the previous output if exists.

//	readline.cursorTo(process.stdin, 0, 0);
//	readline.clearScreenDown(process.stdin);

	// [20151228.1]
	// In Mac OS X, it's ok to do cursor operation onto stdin, and pipe to stdout.
	// In Windows, such operation will throw an EPIPE exception.
	// 在 OSX 系统中可对 stdin 进行移动光标操作，并通过管道影响 stdout。
	// 但是在 Windows 中这样操作会抛出 EPIPE 异常。
//	readline.cursorTo(process.stdout, 0);
//	if (!noclear) {
//		readline.moveCursor(process.stdin, 0, - this.options.length - 1);
//		readline.clearScreenDown(process.stdin);
//	}

	readline.cursorTo(process.stdout, 0);
	if (!noclear) {
		readline.moveCursor(process.stdout, 0, - this.options.length - 1);
		readline.clearScreenDown(process.stdout);
	}

	this.options.forEach(function(option, index) {
		var checked = that.checkedIndexes.indexOf(index) >= 0;

		var signal = checked ? '[*]' : '[ ]';
		var text = signal + ' ' + that.formatter(option) + '\n';

		if (index == that.position) {
			text = colors.inverse(text);
		}
		if (checked) {
			text = colors.bold(text);
		}
		process.stdout.write(text);
	});

	process.stdout.write('Press J, K, UP, DOWN to move, SPACE to toggle, ENTER to exit\n');
	_hideCursor();
};

CheckboxGroup.prototype.emitSingle = function(name) {
	this.emit(name, this.options[this.position], this.position);
};

CheckboxGroup.prototype.check = function() {

};

CheckboxGroup.prototype.uncheck = function() {

};

CheckboxGroup.prototype.toggle = function() {
	if (this.position < 0) return;

	var checked = (this.checkedIndexes.indexOf(this.position) >= 0);
	if (checked) {
		this.checkedIndexes = yuan.array.without(this.checkedIndexes, this.position);
	}
	else {
		this.checkedIndexes.push(this.position);
	}

	this.render();
	this.emitSingle(checked ? 'uncheck' : 'check');
	this.emitSingle('toggle');
};

CheckboxGroup.prototype.movePrevious = function() {
	this.position--;
	if (this.position < 0) this.position = this.options.length - 1;
	this.render();
};

CheckboxGroup.prototype.moveNext = function() {
	this.position++;
	if (this.position >= this.options.length) this.position = 0;
	this.render();
};

CheckboxGroup.prototype.onkeypress = function(char, keyinfo) {
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
			// Erase the keypress output.
			readline.clearLine(process.stdout, 0);
			readline.cursorTo(process.stdout, 0);
	}
};



module.exports = CheckboxGroup;
