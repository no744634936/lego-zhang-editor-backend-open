const { isDev, isTest, isPrd } = require('../utils/env')
const { ErrorRes, SuccessRes } = require('../responseModel/index')
const {
    sendVeriCodeFrequentlyFailInfo,
    sendVeriCodeErrorFailInfo,
    loginVeriCodeIncorrectFailInfo,
    userFrozenFailInfo,
    createUserDbErrorFailInfo,
    updateUserInfoDbErrorFailInfo,
    updateUserInfoFailInfo,
} = require('../responseModel/failInfo/users')
const { msgVeriCodeTimeout } = require('../config/index')
const { getVerfiyCodeFromCache, setVerifyCodeToCache } = require('../cache/verifyCode')
const { sendVerifyCodeMsg } = require('../utils/sendVerifyCodeMsg')
const { findOneUser, createUser, doUpdateUserInfo } = require('../services/user')
const { jwtCreate } = require('../utils/jwt')
const { genPassword } = require('../utils/generatePassword')
const doCrypto = require('../utils/crypto')
const { emailAlarm } = require('../email-alarm/index')

async function sendVerifyCode(phoneNumber, isRemotedTest = false) {
    // 首先从缓存中获取验证码看是否存在，防止有人频繁获取验证码
    const verifyCodeFromCache = await getVerfiyCodeFromCache(phoneNumber)

    // 如果缓存里面有验证码
    if (verifyCodeFromCache) {
        // 非线上环境直接返回从缓存中获取的验证码
        if (!isPrd) {
            return new SuccessRes({ verifyCode: verifyCodeFromCache })
        }
        // 线上环境，直接返回错误不在重新发送
        return new ErrorRes(sendVeriCodeFrequentlyFailInfo)
    }

    // 如果缓存里面没有验证码
    // 生成4位随机数
    const verifyCode = Math.random().toString().slice(-4)
    let sendSuccess = false

    if (isTest || isDev) {
        // 本地接口测试不用发短信，直接返回验证码，发短信会有单独的接口测试
        sendSuccess = true
    } else if (isRemotedTest) {
        // 远程测试不用发短信，直接返回验证码，
        sendSuccess = true
    } else {
        // 其他情况(线上环境)正式发短信
        // 为什么用try catch？因为发短信调用的是第三方服务，有可能会成功，有可能失败
        try {
            // 短信提示的过期时间，单位为分钟
            const msgTimeoutMin = (msgVeriCodeTimeout / 60).toString()
            // 这个方法是模拟的，并不能真正发送短信。真正发短信需要使用vendor/sendMsg.js里的方法
            await sendVerifyCodeMsg(phoneNumber, verifyCode, msgTimeoutMin)
            sendSuccess = true
        } catch (ex) {
            sendSuccess = false
            // 这个错误是自动储存在pm2的错误日志里的
            console.error('发送短信验证码时发生错误', ex)
            // 这里本该有个邮件报警功能,
            // 因为是第三方服务，这个邮件报警功能已经写在src/vendor/sendMsg.js 文件里了，这里就不用写了
        }
    }

    if (!sendSuccess) {
        // 这个错误是返回给前端的网页
        return new ErrorRes(sendVeriCodeErrorFailInfo)
    }
    // 如果短信发送成功,缓存验证码，设置timeOut
    setVerifyCodeToCache(phoneNumber, verifyCode, msgVeriCodeTimeout)

    // 返回成功的信息
    // 本来应该是非线上环境给前端网页返回个验证码，方便调试，线上环境的话验证码别给前端网页了,直接发送到用户手机
    // const responseData = isPrd ? {} : { verifyCode }
    // 但是因为线上环境没有用vendor/sendMsg.js里的方法，真的发送验证码到用户手机，所以所有环境下都给前端网页返回个验证码
    const responseData = isPrd ? { verifyCode } : { verifyCode }
    return new SuccessRes(responseData)
}

