const AipContentCensorClient = require('baidu-aip-sdk').contentCensor
const axios = require('axios')
const { baiduContentSensorConf } = require('../config/index')
// 设置APPID/AK/SK

const { APP_ID, API_KEY, SECRET_KEY, ACCESS_TOKEN } = baiduContentSensorConf

// 新建一个对象
const client = new AipContentCensorClient(APP_ID, API_KEY, SECRET_KEY)

/**
 * 文本审核
 * @param {string} text 文本内容
 * @returns {null|Array} null 或失败信息，null表示没有任何敏感信息
 */
async function textCensor(text = '') {
    if (!text.trim()) return null

    let res
    try {
        // 执行审核
        // 暂时还使用不了textCensorUserDefined 方法
        // SDK的部分API还在逐步封装中，可以直接使用API或者可以仿照别的方法先自行封装一下，
        // SDK其实就是把调用API的逻辑封装了一下而已
        // res = await client.textCensorUserDefined(text)

        const params = new URLSearchParams()
        params.append('text', text)

        const axiosConfig = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }

        res = await axios.post(
            `https://aip.baidubce.com/rest/2.0/solution/v1/text_censor/v2/user_defined?access_token=${ACCESS_TOKEN}`,
            params,
            axiosConfig
        )
    } catch (ex) {
        console.error('百度云 textCensor 错误', ex)
        // todo 发送邮件报警
    }

    if (res == null) {
        // 审查出错，也就是try里面出错了也不能妨碍用户发布信息。
        // 此时，我们需要及时修复错误，并人工处理已发布的信息。
        return null
    }

    if (res.data.conclusionType !== 2) {
        // 没有失败
        return null
    }

    // 检查失败
    // console.log('内容审查失败, text', text)
    // console.log('内容审查失败, res', res.data)

    // 获取失败信息，并分析
    const { data = [] } = res.data
    /**
    data: [
        {
            msg: '存在政治敏感不合规',
            conclusion: '不合规',
            hits: [{"datasetName":"百度默认黑词库","words":["六四事件"]}, {...}],
            subType: 3,
            conclusionType: 2,
            type: 12
        },
        {...},
        {...},
        isHitMd5: false,
        conclusionType: 2        
    ]
     conclusionType  的 1：合规，2：不合规，3：疑似，4：审核失败.
    */
    // 拼接所有的关键字
    let keywords = []
    data.forEach((item = {}) => {
        const { hits = [] } = item
        hits.forEach((hit = {}) => {
            const { words = [] } = hit
            if (words.length === 0) return
            keywords = keywords.concat(words) // 收集关键字
        })
    })

    // 关键字不为空，返回违规关键字
    if (keywords.length) {
        return keywords
    }
    // 非常正规的情况下应该加个else
    // else{
    //     // 将作品的id记录一下，后台管理画面人工审核
    //     // 消息提醒机制
    // }

    // 关键字为空，但是审核也失败了， - 遇到过这种情况，可能是百度云的一个 bug
    return null
}

// 单独测试textCensor方法时用的代码
// ;(async () => {
//     const result = await textCensor('卧槽，六四事件')
//     console.log('result', result) //  [ '六四事件', '六四事件' ]
// })()

/**
 * 审核图片
 * @param {string} imgUrl 图片url
 * @returns {null|Array} null 或失败信息
 * 要审核的图片必须要能下载才行
 */
async function imgCensor(imgUrl) {
    if (!imgUrl.trim()) return null

    let res
    try {
        // 执行检查
        res = await client.imageCensorUserDefined(imgUrl, 'url')
        console.log(res)
    } catch (ex) {
        console.error('百度云 imgCensor 错误', ex)
        // todo 发送邮件报警
    }

    if (res == null) {
        // 审查出错，也不能妨碍用户发布信息。此时，我们需要及时修复错误，并人工处理已发布的信息。
        return null
    }

    if (res.conclusionType === 1 || res.conclusionType === 4) {
        // 未失败
        return null
    }

    // 检查失败
    // console.log('图片审查失败, imgUrl', imgUrl)
    // console.log('图片审查失败, res', JSON.stringify(res, null, 4))

    // 获取失败信息，并分析
    const { data } = res
    /**
    data: [
        {
            msg: '存在政治敏感不合规',
            conclusion: '不合规',
            subType: 0,
            conclusionType: 2,
            stars: [
                { "probability": 0.94308, "name": "习近平" },
                { "probability": 0.44308, "name": "彭丽媛" }
            ],
            type: 5
        },
        {...},
        {...}
    ]
    */

    // 收集所有关键字
    const keywords = []
    data.forEach((item = {}) => {
        console.log(item)
        keywords.push(item.msg)
    })

    console.log(keywords)
    if (keywords.length) return keywords

    // 虽然失败，但没有关键字 - 遇到过这种情况，可能是百度云的一个 bug
    return null
}

// ;(async () => {
//     await imgCensor(
//         'https://lego-test-bucket.s3.ap-northeast-1.amazonaws.com/upload-files/status-013329.png'
//     )
// })()  // [ '疑似存在政治敏感不合规' ]

module.exports = {
    textCensor,
    imgCensor,
}
