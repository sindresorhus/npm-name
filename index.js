'use strict';
const got = require('got');
const isScoped = require('is-scoped');
const registryUrl = require('registry-url')();
const registryAuthToken = require('registry-auth-token');
const zip = require('lodash.zip');
const validate = require('validate-npm-package-name');
const pSettle = require('p-settle');
const AggregateError = require('aggregate-error');

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

	const authInfo = registryAuthToken(registryUrl, {recursive: true});
	const headers = {};
	if (authInfo) {
		headers.authorization = `${authInfo.type} ${authInfo.token}`;
	}

	try {
		await got.head(registryUrl + name.toLowerCase(), {timeout: 10000, headers});
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

module.exports = name => {
	if (!(typeof name === 'string' && name.length > 0)) {
		throw new Error('Package name required');
	}

	return request(name);
};

module.exports.many = async names => {
	if (!Array.isArray(names)) {
		throw new TypeError(`Expected an array, got ${typeof names}`);
	}

	const responses = await pSettle(names.map(request));

	const results = responses.map(response => {
		if (typeof response.value === 'boolean') {
			return response.value;
		}

		return response.reason;
	});

	if (responses.map(response => response.isRejected).includes(true)) {
		const error = new AggregateError(zip(names, results));
		throw error;
	}

	return new Map(zip(names, results));
};

module.exports.InvalidNameError = InvalidNameError;
