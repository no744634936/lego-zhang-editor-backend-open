/**
 * @description 错误报警
 * @author zhang
 */

const sendEmail = require('../vendor/sendEmail')
const { adminMailAddress } = require('../config/index')
const { isPrd, isDev, isTest } = require('../utils/env')
const { cacheSet, cacheGet } = require('../cache/index')

/**
 * 检查缓存
 * @param {string} title title
 */
async function getCache(title) {
    const key = `email_alarm_${title}`
    const res = await cacheGet(key)
    if (res == null) {
        // 缓存中没有，则加入缓存
        cacheSet(
            key,
            1, // 缓存 val 无所谓，有title就行，值是什么无所谓
            2 * 60 // 缓存 2 分钟，即 2 分钟内不频繁发送
        )
    }
    return res
}

/**
 * 邮件报警，普通报警
 * @param {string} title title
 * @param {Error|string|Object} error 错误信息
 */
async function emailAlarm(title, error) {
    if (isDev || isTest) {
        // 如果将isDev 去掉，本地开发环境也可以发邮件
        // dev test 环境下不发报警，没必要
        console.log('dev, test 环境，不发报警')
        return
    }

    if (!title || !error) return

    // 检查缓存。title 相同的报警，不要频繁发送,同一个title的邮件短时间内发送几十上百次，受不了
    const cacheRes = await getCache(title)
    if (cacheRes != null) return // 尚有缓存，说明刚刚发送过，不在频繁发送

    // 拼接标题
    let alarmTitle = `【lego】报警 - ${title}`
    if (!isPrd) {
        // prd_dev
        alarmTitle += '（测试机环境）' // 和线上作区分
    }

    // 拼接内容
    let alarmContent = ''
    if (typeof error === 'string') {
        // 报错信息是字符串
        alarmContent = `<p>${error}</p>`
    } else if (error instanceof Error) {
        // 报错信息是 Error 对象
        const errMsg = error.message
        const errStack = error.stack
        alarmContent = `<h1>${errMsg}</h1><p>${errStack}</p>`
    } else {
        // 其他情况，不是用来报警的
        alarmContent = `<p>${JSON.stringify(error)}</p>`
        return
    }
    alarmContent += '<p><b>请尽快处理问题，勿回复此邮件</b></p>'

    try {
        // 发送邮件
        await sendEmail(adminMailAddress, alarmTitle, alarmContent)
    } catch (ex) {
        console.error('邮件报警错误', ex)
    }
}

module.exports = {
    emailAlarm,
}
