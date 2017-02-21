var
	  fs = require('fs')
	, os = require('os')
	, colors = require('colors/safe')
	, yuan = require('yuan')
	;

var TAGNAMES_EXCLUDE = [ 'markup' ];
var CHAR_NEWLINEs = {
	'Darwin'     : String.fromCharCode(10),
	'Windows_NT' : String.fromCharCode(10),
	'Linux'      : String.fromCharCode(10)
};
var CHAR_NEWLINE = CHAR_NEWLINEs[os.type()];

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

var
	_currentLine = '',
	_lastLine = '',
	_lines = 0,
	_pauseOnScreen = false,

	_resetLine = function(text) {
		// @deprecated 此变量未见引用。
		_lastLine = _currentLine;

		_currentLine = text;
	},

	_newLine = function () {
		_lines++;
		if (_pauseOnScreen && _lines > process.stdout.rows - 2) {
			try {
				process.stdout.clearLine();
				process.stdout.cursorTo(0);
			} catch (ex) {}
			process.stdout.write('-- MORE --');
			if (_readkey() == ' ') {
				_lines = 0;
			}
			try {
				process.stdout.clearLine();
				process.stdout.cursorTo(0);
			} catch (ex) {}
			process.stdout.write(_currentLine);
		}
	},

	/**
	 *
	 * // 返回由空白字符组成的代表缩进的字符串。
	 * _indent()
	 *
	 * // 设置缩进。
	 * _indent.set(n)
	 *
	 * // 获取缩进长度。
	 * _indent.size
	 */
	_indent = (function() {
		var indent = '';
		return {
			set: function(n) {
				// 如果当前行除了缩进，别无内容，则先删除此缩进。
				if (_currentLine == indent) {
					process.stdout.write(yuan.string.repeat(yuan.Char.BACKSPACE, indent.length));
					_resetLine('');
				}
				indent = yuan.Char.space(n);

				// var m = n - _currentLine.length;
				// if (m >= 0) process.stdout.write(yuan.Char.space(m));
				// else print.br();
			},
			get: function() { return indent; },
			size: function() { return indent.length; }
		};
	})(),

	_decorate = function(text, styles) {
		var fn = function(text, style) {
			return colors[style](text);
		};

		if (styles) {
			if (!Array.isArray(styles)) styles = [styles];
			styles.forEach(function(style) {
				text = fn(text, style);
			});
		}

		return text;
	},

	_out = function(text, styles) {
		if (typeof text == 'undefined') text = '';
		if (typeof text != 'string') text = '' + text;

		var outstring = _decorate(text, styles);

		outstring = _indent.get() + outstring.split(CHAR_NEWLINE).join(CHAR_NEWLINE + _indent.get());
		_resetLine(outstring);
		console.log(outstring);
		_resetLine('');
		_newLine();
	},

	_outext = function(text, styles) {
		if (typeof text == 'undefined') text = '';
		if (typeof text != 'string') text = '' + text;

		var m = _indent.size() - _currentLine.length;
		if (m >= 0) process.stdout.write(yuan.Char.space(m));

		// var outstring = _decorate(text, styles);
		// process.stdout.write(outstring);

		// if (text.indexOf(CHAR_NEWLINE) < 0) _currentLine += text;
		// else _currentLine = text.substr(text.lastIndexOf(CHAR_NEWLINE) + CHAR_NEWLINE.length);

		var parts = text.split(CHAR_NEWLINE);
		process.stdout.write(_decorate(parts[0], styles));
		_currentLine += parts[0];

		for (var i = 1; i < parts.length; i++) {
			process.stdout.write(CHAR_NEWLINE + _indent.get() + _decorate(parts[i], styles));
			_resetLine(_indent.get() + parts[i]);
			_newLine();
		}
	},

	_clear = function() {
		// 为什么退格符要 × 2？
		// 因为退格是半角的，需要两个退格才能清除一个全角字符。
		// var
		// 	len = _currentLine.length * 2,
		// 	bs = yuan.string.repeat(yuan.Char.BACKSPACE, len),
		// 	outstring = bs + yuan.Char.space(len) + bs + _indent.get();
		// _outext(outstring);

		// @TODO 不是完善的解决办法，无法处理行溢出时造成的自然换行问题。
		// process.stdout.cursorTo(0);
		// process.stdout.write(yuan.Char.space(process.stdout.columns - 1));
		// process.stdout.cursorTo(0);
		// _currentLine = '';


		try {
			process.stdout.clearLine();
			process.stdout.cursorTo(0);
		} catch (ex) {}
		// 注意：此处不要使用 _resetLine() 。
		_currentLine = '';
	};

var print = function(text) {
	print.TOL();
	if (arguments.length > 1) _out( yuan.array(arguments).join(' ') );
	else _out(text);
	return print;
};

print.line = print.bind(null);

