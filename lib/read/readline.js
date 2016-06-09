// What happen on raw mode?
// 1. Auto-echo on stdout will be disabled.
// 2. Data will be piped out char by char, instead of line by line.

process.on('SIGINT', function () {
	process.exit(1);
});

process.stdin.on('data', function (buf) {
	process.stdout.write(buf);
	process.exit(0);
});
