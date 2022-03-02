const path = require('path')
const _ = require('lodash')
const fs = require('fs')
const formidable = require('formidable')
const uploadS3 = require('../vendor/uploadS3')
const { isWindows } = require('../utils/isWidnows')
const { isDev, isTest, isPrd } = require('../utils/env')
const { ErrorRes, SuccessRes } = require('../responseModel/index')
const { uploadImgFailInfo } = require('../responseModel/failInfo/index')
const { textCensor, imgCensor } = require('../vendor/contentSensor')

const form = formidable({ multiples: true })

// windows 系统，建立一个临时存储文件的目录，ios系统不需要这两步
const TMP_PATH_WINDOWS = 'tmp-files-windows'
// windows 系统，处理 rename 报错
if (isWindows) {
    const tmpPath = path.resolve(__dirname, '..', '..', TMP_PATH_WINDOWS)
    // 判断文件夹是否存在，不存在就新建一个
    if (!fs.existsSync(tmpPath)) {
        fs.mkdirSync(tmpPath)
    }
    form.uploadDir = TMP_PATH_WINDOWS
}

/**
 * 给 fileName 加个后缀，防止重复。如 `a.png` 变为 `a-xxx.png`
 */
function addSuffixForFileName(fileName = '') {
    // 用随机数，做一个后缀
    const suffix = Math.random().toString().slice(-6)

    if (!fileName) return ''
    const lastPointIndex = fileName.lastIndexOf('.') // 没有找到后缀名前面那一个点 返回-1

    if (lastPointIndex < 0) {
        // 文件名没有后缀名，变为 `a-xxx`
        return `${fileName}-${suffix}`
    }

    // 文件名有后缀名，变为 `a-xxx.png`
    return `${fileName.slice(0, lastPointIndex)}-${suffix}${fileName.slice(lastPointIndex)}`
}

/**
 * 通过 formidable 上传图片
 * @param {object} req ctx.req
 */
function uploadImgByFormidable(req) {
    // 图片上传耗时间，是一个异步操作，必须用promise ，然后直接return promise
    const p = new Promise((resolve, reject) => {
        // form.parse(req, async function upload(err, fields, files) 这个是 formidable规定的格式
        // 他会自动把files保存到本地
        form.parse(req, async function upload(err, fields, files) {
            if (err) {
                reject(err)
            }

            // console.log('fields.....', fields) // formData 其他参数，格式如如 { bbb: '123', ccc: 'abc' }

            // 遍历所有图片，并上传,
            const filesKeys = Object.keys(files)
            try {
                const links = await Promise.all(
                    filesKeys.map(name => {
                        const file = files[name]
                        let fileName = file.name || name
                        fileName = addSuffixForFileName(fileName) // 给 name 加个后缀，防止名称重复
                        return uploadS3(fileName, file.path)
                    })
                )
                // for (name of filesKeys) {
                //     const file = files[name]
                //     let fileName = file.name || name
                //     fileName = addSuffixForFileName(fileName) // 给 name 加个后缀，防止名称重复
                //     const url = await uploadS3(fileName, file.path)
                //     links.push(url)
                // }

                // 删除源文件
                _.forEach(files, file => {
                    fs.unlinkSync(file.path)
                })
                // 返回结果
                resolve(links) // 返回一个连接数组
            } catch (ex) {
                reject(ex)
            }
        })
    })
    return p
}

/**
 * 上传图片
 * @param {object} req ctx.req
 */
async function uploadImg(req) {
    let urls
    try {
        urls = await uploadImgByFormidable(req)
    } catch (ex) {
        console.error('上传图片错误', ex)
        // 这里本该有个邮件报警功能,
        // 因为是第三方服务，这个邮件报警功能已经写在src/vendor/uploadS3.js 文件里了，这里就不用写了
        return new ErrorRes(uploadImgFailInfo)
    }

    return new SuccessRes({
        urls,
    })
}

/**
 * 获取所有文本
 * @param {object} work 作品信息
 */
function getWorkText(work = {}) {
    const { title = '', desc = '', content = {} } = work
    const { components = [] } = content

    // 存储结果
    const result = []

    // 增加标题、描述
    result.push(title)
    result.push(desc)

    // 遍历文本组件
    components.forEach((component = {}) => {
        const { name, props = {} } = component
        if (name !== 'l-text') return // 不是文本组件
        const { text = '' } = props
        if (text) result.push(text)
    })

    return result.join('-')
}

/**
 * 获取所有图片
 * @param {object}} work 作品信息
 */
function getWorkImgs(work = {}) {
    const { content = {} } = work
    const { components = [], props = {}, setting = {} } = content
    const { backgroundImage = '' } = props // 背景图片
    const { shareImg = '' } = setting // 分享小图标

    // 存储结果
    const imgs = []

    if (backgroundImage) imgs.push(backgroundImage)
    if (shareImg) imgs.push(shareImg)

    // 遍历所有组件
    components.forEach((component = {}) => {
        // component 结构参考 https://github.com/imooc-lego/lego-components
        const { name, props = {} } = component // eslint-disable-line
        if (name !== 'l-image') return // 不是图片组件
        const { imageSrc } = props
        if (imageSrc) imgs.push(imageSrc)
    })

    return imgs
}

/**
 * 作品内容审核
 * @param {object} work 作品信息
 * @returns {null|Array} null 或错误信息
 */
async function contentCensor(work = {}) {
    // 1. 审查所有文本内容
    const text = getWorkText(work)
    const textCensorRes = await textCensor(text) // 返回 null | Array
    if (textCensorRes) {
        // 审核文本有问题，则直接返回错误，先不管图片（审核文本价格便宜，审核图片价格贵，贵的延后去做）
        return textCensorRes
    }

    // 2. 审查图片内容
    const imgs = getWorkImgs(work)
    if (imgs.length === 0) {
        // 没有图片需要审核
        return null
    }
    const imgCensorResList = await Promise.all(
        imgs.map(imgUrl => {
            const res = imgCensor(imgUrl) // 返回 null | Array
            return res
        })
    )
    const imgCensorResListFilter = imgCensorResList.filter(r => !!r) // 过滤掉 null
    if (imgCensorResListFilter.length === 0) {
        return null // 图片审核没问题
    }
    return _.flatten(imgCensorResListFilter) // [[a,b], [c]] 转换为 [a, b, c]
}
module.exports = { uploadImg, contentCensor }
