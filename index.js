import isUrl from 'is-url-superb';
import ky from 'ky';
import isScoped from 'is-scoped';
import registryUrl from 'registry-url';
import registryAuthToken from 'registry-auth-token';
import zip from 'lodash.zip';
import validate from 'validate-npm-package-name';
import orgRegex from 'org-regex';
import pMap from 'p-map';
import pLimit from 'p-limit';

const configuredRegistryUrl = registryUrl();
const organizationRegex = orgRegex({exact: true});

// One limit is shared by every registry request a call makes, including the
// punctuation probes and `npmNameMany()` batches.
const maxConcurrentRequests = 8;

// Ensure the URL always ends in a `/`
const normalizeUrl = url => url.replace(/\/$/, '') + '/';

const npmOrganizationUrl = 'https://registry.npmjs.org/-/org/';

// Npm blocks publishing packages whose names differ from existing ones only by punctuation.
// https://blog.npmjs.org/post/168978377570/new-package-moniker-rules.html
// The registry strips punctuation from both names before comparing, so `foo-bar`
// conflicts with `foobar`, `foo.bar` and `foo_bar` alike. Runs of separators
// collapse to one boundary, so `foo--bar` also checks `foo-bar`. This is
// best-effort: spellings with different boundaries (`validate.io-string-primitive`
// for the candidate `validate-io.string-primitive`) are not enumerated.
const punctuationVariants = name => {
	const parts = name.split(/[-._]+/);
	if (parts.length === 1) {
		return [];
	}

	const variants = new Set(['', '-', '_', '.'].map(separator => parts.join(separator)));
	variants.delete(name);
	return [...variants];
};

const hasPunctuationConflict = async (name, {isOrganization, isScopedPackage, registryUrl, headers, limit}) => {
	if (isOrganization || isScopedPackage) {
		return false;
	}

	const variants = punctuationVariants(name.toLowerCase());
	if (variants.length === 0) {
		return false;
	}

	// Only a 404 means the variant is absent. Any other failure is kept and
	// surfaced, so a timeout or 5xx cannot make a name look available.
	const errors = [];
	const results = await Promise.all(variants.map(variant => limit(async () => {
		try {
			await ky.head(registryUrl + variant, {timeout: 10_000, headers});
			return true;
		} catch (error) {
			if (error.response?.status === 404) {
				return false;
			}

			errors.push(error);
			return false;
		}
	})));

	// A confirmed conflict is definitive regardless of other probe failures.
	if (results.includes(true)) {
		return true;
	}

	if (errors.length > 0) {
		throw errors[0];
	}

	return false;
};

const request = async (name, options, limit) => {
	const registryUrl = normalizeUrl(options.registryUrl ?? configuredRegistryUrl);

	const isOrganization = organizationRegex.test(name);
	if (isOrganization) {
		name = name.replaceAll(/[@/]/g, '');
	}

	const isValid = validate(name);
	if (!isValid.validForNewPackages) {
		const notices = [...isValid.warnings ?? [], ...isValid.errors ?? []].map(v => `- ${v}`);
		notices.unshift(`Invalid package name: ${name}`);
		const error = new InvalidNameError(notices.join('\n'));
		error.warnings = isValid.warnings;
		error.errors = isValid.errors;
		throw error;
	}

	let urlName = name;
	const isScopedPackage = isScoped(name);
	if (isScopedPackage) {
		urlName = name.replaceAll('/', '%2f');
	}

	const authInfo = registryAuthToken(registryUrl, {recursive: true});
	const headers = {};
	if (authInfo && !isOrganization) {
		headers.authorization = `${authInfo.type} ${authInfo.token}`;
	}

	try {
		let packageUrl = registryUrl + urlName.toLowerCase();
		if (isOrganization) {
			packageUrl = npmOrganizationUrl + urlName.toLowerCase() + '/package';
		}

		await limit(() => ky.head(packageUrl, {timeout: 10_000, headers}));
		return false;
	} catch (error) {
		const statusCode = error.response?.status ?? 500;

		if (statusCode === 404) {
			if (await hasPunctuationConflict(name, {
				isOrganization, isScopedPackage, registryUrl, headers, limit,
			})) {
				return false;
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

	if (options.registryUrl !== undefined && !(typeof options.registryUrl === 'string' && isUrl(options.registryUrl))) {
		throw new Error('The `registryUrl` option must be a valid string URL');
	}

	return request(name, options, pLimit(maxConcurrentRequests));
}

export async function npmNameMany(names, options = {}) {
	if (!Array.isArray(names)) {
		throw new TypeError(`Expected an array of names, got ${typeof names}`);
	}

	if (options.registryUrl !== undefined && !(typeof options.registryUrl === 'string' && isUrl(options.registryUrl))) {
		throw new Error('The `registryUrl` option must be a valid string URL');
	}

	const limit = pLimit(maxConcurrentRequests);
	const result = await pMap(names, name => request(name, options, limit), {stopOnError: false});
	return new Map(zip(names, result));
}

export class InvalidNameError extends Error {}
