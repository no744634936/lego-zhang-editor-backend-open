/**
 * @description 路由 channel
 * @author zhang
 */

const router = require('koa-router')()

// 中间件
const loginCheck = require('../middlewares/requireLogin')
const validate = require('../middlewares/validate')
const channelSchema = require('../validateSchema/channel')

// controller
const {
    createChannel,
    deleteChannel,
    updateChannelName,
    getWorkChannels,
} = require('../controllers/channel')

// 路由前缀
router.prefix('/api/channel')

// 创建渠道
router.post('/', loginCheck, validate(channelSchema), async ctx => {
    // console.log(ctx.request.body)
    const res = await createChannel(ctx.request.body)
    ctx.body = res
})

// 更新渠道名称
router.patch('/updateName/:id', loginCheck, validate(channelSchema), async ctx => {
    const { id } = ctx.params
    const { channelName } = ctx.request.body
    const res = await updateChannelName(id, channelName)
    ctx.body = res
})

// 根据一个作品的workId获取他的所有渠道
router.get('/getWorkChannels/:workId', loginCheck, async ctx => {
    const { workId } = ctx.params
    const res = await getWorkChannels(workId)
    ctx.body = res
})

// 删除渠道
router.delete('/:id', loginCheck, async ctx => {
    const { id } = ctx.params
    const res = await deleteChannel(id)
    ctx.body = res
})

module.exports = router
