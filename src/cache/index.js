const redisClient = require('../db/redis')

/**
 * redis set
 * @param {string} key key
 * @param {string|Object} val val
 * @param {number} timeout 过期时间，单位 s ，默认 1h
 */
function cacheSet(key, val, timeout = 60 * 60) {
    let formatVal
    if (typeof val === 'object') {
        formatVal = JSON.stringify(val) // object 变成字符串类型
    } else {
        formatVal = val
    }
    redisClient.set(key, formatVal)
    redisClient.expire(key, timeout)
}

/**
 * redis get
 * @param {string} key key
 */
function cacheGet(key) {
    // 这里为什么要用promise来包裹一下redisClient.get这个方法呢？
    // 因为，redisClient.get方法有个回调函数，如果我想拿到回调函数里的val，并对val做一些处理
    // 那么大量代码就必须写在 (err, val) => {} 这个方法里才行，这样代码不美观，代码也不容易分割开来
    // 用promise来包裹一下,将val传给resolve,就可以将val直接取出来了。

    const promise = new Promise((resolve, reject) => {
        // redis 包不支持promise所以要在这里用回调函数
        redisClient.get(key, (err, val) => {
            if (err) {
                reject(err)
                return
            }
            if (val == null) {
                resolve(null) // 如果值过期了，或者本来就没有，就返回null,
                return // 为什么resolve完了还要return 呢？不写return 不可以吗？
            }

            try {
                resolve(JSON.parse(val)) // 把字符串转变成object
            } catch (ex) {
                resolve(val) // 如果字符串不能被转变成oject，那么就直接返回这个值
            }
        })
    })
    return promise
}

module.exports = {
    cacheSet,
    cacheGet,
}
