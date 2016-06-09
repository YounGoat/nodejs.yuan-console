var yuan = require('yuan');

var _print = require('./print');
var _read = require('./read');

var choose = {};

/**
 * @param {String}   OPT.options
 * @param {String}   OPT.formatter
 * @param {String}   OPT.title
 * @param {Boolean}  OPT.allowEmpty
 */
choose.one = function(/*Object*/ OPT) {
	OPT = yuan.object.extend({
		allowEmpty: true
	}, OPT);

	var max = OPT.options.length;
	var formatter = OPT.formatter ? OPT.formatter : function(option) { return option.toString(); };
	var numberFormat = yuan.string.repeat('0', max.toString().length);
	var title = yuan.ifEmpty(OPT.title, '');

	_print.TOL();
	OPT.options.forEach(function(option, index) {
		_print
			.text('[')
			.number(index+1, numberFormat)
			.text(']')
			.space()
			.text(formatter(option))
			.br()
			;
	});

	var options = {
		prompt: '请选择' + title + (OPT.allowEmpty ? ' [ 输入序号 | 0, ENTER = 退出选择 ]' : ' [ 输入序号 ]'),
		validator: function(answer) {
			return answer == '' || answer.match(/^\d+$/) && parseInt(answer) <= max;
		},
		allowEmpty: OPT.allowEmpty,
		warner: '非法序号，请重新输入！'
	};
	var answer = _read(options);
	_print.br();
	answer = answer ? parseInt(answer) : 0;
	return OPT.options[answer-1];
};

module.exports = choose;
