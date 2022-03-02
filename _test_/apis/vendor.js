/**
 * @description 第三方服务 test
 * @author zhang haifeng
 */

const path = require('path')
const uploadS3 = require('../../src/vendor/uploadS3')
const { textCensor, imgCensor } = require('../../src/vendor/contentSensor')
const { sendVeriCodeMsg } = require('../../src/vendor/sendMsg')

// 上传图片，暂时不验证
// 将test-files 文件里的1.jpg 图片上传到AWS S3
// test('上传文件到AWS S3', async () => {
//     const fileName = '1.jpg'
//     const filePath = path.resolve(__dirname, '..', 'test-files', '1.jpg')

//     const url = await uploadS3(fileName, filePath)
//     expect(url).not.toBeNull()
//     expect(url.lastIndexOf(fileName)).toBeGreaterThan(0)
// })

// 文本,图片审核，暂时不验证
// test(
//     '内容审查',
//     async () => {
//         // 文本审核 - 正常文字
//         const text1 = 'hello world'
//         const textRes1 = await textCensor(text1)
//         expect(textRes1).toBeNull()

//         // 文本审核 - 敏感文字
//         const text2 = '习近平总书记'
//         const textRes2 = await textCensor(text2)
//         expect(textRes2).not.toBeNull()

//         // 图片审核 - 正常图片
//         const img1 = 'http://static-dev.imooc-lego.com/upload-files/a.jpeg'
//         const imgRes1 = await imgCensor(img1)
//         expect(imgRes1).toBeNull()

//         // 图片审核 - 敏感图片
//         const img2 =
//             'https://dss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=4022283284,2614648235&fm=26&gp=0.jpg'
//         const imgRes2 = await imgCensor(img2)
//         expect(imgRes2).not.toBeNull()
//     },
//     20 * 1000 // 单独设置 timeout，因为审核可能会需要点时间，就把timeout的期限拉长一点
// )

// 发送短信验证码，花钱的，暂时不验证
// test('发短信验证码', async () => {
//     const r = Math.random().toString().slice(-4)
//     const phoneNumber = `1860000${r}` // 每次都不同的手机号，单个手机号，一个时间段内发送次数有限制
//     const res = await sendVeriCodeMsg(phoneNumber, '0000')

//     expect(res.errno).toBe(0)
// })
