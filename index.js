'use strict';
const os = require('os');
const fs = require('fs');
const {spawnSync} = require('child_process');
const zip = require('lodash.zip');
const validate = require('validate-npm-package-name');

class InvalidNameError extends Error {}

const throwIfInvalid = name => {
	const isValid = validate(name);
	if (!isValid.validForNewPackages) {
		const notices = [...isValid.warnings || [], ...isValid.errors || []].map(v => `- ${v}`);
		notices.unshift(`Invalid package name: ${name}`);
		const error = new InvalidNameError(notices.join('\n'));
		error.warnings = isValid.warnings;
		error.errors = isValid.errors;
		throw error;
	}
};

const npmUpdate = ({dependency, stdio}) => {
	const opts = {
		shell: true,
		cwd: __dirname,
		stdio
	};
	const cmd = ['npm', 'update', dependency].filter(Boolean);
	if (os.platform() !== 'win32') {
		try {
			fs.accessSync(__dirname, fs.constants.W_OK);
		} catch (error) {
			cmd.unshift('sudo');
		}
	}
	const {status} = spawnSync(cmd.shift(), cmd, opts);
	if (status !== 0) {
		throw new Error('failed: npm update');
	}
};

const getAllPackageNames = ({update = true, halt = false, stdio = 'inherit', map = toPlainCase} = {}) => {
	if (update && !getAllPackageNames.updated) {
		try {
			npmUpdate({dependency: 'all-the-package-names', stdio});
		} catch (error) {
			if (halt) {
				throw error;
			}
		}
		getAllPackageNames.updated = true;
	}
	delete require.cache[require.resolve('all-the-package-names')];
	return require('all-the-package-names').map(map);
};

module.exports = (name, opts = {}) => {
	if (!(typeof name === 'string' && name.length > 0)) {
		throw new Error('Package name required');
	}

	throwIfInvalid(name);

	const allPackages = getAllPackageNames({update: opts.updateRegistry, halt: opts.updateRegistryIgnoreErrors});
	return !allPackages.includes(name);
};

module.exports.many = async (names, opts = {}) => {
	if (!Array.isArray(names)) {
		throw new TypeError(`Expected an array, got ${typeof names}`);
	}

	const result = await Promise.all(names.map(name => module.exports(name, opts)));
	return new Map(zip(names, result));
};

module.exports.InvalidNameError = InvalidNameError;
