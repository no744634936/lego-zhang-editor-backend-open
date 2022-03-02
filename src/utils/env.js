// 程序运行环境变量
// package.json 文件的scripts里面有根据不同的命名设置不同的NODE_ENV，cross-env这个包的作用
const ENV = process.env.NODE_ENV || ''

module.exports = {
    ENV,
    isPrd: ENV === 'production',
    isPrdDev: ENV === 'prd_dev',
    isDev: ENV === 'dev',
    // test_remote 跟test_local 都属于isTest
    isTest: ENV.indexOf('test') === 0,
    isTestLocal: ENV === 'test_local',
    isTestRemote: ENV === 'test_remote',
}
