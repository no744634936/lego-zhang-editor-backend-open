/**
 * @description 心跳检测,最低程度地测试所有项目的数据库连接
 * @author zhanghaifeng
 */

const { CronJob } = require('cron')
const checkAllServers = require('./check_server')

/**
 * 开始定时任务
 * @param {string} cronTime cron 规则
 * @param {Function} callback 回调函数
 */
function schedule(cronTime, callback) {
    if (!cronTime) return
    if (typeof callback !== 'function') return

    // 创建定时任务
    const c = new CronJob(
        cronTime,
        callback,
        null, // onComplete 何时停止任务，null
        true, // 初始化之后立刻执行，否则要执行 c.start() 才能开始
        'Asia/Tokyo' // 时区
    )

    // 进程结束时，停止定时任务
    process.on('exit', () => c.stop())
}

// 开始定时任务
function main() {
    const cronTime = '*/10 * * * *' // 每隔 10 分钟检查一次，注意这里是5颗星，不是六颗星
    schedule(cronTime, checkAllServers)
    console.log('设置心跳检测定时任务', cronTime)
}

main()
