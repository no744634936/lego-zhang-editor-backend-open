const Koa = require('koa')

const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
// const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const helmet = require('koa-helmet')
const cors = require('./middlewares/cors')
const { onerror, onNotFound } = require('./middlewares/error')

// 路由文件
const index = require('./routes/index')
const users = require('./routes/users')
const work = require('./routes/work')
const template = require('./routes/template')
const channel = require('./routes/channel')
const vendor = require('./routes/vendor')
const { emailAlarm } = require('./email-alarm/index')

// 统一错误处理中间件，写在最上面
// onerror(app) // koa自带的不好用，自己写一个中间件
app.use(onerror)

// 安全预防，优化请求头
app.use(helmet())

// middlewares
app.use(
    bodyparser({
        enableTypes: ['json', 'form', 'text'],
    })
)
app.use(json())
app.use(logger())
app.use(require('koa-static')(`${__dirname}/public`))

// 支持跨域
app.use(cors)

app.use(
    views(`${__dirname}/views`, {
        extension: 'ejs',
    })
)

// logger
app.use(async (ctx, next) => {
    const start = new Date()
    await next()
    const ms = new Date() - start
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
app.use(work.routes(), index.allowedMethods())
app.use(template.routes(), index.allowedMethods())
app.use(channel.routes(), index.allowedMethods())
app.use(vendor.routes(), index.allowedMethods())
app.use(onNotFound) // 404 路由，注册在最后

// error-handling
app.on('error', (err, ctx) => {
    console.error('server error', err, ctx)
    // 统一错误报警，标题中必须错误信息，因为报警会依据标题做缓存
    emailAlarm(`app.on error - ${err.message}`, err)
})

module.exports = app
