/**
 * @description 渠道 Model
 * @author zhanghaifeng
 */

const seq = require('../db/seq/seq')
const { STRING, INTEGER } = require('../db/seq/types')

// 渠道
const Channel = seq.define('channel', {
    channelName: {
        type: STRING,
        allowNull: false,
        comment: '渠道名称',
    },
    workId: {
        type: INTEGER,
        allowNull: false,
        comment: '作品 id',
    },
    status: {
        type: INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: '状态：0-删除，1-正常',
    },
})
// 别忘了initTables.js 文件里要引入Channel以便部署的时候通过db_check 接口创建mysql数据表
module.exports = Channel
