var 
	  path = require('path')
	, yuan = require('yuan')
	, core = require('./core')
	;

var myOS = function() {
	return core.getOS();
};

myOS.isMac = function() {
	return core.isOS('mac');
};

myOS.isWindows = function() {
	return core.isOS('windows');
};

myOS.isLinux = function() {
	return core.isOS('linux');
};

myOS.homepath = function() {
	if (myOS.isWindows()) {
		return path.join(process.env.HOMEDRIVE, process.env.HOMEPATH);
	}

	if (myOS.isMac()) {
		return process.env.HOME;
	}
};

module.exports = myOS;
