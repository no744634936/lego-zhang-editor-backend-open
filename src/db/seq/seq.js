// 配置sequlize 连接mysql

const Sequelize = require('sequelize')
const { mysqlConf } = require('../../config/index')
const { isPrd, isTest } = require('../../utils/env')

const { host, user, password, port, database } = mysqlConf

const seqConf = {
    host,
    port,
    dialect: 'mysql',
}

// 测试环境不打印日志
if (isTest) {
    seqConf.logging = () => {} // 默认是 console.log
}

// 线上环境用 链接池
if (isPrd) {
    seqConf.pool = {
        max: 5, // 连接池中最大连接数量
        min: 0, // 连接池中最小连接数量
        idle: 10000, // 如果一个线程 10 秒钟内没有被使用过的话，那么就释放线程
    }
}

// 创建连接
const seq = new Sequelize(database, user, password, seqConf)

// 注释掉 module.exports 之后使用 node src/db/seq/seq.js 进行测试连接
// seq.authenticate()
//     .then(() => {
//         console.log('ok')
//     })
//     .catch(() => {
//         console.log('fail')
//     })
//     .finally(() => {
//         process.exit()
//     })

module.exports = seq
