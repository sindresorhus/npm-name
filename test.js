import test from 'ava';
import uniqueString from 'unique-string';
import npmName from '.';

test('returns true when package name is available', async t => {
	t.true(await npmName(uniqueString()));
});

test('returns false when package name is taken', async t => {
	t.false(await npmName('chalk'));
	t.false(await npmName('recursive-readdir'));
});

test('returns a map of multiple package names', async t => {
	const name1 = 'chalk';
	const name2 = uniqueString();
	const res = await npmName.many([name1, name2]);
	t.false(res.get(name1));
	t.true(res.get(name2));
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
