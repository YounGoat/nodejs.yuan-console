var MODULE_REQUIRE
	  yuan = require('yuan')
	;

var RE_CTRL = /\u001b\[[^m]+m/g;

var S = {};

S.countLines = function(s) {
	return s.split(/[\r\n]+/).length;
};

S.getDisplayWidth = function(s) {
	var lines = s.split(/[\r\n]+/);
	var ns = [];
	lines.forEach(function(line) {
		line = line.replace(RE_CTRL, '');
		ns.push(yuan.string.getDisplayWidth(line));
	});
	return Math.max.apply(Math, ns);
};

S.splitIntoLines = function(str, maxWidth) {
	if (maxWidth) {
		var	VARS
			, lines = []
			, cursor = 0
			, shift = function() { return str.charAt(cursor++); }
			, next = function() { return str.charAt(cursor); }
			, rest = function() { return str.substr(cursor); }
			, c
			, line = ''
			, status
			, lineWidth = 0
			;

		var newline = function() {
			lines.push(line);
			lineWidth = 0;
			line = '';
			status = '';
		};

		do {
			c = shift();
			if (status == 'CTRL') {
				line += c;
				if (c == 'm') status = '';
			}
			else {
				if (c == '\u001b' && next() == '[') {
					status = 'CTRL';
					line += c;
				}
				else if (c == '\n') {
					newline();
				}
				else if (c == '\r') {
					// DO NOTHING.
				}
				else {
					lineWidth += yuan.string.getDisplayWidth(c);
					if (lineWidth >= maxWidth) newline();
					line += c;
				}
			}
		} while (c)
		lines.push(line);
		return lines;
	}
	else {
		return s.split(/[\r\n]+/);
	}
};

module.exports = S;
