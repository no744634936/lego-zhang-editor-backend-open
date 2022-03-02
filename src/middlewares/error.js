/**
 * @description 错误统一处理中间件
 * @author zhanghaifeng
 */

const { ErrorRes } = require('../responseModel/index')
const { serverErrorFailInfo, notFoundFailInfo } = require('../responseModel/failInfo/index')
const { isPrd } = require('../utils/env')
const { emailAlarm } = require('../email-alarm/index')

/**
 * 统一错误处理
 * @param {object} ctx ctx
 * @param {Function} next next
 */
async function onerror(ctx, next) {
    try {
        // app.js 中本中间件必须放在所有中间件之前
        // 在app.js 里执行本中间件后面的所有中间件，如果有错误就catch住
        await next()
    } catch (ex) {
        // 写入日志文件之中
        console.error('onerror middleware', ex)

        // 发送邮件报警
        // 统一错误报警，标题中必须错误信息，因为报警会依据标题做缓存
        emailAlarm(`onerror 中间件 - ${ex.message}`, ex)

        const errInfo = serverErrorFailInfo
        if (!isPrd) {
            // 非线上环境，暴露错误信息
            errInfo.data = {
                message: ex.message,
                stack: ex.stack,
            }
        }
        ctx.body = new ErrorRes(errInfo)
    }
}

/**
 * 404
 * @param {object} ctx ctx
 */
async function onNotFound(ctx) {
    ctx.body = new ErrorRes(notFoundFailInfo)
}

module.exports = {
    onerror,
    onNotFound,
}
