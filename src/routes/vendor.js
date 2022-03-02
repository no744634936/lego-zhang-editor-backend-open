/**
 * @description 路由 第三方服务
 * @author zhang
 */

const router = require('koa-router')()

// 中间件
const loginCheck = require('../middlewares/requireLogin')

// controller
const { uploadImg } = require('../controllers/vendor')

// 路由前缀
router.prefix('/api/vendor')

// 上传图片（form-data 形式，支持多文件上传）
// 使用 formidable 上传文件的时候，需要用到ctx.req 而不是 ctx.request
// Note: this example is assuming Koa v2.
// Be aware that you should pass ctx.req which is Node.js's Request,
// and NOT the ctx.request which is Koa's Request object - there is a difference.
router.post('/upload-img', loginCheck, async ctx => {
    const res = await uploadImg(ctx.req)
    ctx.body = res
})

module.exports = router
