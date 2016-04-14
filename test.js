import test from 'ava';
import fn from './';

function randomName() {
	return 'asdasfgrgafadsgaf' + Math.random().toString().slice(2);
}

test('returns true when package name is available', async t => {
	t.true(await fn(randomName()));
});

test('returns false when package name is taken', async t => {
	t.false(await fn('chalk'));
});

test('returns a map of multiple package names', async t => {
	var name1 = 'chalk';
	var name2 = randomName();
	const res = await fn.many([name1, name2]);
	t.false(res.get(name1));
	t.true(res.get(name2));
});
