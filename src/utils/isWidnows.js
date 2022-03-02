/**
 * @description 判断当前操作系统是否为windows
 * @author zhang
 */

const os = require('os')

module.exports = {
    // 判断 windows 系统
    isWindows: os.type().toLowerCase().indexOf('windows') >= 0,
}
