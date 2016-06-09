var core = require('../core');
var name = core.getOS().commonName;
module.exports = require('./' + name);
