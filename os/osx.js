var macosx = {};

macosx.getTermProgram = function() {
	var name = process.env.TERM_PROGRAM;
	if (!name.match(/\.app$/)) {
		name = 'Terminal';
	}
	return name;
};

module.exports = macosx;
