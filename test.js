import test from 'ava';
import uniqueString from 'unique-string';
import m from '.';

test('returns true when package name is available', async t => {
	t.true(await m(uniqueString()));
});

test('returns false when package name is taken', async t => {
	t.false(await m('chalk'));
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
	t.false(await m(`@sindresorhus/is`));
});

test('throws when package name is invalid', async t => {
	const e = await t.throws(m('_ABC'), m.InvalidNameError);
	t.is(e.message, 'Invalid package name: _ABC');
	t.is(e.warnings[0], 'name can no longer contain capital letters');
	t.is(e.errors[0], 'name cannot start with an underscore');
});

