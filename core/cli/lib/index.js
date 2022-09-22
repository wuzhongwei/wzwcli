'use strict';

module.exports = core;
const pkg = require('../package.json')
const log = require('@wzw-cli-dev/log')
function core() {
  checkPkgVersion()
}
// 检查版本号
function checkPkgVersion() {
	log.info('cli', pkg.version)
}
