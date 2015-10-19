import test from 'ava';
import fn from './';

test('returns true when package name is available', async t => {
	t.true(await fn('asdasfgrgafadsgaf'));
});

test('returns false when package name is taken', async t => {
	t.false(await fn('chalk'));
});
