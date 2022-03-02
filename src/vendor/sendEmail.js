/**
 * @description 发送邮件
 * @author zhang
 */

const nodemailer = require('nodemailer')
const config = require('../config/index')
// 创建发送邮件的客户端
const transporter = nodemailer.createTransport({
    host: 'smtp.126.com',
    port: 465, // 默认
    secure: true, // true for 465, false for other ports
    auth: {
        user: config.emailAddress,
        pass: config.emailPass,
    },
})

/**
 * @param {Array} mails 邮箱列表,群发邮件
 * @param {string} subject 邮件主题
 * @param {string} content 邮件内容，支持 html 格式
 */
async function sendEmail(mails = [], subject = '', content = '') {
    if (!mails.length) return
    if (!subject || !content) return

    // 邮件配置
    const conf = {
        from: '"lego-zhang" <zhanghaifeng2022@126.com>',
        to: mails.join(','),
        subject,
    }
    // 如果是html格式
    if (content.indexOf('<') === 0) {
        // html 内容
        conf.html = content
    } else {
        // text 内容
        conf.text = content
    }

    // 发送邮件
    const res = await transporter.sendMail(conf)

    console.log('mail sent: %s', res.messageId)
}

module.exports = sendEmail
