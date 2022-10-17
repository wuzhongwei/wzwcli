'use strict';

const path = require('path') 
const pkgDir = require('pkg-dir').sync
const npmInstall = require('npminstall')
const pathExists = require('path-exists').sync
const fse = require('fs-extra')
const {isObject} = require('@imooc-cli-dev/utils')
const formatPath = require('@imooc-cli-dev/format-path')
const {getDefaultRegistry, getNpmLatestVersion} = require('@imooc-cli-dev/get-npm-info')

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
    // 缓存前缀
    this.cacheFilePathPrefix = this.packageName.replace('/', '_')
  }

  async prepare() {
    if (this.storeDir && !pathExists(this.storeDir)) {
      fse.mkdirpSync(this.storeDir) // 目录不存在，按照目录创建目录
    }
    if (this.packageVersion === 'latest') {
      this.packageVersion = await getNpmLatestVersion(this.packageName)
    }
  }

  get cacheFilePath() {
    return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`)
  }

  getSpecificCacheFilePath(packageVersion) {
    return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${packageVersion}@${this.packageName}`)
  }

  // 判断当前Package是否存在
  async exists() {
    if (this.storeDir) {
      await this.prepare()
      return pathExists(this.cacheFilePath)
    } else {
      return pathExists(this.targetPath)
    }
  }

  // 安装Package
  async install() {
    await this.prepare()
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
  async update() {
    await this.prepare()
    // 1.获取最新的npm版本号 
    const latestPackageVersion = await getNpmLatestVersion(this.packageName)
    // 2.查询最新版本号对应的路径是否存在
    const latestFilePath = this.getSpecificCacheFilePath(latestPackageVersion)
    // 3.如果不存在，则直接安装最新版本
    if (!pathExists(latestFilePath)) {
      await npmInstall({
        root: this.targetPath,
        storeDir: this.storeDir,
        registry: getDefaultRegistry(),
        pkgs: [{
          name: this.packageName, 
          version: latestPackageVersion
        }]
      })
      this.packageVersion = latestPackageVersion
    }
  }

  // 获取入口文件的路径
  getRootFilePath() {
    function _getRootFile(targetPath) {
      const dir = pkgDir(targetPath)
      if (dir) {
        const pkgFile = require(path.resolve(dir, 'package.json'))
        if (pkgFile && pkgFile.main) {
          // 路径的兼容
          return formatPath(path.resolve(dir, pkgFile.main))
        }
      }
      return null
    }
    if (this.storeDir) {
      return _getRootFile(this.cacheFilePath)
    } else {
      return _getRootFile(this.targetPath)
    }
    
  }
}
module.exports = Package;


