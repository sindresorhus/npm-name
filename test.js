'use strict';
var assert = require('assert');
var npmName = require('./index');

it('should return true when package name is available', function (cb) {
	npmName('asdasfgrgafadsgaf', function (err, available) {
		assert(!err, err);
		assert(available);
		cb();
	});
});

it('should return false when package name is taken', function (cb) {
	npmName('jquery', function (err, available) {
		assert(!err, err);
		assert(!available);
		cb();
	});
});
