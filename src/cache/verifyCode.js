/**
 * @description 短信验证码 缓存
 * @author zhang
 */

const { cacheSet, cacheGet } = require('./index')

// cache key 前缀，重要！！否则数据容易混乱
const PREFIX = 'phone_number_verify_code-'

/**
 * 从缓存获取验证码
 * @param {string} phoneNumber 手机号
 */
async function getVerfiyCodeFromCache(phoneNumber) {
    const key = `${PREFIX}${phoneNumber}`
    const code = await cacheGet(key)
    if (code == null) return code
    return code.toString() // cacheGet 方法中有 JSON.parse
}

/**
 * 缓存验证码
 * @param {string} phoneNumber 手机号
 * @param {string} veriCode 验证码
 * @param {number} timeout timeout 单位 s
 */
async function setVerifyCodeToCache(phoneNumber, veriCode, timeout) {
    const key = `${PREFIX}${phoneNumber}`
    cacheSet(key, veriCode, timeout)
}

module.exports = {
    getVerfiyCodeFromCache,
    setVerifyCodeToCache,
}
