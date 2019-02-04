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

### npmName(name)

Returns a promise for a boolean.

#### name

Type: `string`

Name to check.

### npmName.many(names)

Returns a promise for a `Map` of name/status.

#### names

Type: `string[]`

Multiple names to check.


## Related

- [npm-name-cli](https://github.com/sindresorhus/npm-name-cli) - CLI for this module


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
