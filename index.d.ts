declare class InvalidNameErrorClass extends Error {}

interface Options {
	/**
	Registry URL to check name availability against.

	Default: User's configured npm registry URL.
	*/
	readonly registryUrl: string;
}

declare const npmName: {
	/**
	Check whether a package name is available (not registered) on npm.

	@param name - Name to check.
	@returns Whether the given name is available.

	@example
	```
	import npmName = require('npm-name');

	(async () => {
		console.log(await npmName('chalk'));
		//=> false

		console.log(await npmName('got', {registryUrl: 'https://registry.yarnpkg.com'}));
		//=> false

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
	*/
	(name: string, options?: Options): Promise<boolean>;

	/**
	Check whether multiple package names are available (not registered) on npm.

	@param names - Multiple names to check.
	@returns A `Map` of name and status.

	@example
	```
	import npmName = require('npm-name');

	(async () => {
		const result = await npmName.many(['chalk', '@sindresorhus/is', 'abc123']);
		console.log(result.get('chalk'));
		//=> false
		console.log(result.get('@sindresorhus/is'));
		//=> false
		console.log(result.get('abc123'));
		//=> true
	})();
	```
	*/
	many<NameType extends string>(
		names: NameType[],
		options?: Options
	): Promise<Map<NameType, boolean>>;

	InvalidNameError: typeof InvalidNameErrorClass;

	// TODO: remove this in the next major version
	default: typeof npmName;
};

export = npmName;
