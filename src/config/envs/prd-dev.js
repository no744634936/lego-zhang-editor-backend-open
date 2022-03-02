// 远程测试机的配置
module.exports = {
    // mysql 连接配置
    // host和docker-compose中配置的service name一样,   即与editor-mysql: 一致
    mysqlConf: {
        host: 'editor-mysql',
        user: 'root',
        password: 'xxxxxxxxxx',
        port: '3306',
        database: 'imooc_lego_course',
    },
    // mongodb 连接配置
    // host和docker-compose中配置的service name一样,    editor-mongo:

    mongodbConf: {
        host: 'editor-mongo',
        port: '27017',
        dbName: 'imooc_lego_course',
    },
    // redis 连接配置
    // host和docker-compose中配置的service name一样,    editor-redis:

    redisConf: {
        port: '6379',
        host: 'editor-redis',
    },

    //---------------------------------
    // 短信验证码缓存时间2分钟，单位 s
    msgVeriCodeTimeout: 2 * 60,

    // jwt 过期时间
    jwtExpiresIn: '1d', // 1. 字符串，如 '1h' '2d'； 2. 如果是数字的话单位是 s

    // 发布出来的 h5 域名
    h5Origin: 'http://xxxxxx:3001',

    // AWS云短信服务配置
    awsMsgConf: {
        accessKeyId: 'xxxxxxxxxx',
        secretAccessKey: 'xxxxxxxxxx',
        region: 'ap-northeast-1',
    },
    awsS3Conf: {
        accessKeyId: 'xxxxxxxxxx',
        secretAccessKey: 'xxxxxxxxxx',
        region: 'ap-northeast-1',
    },
    baiduContentSensorConf: {
        APP_ID: '24406853',
        API_KEY: 'xxxxxxxxxx',
        SECRET_KEY: 'xxxxxxxxxx',
        ACCESS_TOKEN: 'xxxxxxxxxx',
    },
    // cors origin
    corsOrigin: '*',

    // email alert config 邮件报警
    emailAddress: 'zhanghaifeng2022@126.com',
    emailPass: 'xxxxxxxxxx', // 这个是授权密码，不是邮箱的登录密码
    adminMailAddress: ['zhanghaifeng1123@gmail.com', 'zhanghai.fong@qq.com'],
}
