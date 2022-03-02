/**
 * @description 模板 router
 * @author zhanghaifeng
 */

const router = require('koa-router')()

// controller
const { findPublicTemplates, findOneTemplate } = require('../controllers/work')

// 路由前缀
router.prefix('/api/templates')

// 获取公共模板
router.get('/', async ctx => {
    // 因为要分页，查询，所以一定要有pageIndex, pageSize两个参数
    const { title, pageIndex, pageSize } = ctx.query
    console.log(title, pageIndex, pageSize)
    const res = await findPublicTemplates({ title }, { pageIndex, pageSize })
    ctx.body = res
})

// 查询单个公共模板
router.get('/:id', async ctx => {
    const { id } = ctx.params
    const res = await findOneTemplate(id)
    ctx.body = res
})

module.exports = router
