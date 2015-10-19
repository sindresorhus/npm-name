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
```


## Related

- [npm-name-cli](https://github.com/sindresorhus/npm-name-cli) - CLI for this module


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
