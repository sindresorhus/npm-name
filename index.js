'use strict';
const got = require('got');
const isScoped = require('is-scoped');
const registryUrl = require('registry-url')();
const zip = require('lodash.zip');
const validate = require('validate-npm-package-name');

class InvalidNameError extends Error {}

function request(name) {
	const isValid = validate(name);
	if (!isValid.validForNewPackages) {
		const notices = [...isValid.warnings || [], ...isValid.errors || []].map(v => `- ${v}`);
		notices.unshift(`Invalid package name: ${name}`);
		const err = new InvalidNameError(notices.join('\n'));
		err.warnings = isValid.warnings;
		err.errors = isValid.errors;
		return Promise.reject(err);
	}

	const isScopedRepo = isScoped(name);
	if (isScopedRepo) {
		name = name.replace(/\//g, '%2f');
	}

	return got.head(registryUrl + name.toLowerCase().replace(/[-_.]/g, ''), {timeout: 10000})
		.then(() => false)
		.catch(err => {
			if (err.statusCode === 404) {
				return true;
			}

			if (isScopedRepo && err.statusCode === 401) {
				return true;
			}

			throw err;
		});
}

module.exports = name => {
	if (!(typeof name === 'string' && name.length !== 0)) {
		return Promise.reject(new Error('Package name required'));
	}

	return request(name);
};

module.exports.many = names => {
	if (!Array.isArray(names)) {
		return Promise.reject(new TypeError(`Expected an array, got ${typeof names}`));
	}

	return Promise.all(names.map(request))
		.then(result => new Map(zip(names, result)));
};

module.exports.InvalidNameError = InvalidNameError;
