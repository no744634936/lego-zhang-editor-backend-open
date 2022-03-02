const { ErrorRes, SuccessRes } = require('../responseModel/index')
const { jwtVerify } = require('../utils/jwt')
const { loginCheckFailInfo } = require('../responseModel/failInfo/users')

// 查看用户是否已经登录，token是否合法，
async function loginCheck(ctx, next) {
    // 失败信息
    const errRes = new ErrorRes(loginCheckFailInfo)

    // 获取 token
    const token = ctx.header.authorization // 注意这里是authorization 不是Authorization
    if (!token) {
        ctx.body = errRes
        return // 注意return后面没跟任何东西。
    }

    let flag = true
    try {
        const userInfo = await jwtVerify(token)
        // 验证成功，获取 userInfo，将userInfo加到ctx里面去。
        ctx.userInfo = userInfo
    } catch (ex) {
        flag = false
        ctx.body = errRes
    }

    if (flag) {
        // 继续下一步
        await next()
    }
}

module.exports = loginCheck
