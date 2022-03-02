/* eslint-disable default-param-last */
/**
 * @description 公共模板 - 缓存
 * @author zhanghaifeng
 */

const { cacheSet, cacheGet } = require('./index')
const createSortedObjStr = require('../utils/createSortedObjStr')

/**
 * 获取 key
 * @param {object} queryInfo 查询条件
 * @param {object} pageInfo 分页
 */
function createCacheKey(queryInfo = {}, pageInfo = {}) {
    const PREFIX = 'public-templates-'
    const queryInfoStr = createSortedObjStr(queryInfo)
    const pageInfoStr = createSortedObjStr(pageInfo)

    // 'public-templates-'
    // const { id, uuid, title } = queryInfo
    // let { pageIndex, pageSize } = pageInfo
    // 做一个这样的key ：public-templates-id=1&uuid=bedc&title="test"-pageIndex=1&pageSize=20
    const key = `${PREFIX}${queryInfoStr}-${pageInfoStr}`
    return key
}

/**
 * 公共模板 - 缓存 get 根据key获取缓存
 * @param {object} queryInfo 查询条件
 * @param {object} pageInfo 分页
 */

async function publicTemplatesCacheGet(queryInfo = {}, pageInfo = {}) {
    const key = createCacheKey(queryInfo, pageInfo)
    const templates = await cacheGet(key)
    if (!templates) return null // 无缓存
    return templates // cacheGet 中有 JSON.parse
}

/**
 * 公共模板 - 缓存 set
 * @param {object} queryInfo 查询条件
 * @param {object} pageInfo 分页
 * @param {object} templates 模板数据
 */
function publicTemplatesCacheSet(queryInfo = {}, pageInfo = {}, templates) {
    if (templates == null) return

    const key = createCacheKey(queryInfo, pageInfo)
    cacheSet(
        key,
        templates,
        60 // timeout 设置为 1min，单位是 s
    )
}

module.exports = {
    publicTemplatesCacheGet,
    publicTemplatesCacheSet,
}
