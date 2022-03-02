/**
 * @description 用户接口测试
 * @author zhang haifeng
 */

const { setToken, get, post, patch } = require('./_server')

const R = Math.random().toString().slice(-4)
const PHONE_NUMBER = `1550000${R}` // 每次账号不一样，走用户创建流程
let VERI_CODE = ''
let TOKEN = ''

test('获取短信验证码', async () => {
    const url = '/api/user/genVerifyCode'
    const { errno, data } = await post(url, {
        phoneNumber: PHONE_NUMBER,
        isRemoteTest: true, // test:remote 时，告诉服务器，不用发短信（发短信会有专门测试用例）
    })
    expect(errno).toBe(0)

    // console.log('genVerifyCode response: ', data)
    VERI_CODE = data.verifyCode // 获取短信验证码
    expect(VERI_CODE).not.toBeNull()
})

test('手机验证码登录', async () => {
    const url = '/api/user/loginByPhoneNumber'
    const body = {
        phoneNumber: PHONE_NUMBER,
        verifyCode: VERI_CODE,
    }
    // console.log('loginByPhoneNumber req body: ', body)
    const { errno, data } = await post(url, body)
    expect(errno).toBe(0)

    TOKEN = data.token // 获取 token
    // console.log("login token:",TOKEN)
    expect(TOKEN).not.toBeNull()

    // 统一设置 token ，后面 API 都不用每次都设置了
    setToken(TOKEN)
})

test('获取用户信息', async () => {
    const url = '/api/user/getUserInfo'
    const { data, errno } = await get(url)
    expect(errno).toBe(0)
    expect(data.userInfo.phoneNumber).toBe(PHONE_NUMBER)
})

test('修改用户信息', async () => {
    const r = Math.random().toString().slice(-4)
    const url = '/api/user/updateUserInfo'
    const { data, errno } = await patch(url, {
        nickName: `zhang-${r}`, // 加一个随机数，能看出修改的差异
        gender: 0,
    })
    expect(errno).toBe(0)
    const newToken = data.token
    expect(newToken).not.toBe(TOKEN) // 新 token 和之前的不一样

    // 重新设置 token
    setToken(newToken)

    console.log(PHONE_NUMBER)
})
