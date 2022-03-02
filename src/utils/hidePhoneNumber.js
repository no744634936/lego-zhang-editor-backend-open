/**
 * 隐藏手机号
 * @param {string} number 手机号
 * 把手机号码隐藏一部分'136****7004'
 */

function hidePhoneNumber(number = '') {
    const n = number.toString()

    if (!n) return n

    const reg = /^1[3456789]\d{9}$/ // 手机号正则
    if (reg.test(n) === false) return n

    return `${n.slice(0, 3)}****${n.slice(-4)}`
}

module.exports = { hidePhoneNumber }
