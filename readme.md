# npm-name [![Build Status](https://travis-ci.org/sindresorhus/npm-name.svg?branch=master)](https://travis-ci.org/sindresorhus/npm-name)

> Check whether a package name is available on npm


## Install

```sh
$ npm install --save npm-name
```


## Usage

```js
var npmName = require('npm-name');

npmName('request', function (err, available) {
	console.log(available);
	//=> false
});
```


## CLI

```sh
$ npm install --global npm-name
```

```
$ npm-name --help

  Usage
    npm-name <name>

  Exits with code 0 when the name is available or 2 when taken
```


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
