/**
 * @description 检查数据库连接
 * @author zhang haifeng
 */

const { get } = require('./_server')

test('数据库连接', async () => {
    const { data, errno } = await get('/api/db_check')

    const { redisConn, mysqlConn, mongodbConn } = data

    expect(errno).toBe(0)
    expect(redisConn).toBe(true)
    expect(mysqlConn).toBe(true)
    expect(mongodbConn).toBe(true)
})