async function loginByPhoneNumberVerifyCode(phoneNumber, verifyCode) {
    // 根据电话号码从缓存中获取验证码。
    const verifyCodeFromCache = await getVerfiyCodeFromCache(phoneNumber)

    if (verifyCode !== verifyCodeFromCache) {
        return new ErrorRes(loginVeriCodeIncorrectFailInfo)
    }

    // 用户的注册登录是一体的,先查找用户信息，如果找到就登录，没有找到就新建一个用户
    // 先查找，找到就返回
    const userInfo = await findOneUser({ phoneNumber })

    // 如果找到了user的数据
    if (userInfo) {
        // 用户是否被冻结，如果被冻结返回相应错误信息
        if (userInfo.isFrozen) {
            return new ErrorRes(userFrozenFailInfo)
        }

        // 更新最后登录的时间
        try {
            await doUpdateUserInfo(userInfo.username, { latestLoginAt: new Date() })
        } catch (ex) {
            console.error('更新最后登录时间时发生错误', ex)
            // 报警功能
            emailAlarm(`用户登录，更新最后登录时间时发生错误 - ${ex.message}`, ex)
        }

        // 返回登录成功的信息token
        const payload = {
            username: userInfo.username,
            phoneNumber: userInfo.phoneNumber,
            nickName: userInfo.nickName,
        }
        return new SuccessRes({
            token: jwtCreate(payload),
        })
    }

    // userInfo 找不到就创建新用户
    // 手机号注册，密码有没有无所谓，但是预留了密码栏位，
    // 为了不让这个密码栏位为空，自动生成了一个密码
    let password = genPassword()
    password = doCrypto(password) // 加密密码
    try {
        const newUser = await createUser({
            username: phoneNumber,
            password,
            phoneNumber,
            nickName: `lego-${phoneNumber.slice(-4)}`,
            latestLoginAt: new Date(),
        })
        // 创建成功,payload加密成token，返回给前端这个token，前端用这个token就可以登录了
        const payload = {
            username: phoneNumber,
            phoneNumber,
            nickName: `lego-${phoneNumber.slice(-4)}`,
        }
        return new SuccessRes({
            token: jwtCreate(payload),
        })
    } catch (ex) {
        console.error('创建用户失败', ex)
        // 报警功能
        emailAlarm(`创建用户失败 - ${ex.message}`, ex)

        return new ErrorRes(createUserDbErrorFailInfo)
    }
}

async function getUserinfo(phoneNumber) {
    // 根据手机号找到这个人的信息
    // 为什么不用try catch 处理查找失败时的情况，是因为只有登录完成后才能看到到自己的信息，
    // loginByPhoneNumberVerifyCode 方法里已经处理过了
    const userInfo = await findOneUser({ phoneNumber })
    return new SuccessRes({
        userInfo,
    })
}

async function updateUserInfo(phoneNumber, data = {}) {
    let response
    try {
        /** 
        data 就是路由传过来的 ctx.request.body
        {
            "username": "zhang1123",
            "nickName": "zhanghaifeng_kkk",
            "gender": "1",
            "picture": "test",
            "city": null,
        }
        */
        response = await doUpdateUserInfo(phoneNumber, data)
        // 更新成功重新做一个token，前端会在cookie中将原来的token替换成这个新token
        if (response) {
            const userInfo = await findOneUser({ phoneNumber })
            const payload = {
                username: userInfo.username,
                phoneNumber: userInfo.phoneNumber,
                nickName: userInfo.nickName,
            }
            // 修改成功重新生成token,并返回
            return new SuccessRes({ token: jwtCreate(payload) })
        }
    } catch (ex) {
        // 数据库操作失败
        console.error('修改用户信息失败', ex)
        // 报警功能
        emailAlarm(`修改用户信息失败 - ${ex.message}`, ex)
        return new ErrorRes(updateUserInfoDbErrorFailInfo)
    }

    // try 里的 if (response) 不成立的情况下
    return new ErrorRes(updateUserInfoFailInfo)
}

module.exports = {
    sendVerifyCode,
    loginByPhoneNumberVerifyCode,
    getUserinfo,
    updateUserInfo,
}
