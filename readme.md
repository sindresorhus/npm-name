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
	
	console.log(await npmName('apple-rainbow', 'https://registry.yarnpkg.com'));
	//=> true

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

_**Note:** you should only provide a registry URL in case you'd like to check a package name against a registry which you haven't configured using npm. If you'd like to check the name against the currently set registry simply use `npmName(name)`, without providing a second parameter. You're very unlikely to need this in public npm packages, as it's more targeted towards internal tools._

> If you use this when you shouldn't, @sindresorhus will hunt you at night. 🤫

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
