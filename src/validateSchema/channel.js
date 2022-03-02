/**
 * @description 数据校验 channel
 * @author zhanghaifeng
 */

const strRule = {
    type: 'string',
    maxLength: 255,
}
const numRule = {
    type: 'number',
}

// 创建作品 schema
const channelSchema = {
    type: 'object',
    // 用户信息要符合 ChannelModel 配置
    required: ['channelName'],
    properties: {
        channelName: strRule,
        workId: numRule,
    },
}

module.exports = channelSchema