print.markup = yuan.overload.Function([
	[
		String,
		function(tag) {
			var output = function() {
				var tagname = RegExp.$1;
				var text = RegExp.$3;
				var fn;
				if (TAGNAMES_EXCLUDE.indexOf(tagname) == -1) fn = print[tagname];
				fn ? fn(text) : _outext(tag);
			}

			// 不支持转义。
			if (/^\/([a-zA-Z0-9]+)(:([^/]+))?\/$/.test(tag)) {
				output(tag);
			}
			else {
				var re = /\/([a-zA-Z0-9]+)(:([^/]+))?\//;
				var matched;
				var text = tag, pre;
				do {
					matched = text.match(re);
					if (matched) {
						tag = matched[0];
						pre = text.substr(0, matched.index);
						text = text.substr(matched.index + tag.length);
						_outext(pre);
						output(tag);
					}
					else {
						_outext(text);
						text = '';
					}
				} while(text.length)
			}
			return print;
		}
	],
	[
		Array,
		function(tags) {
			tags.forEach(function(tag) {
				print.markup(tag);
			})
			return print;
		}
	],
	[
		yuan.overload.Type(function() { return !0; }),
		function(anything) {
			print.markup('' + anything);
			return print;
		}
	],
	function() {
		for (var i = 0; i < arguments.length; i++) print.markup(arguments[i]);
		return print;
	}
]);

print.br = function() {
	// _outext(CHAR_NEWLINE + _indent.get());
	_outext(CHAR_NEWLINE);
	return print;
};

print.clearline = function() {
	_clear();
	return print;
};
print.clearLine = print.clearline;

print.code = function(text) {
	print.br();
	_out(text.replace(/^/gm, '    '), [ 'cyan' ]);
	print.TOL().br();
	return print;
};

print.codeInline = function(text) {
	_outext(text, [ 'cyan' ]);
	return print;
};

print.command = function(text) {
	_out(text, 'green');
	return print;
};

print.dim = function(text) {
	_outext(text, 'dim');
	return print;
};

print.em = function(text) {
	_outext(text, 'bold');
	return print;
};

print.end = function(text) {
	print.br();
	_out('~~ ' + text + ' ~~', 'green');
	return print;
};

print.error = function(ex) {
	var text = ex.toString();
	if (ex instanceof Error && ex.stack) {
		text = ex.stack;
	}
	print.code(text);
	return print;
};

print.h2 = function(text) {
	print.br();
	_out('== ' + text + ' ==', 'bold');
	return print;
};

print.h3 = function(text) {
	print.br();
	_out('-- ' + text + ' --', 'bold');
	return print;
};

print.h4 = function(text) {
	print.br();
	_out('.. ' + text + ' ..', 'bold');
	return print;
};

print.hr = function () {
	print.TOL();
	_out(colors.gray('……………………'));
};

print.indent = (function() {
	var stack = [];

	var DEFs = [
		[
			Number,
			function(n) {
				_indent.set(n);
			}
		],
		[
			'pop',
			function(pop) {
				var n = stack.pop();
				_indent.set(n);
			}
		],
		[
			'push',
			function(push) {
				stack.push(_indent.size());
			}
		],
		[
			yuan.overload.Type(/^(-|\+)\d+$/),
			function(text) {
				_indent.set(_indent.size() + parseInt(text));
			}
		],
		[
			yuan.overload.Type(/^\d+$/),
			function(text) {
				_indent.set(parseInt(text));
			}
		]
	];

	return function() {
		yuan.overload.run(DEFs, arguments);
		return print;
	};
})();

print.margin = function(x, y) {
	if (_currentLine == '' && _lastLine == '') {
		// DO NOTHING.
	}
	else {
		print.spaceline();
	}
	return print;
};

print.note = function(text) {
	_outext('[ ' + text + ' ]', [ 'gray' ]);
	return print;
};

print.number = yuan.overload.Function(
	[
		Number,
		String,
		function(num, format) {
			var s = num.toString();
			if (format.match(/^0+$/)) {
				s = format.substr(0, format.length - s.length) + s;
			}
			_outext(s, 'bold');
			return print;
		}
	],

	function(number) {
		_outext(number.toString(), 'bold');
		return print;
	}
);

print.ol = function(/*Array(String)*/ lines, OPT) {
	OPT = yuan.object.extend({
		vspace: true,
		formatter: null
	}, OPT);
	lines.forEach(function(line, index) {
		// 自第二项起，每项前添加一个空行。
		if (index) {
			if (OPT.vspace) print.spaceline();
			else print.br();
		}

		// 输出项编号。
		_outext(' ' + (index + 1) + '.', 'gray');

		// 设置悬挂缩进（4 * 空格）
		_indent.set(4);

		print.markup(line);

		// 恢复缩进
		_indent.set(0);
	});
	return print;
};

print.param = function(text) {
	_outext(text, 'underline');
	return print;
}

/**
 * @param {Boolean} tf Ture or False
 */
print.pauseOnScreen = function(tf) {
	_pauseOnScreen = !!tf;
	_lines = 0;
};

print.reset = function() {
	_lines = 0;
	_lastLine = '';
	_currentLine = '';
};

