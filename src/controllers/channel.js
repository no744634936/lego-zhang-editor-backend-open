/**
 * @description controller channel
 * @author zhang
 */

const {
    createChannelService,
    updateChannelService,
    findChannelsService,
} = require('../services/channel')

const {
    createChannelFailInfo,
    createChannelDbErrorFailInfo,
    updateChannelFailInfo,
    updateChannelDbErrorFailInfo,
    findChannelListFailInfo,
} = require('../responseModel/failInfo/channel')

const { ErrorRes, SuccessRes } = require('../responseModel/index')
const { emailAlarm } = require('../email-alarm/index')
/**
 * 创建渠道
 * @param {object} data 渠道数据
 * 一个作品可以对应多个渠道
 */
async function createChannel(data = {}) {
    const { workId, channelName } = data
    // 首先对参数进行检查
    if (!workId || !channelName) {
        return new ErrorRes(createChannelFailInfo, '渠道名和作品 id 不能为空')
    }

    let result
    try {
        result = await createChannelService(data)
    } catch (ex) {
        console.error('创建渠道错误', ex)
        // 报警功能
        emailAlarm(`创建渠道错误 - ${ex.message}`, ex)
        return new ErrorRes(createChannelDbErrorFailInfo)
    }

    if (result == null) return new ErrorRes(createChannelFailInfo)
    return new SuccessRes(result)
}

/**
 * 删除渠道
 * @param {string} id id
 */
async function deleteChannel(id) {
    if (!id) return new ErrorRes(updateChannelFailInfo, 'id 不能为空')

    let result
    try {
        result = await updateChannelService(
            {
                status: 0, // 假删除，实际更新 status
            },
            {
                id,
            }
        )
    } catch (ex) {
        console.error('删除渠道错误', ex)
        // 报警功能
        emailAlarm(`删除渠道错误 - ${ex.message}`, ex)
        return new ErrorRes(updateChannelDbErrorFailInfo)
    }

    if (result) return new SuccessRes() // 成功
    return new ErrorRes(updateChannelFailInfo)
}

/**
 * 更新渠道
 * @param {string} id id
 * @param {string} channelName 名称
 */
async function updateChannelName(id, channelName) {
    if (!id || !channelName) return new ErrorRes(updateChannelFailInfo, 'id 和名称不能为空')

    let result
    try {
        result = await updateChannelService({ channelName }, { id })
    } catch (ex) {
        console.error('更新渠道错误', ex)
        // 报警功能
        emailAlarm(`更新渠道错误 - ${ex.message}`, ex)
        return new ErrorRes(updateChannelDbErrorFailInfo)
    }

    if (result) return new SuccessRes() // 成功
    return new ErrorRes(updateChannelFailInfo)
}

/**
 * 获取作品的渠道列表
 * @param {string} workId 作品 id
 */
async function getWorkChannels(workId) {
    if (!workId) return new ErrorRes(findChannelListFailInfo, 'id 和名称不能为空')

    const result = await findChannelsService({
        workId,
    })

    return new SuccessRes(result)
}

module.exports = {
    createChannel,
    deleteChannel,
    updateChannelName,
    getWorkChannels,
}
