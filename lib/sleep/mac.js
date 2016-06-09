var child_process = require('child_process');

function sleep(millseconds) {
	try {
		child_process.execSync('sleep 9999', { timeout: millseconds });
	} catch (e) {
		// DO NOTHING.
	}
}

module.exports = sleep;
