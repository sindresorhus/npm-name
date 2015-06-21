# npm-name [![Build Status](https://travis-ci.org/sindresorhus/npm-name.svg?branch=master)](https://travis-ci.org/sindresorhus/npm-name)

> Check whether a package name is available on npm


## Install

```
$ npm install --save npm-name
```


## Usage

```js
var npmName = require('npm-name');

npmName('chalk', function (err, available) {
	console.log(available);
	//=> false
});
```


## CLI

<img src="https://cloud.githubusercontent.com/assets/170270/8269981/6d394f42-17c4-11e5-8da3-fdb3e251d535.png" width="332">

```
$ npm install --global npm-name
```

```
$ npm-name --help

  Usage
    $ npm-name <name>

  Examples
    $ npm-name chalk
    ✖ Unavailable
    $ npm-name unicorn-cake
    ✔ Available

  Exits with code 0 when the name is available or 2 when taken
```


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
