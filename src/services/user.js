/**
 * @description user 数据操作
 * @author zhang
 */

const _ = require('lodash')
const UserModel = require('../models/userModel')

/**
 * 查找用户信息
 * @param {Object} param0 查询参数
 */

// { username, password, phoneNumber } = {} 函数参数的解构,这样写可以传任意个参数，可以不传参数
async function findOneUser({ username, password, phoneNumber } = {}) {
    // 拼接查询条件
    const whereOpt = {}
    if (username) {
        Object.assign(whereOpt, { username })
    }
    if (password) {
        // 用户名和密码在一块，因为密码可能重复
        Object.assign(whereOpt, { username, password })
    }
    if (phoneNumber) Object.assign(whereOpt, { phoneNumber })

    // 无查询条件，则返回空
    if (_.isEmpty(whereOpt)) return null

    // 查询
    const result = await UserModel.findOne({
        where: whereOpt,
    })
    if (result == null) {
        // 未查到用户
        return result
    }

    // 返回查询结果
    return result.dataValues
}

/**
 * 修改用户信息
 * @param {string} username username
 * @param {object} data 用户信息，要符合 UserModel 的属性
 * @returns {boolean} true/false
 */

// 一个方法可以修改各种属性，传object挺方便的
async function doUpdateUserInfo(phoneNumber, data = {}) {
    console.log(phoneNumber)
    console.log(data)

    if (!phoneNumber) return false
    if (_.isEmpty(data)) return false // 没有要修改的
    const result = await UserModel.update(data, {
        where: {
            phoneNumber,
        },
    })
    console.log(result)
    // result[0] ===0 表示没有修改成功
    return result[0] !== 0
}

/**
 * 创建用户
 * @param {Object} data 用户信息，要符合 UserModel 的属性
 */
async function createUser(data = {}) {
    const result = await UserModel.create(data)
    return result.dataValues
}

module.exports = {
    findOneUser,
    createUser,
    doUpdateUserInfo,
}
