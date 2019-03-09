declare const npmName: {
	/**
	 * Check whether a package name is available (not registered) on npm.
	 *
	 * @param name - Name to check.
	 * @returns Whether a name is available.
	 */
	(name: string): Promise<boolean>;

	/**
	 * Check whether multiple package names are available (not registered) on npm.
	 *
	 * @param names - Multiple names to check.
	 * @returns A `Map` of name/status.
	 */
	many<NameType extends string>(names: NameType[]): Promise<Map<NameType, boolean>>;
};

export default npmName;

export class InvalidNameError extends Error {}
