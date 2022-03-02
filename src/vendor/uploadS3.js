const AWS = require('aws-sdk')
const path = require('path')
const fs = require('fs')
const url = require('url')
const { awsS3Conf } = require('../config/index')
const { emailAlarm } = require('../email-alarm/index')

AWS.config.update({
    accessKeyId: awsS3Conf.accessKeyId,
    secretAccessKey: awsS3Conf.secretAccessKey,
    region: awsS3Conf.region,
})

const s3 = new AWS.S3({ apiVersion: '2006-03-01' })

const BucketName = 'lego-test-bucket'

/**
 * 替换 url 的 host 为 CDN host
 * @param {string} u url
 * 这个方法以后会用，就是将s3 给文件自动生成对url转换成自己设定的url
 * 现在还不需要，
 */
// function replaceCDNHost(u = '') {
//     if (!u) return u
//     const res = url.parse(u)
//     const { protocol, path } = res
//     const u1 = `${protocol}//${CDNHost}${path}` // 替换 CDN host
//     return u1
// }

// 上传文件
const uploadS3 = async (fileName, filePath) => {
    // 必须用同步方法，因为下面的代码必须要用到fileContent
    const fileContent = fs.readFileSync(filePath)

    const folder = 'upload-files'

    const bucketParams = {
        Bucket: BucketName,
        Key: `${folder}/${fileName}`, // 文件存放的路径，lego-test-bucket 下的 upload-files/pic.jpg
        // 这样可以将图篇传入lego-test-bucket里的upload-files文件夹里，没有upload-files文件夹就新建
        Body: fileContent,
    }

    try {
        const result = await s3.upload(bucketParams).promise()
        console.log(result.Location)
        return result.Location // s3上面的文件的url
    } catch (err) {
        console.error('AWS s3 上传错误', err)
        // 发送邮件报警
        emailAlarm(`AWS s3 上传图片错误 - ${err.message}`, err)
        throw new Error('AWS s3 上传错误')
    }
}

// 单独测试用的代码,将test-files 文件里的1.jpg 图片上传
// 拼接路径就用path.resolve
// const fileName = '1-23cd.jpg'
// const filePath = path.resolve(__dirname, 'test-files', '1.jpg')
// uploadS3(fileName, filePath)

module.exports = uploadS3
