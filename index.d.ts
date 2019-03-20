declare const npmName: {
	/**
	 * Check whether a package name is available (not registered) on npm.
	 *
	 * @param name - Name to check.
	 * @param options - Object containing some options you can pass to change the method's behavior.
	 * @returns Whether the given name is available.
	 */
	(name: string, options?: object): Promise<boolean>;

	/**
	 * Check whether multiple package names are available (not registered) on npm.
	 *
	 * @param names - Multiple names to check.
	 * @param options - Object containing some options you can pass to change the method's behavior.
	 * @returns A `Map` of name and status.
	 */
	many<NameType extends string>(names: NameType[], options?: object): Promise<Map<NameType, boolean>>;
};

export default npmName;

export class InvalidNameError extends Error {}
