/**
 * @description 封装 mongoose ，连接 mongodb
 * @author zhanghaifeng
 */

const mongoose = require('mongoose')
const { mongodbConf } = require('../config/index')

const { host, port, dbName, user, password } = mongodbConf

// 拼接连接字符串
let url = `mongodb://${host}:${port}` // dev 环境

if (user && password) {
    // 连接线上的第三方mongogdb
    // 这个url是MongoDB Atlas特有的写法，不同的服务商有不同的写法
    url = `mongodb+srv://${user}:${password}@imooc-lego-course.ejeef.mongodb.net/${dbName}?retryWrites=true&w=majority`

    mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
} else {
    // 本地mongodb的连接
    // 开始连接（ 使用用户名和密码时，需要 `?authSource=admin` ）
    mongoose.connect(`${url}/${dbName}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
}

// 连接对象
const db = mongoose.connection

console.log(url)

db.on('error', err => {
    console.error('mongoose connect error', err)
})

//  node src/db/mongoose.js 演示注释掉即可
// db.once('open', () => {
//     // 用以测试数据库连接是否成功
//     console.log('mongoose connect success')
// })

module.exports = mongoose
