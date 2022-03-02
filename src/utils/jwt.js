const jwt = require('jsonwebtoken')
const { JWT_SECRET_KEY } = require('../config/constant')
const { jwtExpiresIn } = require('../config/index')

function jwtVerify(token) {
    // 这里的data被什么特别情况差不多就是userinfo。将token转化成用户信息
    const data = jwt.verify(token.split(' ')[1], JWT_SECRET_KEY) // 去掉前面的Bearer
    return data
}

function jwtCreate(data) {
    const token = `Bearer ${jwt.sign(data, JWT_SECRET_KEY, { expiresIn: jwtExpiresIn })}`
    return token
}

module.exports = {
    jwtCreate,
    jwtVerify,
}
