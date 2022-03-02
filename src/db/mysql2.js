const mysql = require('mysql2/promise')
const { mysqlConf } = require('../config/index')

async function testMysqlConn() {
    const connection = await mysql.createConnection(mysqlConf)
    // connection.execute返回的是一个 [rows, fields] 数组
    const [rows] = await connection.execute('select now();')
    return rows
}

// 注释掉 module.exports 之后使用 node src/db/mysql2.js 进行测试连接
// ;(async () => {
//     const data = await testMysqlConn()
//     console.log(data) // [ BinaryRow { 'now()': 2021-04-22T02:23:18.000Z } ]
// })()

module.exports = testMysqlConn
