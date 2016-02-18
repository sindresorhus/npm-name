'use strict';
var got = require('got');
var registryUrl = require('registry-url')();
var path = require('path');
var NPMRC = process.env.NPMRC || path.join(process.env.HOME || process.env.USERPROFILE, '.npmrc');
var properties = require('properties');
var ProxyAgent = require('proxy-agent');

function config() {
	return new Promise(function (resolve) {
		properties.parse(NPMRC, {
			path: true
		}, function (error, obj) {
			if (error) {
				return resolve(null);
			}
			return resolve(obj[Object.keys(obj).find((value) => value === 'https-proxy')]);
		});
	});
}

module.exports = function (name) {
	if (!(typeof name === 'string' && name.length !== 0)) {
		return Promise.reject(new Error('Package name required'));
	}
	return config()
	.then((url) => got.head(registryUrl + name.toLowerCase(), url ? {agent: new ProxyAgent(url)} : {}))
	.then(() => false)
	.catch((err) => err.statusCode === 404 ? true : err);
};
