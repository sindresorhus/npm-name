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

test('returns true when package names are available', async t => {
	const res = await fn.many([randomName(), randomName()]);
	t.false(res.indexOf(false) > -1);
});

test('returns false when package names are taken', async t => {
	const res = await fn.many(['chalk', 'npm-name']);
	t.false(res.indexOf(true) > -1);
});

test('returns true and false', async t => {
	const res = await fn.many(['chalk', randomName()]);
	t.true(res.indexOf(true) > -1);
	t.true(res.indexOf(false) > -1);
});
