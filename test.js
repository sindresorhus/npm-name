import http from 'node:http';
import {promisify} from 'node:util';
import test from 'ava';
import uniqueString from 'unique-string';
import npmName, {npmNameMany, InvalidNameError} from './index.js';

const createRegistry = async (t, handler) => {
	const server = http.createServer(handler);
	await promisify(server.listen.bind(server))(0, '127.0.0.1');
	t.teardown(() => server.close());
	return `http://127.0.0.1:${server.address().port}/`;
};

const registryUrl = 'https://registry.yarnpkg.com/';
const options = {registryUrl};

test('returns true when package name is available', async t => {
	const moduleName = uniqueString();

	t.true(await npmName(moduleName));
	t.true(await npmName(moduleName, options));
	await t.throwsAsync(npmName(moduleName, {registryUrl: null}));
});

test('returns true when organization name is available', async t => {
	const moduleName = uniqueString();

	t.true(await npmName(`@${moduleName}`));
	t.true(await npmName(`@${moduleName}/`));
});

test('returns false when package name is taken', async t => {
	t.false(await npmName('chalk'));
	t.false(await npmName('recursive-readdir'));
	t.false(await npmName('np', options));
});

test('returns false when package name is taken, regardless of punctuation', async t => {
	t.false(await npmName('ch-alk'));
	t.false(await npmName('ch.alk'));
	t.false(await npmName('ch_alk'));
});

test('returns false when the existing package is the punctuated one', async t => {
	// `lodash.merge` exists, `lodash-merge` and `lodash_merge` do not.
	t.false(await npmName('lodash-merge'));
	t.false(await npmName('lodash_merge'));
});

test('collapses separator runs when building punctuation variants', async t => {
	// `lodash--merge` must check the single-separator spellings, one of which
	// (`lodash.merge`) exists.
	t.false(await npmName('lodash--merge'));
});

test('throws when a punctuation probe fails with a server error', async t => {
	const registryUrl = await createRegistry(t, (request, response) => {
		response.statusCode = request.url === '/err-name' ? 404 : 500;
		response.end();
	});

	await t.throwsAsync(npmName('err-name', {registryUrl}));
});

test('reports a conflict even when another punctuation probe fails', async t => {
	const registryUrl = await createRegistry(t, (request, response) => {
		if (request.url === '/errname') {
			response.statusCode = 200;
		} else if (request.url === '/err-name') {
			response.statusCode = 404;
		} else {
			response.statusCode = 500;
		}

		response.end();
	});

	t.false(await npmName('err-name', {registryUrl}));
});

test('limits concurrent registry requests across a batch', async t => {
	let active = 0;
	let maxActive = 0;
	const registryUrl = await createRegistry(t, (request, response) => {
		active++;
		maxActive = Math.max(maxActive, active);
		setTimeout(() => {
			active--;
			response.statusCode = 404;
			response.end();
		}, 25);
	});

	const names = Array.from({length: 24}, (_, index) => `zz-limit-probe-${index}`);
	const result = await npmNameMany(names, {registryUrl});
	t.true([...result.values()].every(Boolean));
	t.true(maxActive <= 8, `max concurrent requests was ${maxActive}`);
});

test('returns false when organization name is taken', async t => {
	t.false(await npmName('@ava'));
	t.false(await npmName('@ava/'));
	t.false(await npmName('@angular/'));
});

test('registry url is normalized', async t => {
	const moduleName = uniqueString();

	t.true(await npmName(moduleName, options));
	t.true(await npmName(moduleName, {
		registryUrl: registryUrl.slice(0, -1), // The `.slice()` removes the trailing `/` from the URL
	}));
});

test('returns a map of multiple package names', async t => {
	const name1 = 'chalk';
	const name2 = uniqueString();
	const result = await npmNameMany([name1, name2]);
	t.false(result.get(name1));
	t.true(result.get(name2));

	await t.throwsAsync(npmNameMany([name1, name2], {registryUrl: null}));
});

test('returns true when scoped package name is not taken', async t => {
	t.true(await npmName(`@${uniqueString()}/${uniqueString()}`));
});

test('returns false when scoped package name is taken', async t => {
	t.false(await npmName('@sindresorhus/is'));
});

test('throws when package name is invalid', async t => {
	await t.throwsAsync(npmName('_ABC'), {
		instanceOf: InvalidNameError,
		message: `Invalid package name: _ABC
- name can no longer contain capital letters
- name cannot start with an underscore`,
	});
});

test('should return an iterable error capturing multiple errors when appropriate', async t => {
	const name1 = 'chalk'; // False
	const name2 = uniqueString(); // True
	const name3 = '_ABC'; // Error
	const name4 = 'CapitalsAreBad'; // Error

	const aggregateError = await t.throwsAsync(npmNameMany([name1, name2, name3, name4]), {
		instanceOf: AggregateError,
	});

	const errors = [...aggregateError.errors];
	t.is(errors.length, 2);
	t.regex(errors[0].message, /Invalid package name: _ABC/);
	t.regex(errors[1].message, /Invalid package name: CapitalsAreBad/);
});
