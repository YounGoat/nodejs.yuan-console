var
 	  path = require('path')
	, yuan = require('yuan')
	;

var env = {};

env.splitPath = function(pathvalue) {
	if (!pathvalue) return [];
	else {
		var paths = pathvalue.split(path.delimiter);
		return  yuan.array.excludeOn(paths, function(item) {
			return item.match(/\s*/);
		});
	}
};

module.exports = env;
