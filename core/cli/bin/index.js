#!/usr/bin/env node
const importLocal = require('import-local')

if (importLocal(__filename)) {
  require('npmlog').info('cli', '正在使用本地 imooc-cli版本') // 获取本地node_modules
} else {
	require('../lib')(process.argv.slice(2)) // 获取全局node_modules
}
