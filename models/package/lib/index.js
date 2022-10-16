'use strict';

const path = require('path') 
const pkgDir = require('pkg-dir').sync
const npmInstall = require('npminstall')
const {isObject} = require('@imooc-cli-dev/utils')
const formatPath = require('@imooc-cli-dev/format-path')
const {getDefaultRegistry} = require('@imooc-cli-dev/get-npm-info')

class Package {
  constructor(options = {}) {
    if (!isObject(options)) {
      throw new Error('options参数必须为对象')
    }
    // package路径
    this.targetPath = options.targetPath
    // 缓存package路径
    this.storeDir = options.storeDir
    // packageName
    this.packageName = options.packageName
    // package版本
    this.packageVersion = options.packageVersion
  }

  // 判断当前Package是否存在
  exists() {}

  // 安装Package
  install() {
    return npmInstall({
      root: this.targetPath,
      storeDir: this.storeDir,
      registry: getDefaultRegistry(),
      pkgs: [{
        name: this.packageName, 
        version: this.packageVersion
      }]
    })
  }

  // 更新Package
  update() {}

  // 获取入口文件的路径
  getRootFilePath() {
    const dir = pkgDir(this.targetPath)
    if (dir) {
      const pkgFile = require(path.resolve(dir, 'package.json'))
      if (pkgFile && pkgFile.main) {
        // 路径的兼容
        return formatPath(path.resolve(dir, pkgFile.main))
      }
    }
    return null
  }
}
module.exports = Package;


