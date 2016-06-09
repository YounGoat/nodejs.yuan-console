var fs = require('fs');

var xml = function(pathname, OPT) {
	var xmldom = require('xmldom');

	var xmlString = fs.readFileSync(pathname).toString();
	var dom = (new xmldom.DOMParser).parseFromString(xmlString);
	return {
		dom : dom,

		save: function() {
			xmlString = (new xmldom.XMLSerializer).serializeToString(dom);
			fs.writeFileSync(pathname, xmlString);
		},

		saveAs: function(pathname) {
			xmlString = (new xmldom.XMLSerializer).serializeToString(dom);
			fs.writeFileSync(pathname, xmlString);
		}
	}
};

xml.load = xml.bind(null);

module.exports = xml;