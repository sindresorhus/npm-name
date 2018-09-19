import test from 'ava';
import uniqueString from 'unique-string';
import m from '.';

test('returns true when package name is available', async t => {
	t.true(await m(uniqueString()));
});

test('returns false when package name is taken', async t => {
	t.false(await m('chalk'));
	t.false(await m('recursive-readdir'));
});

test('returns a map of multiple package names', async t => {
	const name1 = 'chalk';
	const name2 = uniqueString();
	const res = await m.many([name1, name2]);
	t.false(res.get(name1));
	t.true(res.get(name2));
});

test('returns true when scoped package name is not taken', async t => {
	t.true(await m(`@${uniqueString()}/${uniqueString()}`));
});

test('returns false when scoped package name is taken', async t => {
	t.false(await m('@sindresorhus/is'));
});

test('throws when package name is invalid', async t => {
	const error = await t.throws(m('_ABC'), m.InvalidNameError);
	const lines = error.message.split('\n');
	t.is(lines[0], 'Invalid package name: _ABC');
	t.is(lines[1], '- name can no longer contain capital letters');
	t.is(lines[2], '- name cannot start with an underscore');
});
