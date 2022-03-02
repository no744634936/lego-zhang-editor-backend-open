/**
 * @description 作品 Model
 * @author zhang haifeng
 */

const seq = require('../db/seq/seq')
const { INTEGER, STRING, BOOLEAN, DATE } = require('../db/seq/types')
const User = require('./userModel')

// 作品
const workSchema = {
    uuid: {
        type: STRING,
        allowNull: false,
        unique: 'uuid',
        comment: 'uuid，h5 url 中使用，隐藏真正的 id，避免被爬虫',
    },
    title: {
        type: STRING,
        allowNull: false,
        comment: '标题',
    },
    desc: {
        type: STRING,
        comment: '副标题',
    },
    contentId: {
        type: STRING,
        allowNull: false,
        unique: 'contentId',
        comment: '内容 id ，内容存储在 mongodb 中,对应的是未发布的作品id',
    },
    publishContentId: {
        type: STRING,
        unique: 'publishContentId',
        comment: '发布内容 id ，内容存储在 mongodb 中，对应的是已发布的作品id，未发布时候为空',
    },
    authorPhoneNumber: {
        type: STRING,
        allowNull: false,
        comment: '作者的手机号,phoneNumber',
    },
    coverImg: {
        type: STRING,
        comment: '封面图片 url',
    },
    isTemplate: {
        type: BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '是否是模板',
    },
    status: {
        type: STRING,
        allowNull: false,
        defaultValue: 1,
        comment: '状态：0-删除，1-未发布，2-发布，3-强制下线',
    },
    // viewedCount: {
    //     type: INTEGER,
    //     allowNull: false,
    //     defaultValue: 0,
    //     comment: '被浏览次数',
    // },
    copiedCount: {
        type: INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '被复制的次数',
    },
    latestPublishAt: {
        type: DATE,
        defaultValue: null,
        comment: '最后一次发布的时间',
    },
    isHot: {
        type: BOOLEAN,
        defaultValue: false,
        comment: 'hot 标签，模板使用',
    },
    isNew: {
        type: BOOLEAN,
        defaultValue: false,
        comment: 'new 标签，模板使用',
    },
    orderIndex: {
        type: INTEGER,
        defaultValue: 0,
        comment: '排序参数',
    },
    isPublic: {
        type: BOOLEAN,
        defaultValue: false,
        comment: '是否公开显示，在首页公共的模板列表',
    },
}

const Work = seq.define('work', workSchema)

// 和 UserModel 建立关系
Work.belongsTo(User, {
    // 注意外键字段必须是索引，也就是说authorPhoneNumber，跟phoneNumber必须是索引
    // 用这条命令 show index from users 查看索引发现索引很乱，
    // sequelize 是怎么自动创建索引的呢？
    foreignKey: 'authorPhoneNumber',
    targetKey: 'phoneNumber', // 对应 UserModel.phoneNumber 属性
})

// 别忘了initTables.js 文件里要引入Work以便部署的时候通过db_check 接口创建mysql数据表
module.exports = Work
