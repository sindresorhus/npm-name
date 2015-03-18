#!/usr/bin/env node
'use strict';
var logSymbols = require('log-symbols');
var meow = require('meow');
var npmName = require('./');

var cli = meow({
	help: [
		'Usage',
		'  npm-name <name>',
		'',
		'Exits with code 0 when the name is available or 2 when taken'
	].join('\n')
});

if (!cli.input[0]) {
	console.error('`name` required');
	process.exit(1);
}

npmName(cli.input[0], function (err, available) {
	if (err) {
		console.error(err);
		process.exit(1);
	}

	console.log(available ? logSymbols.success + ' Available' : logSymbols.error + ' Unavailable');
	process.exit(available ? 0 : 2);
});
