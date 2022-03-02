/* eslint-disable no-useless-return */
/**
 * @description 检测各个服务
 * @author zhanghaifeng
 */

const axios = require('axios')
const { emailAlarm } = require('../src/email-alarm/index')

/**
 * 测试 API 的数据库连接
 * @param {string} url url
 */
async function checkServerDbConn(url = '') {
    if (!url) return

    try {
        const res = await axios(url)
        const { data = {}, errno } = res.data
        /**
         * 数据格式：
         {
             "errno": 0,
                "data": {
                    "name": "zhang editor server 20220206",
                    "version": "0.1.0",
                    "ENV": "prd_dev",
                    "mysqlConn": true,
                    "mongodbConn": true,
                    "redisConn": true,
                    "mysqlTablesCreated": true
                }
            }
        */
        const { name, version, ENV } = data
        if (errno === 0 && name && version && ENV) {
            console.log('心跳检测成功', url)
            return
        }
        // 报警
        // 这里加个${url}的原因是，为了防止多次重复报警
        // email报警的title是会被缓存的，
        // 一个心跳测试报警，为了不影响其他的心跳测试也报警
        // email报警的title必须各不相同
        emailAlarm(`心跳检查失败 ${url}`, res)
    } catch (ex) {
        // 报警
        emailAlarm(`心跳检查失败 ${url}`, ex)
    }
}

/**
 * 检查图片
 * @param {string} url url
 */
async function checkImg(url = '') {
    if (!url) return
    try {
        const res = await axios(url)
        const { status, headers } = res
        const contentType = headers['content-type']
        if (status === 200 && contentType.indexOf('image') === 0) {
            console.log('心跳检测成功', url)
            return
        }
        // 报警
        emailAlarm(`心跳检查失败 ${url}`, res)
    } catch (ex) {
        // 报警
        emailAlarm(`心跳检查失败 ${url}`, ex)
    }
}

/**
 * 检查各个服务
 */
async function checkAllServers() {
    console.log('心跳检测 - 开始')

    // biz-editor-server，线上机服务器的url
    await checkServerDbConn('https://xxxxxxxxx/api/db_check')

    // h5-server
    // await checkServerDbConn('https://xxxxxxxxx/api/db-check')

    // // admin-server
    // await checkServerDbConn('https://xxxxxxxxx/api/db-check')

    // // 统计服务 - OpenAPI
    // await checkServerDbConn('https://xxxxxxxxx/api/db-check')

    // // 统计服务 - 收集日志
    // await checkImg('https://xxxxxxxxxxxx/event.png')

    console.log('心跳检测 - 结束')
}

module.exports = checkAllServers
