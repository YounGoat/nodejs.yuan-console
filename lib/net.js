var fs = require('fs');
var path = require('path');
var url = require('url');

var thunkify = require('thunkify');
var yuan = require('yuan');

var _fs = require('./fs');

var net = {};

/**
 * 通过网络下载文件到本地。
 * @param {String}   urlname    远程网络地址
 * @param {String}   pathname   本地文件路径或目录路径（自适应判断）
 */
// net.downloadThunk = thunkify(function(urlname, pathname, callback) {
//	var request = require('request');
// 	request(urlname, function(error, response, body) {
// 		var ex = null;
// 		if (error) {
// 			ex = error;
// 		}
// 		else if (response.statusCode != 200) {
// 			ex = 'Failed to request: ' + urlname
// 				+ '[' + response.statusCode + ': ' + response.statusMessage + ']';
// 		}
// 		else {
// 			var dst;

// 			// 如果提供的本地路径是一个目录，则将文件下载到该目录下，并以 URL 中路径的最后一部分命名。
// 			if (_fs.isDir(pathname)) {
// 				dst = path.join(pathname, path.basename(url.parse(urlname).pathname));
// 			}

// 			// 否则，则将本地路径作为文件名。
// 			else {

// 				// 创建所属目录。
// 				var parent = path.resolve(pathname, '..');
// 				_fs.mkdirp(parent);

// 				dst = pathname;
// 			}

// 			fs.writeFileSync(dst, body);
// 		}
// 		callback(ex);
// 	});
// });

net.downloadAsync = function foo(urlname, pathname, OPT, callback) {
	var Download = require('download');
	var DEFs = [
		[
			String,
			String,
			Function,
			function(urlname, pathname, callback) {
				foo(urlname, pathname, {}, callback);
			}
		],

		function (urlname, pathname, OPT, callback) {
			OPT = yuan.object.extend({
				extract: false
			}, OPT);

			new Download({ mode : '777', extract : OPT.extract })
				.get(urlname)
				.dest(pathname)
				.run(function() {
					callback();
				});
		}
	];
	return yuan.overload.run(DEFs, arguments);	
};

net.downloadThunk = thunkify(net.downloadAsync);

module.exports = net;