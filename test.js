import test from 'ava';
import fn from './';

test('returns true when package name is available', async t => {
	t.true(await fn('asdasfgrgafadsgaf' + Math.random().toString().slice(2)));
	t.true(await fn(Math.floor(Math.random() * 1e10)));
});

test('returns false when package name is taken', async t => {
	t.false(await fn('chalk'));
	t.false(await fn(1));
});
