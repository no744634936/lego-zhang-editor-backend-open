// 用异步模拟一个发送短信流程
// 耗费时间的操作都用promise包裹一下才行
async function sendVerifyCodeMsg(phoneNumber, code, timeout = '') {
    if (!phoneNumber || !code) return Promise.reject(new Error('手机号或验证码为空'))
    return Promise.resolve('ok')
}

module.exports = {
    sendVerifyCodeMsg,
}
