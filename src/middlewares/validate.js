/**
 * @description  ctx.request.body 格式校验的中间件
 * @author zhang
 */

const Ajv = require('ajv')
const { ErrorRes } = require('../responseModel/index')
const { validateFailInfo } = require('../responseModel/failInfo/index')

const ajv = new Ajv({
    allErrors: true, // 输出所有错误
})

/**
 * json schema 校验
 * @param {Object} schema json schema 规则
 * @param {Object} data 待校验的数据
 * @returns {Array|undefined} 错误信息|undefined
 */
function validate(schema, data = {}) {
    const valid = ajv.validate(schema, data)
    if (!valid) {
        return ajv.errors
    }
    return undefined
}

/**
 * 这是一个闭包,为什么要用闭包，因为validationStart(ctx, next) 方法只能从路由里
 * 获取到(ctx, next) 两个参数，但是又要使用第三个参数schema，所以就使用了闭包
 * 生成校验中间件
 * @param {Object} schema schema 规则
 */
function validator(schema) {
    /**
     * ctx.request.body 格式校验中间件
     * @param {Object} ctx ctx
     * @param {Function} next next
     */
    async function validationStart(ctx, next) {
        const data = ctx.request.body
        const validateError = validate(schema, data)
        if (validateError) {
            // 检验失败，返回
            ctx.body = new ErrorRes({
                ...validateFailInfo, // 其中有 errno 和 message
                data: validateError, // 把失败信息也返回给前端
            })
            return
        }
        // 检验成功，继续
        await next()
    }
    return validationStart
}

module.exports = validator
