const router = require('koa-router')()
const packageInfo = require('../../package.json')
const testMysqlConn = require('../db/mysql2')
const { ENV } = require('../utils/env')
const { WorkContentModel } = require('../models/workContentModel')
const { cacheGet, cacheSet } = require('../cache/index')
const initTables = require('../controllers/initTables')
const { emailAlarm } = require('../email-alarm/index')

router.get('/', async (ctx, next) => {
    await ctx.render('index', {
        title: 'Hello Koa 2!',
    })
})

router.get('/string', async (ctx, next) => {
    ctx.body = 'koa2 string'
})

router.get('/json', async (ctx, next) => {
    ctx.body = {
        title: 'koa2 json',
    }
})

router.get('/throwError', async (ctx, next) => {
    throw Error()

    // eslint-disable-next-line no-unreachable
    ctx.body = {
        test: 'hahaha',
    }
})

// 测试数据库的连接
router.get('/api/db_check', async (ctx, next) => {
    // 测试mysql连接
    const mysqlResponse = await testMysqlConn()

    // 测试 mongodb 连接
    let mongodbConn
    let mysqlTablesCreated
    try {
        mongodbConn = true
        mysqlTablesCreated = true
        // 建立与mysql有关的数据表
        await initTables()
        await WorkContentModel.findOne() // 不报错就算连接成功
    } catch (ex) {
        console.log(ex)
        mongodbConn = false
        mysqlTablesCreated = false
    }

    // 测试 redis 连接
    cacheSet('name', 'biz editor sever OK - by redis')
    const redisTestVal = await cacheGet('name')

    ctx.body = {
        errno: 0,
        data: {
            name: 'lego zhang editor backend 20220226',
            version: packageInfo.version,
            ENV,
            mysqlConn: mysqlResponse.length > 0,
            mongodbConn,
            redisConn: redisTestVal != null,
            mysqlTablesCreated,
        },
    }
})

// 邮件会被缓存 2 分钟，即 2 分钟内不频繁触发该api
router.get('/api/email_send_test', async (ctx, next) => {
    emailAlarm(`发送邮件测试-${ENV}`, 'test test')
})

module.exports = router
