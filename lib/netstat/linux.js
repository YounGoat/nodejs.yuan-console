var
	  child_process = require('child_process')
	, yuan = require('yuan')
	;

var subcommand = {};

subcommand.isPortInUse = function(port) {
	var inuse = false;
	var cmdline = yuan.string.format("netstat -tnlp | awk '{print $4;}' | grep ':%s$'", port);
	try {
		var output = child_process.execSync(cmdline);
		inuse = !!output.length;
	} catch (e) {
		// 如果命令输出为空，execSync 将抛出 checkExecSyncError 错误。
		// 这是 NodeJS 的特点，与操作系统无关。
	}
	return inuse;
};

module.exports = subcommand;
