#!/usr/bin/env node
'use strict';
var logSymbols = require('log-symbols');
var pkg = require('./package.json');
var npmName = require('./index');
var argv = process.argv.slice(2);
var input = argv[0];

function help() {
	console.log([
		'',
		'  ' + pkg.description,
		'',
		'  Usage',
		'    npm-name <name>',
		'',
		'  Exits with code 0 when the name is available or 2 when taken'
	].join('\n'));
}

if (argv.indexOf('--help') !== -1) {
	help();
	return;
}

if (argv.indexOf('--version') !== -1) {
	console.log(pkg.version);
	return;
}

npmName(input, function (err, available) {
	if (err) {
		console.error(err);
		process.exit(1);
		return;
	}

	console.log(available ? logSymbols.success + ' Available' : logSymbols.error + ' Unavailable');
	process.exit(available ? 0 : 2);
});
