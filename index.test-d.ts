import {expectType} from 'tsd';
import npmName = require('.');
import {InvalidNameError} from '.';

expectType<Promise<boolean>>(npmName('chalk'));

const manyResult = npmName.many(['chalk', '@sindresorhus/is', 'abc123']);
expectType<Promise<Map<'chalk' | '@sindresorhus/is' | 'abc123', boolean>>>(
	manyResult
);
expectType<boolean | undefined>((await manyResult).get('chalk'));

new InvalidNameError('foo') instanceof InvalidNameError;
