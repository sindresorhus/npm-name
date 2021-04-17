import isUrl from 'is-url-superb';
import got from 'got';
import isScoped from 'is-scoped';
import registryUrl from 'registry-url';
import registryAuthToken from 'registry-auth-token';
import zip from 'lodash.zip';
import validate from 'validate-npm-package-name';
import orgRegex from 'org-regex';
import pMap from 'p-map';
import {isTaken} from 'is-name-taken';

const configuredRegistryUrl = registryUrl();
const organizationRegex = orgRegex({exact: true});

// Ensure the URL always ends in a `/`
const normalizeUrl = url => url.replace(/\/$/, '') + '/';

const npmOrganizationUrl = 'https://www.npmjs.com/org/';

const request = async (name, options) => {
	const registryUrl = normalizeUrl(options.registryUrl || configuredRegistryUrl);

	const isOrganization = organizationRegex.test(name);
	if (isOrganization) {
		name = name.replace(/[@/]/g, '');
	}

	const isValid = validate(name);
	if (!isValid.validForNewPackages) {
		const notices = [...isValid.warnings || [], ...isValid.errors || []].map(v => `- ${v}`);
		notices.unshift(`Invalid package name: ${name}`);
		const error = new InvalidNameError(notices.join('\n'));
		error.warnings = isValid.warnings;
		error.errors = isValid.errors;
		throw error;
	}

	let urlName = name;
	const isScopedPackage = isScoped(name);
	if (isScopedPackage) {
		urlName = name.replace(/\//g, '%2f');
	}

	const authInfo = registryAuthToken(registryUrl, {recursive: true});
	const headers = {};
	if (authInfo) {
		headers.authorization = `${authInfo.type} ${authInfo.token}`;
	}

	try {
		// eslint-disable-next-line unicorn/prefer-ternary
		if (isOrganization) {
			await got.head(npmOrganizationUrl + urlName.toLowerCase(), {timeout: 10000});
		} else {
			await got.head(registryUrl + urlName.toLowerCase(), {timeout: 10000, headers});
		}

		return false;
	} catch (error) {
		const {statusCode} = error.response;

		if (statusCode === 404) {
			if (!isOrganization) {
				const conflict = await isTaken(name.toLowerCase(), {maxAge: 60000});
				return !conflict;
			}

			return true;
		}

		if (isScopedPackage && statusCode === 401) {
			return true;
		}

		throw error;
	}
};

export default async function npmName(name, options = {}) {
	if (!(typeof name === 'string' && name.length > 0)) {
		throw new Error('Package name required');
	}

	if (typeof options.registryUrl !== 'undefined' && !(typeof options.registryUrl === 'string' && isUrl(options.registryUrl))) {
		throw new Error('The `registryUrl` option must be a valid string URL');
	}

	return request(name, options);
}

export async function npmNameMany(names, options = {}) {
	if (!Array.isArray(names)) {
		throw new TypeError(`Expected an array of names, got ${typeof names}`);
	}

	if (typeof options.registryUrl !== 'undefined' && !(typeof options.registryUrl === 'string' && isUrl(options.registryUrl))) {
		throw new Error('The `registryUrl` option must be a valid string URL');
	}

	const result = await pMap(names, name => request(name, options), {stopOnError: false});
	return new Map(zip(names, result));
}

export class InvalidNameError extends Error {}
