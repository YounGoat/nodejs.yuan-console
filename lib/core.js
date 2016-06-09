var
	  child_process = require('child_process')
	, fs = require('fs')
	, os = require('os')
	, path = require('path')
	, yuan = require('yuan')
	;

var core = {};

core.clear = (function() {
	var first = true;
	return function() {
		if (first) {
			console.log(yuan.string.repeat('\n', 100));
		}
		first = false;
		process.stdout.write('\033[2J\033[0;0H');
	};
})();

core.debug = (function () {
	var _status = false;
	return function (status) {
		if (arguments.length) _status = !!status;
		return _status;
	};
})();

core.entitle = function(title) {
	process.title = title;
	if (core.isOS('mac')) {
		process.stdout.write("\033]0;" + title + "\007");
	}
};

core.isOS = yuan.overload.Function(
	[
		yuan.overload.Type.Enum('mac', 'windows', 'linux'),
		function(name) {
			var type = os.type(), ret = undefined;
			ret =
				   (name == 'mac' && type == 'Darwin')
				|| (name == 'windows' && type == 'Windows_NT')
				|| (name == 'linux' && type == '?')
				;
			return ret;
		}
	],

	[
		Object,
		function(OPT) {
			// @TODO
		}
	]
);

core.getOS = function() {
	var info = {};

	var ostype = os.type();
	if (ostype == 'Darwin') {
		info.commonName = 'mac';
	}
	else if (ostype == 'Windows_NT') {
		info.commonName = 'windows';
	}
	else if (ostype == 'Linux') {
		info.commonName = 'linux';
	}

	return info;
};

core.ifNotExists = function() {
	for (var i = 0, args = arguments; i < args.length - 1; i++) if (args[i] && fs.existsSync(args[i].toString())) return args[i];
	return args[i];
};

core.mkdirp = function foo(dirpath) {

	// 如果目录已经存在，则什么都不需要做。
	if (!fs.existsSync(dirpath)) {

		// 如果上一级目录不存在，则递归创建之。
		var parent = path.resolve(dirpath, '..');
		if (!fs.existsSync(parent)) foo(parent);

		// 创建目录。
		fs.mkdirSync(dirpath);
	}
};

// To make it easier to understand, method 'explorer' was renamed 'start'.
core.start = function(url) {
	var cmdnames = {
		'mac' : 'open',
		'windows' : 'START'
	};
	var osinfo = core.getOS();
	var cmdname = cmdnames[osinfo.commonName];
	var command = yuan.string.format('%s "%s"', cmdname, url);
	if (cmdname) child_process.exec(command);
};
core.open = core.start;
core.explorer = core.start;

core.terminal = function(path) {
	if (core.isOS('windows')) {
		var cmdline = path
			? yuan.string.format('START CMD /K "CD /D %s"', path)
			: 'START CMD'
			;
		child_process.exec(cmdline);
	}

	else if (core.isOS('mac')) {
		var macosx = require('../os/osx');
		var cmdline = yuan.string.format('open -a  %s %s', macosx.getTermProgram(), path);
		child_process.exec(cmdline);
	}
};

module.exports = core;
