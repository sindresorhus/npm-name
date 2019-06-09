'use strict';
const isUrl = require('is-url-superb');
const got = require('got');
const isScoped = require('is-scoped');
const configuredRegistryUrl = require('registry-url')();
const registryAuthToken = require('registry-auth-token');
const zip = require('lodash.zip');
const validate = require('validate-npm-package-name');

class InvalidNameError extends Error {}

const request = async (name, options) => {
	const registryUrl = normalizeUrl(options.registryUrl || configuredRegistryUrl);

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

const normalizeUrl = url => (new URL(url)).href; // Meant to make sure the URL always ends with '/'.

const npmName = async (name, options = {}) => {
	if (!(typeof name === 'string' && name.length > 0)) {
		throw new Error('Package name required');
	}

	if (typeof options.registryUrl !== 'undefined' && !(typeof options.registryUrl === 'string' && isUrl(options.registryUrl))) {
		throw new Error('Registry URL must be a valid string URL');
	}

	return request(name, options);
};

module.exports = npmName;
// TODO: remove this in the next major version
module.exports.default = npmName;

module.exports.many = async (names, options = {}) => {
	if (!Array.isArray(names)) {
		throw new TypeError(`Expected an array of names, got ${typeof names}`);
	}

	if (typeof options.registryUrl !== 'undefined' && !(typeof options.registryUrl === 'string' && isUrl(options.registryUrl))) {
		throw new Error('Registry URL must be a valid string URL');
	}

	const result = await Promise.all(names.map(name => request(name, options)));
	return new Map(zip(names, result));
};

module.exports.InvalidNameError = InvalidNameError;
