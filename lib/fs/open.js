var child_process = require('child_process');
var os = require('os');

module.exports = function(pathname, mime) {
	if (os.type() == 'Windows_NT') {
		child_process.exec('explorer "' + pathname + '"');
	}
	else if (os.type() == 'Darwin') {
		child_process.exec('open "' + pathname + '"');
	}
};
