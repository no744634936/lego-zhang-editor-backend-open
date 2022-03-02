const seq = require('../db/seq/seq')
const { STRING, DATE, BOOLEAN } = require('../db/seq/types')

const userSchema = {
    username: {
        type: STRING,
        allowNull: false,
        unique: 'username', // 不要用 unique: true, https://www.chaoswork.cn/1064.html
        comment: '用户名，唯一',
    },
    password: {
        type: STRING,
        allowNull: false,
        comment: '密码',
    },
    phoneNumber: {
        type: STRING,
        allowNull: false,
        unique: 'phoneNumber',
        comment: '手机号，唯一',
    },
    nickName: {
        type: STRING,
        comment: '昵称',
    },
    gender: {
        type: STRING,
        allowNull: false,
        defaultValue: 0,
        comment: '性别（1 男性，2 女性，0 保密）',
    },
    picture: {
        type: STRING,
        comment: '头像，图片地址',
    },
    city: {
        type: STRING,
        comment: '城市',
    },
    latestLoginAt: {
        type: DATE,
        defaultValue: null,
        comment: '最后登录时间',
    },
    isFrozen: {
        type: BOOLEAN,
        defaultValue: false,
        comment: '用户是否冻结',
    },
}

const User = seq.define('user', userSchema)

// node src/db_tables/userModel.js 不报错就应该没问题，这句命令会自动建表
// 别忘了initTables.js 文件里要引入User以便部署的时候通过db_check 接口创建mysql数据表

module.exports = User
