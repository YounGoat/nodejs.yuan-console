/**
 * @author youngoat@163.com
 * (c) 2013-2015
 *
 * 注释说明：
 * @standard 表示此段代码遵从业界标准逻辑。
 */

'use strict';

var underscore = require('underscore');
var core = require('./lib/core');
var ME = {
	VERSION : '0.1.0',
	choose  : require('./lib/choose' ),
	env     : require('./lib/env'    ),
	fprint  : require('./lib/fprint' ),
	fs      : require('./lib/fs'     ),
	java    : require('./lib/java'   ),
	sleep   : require('./lib/sleep'  ),
	net     : require('./lib/net'    ),
	netstat : require('./lib/netstat'),
	os      : require('./lib/os'     ),
	path    : require('./lib/path'   ),
	print   : require('./lib/print'  ),
	process : require('./lib/process'),
	read    : require('./lib/read'   ),
	run     : require('./lib/run'    ),
	stdout  : require('./lib/stdout' ),

	UI      : require('./UI/'        )
};

module.exports = underscore.extendOwn(ME, core);
