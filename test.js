import test from 'ava';
import randomString from 'randomstring';
import fn from './';

test('returns true when package name is available', async t => {
	const rand = randomString.generate({
		length: 64,
		charset: 'alphabetic',
		capitalization: 'lowercase'
	});
	t.true(await fn(rand));
});

test('returns false when package name is taken', async t => {
	t.false(await fn('chalk'));
});
