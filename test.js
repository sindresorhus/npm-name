import test from 'ava';
import fn from './';

test('returns true when package name is available', async t => {
	t.true(await fn('asdasfgrgafadsgaf' + Math.random().toString().slice(2)));
});

test('returns false when package name is taken', async t => {
	t.false(await fn('chalk'));
});

test('returns true when package names are available', async t => {
	var name1 = 'asdasfgrgafadsgaf' + Math.random().toString().slice(2);
	var name2 = 'ihvoiwehbioboiwwq' + Math.random().toString().slice(2);
	var res = await fn.many([name1, name2]);
	t.false(res.indexOf(false) > -1);
});

test('returns false when package names are taken', async t => {
	var name1 = 'chalk';
	var name2 = 'npm-name';
	var res = await fn.many([name1, name2]);
	t.false(res.indexOf(true) > -1);
});

test('returns true and false', async t => {
	var name1 = 'chalk';
	var name2 = 'ihvoiwehbioboiwwq' + Math.random().toString().slice(2);
	var res = await fn.many([name1, name2]);
	t.true(res.indexOf(true) > -1);
	t.true(res.indexOf(false) > -1);
});
