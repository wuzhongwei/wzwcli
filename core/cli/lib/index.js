'use strict';

module.exports = core;
const commander = require('commander')
const path = require('path')
const semver = require('semver')
const colors = require('colors/safe')
const userHome = require('user-home')
const pathExists = require('path-exists').sync
const log = require('@imooc-cli-dev/log')
const init = require('@imooc-cli-dev/init')
const exec = require('@imooc-cli-dev/exec')
const pkg = require('../package.json')
const constant = require('./const')


const program = new commander.Command()
const options = program.opts()
async function core() {
  try{
    await prepare()
    registerCommand()
  }catch(e){
    log.error(e.message)
    if (program.debug) {
      console.log(e)
    }
  }
  
}

// 注册命令
function registerCommand() {
  
  program
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> [options]')
    .version(pkg.version)
    .option('-d, --debug', '是否开启调试模式', false)
    .option('-tp, --targetPath <targetPath>', '是否指定本地调试文件路径', '')

  program
    .command('init [projectName]')
    .option('-f, --force', '是否强制初始化项目')
    .action(exec)
  
  // 开启debug模式
  program.on('option:debug', function() {
    if (options.debug) {
      process.env.LOG_LEVEL = 'verbose'
    } else {
      process.env.LOG_LEVEL = 'info'
    }
    log.level = process.env.LOG_LEVEL
  })

  // 指定targetPath
  program.on('option:targetPath', function() {
    process.env.CLI_TARGET_PATH = options.targetPath
  })

  // 对未知命令监听
  program.on('command:*', function(obj) {
    const availableCommands = program.commands.map(cmd => cmd.name())
    console.log(colors.red('未知的命令: ' + obj[0]))
    if (availableCommands.length > 0) {
      console.log(colors.red('可用命令: ' + availableCommands.join(',')))
    }
  })
  
  program.parse(process.argv)

  if (program.args && program.args.length < 1) {
    program.outputHelp()
    console.log()
  }

}

async function prepare() {
  checkPkgVersion()
  checkNodeVersion()
  checkRoot()
  checkUserHome()
  checkEnv()
  await checkGlobalUpdate()
}

// 更新版本号
async function checkGlobalUpdate() {
  const currentVersion = pkg.version
  const npmName = pkg.name
  const {getNpmSemverVersion} = require('@imooc-cli-dev/get-npm-info')
  const lastVersion = await getNpmSemverVersion(currentVersion, npmName)
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn('更新提示', colors.yellow(`请手动更新 ${npmName}, 当前版本: ${currentVersion}, 最新版本: ${lastVersion}更新命令：npm install -g ${npmName}`))
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
  if (!semver.gte(currentVersion, lowestVersion)) {
    throw new Error(colors.red(`imooc-cli 需要安装 v${lowestVersion} 以上版本Node,js`))
  }
}
