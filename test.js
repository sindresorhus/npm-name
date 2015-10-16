'use strict';
var assert = require('assert');
var npmName = require('./');

it('should return true when package name is available', function (cb) {
	npmName('asdasfgrgafadsgaf').then(function (available) {
		assert(available);
		cb();
	});
});

it('should return false when package name is taken', function (cb) {
	npmName('chalk').then(function (available) {
		assert(!available);
		cb();
	});
});
