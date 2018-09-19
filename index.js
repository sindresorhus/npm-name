'use strict';
const got = require('got');
const isScoped = require('is-scoped');
const registryUrl = require('registry-url')();
const zip = require('lodash.zip');
const validate = require('validate-npm-package-name');

class InvalidNameError extends Error {}

const request = async name => {
	const isValid = validate(name);
	if (!isValid.validForNewPackages) {
		const notices = [...isValid.warnings || [], ...isValid.errors || []].map(v => `- ${v}`);
		notices.unshift(`Invalid package name: ${name}`);
		const error = new InvalidNameError(notices.join('\n'));
		error.warnings = isValid.warnings;
		error.errors = isValid.errors;
		throw error;
	}

	const isScopedPackage = isScoped(name);
	if (isScopedPackage) {
		name = name.replace(/\//g, '%2f');
	}

	try {
		await got.head(registryUrl + name.toLowerCase(), {timeout: 10000});
		return false;
	} catch (error) {
		if (error.statusCode === 404) {
			return true;
		}

		if (isScopedPackage && error.statusCode === 401) {
			return true;
		}

		throw error;
	}
};

module.exports = async name => {
	if (!(typeof name === 'string' && name.length > 0)) {
		throw new Error('Package name required');
	}

	return request(name);
};

module.exports.many = async names => {
	if (!Array.isArray(names)) {
		throw new TypeError(`Expected an array, got ${typeof names}`);
	}

	const result = await Promise.all(names.map(request));
	return new Map(zip(names, result));
};

module.exports.InvalidNameError = InvalidNameError;
