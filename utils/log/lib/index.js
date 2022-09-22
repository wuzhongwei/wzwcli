'use strict';


// lerna 安装npmlog, lerna add npmlog utils/log/
const log = require('npmlog')

log.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info' // 判断debug模式
log.heading = 'imooc' // 修改前缀
// log.headingStyle = {fg: 'red', bg: 'black'} // 修改前缀颜色
log.addLevel('success', 2000, {fg: 'green', bold: true}) // 添加自定义命令

module.exports = log;