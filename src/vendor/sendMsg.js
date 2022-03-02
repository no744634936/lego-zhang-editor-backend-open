const AWS = require('aws-sdk')
const { awsMsgConf } = require('../config/index')
const { emailAlarm } = require('../email-alarm/index')

AWS.config.update({
    accessKeyId: awsMsgConf.accessKeyId,
    secretAccessKey: awsMsgConf.secretAccessKey,
    region: awsMsgConf.region,
})
const sns = new AWS.SNS({ apiVersion: '2010-03-31' })

const sendVerifyCodeMsg = async (phoneNumber, verifyCode) => {
    const params = {
        Message: `[lego-zhang]your verification code is:${verifyCode},please used it in 2 minutes`,
        PhoneNumber: `+81${phoneNumber}`,
        // StringValue 是短信的标题，
        MessageAttributes: {
            'AWS.SNS.SMS.SenderID': {
                DataType: 'String',
                StringValue: 'test',
            },
        },
    }

    try {
        const result = await sns.publish(params).promise()
        return result
    } catch (error) {
        console.error('AWS sms 发送短信错误', error)
        // 发送邮件报警
        emailAlarm(`AWS sms 发送短信错误 - ${error.message}`, error)
        throw new Error('AWS sms 发送短信错误')
        // 对于这种第三方服务，就算发生错误也不能让程序停下来，而是抛出错误，之后做下一步的处理
    }
}

// 用 node sendMsg.js   运行文件测试一下
// async functions return promises. you need to do
// ;(async () => {
//     const result = await sendVerifyCodeMsg('9082657624', '1234')
//     console.log(result)
// })()

module.exports = sendVerifyCodeMsg
