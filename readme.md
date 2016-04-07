# npm-name [![Build Status](https://travis-ci.org/sindresorhus/npm-name.svg?branch=master)](https://travis-ci.org/sindresorhus/npm-name)

> Check whether a package name is available on npm


## Install

```
$ npm install --save npm-name
```


## Usage

```js
const npmName = require('npm-name');

npmName('chalk').then(available => {
	console.log(available);
	//=> false
});

npmName.many(['chalk', 'abc123']).then(result => {
	console.log(result.get('chalk'));
	//=> false
	console.log(result.get('abc123'));
	//=> true
});
```

## API

### npmName(name)
#### name
Type: `string`

A single name to check. Returns a promise with `true` or `false`.

### npmName.many(names)
#### names
Type: `array`

Multiple names to check. Returns a promise with a `Map` of the names/status.

## Related

- [npm-name-cli](https://github.com/sindresorhus/npm-name-cli) - CLI for this module


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
