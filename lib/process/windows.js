var
	  child_process = require('child_process')
	, yuan = require('yuan')
	;

var subcommand = {

	getPIDs: function(OPT) {
		var PIDs = [];
		var cmdline = yuan.string.format('netstat -ano | findstr :%s', OPT.port);
		try {
			var output = child_process.execSync(cmdline);
			var lines = output.toString().split('\r\n');
			lines.forEach(function(line) {
				if (line == '') return;
				var parts = line.trim().split(/\s+/);
				if (yuan.string.endsWith(parts[1], ':' + OPT.port)) {
					PIDs.push(parts[4]);
				}
			});
		}
		catch (ex) {
			// 如果命令输出为空，execSync 将抛出 checkExecSyncError 错误。
			// 这是 NodeJS 的特点，与操作系统无关。
		}

		return yuan.array.uniq(PIDs);
	},

	kill: function(pid) {
		var cmdline = yuan.string.format('taskkill /pid %s /f', pid);
		try {
			child_process.execSync(cmdline);
		}
		catch (ex) {
			// DO NOTHING.
		}
	}

};

module.exports = subcommand;
