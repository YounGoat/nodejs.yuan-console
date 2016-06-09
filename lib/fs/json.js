var
	  fs = require('fs')
	, path = require('path')
	, yuan = require('yuan')
	, core = require('./../core')
	;

var json = function(pathname, OPT) {
	var data = pathname && fs.existsSync(pathname) ? require(pathname) : {};

	return {
		root: data,

		clear: function() {
			for (var key in data) {
				delete data[key];
			}
		},

		save: function() {
			core.mkdirp(path.dirname(pathname));
			fs.writeFileSync(pathname, JSON.stringify(data, null, 4));
		},

		saveAs: function(pathname) {
			core.mkdirp(path.dirname(pathname));
			fs.writeFileSync(pathname, JSON.stringify(data, null, 4));
		}
	}
};

json.load = json.bind(null);

json.saveAs = function(json, pathname) {
	core.mkdirp(path.dirname(pathname));
	fs.writeFileSync(pathname, JSON.stringify(json, null, 4));
};

module.exports = json;
