'use strict';
var got = require('got');
var registryUrl = require('registry-url')();

module.exports = function (name, cb) {
	if (!(typeof name === 'string' && name.length !== 0)) {
		throw new Error('Package name required');
	}

	got.head(registryUrl + name.toLowerCase(), function (err) {
		if (err && err.code === 404) {
			cb(null, true);
			return;
		}

		if (err) {
			cb(err);
			return;
		}

		cb(null, false);
	});
};
