var fs = require('fs');
var path = require('path');
var yuan = require('yuan');

var core = require('./core');

var java = {};

java.isReady = function() {
	return !!process.env.JAVA_HOME;
};

java.init = yuan.fn.once(function() {

	if (!java.isReady()) {

		var envs = {};

		// Apple Mac OS X
		if (core.isOS('mac')) {
			// What to do ? e.g.
			// JAVA_HOME=Library/Java/JavaVirtualMachines/jdk1.8.0_25.jdk/Contents/Home

			var ready = false;

			if (!ready) {	
				var pathname = '/Library/Java/JavaVirtualMachines/';
				if (fs.existsSync(pathname)) {
					var reJDK = /^jdk[\d\._]+\.jdk$/;
					yuan.array.untilOn(fs.readdirSync(pathname), function(name) {
						var homepath = path.join(pathname, name, 'Contents', 'Home');
						if (reJDK.test(name) && fs.existsSync(homepath)) {
							envs.JAVA_HOME = homepath;
							return ready = true;
						}
					});
				}
			}

			if (!ready) {
				var pathname = '/Library/Java/Home';
				if (fs.existsSync(pathname)) {
					envs.JAVA_HOME = pathname;
					ready = true;
				}
			}

			if (!ready) {
				var pathname = '/System/Library/Frameworks/JavaVM.framework/Home';
				if (fs.existsSync(pathname)) {
					evns.JAVA_HOME = pathname;
					ready = true;
				}
			}
		}

		// Microsoft Windows
		else if (core.isOS('windows')) {
			// What to do ? e.g.
			// JAVA_HOME=c:\Program Files (x86)\Java\jre7\

			var env = process.env, ready = false;

			if (!ready) {
				var pathname = core.ifNotExists(
					  env['ProgramFiles(x86)']
					, path.join(env['SystemDrive'], 'Program Files (x86)')
					, path.join(env['SystemDrive'], 'Program Files')
					);
				
				if (pathname) pathname = path.join(pathname, 'Java');
				
				if (pathname && fs.existsSync(pathname)) {
					var items = fs.readdirSync(pathname);
					var reJre = /^jre(\d+)$/;
					for (var i = 0, item; item = items[i]; i++) {
						if (reJre.test(item)) {
							// version = RegExp.$1;
							envs.JAVA_HOME = path.join(pathname, item);
							break;
						}
					}
				}
			}
		}

		yuan.object.extendOwn(process.env, envs);
	}

	return java.isReady();
});

module.exports = java;