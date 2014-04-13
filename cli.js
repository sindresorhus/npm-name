#!/usr/bin/env node
'use strict';
var pkg = require('./package.json');
var npmName = require('./index');
var input = process.argv[2];

function help() {
	console.log(pkg.description);
	console.log('');
	console.log('Usage');
	console.log('  $ npm-name <name>');
	console.log('');
	console.log('Exits with code 0 when the name is available or 2 when taken');
}

if (!input || process.argv.indexOf('-h') !== -1 || process.argv.indexOf('--help') !== -1) {
	help();
	return;
}

if (process.argv.indexOf('-v') !== -1 || process.argv.indexOf('--version') !== -1) {
	console.log(pkg.version);
	return;
}

npmName(input, function (err, available) {
	if (err) {
		console.error(err);
		process.exit(1);
		return;
	}

	console.log(available ? 'Available' : 'Taken');
	process.exit(available ? 0 : 2);
});
