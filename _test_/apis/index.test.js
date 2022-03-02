/**
 * @description API test - 按顺序挨个测试
 * @author zhang
 */

require('./db_check')
require('./user') // 先测试 users 接口，将登录token放入axios的header里面 以便获取登录权限
require('./work')
require('./template')
require('./channel')
require('./vendor')
