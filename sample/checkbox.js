var yuancon = require('../index');

var options = [
	{ name: 'Jack', gender: 'male' },
	{ name: 'Mary', gender: 'female' },
	{ name: 'Eric', gender: 'male' },
	{ name: 'Jack', gender: 'male' },
	{ name: 'Mary', gender: 'female' },
	{ name: 'Eric', gender: 'male' },
	{ name: 'Jack', gender: 'male' },
	{ name: 'Mary', gender: 'female' },
	{ name: 'Eric', gender: 'male' },
	{ name: 'Jack', gender: 'male' },
	{ name: 'Mary', gender: 'female' },
	{ name: 'Eric', gender: 'male' },
	{ name: 'Jack', gender: 'male' },
	{ name: 'Mary', gender: 'female' },
	{ name: 'Eric', gender: 'male' },
	{ name: 'Jack', gender: 'male' },
	{ name: 'Mary', gender: 'female' },
	{ name: 'Eric', gender: 'male' },
	{ name: 'Jack', gender: 'male' },
	{ name: 'Mary', gender: 'female' },
	{ name: 'Eric', gender: 'male' },
	{ name: 'Jack', gender: 'male' },
	{ name: 'Mary', gender: 'female' },
	{ name: 'Eric', gender: 'male' },
	{ name: 'Jack', gender: 'male' },
	{ name: 'Mary', gender: 'female' },
	{ name: 'Eric', gender: 'male' },
	{ name: 'Jack', gender: 'male' },
	{ name: 'Mary', gender: 'female' },
	{ name: 'Eric', gender: 'male' },
	{ name: 'Jack', gender: 'male' },
	{ name: 'Mary', gender: 'female' },
	{ name: 'Eric', gender: 'male' },
	{ name: 'Jack', gender: 'male' },
	{ name: 'Mary', gender: 'female' },
	{ name: 'Eric', gender: 'male' },
	{ name: 'Jack', gender: 'male' },
	{ name: 'Mary', gender: 'female' },
	{ name: 'Eric', gender: 'male' },
	{ name: 'Jack', gender: 'male' },
	{ name: 'Mary', gender: 'female' },
	{ name: 'Eric', gender: 'male' },
	{ name: 'Jack', gender: 'male' },
	{ name: 'Mary', gender: 'female' },
	{ name: 'Eric', gender: 'male' },
	{ name: 'Jack', gender: 'male' },
	{ name: 'Mary', gender: 'female' },
	{ name: 'Eric', gender: 'male' },
	{ name: 'Jack', gender: 'male' },
	{ name: 'Mary', gender: 'female' },
	{ name: 'Eric', gender: 'male' },
	{ name: 'Jack', gender: 'male' },
	{ name: 'Mary', gender: 'female' },
	{ name: 'Eric', gender: 'male' },
	{ name: 'Bill', gender: 'male' }
];
console.log(1);
console.log(2);
console.log(3);
var cg = new yuancon.UI.CheckboxGroup({
	options: options
});
cg.on('close', function(options, indexes) {
	console.log(options);
	console.log(indexes);
})
cg.display();
