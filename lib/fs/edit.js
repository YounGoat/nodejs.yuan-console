var child_process = require('child_process');
var os = require('os');

module.exports = function(pathname, mime) {
	if (os.type() == 'Windows_NT') {
		child_process.exec('notepad "' + pathname + '"');
	}
	else if (os.type() == 'Darwin') {
		child_process.exec('open -a /Applications/TextEdit.app "' + pathname + '"');
	}
};
