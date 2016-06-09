var
	  child_process = require('child_process')
	, yuan = require('yuan')
	;

var subcommand = {

	getPIDs: function(OPT) {
		var PIDs = [];
		var cmdline = yuan.string.format("netstat -tnlp | grep ':%s\s' | awk '{print $7;}' | awk -F/ '{print $1;}'", OPT.port);
		try {
			var output = child_process.execSync(cmdline);
			var lines = output.toString().split(/\r|\n/);
			PIDs = yuan.array.without(lines, '');
		} catch (ex) {
			// 如果命令输出为空，execSync 将抛出 checkExecSyncError 错误。
			// 这是 NodeJS 的特点，与操作系统无关。
			console.log(ex);
		}
		return yuan.array.uniq(PIDs);
	},

	kill: function(pid) {
		var cmdline = yuan.string.format('kill %s', pid);
		try {
			child_process.execSync(cmdline);
		}
		catch(ex) {
			// DO NOTHING.
		}
	}

};

module.exports = subcommand;
