/**
 * @description 生成一个密码。手机号注册时，需要生成一个随机的密码
 * @author zhang
 */

const { uuid } = require('uuidv4')

/**
 * 生成一个密码
 */
function genPassword() {
    const s = uuid() // 格式如 5e79b94b-548a-444a-943a-8a09377e3744
    return s.split('-')[0]
}
module.exports = {
    genPassword,
}
