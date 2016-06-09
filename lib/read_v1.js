
var colors = require('colors');
var fs = require('fs');

var readlineSync = function() { return require('readline-sync'); };
var yuan = require('yuan');

var _print = require('./print');

// var _readline = function() {
// 	var answer = readlineSync().question('', { keyIn: true });
// 	_print._resetLine();
// 	return answer;
// };

// var _readkey = function(noEcho) {
// 	return readlineSync().keyIn('', { limit: [], hideEchoBack: noEcho, mask: '' });
// };

var _readkey = function() {
	var changeMode = !process.stdin.isRaw;

	// What happen on raw mode?
	// 1. Auto-echo on stdout will be disabled.
	// 2. Data will be piped out char by char, instead of line by line.
	if (changeMode) process.stdin.setRawMode(true);

	var buf = new Buffer(1);
	fs.readSync(
		/*fd*/ process.stdin.fd,
		/*buffer that the data will be written to*/ buf,
		/*offset in the buffer*/ 0,
		/*number of bytes to read*/ 1,
		/*where to begin readinng from in the file*/ null
		);

	if (changeMode) process.stdin.setRawMode(false);

	return buf.toString('utf8');
};

var _readline = function() {
	var changeMode = process.stdin.isRaw;
	var pause = !process.stdin.isPaused();

	if (pause)
		process.stdin.pause();
	if (changeMode)
		process.stdin.setRawMode(false);

	var buf = new Buffer(1024);
	var size = fs.readSync(process.stdin.fd, buf, 0, 1024, null);

	if (pause)
		process.stdin.resume();
	if (changeMode)
		process.stdin.setRawMode(true);

	_print.resetLine();
	return buf.toString('utf8', 0, size).replace(/\r|\n/g, '');
};

// 读取用户输入
var read = yuan.overload.Function(
	[
		String,
		function(prompt) {
			return read({ prompt: prompt });
		}
	],

	/**
	 * @param {String}   OPT.allowEmpty
	 * @param {String}   OPT.prompt
	 * @param {String}   OPT.default
	 * @param {String}   OPT.example
	 * @param {Function} OPT.validator
	 * @param {Function} OPT.processor
	 * @param {Number}   OPT.repeat
	 */
	function(OPT) {
		//---- 参数规范化 ----

		// 自定义验证器。
		// 支持使用正则表达式字符串或正则表达式对象作为验证器。
		if (typeof OPT.validator == 'string' || OPT.validator instanceof RegExp) {
			OPT.validator = (function(re) {
				re = new RegExp(re);
				return function(text) { return re.test(text); };
			})(OPT.validator);
		}
		else if (typeof OPT.validator != 'function') {
			delete OPT.validator;
		}

		// 自定义告警内容。
		if (typeof OPT.warner == 'string') {
			OPT.warner = (function(warning) {
				return function(text) {
					_print.warning(warning);
				};
			})(OPT.warner);
		}
		else if (typeof OPT.warner != 'function') {
			delete OPT.warner;
		}

		// 如果未指定重复次数，则默认为不重复，或者无限次（在指定了校验方法时）。
		if (!yuan.object.has(OPT, 'repeat')) {
			OPT.repeat = OPT.validator ? -1 : 1;
		}

		//---- 函数正文 ----
		var answer;

		do {
			// 打印提示语。
			_print.text(OPT.prompt);
			_print.space();

			// 打印缺省值。
			if (yuan.object.has(OPT, 'default')) {
				_print.note('DEFAULT ' + yuan.ifEmpty(OPT.default, '<EMPTY>'));
				_print.space();
			}

			// 打印示例。
			if (OPT.example) {
				_print.note('e.g. ' + OPT.example);
				_print.space();
			}

			// 读取用户输入。
			answer = _readline();
			if (!OPT.allowEmpty && answer == '') {
				if (yuan.object.has(OPT, 'default')) {
					answer = OPT.default;
					break;
				}
			}
			else if (OPT.validator) {
				if (OPT.validator(answer)) break;
				else if (OPT.warner) OPT.warner(answer);
				else _print.warning('输入内容未通过合法性校验，请重新输入！');
			}
			else break;

		} while (OPT.repeat == -1 || --OPT.repeat > 0)

		if (OPT.processor) {
			answer = OPT.processor(answer);
		}

		return answer;
	}
);

read.ENTER = function(prompt) {
	readlineSync().question(prompt, { hideEchoBack: true, mask: '' });
};

read.key = function(prompt, keys) {

	// 打印提示语。
	_print.text(prompt);
	_print.space();

	var anykey = false, keyname;

	if (keys) {
		var keynotes = [];
		for (var name in keys) {
			if (name == 'DEFAULT') anykey = keys[name];
			else keynotes.push(name + ' = ' + keys[name]);
		}
		if (anykey) keynotes.push('其他键 = ' + anykey);
		_print.note( keynotes.join(' | ') );
		_print.space();

		anykey = !!anykey;
	}
	else {
		anykey = true;
	}

	if (anykey) {
		// 我们需要通过 yuancon.print 输出以便于对输出进行更好的控制。
		keyname = _readkey(/*noEcho*/ 1).toUpperCase();
		_print(keyname);
	}
	else {
		var keynames = Object.keys(keys);
		do {
			keyname = _readkey(/*noEcho*/ 1).toUpperCase();
			if (keynames.indexOf(keyname) >= 0) {
				_print(keyname);
				break;
			}
		} while (1)
	}

	return keyname;
};

read.key.yes = function(prompt) {
	var keyname = read.key(prompt, { 'Y' : '是', 'DEFAULT' : '否' });
	return keyname == 'Y';
};

read.key.no = function(prompt) {
	var keyname = read.key(prompt, { 'N' : '否', 'DEFAULT' : '是' });
	return keyname == 'N';
};

module.exports = read;