print.resetLine = function() {
	_resetLine('');
	return print;
};

print.space = function(times) {
	if (!times) times = 1;
	_outext(yuan.Char.space(times));
	return print;
};

/**
 * 打印一个空白行。
 */
print.spaceline = function() {
	return print.TOL().br();
};

print.path = function(text) {
	_outext(text, [ 'yellow' ]);
	return print;
};

/**
 * 打印表格。
 * @param {Array}   columns           列定义
 * @param {String}  columns[i].name   列名（数据对象属性名）
 * @param {String}  columns[i].title  列标题
 * @param {ENUM}    columns[i].align  列对齐方式
 * @param {ENUM}    columns[i].color  列颜色
 *
 * @param {Array}   data              数据
 * @param {Object}  OPT               其他打印选项
 */
print.table = yuan.overload.Function(
	[
		Array,
		function(data) {
			return print.table(data, {});
		}
	],

	[
		Array,
		Object,
		function(data, OPT) {
			var keys = [];
			data.forEach(function(item) {
				keys = keys.concat(Object.keys(item));
			});
			keys = yuan.array.uniq(keys.sort());

			var columns = [];
			keys.forEach(function(key) {
				columns.push({ name : key });
			})
			return print.table(columns, data, OPT);
		}
	],

	function(/*Array*/ columns, /*Array[JSON]*/ data, /*Object*/ OPT) {
		// 参数规范化：选项默认值。
		OPT = yuan.object.extend({
			hideHeader: false
		}, OPT);

		// 参数规范化：将所有字段格式一律转化为字符串。
		var newdata = [];
		data.forEach(function(item) {
			var newitem = {};
			columns.forEach(function(column) {
				if (column.formatter) {
					newitem[column.name] = column.formatter(item[column.name]);
				}
				else {
					newitem[column.name] = item[column.name] + '';
				}
			});
			newdata.push(newitem);
		});
		data = newdata;

		// 参数规范化：将列的默认宽度设置为该列文本最大长度。
		columns.forEach(function(column) {
			if (typeof column.width == 'undefined') {
				var L = OPT.hideHeader
					? 0
					: yuan.string.getDisplayWidth(yuan.ifEmpty(column.title, column.name))
					;
				data.forEach(function(item) {
					L = Math.max(L, yuan.string.getDisplayWidth(item[column.name]))
				});
				column.width = L;
			}
		});

		// 内部函数：格式化单元格。
		var _format = function(column, value) {
			var
				text = value.substr(0, column.width),
				space = yuan.Char.space(column.width - yuan.string.getDisplayWidth(text))
				;
			if (column.align == 'right') {
				text = space + text;
			}
			else {
				text += space;
			}

			if (column.color) {
				text = colors[column.color](text);
			}

			return text;
		};

		// 内部函数：输出表格行。
		var _out_line = function(line) {
			var INDENT = '  ', SPACE = '  ';
			_out(INDENT + line.join(SPACE))
		};

		var changePauseOnScreen = !_pauseOnScreen;
		if (changePauseOnScreen) print.pauseOnScreen(true);

		// 输出表前空行。
		_out();

		// 输出表头。
		if (!OPT.hideHeader) {
			var line1 = [], line2 = [], text;
			columns.forEach(function(column) {
				text = yuan.ifEmpty(column.title, column.name);
				line1.push(_format(column, text));
				line2.push(_format(column, yuan.string.repeat('-', column.width)));
			});
			// 输出表头行。
			_out_line(line1);
			// 输出分隔线行。
			_out_line(line2);
		}

		// 逐行输出。
		var line;
		data.forEach(function(item) {
			line = [];
			columns.forEach(function(column) {
				line.push(_format(column, item[column.name]));
			})
			_out_line(line);
		});

		// 输出表尾空行。
		_out();

		if (changePauseOnScreen) print.pauseOnScreen(false);

		return print;
	}
);

print.text = function(text) {
	_outext(text);
	return print;
};

print.TOL = function() {
	if (_currentLine.length > _indent.size()) {
		print.br();
	}
	return print;
};

print.ul = function(/*Array(String)*/ lines, OPT) {
	OPT = yuan.object.extend({
		vspace: true,
		formatter: null,
		vspace: true
	}, OPT);
	lines.forEach(function(line, index) {
		// 自第二项起，每项前添加一个空行。
		if (index && OPT.vspace) {
			if (OPT.vspace) print.spaceline();
			else print.br();
		}

		// 输出项编号。
		_outext('*', 'gray');

		// 设置悬挂缩进（4 * 空格）
		_indent.set(4);

		if (OPT.formatter) OPT.formatter(line);
		else print.markup(line);

		// 恢复缩进
		_indent.set(0);
	});
	return print;
};

print.warning = function(text) {
	print.TOL();
	_out(text, [ 'yellow', 'bold' ]);
	return print;
};
print.warn = print.warning;

print.warnInline = function(text) {
	_outext(text, [ 'yellow', 'bold' ]);
	return print;
};

module.exports = print;
