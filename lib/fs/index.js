var
	  fs = require('fs')
	, path = require('path')
	, yuan = require('yuan')
	;

var myfs = {};

myfs.copy = function(src, dest, OPT) {
	myfs.mkdirp(path.dirname(dest));

	// // 创建一个只读流。
	// var rs = fs.createReadStream(src);

	// // 创建一个只写流。
	// var ws = fs.createWriteStream(dest);

	// rs.pipe(ws);

	var fdSrc = fs.openSync(src, 'r');
	var fdDest = fs.openSync(dest, 'w');

	var BUFSIZE = 4096;
	var buf = new Buffer(BUFSIZE);
	var size;
	do {
		size = fs.readSync(fdSrc, buf, 0, BUFSIZE);
		fs.writeSync(fdDest, buf, 0, size);
	} while (size == BUFSIZE)

	fs.closeSync(fdSrc);
	fs.closeSync(fdDest);
};

myfs.distillDir = function foo() {
	return yuan.overload.run([
		[
			String,
			String,
			function(src, dst) {
				return foo(src, dst, false);
			}
		],

		[
			String,
			Boolean,
			function(src, removeSrc) {
				return foo(src, path.resolve(src, '..'), removeSrc);
			}
		],

		[
			String,
			String,
			Boolean,
			function(src, dst, removeSrc) {
				fs.readdirSync(src).forEach(function(itemName) {
					fs.renameSync(path.join(src, itemName), path.join(dst, itemName));
				});

				if (removeSrc) fs.rmdir(src);
			}
		]
	], arguments);
};

myfs.edit = require('./edit');

myfs.isDir = function(pathname) {
	var ret = false;
	if (fs.existsSync(pathname)) {
		var stats = fs.statSync(pathname);
		ret = stats.isDirectory();
	}
	return ret;
};

myfs.isEmptyDir = function(pathname) {
	var empty = false;
	if (myfs.isDir(pathname)) {
		empty = (fs.readdirSync(pathname).length == 0);
	}
	return empty;
};

// 递归创建目录，即如果目录的上级目录不存在，则递归创建之。
myfs.mkdirp = function foo(dirpath) {

	// 如果目录已经存在，则什么都不需要做。
	if (!fs.existsSync(dirpath)) {

		// 如果上一级目录不存在，则递归创建之。
		var parent = path.resolve(dirpath, '..');
		if (!fs.existsSync(parent)) foo(parent);

		// 创建目录。
		fs.mkdirSync(dirpath);
	}
};

myfs.open = require('./open');

// 强制删除指定路径下的全部内容。
myfs.rmfr = function foo(pathname) {
	if (fs.existsSync(pathname)) {
		if (myfs.isDir(pathname)) {
			// 删除目录内容。
			fs.readdirSync(pathname).forEach(function(filename) {
				foo(path.join(pathname, filename));
			})

			// 删除目录。
			fs.rmdirSync(pathname);
		}
		else {
			// 删除文件。
			fs.unlinkSync(pathname);
		}
	}
};

myfs.rmdirp = function foo(pathname) {
	if (myfs.isDir(pathname) && fs.readdirSync(pathname).length == 0) {
		fs.rmdirSync(pathname);
		foo(path.resolve(pathname, '..'));
	}
};

myfs.traverse = function(pathname, fn) {
	var items = fs.readdirSync(pathname);
	items.forEach(function(item) {
		fn(path.join(pathname, item));
	});
};

// myfs.unzip = function(zip, dest) {
//
// };

myfs.xml = require('./xml');
myfs.json = require('./json');

module.exports = myfs;
