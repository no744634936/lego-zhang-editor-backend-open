module.exports = {
    // mysql 连接配置
    mysqlConf: {
        host: 'database-1.cpkxklkq7i4c.ap-northeast-1.rds.amazonaws.com',
        user: 'admin',
        password: 'testtest123',
        port: '3306',
        database: 'imooc_lego_course',
    },
    // mongodb 连接配置
    mongodbConf: {
        host: 'localhost',
        port: '27017',
        dbName: 'imooc_lego_course',
    },
    // redis 连接配置
    redisConf: {
        port: '6379',
        host: 'demo-redis.d19cgo.0001.apne1.cache.amazonaws.com',
    },
    // 短信验证码缓存时间2分钟，单位 s
    msgVeriCodeTimeout: 2 * 60,

    // jwt 过期时间
    jwtExpiresIn: '1d', // 1. 字符串，如 '1h' '2d'； 2. 如果是数字的话单位是 s

    // 发布出来的 h5 域名
    h5Origin: 'http://xxxxxxx:3001',

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
    corsOrigin: '',

    // email alert config 邮件报警
    emailAddress: 'zhanghaifeng2022@126.com',
    emailPass: 'xxxxxxxxxx', // 这个是授权密码，不是邮箱的登录密码
    adminMailAddress: ['zhanghaifeng1123@gmail.com', 'zhanghai.fong@qq.com'],
}
