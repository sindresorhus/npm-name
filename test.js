import test from 'ava';
import uniqueString from 'unique-string';
import AggregateError from 'aggregate-error';
import npmName from '.';

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
	t.false(await npmName('recursivereaddir'));
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
		registryUrl: registryUrl.slice(0, -1) // The `.slice()` removes the trailing `/` from the URL
	}));
});

test('returns a map of multiple package names', async t => {
	const name1 = 'chalk';
	const name2 = uniqueString();
	const res = await npmName.many([name1, name2]);
	t.false(res.get(name1));
	t.true(res.get(name2));

	await t.throwsAsync(npmName.many([name1, name2], {registryUrl: null}));
});

test('returns true when scoped package name is not taken', async t => {
	t.true(await npmName(`@${uniqueString()}/${uniqueString()}`));
});

test('returns false when scoped package name is taken', async t => {
	t.false(await npmName('@sindresorhus/is'));
});

test('throws when package name is invalid', async t => {
	await t.throwsAsync(npmName('_ABC'), {
		instanceOf: npmName.InvalidNameError,
		message: `Invalid package name: _ABC
- name can no longer contain capital letters
- name cannot start with an underscore`
	});
});

test('should return an iterable error capturing multiple errors when appropriate', async t => {
	const name1 = 'chalk'; // False
	const name2 = uniqueString(); // True
	const name3 = '_ABC'; // Error
	const name4 = 'CapitalsAreBad'; // Error

	const aggregateError = await t.throwsAsync(npmName.many([name1, name2, name3, name4]), {
		instanceOf: AggregateError
	});

	const errors = [...aggregateError];
	t.is(errors.length, 2);
	t.regex(errors[0].message, /Invalid package name: _ABC/);
	t.regex(errors[1].message, /Invalid package name: CapitalsAreBad/);
});
