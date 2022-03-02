/**
 * @description res 错误信息配置
 * @author zhang
 */

const errorInfos = require('./error')
const validateInfos = require('./validate')
const usersInfos = require('./users')
const worksInfos = require('./work')
const utilsInfos = require('./vendor')
const channelInfos = require('./channel')

module.exports = {
    ...errorInfos,
    ...validateInfos,
    ...usersInfos,
    ...worksInfos,
    ...utilsInfos,
    ...channelInfos,
}
