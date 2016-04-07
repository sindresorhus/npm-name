'use strict';
var got = require('got');
var registryUrl = require('registry-url')();
var Promise = require('pinkie-promise');

module.exports = function (name) {
	if (!(typeof name === 'string' && name.length !== 0)) {
		return Promise.reject(new Error('Package name required'));
	}

	return makeRequest(name);
};

module.exports.many = function (names) {
	if (!Array.isArray(names)) {
		return Promise.reject(new Error('You must pass an array'));
	}

	return Promise.all(names.map(makeRequest));
};

function makeRequest(name) {
	return got.head(registryUrl + name.toLowerCase()).then(function () {
		return false;
	}).catch(function (err) {
		if (err.statusCode === 404) {
			return true;
		}

		throw err;
	});
}
