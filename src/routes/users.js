const router = require('koa-router')()
const validate = require('../middlewares/validate')
const loginCheck = require('../middlewares/requireLogin')
const {
    phoneNumberSchema,
    phoneNumberVerifyCodeSchema,
    userInfoSchema,
} = require('../validateSchema/user')
const {
    sendVerifyCode,
    loginByPhoneNumberVerifyCode,
    getUserinfo,
    updateUserInfo,
} = require('../controllers/user')

// 路由前缀
router.prefix('/api/user')

router.post('/genVerifyCode', validate(phoneNumberSchema), async (ctx, next) => {
    const { phoneNumber, isRemoteTest } = ctx.request.body
    // 发送验证码
    const response = await sendVerifyCode(phoneNumber, isRemoteTest)
    ctx.body = response
})

// 使用手机号,验证码登录
router.post('/loginByPhoneNumber', validate(phoneNumberVerifyCodeSchema), async ctx => {
    const { phoneNumber, verifyCode } = ctx.request.body
    const res = await loginByPhoneNumberVerifyCode(phoneNumber, verifyCode)
    ctx.body = res
})

// 获取用户信息，需要登录
// loginCheck的时候就phoneNumber等一部分信息放到了 ctx之中，用ctx.userInfo 获取
router.get('/getUserInfo', loginCheck, async (ctx, next) => {
    const { phoneNumber } = ctx.userInfo
    const res = await getUserinfo(phoneNumber)
    ctx.body = res
})

// 更新用户信息，需要登录
router.patch('/updateUserInfo', loginCheck, async (ctx, next) => {
    const { phoneNumber } = ctx.userInfo
    const res = await updateUserInfo(phoneNumber, ctx.request.body)
    ctx.body = res
})

module.exports = router
