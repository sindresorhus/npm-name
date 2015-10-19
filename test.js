import test from 'ava';
import fn from './';

test('should return true when package name is available', async t => {
	t.true(await fn('asdasfgrgafadsgaf'));
});

test('should return false when package name is taken', async t => {
	t.false(await fn('chalk'));
});
