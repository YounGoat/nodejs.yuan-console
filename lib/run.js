var
	  child_process = require('child_process')
	, os            = require('os')
	, yuan          = require('yuan')
	, _core         = require('./core')
	, _print        = require('./print')
	;

var run = function(cmdline, OPT) {
	OPT = yuan.object.extend({
		// Whether to print the command's output to STDOUT.
		// 是否在标准输出设备上打印命令输出。
		echo            : true,

		// Whether to print seperators before and after command running. ONLY effective when OPT.echo is true.
		// 是否在命令开始前和结束后打印分隔符。仅当 OPT.echo 选项为真时有效。
		echoSeparator   : false,

		// Current Working Directory
		// 当前工作目录
		cwd             : undefined,

		echoOnError     : _core.debug()

	}, OPT);

	// 前台命令，使用内置的子进程函数直接执行。
	var options = { cwd : OPT.cwd };
	var separator = [
		'-- system command start ' + yuan.string.repeat('-', process.stdout.columns - 24),
		'-- system command end --' + yuan.string.repeat('-', process.stdout.columns - 24)];
	var response;

	if (OPT.echo) {
		options.stdio = [ null, process.stdout ];
		_print.indent('push').indent(0).TOL();
		if (OPT.echoSeparator) _print.dim(separator[0]).br();
	}
	else {
		options.stdio = [ null, null, null ];
	}

	try {
		response = child_process.execSync(cmdline, options);
		run.exitCode = 0;
	}
	catch (ex) {
		if (OPT.echo || OPT.echoOnError) {
			_print.warning('COMMAND EXECUTION FAILED. By YC.RUN');
		}
		if (OPT.echoOnError) {
			_print.code(ex.stderr.toString('utf-8')) ;
		}
		run.exitCode = 1;
		run.exitMessage = ex.message;
	}

	if (OPT.echo) {
		_print.TOL();
		if (OPT.echoSeparator) _print.dim(separator[1]).br();
		_print.indent('pop');
	}

	if (!OPT.echo) return response ? response.toString('utf-8') : '';
};

run.andResponse = function (cmdline, OPT) {
	OPT = yuan.object.extend(OPT, { echo: false });
	return run(cmdline, OPT);
}

// To run the command in background.
// 在后台运行命令。
run.inBackground = function(cmdline, OPT) {
	var p = child_process.exec(cmdline);
	run.exitCode = null;
	return p;
};

// To run the command in a new terminal window.
// 在新窗口中运行命令。
run.inNewWindow = function(cmdline, OPT) {
	// Apple MacOSX
	if (_core.isOS('mac')) {
		cmdline = cmdline.replace(/"/g, '\\"');

		// @TODO How to replace Terminal with other terminal apps like iTerm?
		cmdline = yuan.string.format('osascript -e \'tell application "Terminal" to do script "%s"\'', cmdline);
		child_process.exec(cmdline);
	}

	// Microsoft Windows
	else if (_core.isOS('windows')) {
		cmdline = 'START ' + cmdline;
		child_process.exec(cmdline);
	}

	run.exitCode = null;
};

module.exports = run;
