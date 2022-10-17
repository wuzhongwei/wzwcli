'use strict';
const path = require('path')
const Package = require('@imooc-cli-dev/package')
const log = require('@imooc-cli-dev/log')

const SETTINGS = {
  init: '@imooc-cli/init'
}

const CACHE_DIR = 'dependencies'

async function exec() {
  let targetPath = process.env.CLI_TARGET_PATH
  const homePath = process.env.CLI_HOME_PATH
  let storeDir = ''
  let pkg;
  log.verbose('targetPath', targetPath)
  log.verbose('homePath', homePath)

  const cmdObj = arguments[arguments.length - 1]

  const cmdName = cmdObj.name()
  const packageName = SETTINGS[cmdName]
  const packageVersion = 'latest' // 默认安装版本
  

  if (!targetPath) {
    targetPath = path.resolve(homePath, CACHE_DIR) // 生成缓存路径
    storeDir = path.resolve(targetPath, 'node_modules')
    log.verbose('targetPath', targetPath)
    log.verbose('storeDir', storeDir)
    pkg = new Package({
      targetPath,
      packageName,
      packageVersion,
      storeDir
    })
    if (await pkg.exists()) {
      // 更新package
      await pkg.update()
    } else {
      await pkg.install()
      // 安装package
    }
  } else {
    pkg = new Package({
      targetPath,
      packageName,
      packageVersion
    })
  }
  const rootFile = pkg.getRootFilePath()
  console.log('rootFile', rootFile)
  if (rootFile) {
    require(rootFile).apply(null, arguments)
  }
  
}

module.exports = exec;

