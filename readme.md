# npm-name [![Build Status](https://travis-ci.org/sindresorhus/npm-name.svg?branch=master)](https://travis-ci.org/sindresorhus/npm-name)

> Check whether a package name is available on npm


## Install

```
$ npm install npm-name
```


## Usage

```js
const npmName = require('npm-name');

(async () => {
	console.log(await npmName('chalk'));
	//=> false

	const result = await npmName.many(['chalk', '@sindresorhus/is', 'abc123']);
	console.log(result.get('chalk'));
	//=> false
	console.log(result.get('@sindresorhus/is'));
	//=> false
	console.log(result.get('abc123'));
	//=> true

	try {
		await npmName('_ABC');
	} catch (error) {
		console.log(error.message);
		// Invalid package name: _ABC
		// - name cannot start with an underscore
		// - name can no longer contain capital letters
	}
})();
```


## API

### npmName(name, options?)

Returns a `Promise<boolean>` of whether the given name is available.

#### name

Type: `string`

Name to check.

#### options

Type: `object`

##### registryUrl

Default: User's configured npm registry URL.

Registry URL to check name availability against.

**Note:** You're unlikely to need this option. Most use-cases are best solved by using the default. You should only use this option if you need to check a package name against a specific registry.

### npmName.many(names, options?)

Returns a `Promise<Map>` of name and status.

#### names

Type: `string[]`

Multiple names to check.

#### options

Type: `object`

Same as `npmName()`.


## Related

- [npm-name-cli](https://github.com/sindresorhus/npm-name-cli) - CLI for this module


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
