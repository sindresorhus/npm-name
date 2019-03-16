declare const npmName: {
	/**
	 * Check whether a package name is available (not registered) on npm.
	 *
	 * @param name - Name to check.
	 * @param [registryUrl] - Registry URL to check name availability against (default to the currently set npm registry URL).
	 * @returns Whether the given name is available.
	 */
	(name: string, registryUrl?: string): Promise<boolean>;

	/**
	 * Check whether multiple package names are available (not registered) on npm.
	 *
	 * @param names - Multiple names to check.
	 * @param [registryUrl] - Registry URL to check name availability against (default to the currently set npm registry URL).
	 * @returns A `Map` of name and status.
	 */
	many<NameType extends string>(names: NameType[], registryUrl?: string): Promise<Map<NameType, boolean>>;
};

export default npmName;

export class InvalidNameError extends Error {}
