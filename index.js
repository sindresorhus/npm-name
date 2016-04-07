'use strict';
var got = require('got');
var registryUrl = require('registry-url')();
var Promise = require('pinkie-promise');

module.exports = function (name) {
  if (!name instanceof String || !name instanceof Array || !name.length) {
    return Promise.reject(new Error('Package name required'));
  }

  if (name instanceof Array) {
    var queue = [];
    for (var i = 0, len = name.length; i < len; i++) {
      queue.push(makeRequest(name[i]));
    }
    return Promise.all(queue);
  }

  return makeRequest(name);
};

function makeRequest(name) {
  return got.head(registryUrl + name.toLowerCase()).then(function () {
    return false;
  }).catch(function (err) {
    if (err.statusCode === 404) {
      return true;
    }

    throw err;
  });
}
