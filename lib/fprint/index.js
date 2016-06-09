var fs = require('fs');

var fprint = {};

var files = fs.readdirSync(__dirname);
var reJs = /^(.+)\.js$/;
files.forEach(function(name) {
	if (name != __filename && reJs.test(name)) {
		name = RegExp.$1;
		fprint[name] = require('./' + name);
	}
});

module.exports = fprint;