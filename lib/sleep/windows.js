var child_process = require('child_process');

function sleep(millseconds) {
	try {
		child_process.execSync('PAUSE', {
			stdio: [ process.stdin ],
			timeout: millseconds
		});
	} catch (e) {
		// DO NOTHING.
	}
}

module.exports = sleep;
