const router = require('koa-router')()
const loginCheck = require('../middlewares/requireLogin')
const validate = require('../middlewares/validate')
const { workInfoSchema } = require('../validateSchema/work')
const {
    createWorks,
    findOneWork,
    updateWorks,
    deleteWork,
    putBackWork,
    transferWorks,
    findMyWorks,
    publishWork,
    copyWork,
} = require('../controllers/work')

router.prefix('/api/work')

// 创建作品，可以创建空白作品（只有title没有内容）也可以创建非空白作品
router.post('/create', loginCheck, validate(workInfoSchema), async (ctx, next) => {
    const { phoneNumber } = ctx.userInfo
    const { title, desc, content = {} } = ctx.request.body
    const response = await createWorks(phoneNumber, { title, desc }, content)
    ctx.body = response
})

// 查询单个作品
router.get('/getWork/:id', loginCheck, async ctx => {
    // 不止id 还要有phoneNumber,保证安全性，避免查询他人作品，需要两个信息匹配才能查
    const { id } = ctx.params
    const { phoneNumber } = ctx.userInfo

    const res = await findOneWork(id, phoneNumber)
    ctx.body = res
})

// 获取自己的作品或模板
// 支持 查询 跟 分页
router.get('/getMyWorks', loginCheck, async ctx => {
    const { phoneNumber } = ctx.userInfo
    // isTemplate = '0' 表示查询的是作品(work)，如果isTemplate = '1' 表示查询的是模板(template)
    // 从url的query里面获取数据，isTemplate = '0' 是字符串不是数字？ 因为iquery里面的参数都是字符串
    const { title, status, isTemplate = '0', pageIndex, pageSize } = ctx.query
    const res = await findMyWorks(
        phoneNumber,
        { title, status, isTemplate },
        { pageIndex, pageSize }
    )
    ctx.body = res
})

// 修改作品信息
router.patch('/update/:id', loginCheck, async ctx => {
    const { id } = ctx.params
    const { phoneNumber } = ctx.userInfo

    const res = await updateWorks(id, phoneNumber, ctx.request.body)
    ctx.body = res
})

// 删除作品
router.delete('/:id', loginCheck, async ctx => {
    const { id } = ctx.params
    const { phoneNumber } = ctx.userInfo

    const res = await deleteWork(id, phoneNumber)
    ctx.body = res
})

// 恢复删除
router.patch('/put-back/:id', loginCheck, async ctx => {
    const { id } = ctx.params
    const { phoneNumber } = ctx.userInfo

    const res = await putBackWork(id, phoneNumber)
    ctx.body = res
})

// 转赠作品,将自己的作品转赠给别人
router.post('/transfer/:id/:receiver', loginCheck, async ctx => {
    const { id, receiver } = ctx.params
    const { phoneNumber } = ctx.userInfo

    const res = await transferWorks(id, phoneNumber, receiver)
    ctx.body = res
})

// 发布作品
// 发布作品得到一个这个样子的url localhost:3000/p/21-2785
router.post('/publish/:id', loginCheck, async ctx => {
    const { id } = ctx.params
    const { phoneNumber } = ctx.userInfo
    const res = await publishWork(id, phoneNumber)
    ctx.body = res
})

// 发布作品之后并当作模板
router.post('/publish-template/:id', loginCheck, async ctx => {
    const { id } = ctx.params
    const { username } = ctx.userInfo
    const res = await publishWork(id, username, true)
    ctx.body = res
})

// 复制作品（通过模板创建作品，就是复制，也就是将别人的模板粘贴复制,变成自己的）
// 可以复制别人的公开的template，(只有公开的work才能成为template，才能被其他用户看见)
// 也可以复制自己的作品(work)
router.post('/copy/:id', loginCheck, async ctx => {
    const { id } = ctx.params
    const { phoneNumber } = ctx.userInfo

    const res = await copyWork(id, phoneNumber)
    ctx.body = res
})
module.exports = router
