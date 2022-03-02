const User = require('../models/userModel')
const Work = require('../models/workModel')
const Channel = require('../models/channelModel')

// 通过db_check api来建立mysql表，
// 要建立新的mysql表都要放这个方法里同步建立表格，否者部署的时候,会发生找不到表格的错误
async function initTables(phoneNumber) {
    await User.sync()
    await Work.sync()
    await Channel.sync()
}

module.exports = initTables
