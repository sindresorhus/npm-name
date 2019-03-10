import {expectType} from 'tsd-check';
import npmName, {InvalidNameError} from '.';

expectType<Promise<boolean>>(npmName('chalk'));

const manyResult = npmName.many(['chalk', '@sindresorhus/is', 'abc123']);
expectType<Promise<Map<'chalk' | '@sindresorhus/is' | 'abc123', boolean>>>(
	manyResult
);
expectType<boolean | undefined>((await manyResult).get('chalk'));

expectType<typeof InvalidNameError>(InvalidNameError);
