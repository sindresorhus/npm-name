'use strict';
var got = require('got');
var registryUrl = require('registry-url');

module.exports = function (name, cb) {
	registryUrl(function (err, url) {
		got(url + encodeURIComponent(name), {method: 'HEAD'}, function (err) {
			if (err === 404) {
				cb(null, true);
				return;
			}

			if (err) {
				cb(err);
				return;
			}

			cb(null, false);
		});
	});
};
