# npm-name

> Check whether a package or organization name is available on npm

## Install

```sh
npm install npm-name
```

## Usage

```js
import npmName from 'npm-name';

// Check a package name
console.log(await npmName('chalk'));
//=> false

// Check an organization name
console.log(await npmName('@ava'));
//=> false

console.log(await npmName('@abc123'));
//=> true

try {
	await npmName('_ABC');
} catch (error) {
	console.log(error.message);
	// Invalid package name: _ABC
	// - name cannot start with an underscore
	// - name can no longer contain capital letters
}
```

## API

### npmName(name, options?)

Check whether a package/organization name is available (not registered) on npm.

An organization name should start with `@` and should not be a scoped package.

Returns a `Promise<boolean>` of whether the given name is available.

#### name

Type: `string`

The name to check.

#### options

Type: `object`

##### registryUrl

Default: User's configured npm registry URL.

The registry URL to check name availability against.

**Note:** You're unlikely to need this option. Most use-cases are best solved by using the default. You should only use this option if you need to check a package name against a specific registry.

### npmNameMany(names, options?)

Check whether multiple package/organization names are available (not registered) on npm.

Returns a `Promise<Map>` of name and status.

```js
import {npmNameMany} from 'npm-name';

const result = await npmNameMany(['chalk', '@sindresorhus/is', 'abc123']);

console.log(result.get('chalk'));
//=> false

console.log(result.get('@sindresorhus/is'));
//=> false

console.log(result.get('abc123'));
//=> true
```

#### names

Type: `string[]`

Multiple names to check.

#### options

Type: `object`

Same as `npmName()`.

## Known limitations

This package checks the npm registry to see if a name is already taken. It also makes a best-effort attempt to detect names that npm blocks at publish time for differing from an existing package only by punctuation (`-`, `.`, `_`): the registry strips punctuation from both names before comparing them. The detection tries the spellings that share the name's own word boundaries, so `ch-alk` and `lodash-merge` are reported as unavailable because `chalk` and `lodash.merge` exist, but it does not enumerate every possible spelling: `validate-io.string-primitive` is reported as available even though the registry blocks it, because `validate.io-string-primitive` exists with different boundaries.

A name with no punctuation can also conflict with an existing punctuated one, for example `lodashmerge` against `lodash.merge`. That direction cannot be enumerated from the client, as there is no way to ask the registry which existing names strip down to a given string.

However, npm also performs additional undocumented [similarity checks](https://blog.npmjs.org/post/168978377570/new-package-moniker-rules.html) server-side that may still reject a name at publish time even if this package reports it as available. There is no public API to replicate these checks.

## Related

- [npm-name-cli](https://github.com/sindresorhus/npm-name-cli) - CLI for this module
