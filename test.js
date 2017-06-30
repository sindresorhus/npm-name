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
