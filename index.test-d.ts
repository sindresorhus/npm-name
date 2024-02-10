import {expectType} from 'tsd';
import npmName, {npmNameMany, InvalidNameError} from './index.js';

expectType<Promise<boolean>>(npmName('chalk'));
expectType<Promise<boolean>>(npmName('got', {
	registryUrl: 'https://registry.yarnpkg.com/',
}));

const manyResult = npmNameMany(['chalk', '@sindresorhus/is', 'abc123']);
expectType<Promise<Map<'chalk' | '@sindresorhus/is' | 'abc123', boolean>>>(
	manyResult,
);
const results = await manyResult;
const chalk = results.get('chalk');
expectType<boolean | undefined>(chalk);

expectType<InvalidNameError>(new InvalidNameError('foo'));
