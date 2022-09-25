'use strict';

module.exports = core;
const path = require('path')
const semvewr = require('semver')
const colors = require('colors/safe')
const userHome = require('user-home')
const pathExists = require('path-exists').sync
const log = require('@wzw-cli-dev/log')
const pkg = require('../package.json')
const constant = require('./const')
let args, config;
function core() {
  try{
    checkPkgVersion()
    checkNodeVersion()
    checkRoot()
    checkUserHome()
    checkInputArgs()
    checkEnv()
    // log.verbose('debug', 'test debug log')
  }catch(e){
    log.error(e.message)
  }
  
}

// 环境变量检查功能开发
function checkEnv() {
  const dotenv = require('dotenv')
  const dotenvPath = path.resolve(userHome, '.env')

  if (pathExists(dotenvPath)) {
    dotenv.config({
      path: dotenvPath
    })
  }
  createDefaultConfig()
  log.verbose('环境变量', process.env.CLI_HOME_PATH)
}
function createDefaultConfig() {
  const cliConfig = {
    home: userHome
  }
  if (process.env.CLI_HOME) {
    cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME)
  } else {
    cliConfig['cliHome'] = path.join(userHome, constant.DEFAULT_CLI_HOME)
  }
  process.env.CLI_HOME_PATH = cliConfig.cliHome
}

// 检查入参
function checkInputArgs() {
  const minimist = require('minimist')
  args = minimist(process.argv.slice(2))
  checkArgs()
}
function checkArgs() {
  if (args.debug) {
    process.env.LOG_LEVEL = 'verbose'
  } else {
    process.env.LOG_LEVEL = 'info'
  }
  log.level = process.env.LOG_LEVEL
}
// 检查用户主目录
function checkUserHome() {
  if (!userHome || !pathExists(userHome)) {
    throw new Error(colors.red('当前登录用户主目录不存在!'))
  }
}
// 检查root
function checkRoot() {
  const rootCheck = require('root-check') // 此方法仅适用于POSIX平台。在Windows或Android平台上不可用，因此会导致错误，即TypeError，geteuid不是函数。
  rootCheck()
}
// 检查版本号
function checkPkgVersion() {
	log.info('cli', pkg.version)
}
// 检查Node版本
function checkNodeVersion() {
  const currentVersion = process.version
  const lowestVersion = constant.LOWSET_NODE_VERSION
  if (!semvewr.gte(currentVersion, lowestVersion)) {
    throw new Error(colors.red(`imooc-cli 需要安装 v${lowestVersion} 以上版本Node,js`))
  }
}
