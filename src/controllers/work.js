const _ = require('lodash')
const { uuid: createUuid } = require('uuidv4')
const { isDev, isTest, isPrd } = require('../utils/env')
const { ErrorRes, SuccessRes } = require('../responseModel/index')
const {
    createWorksFailInfo,
    createWorksDbErrorFailInfo,
    findOneWorkFailInfo,
    findOneWorkDbErrorFailInfo,
    updateWorkFailInfo,
    updateWorkDbErrorFailInfo,
    forceOffLineFailInfo,
    deleteWorkDbErrorFailInfo,
    deleteWorkFailInfo,
    putBackWorkDbErrorFailInfo,
    putBackWorkFailInfo,
    transferWorkFailInfo,
    publishWorkFailInfo,
    publishWorkDbErrorFailInfo,
} = require('../responseModel/failInfo/work')
const {
    createWorkService,
    findOneWorkService,
    updateWorkService,
    findWorkListService,
    findOneTemplateService,
    updateContentToPublishContent,
} = require('../services/work')
const { findOneUser } = require('../services/user')
const { h5Origin } = require('../config/index')
const { DEFAULT_PAGE_SIZE } = require('../config/constant')
const { hidePhoneNumber } = require('../utils/hidePhoneNumber')
const { publicTemplatesCacheSet, publicTemplatesCacheGet } = require('../cache/publicTemplate')
const { publishWorkClearCache } = require('../cache/publish')
const { emailAlarm } = require('../email-alarm/index')

/**
 * 创建单个作品
 * @param {string} authorPhoneNumber 登录用户自己的电话号码
 * @param {object} data 内容{title,desc,coverImg,...},存入mysql数据库的数据
 * @param {object} content 内容{component,props,setting}，存入mongodb的数据
 */
const createWorks = async (authorPhoneNumber, data = {}, content = {}) => {
    const { title } = data
    if (!title) {
        // 标题不能为空
        return new ErrorRes(createWorksFailInfo, '标题不能为空')
    }

    // uuidV4() 生成的格式如 'bc5af863-dd15-4bd9-adbe-37ea1e6450ce'
    // uuid 要用于拼接作品发布后的 url ，url 太长会导致二维码混乱。所以，只取 uuid 前几位即可。
    // uuid 太短，重复了怎么办？—— 可参考发布作品，生成 url 时的代码逻辑和注释。
    const randomId = createUuid().slice(0, 4)
    try {
        const newWork = await createWorkService(
            {
                // 按照 WorksModel 属性
                ...data,
                authorPhoneNumber,
                uuid: randomId,
            },
            content
        )

        // 创建成功
        return new SuccessRes(newWork)
    } catch (ex) {
        console.error('创建作品失败', ex)
        // 报警功能
        emailAlarm(`创建作品失败 - ${ex.message}`, ex)
        return new ErrorRes(createWorksDbErrorFailInfo) // 写入数据库失败
    }
}

/**
 * 查询单个作品
 * @param {string} id mysql 数据库里的作品id
 * @param {string} authorPhoneNumber 用户电话号码，保证安全性，避免查询他人作品
 */
const findOneWork = async (id, authorPhoneNumber) => {
    if (!id || !authorPhoneNumber) {
        return new ErrorRes(findOneWorkFailInfo, 'id 或 authorPhoneNumber 为空')
    }

    let work
    try {
        work = await findOneWorkService({ id, authorPhoneNumber })
    } catch (ex) {
        console.error('查询单个作品', ex)
        // 报警功能
        emailAlarm(`查询单个作品失败 - ${ex.message}`, ex)
        return new ErrorRes(findOneWorkDbErrorFailInfo) // 数据库错误
    }

    // 查询失败，id 或 authorPhoneNumber 不匹配，就是说id 不属于authorPhoneNumber这个所有者
    if (work == null) return new ErrorRes(findOneWorkFailInfo, 'id 或 authorPhoneNumber 不匹配')

    // 查询成功
    return new SuccessRes(work)
}

/**
 * 更新作品
 * @param {string} id mysql数据库里的作品id
 * @param {string} authorPhoneNumber 用户电话号码，保证安全性，避免查询他人作品
 * @param {object} data 代表使用查询单个作品api得到的json数据，可以是全部，也可以是部分
 */
const updateWorks = async (id, authorPhoneNumber, data = {}) => {
    // 保证数据不为空
    if (!id || !authorPhoneNumber) {
        return new ErrorRes(updateWorkFailInfo, 'id 或 authorPhoneNumber 不能为空')
    }
    if (_.isEmpty(data)) return new ErrorRes(updateWorkFailInfo, '更新数据不能为空')

    let res
    try {
        res = await updateWorkService(data, { id, authorPhoneNumber })
    } catch (ex) {
        console.error('更新作品错误', id, ex)
        emailAlarm(`更新作品错误 - ${ex.message}`, ex)
        return new ErrorRes(updateWorkDbErrorFailInfo) // 数据库错误
    }

    // 更新成功
    if (res) return new SuccessRes()
    // 更新失败
    return new ErrorRes(updateWorkFailInfo, 'id 或 phoneNumber 不匹配')
}

/**
 * 复制作品（通过模板创建，也是复制）
 * @param {string} id id
 * @param {string} authorPhoneNumber 电话号码代表唯一的user 用户自己的电话号码
 */
const copyWork = async (id, authorPhoneNumber) => {
    // 复制首先要知道复制的是谁的作品，是谁的模板
    const work = await findOneWorkService({ id })

    // 是否强制下线 查看status是否是等于3
    if (parseInt(work.status, 10) === 3) {
        return new ErrorRes(forceOffLineFailInfo)
    }

    // 把content取出来
    const { content } = work

    // 新项目的信息，要符合 WorksModel 属性规则
    const newData = {
        title: `${work.title}-复制`,
        desc: work.desc,
        coverImg: work.coverImg,

        // 其他信息，如 isTemplate status 等，都不需要
    }

    // 复制作品就是基于之前的作品，创造一个新作品
    const res = await createWorks(authorPhoneNumber, newData, content)

    // 更新被复制的work或者template的使用次数
    await updateWorkService(
        {
            copiedCount: work.copiedCount + 1,
        },
        { id }
    )

    // 返回新项目
    return res
}

/**
 * 删除作品
 * @param {string} id 作品的id
 * @param {string} authorPhoneNumber 登录用户自己的电话号码，防止误删别人的
 */
const deleteWork = async (id, authorPhoneNumber) => {
    let res
    try {
        // 假删除，更新 status
        const status = 0
        res = await updateWorkService(
            { status },
            { id, authorPhoneNumber } // 条件里加cookie里的 authorPhoneNumber ，防止删除别人的项目
        )
    } catch (ex) {
        console.error('删除作品错误', ex)
        // 报警功能
        emailAlarm(`删除作品错误 - ${ex.message}`, ex)
        return new ErrorRes(deleteWorkDbErrorFailInfo)
    }

    // 删除成功
    if (res) return new SuccessRes()
    // 删除失败
    return new ErrorRes(deleteWorkFailInfo, 'id 或 authorPhoneNumber 不匹配')
}

/**
 * 恢复删除
 * @param {string} id id
 * @param {string} authorPhoneNumber 存放在cookie中的作者的电话号码 authorPhoneNumber
 */
const putBackWork = async (id, authorPhoneNumber) => {
    let res
    try {
        // 更新 status
        const status = 1
        res = await updateWorkService(
            { status },
            { id, authorPhoneNumber } // 条件里加cookie里的 authorPhoneNumber ，防止恢复别人的项目
        )
    } catch (ex) {
        console.error('恢复作品错误', ex)
        // 报警功能
        emailAlarm(`恢复作品错误 - ${ex.message}`, ex)
        return new ErrorRes(putBackWorkDbErrorFailInfo)
    }

    // 恢复成功
    if (res) return new SuccessRes()
    // 恢复失败
    return new ErrorRes(putBackWorkFailInfo, 'id 或 authorPhoneNumber 不匹配')
}

/**
 * 转赠作品，将作品的电话号码换成别人的
 * @param {string} id 作品id
 * @param {string} authorPhoneNumber 作者电话号码 authorPhoneNumber
 * @param {string} receiverPhoneNumber 接收人phoneNumber receiverPhoneNumber
 */
const transferWorks = async (id, authorPhoneNumber, receiverPhoneNumber) => {
    // 两者一样
    if (authorPhoneNumber === receiverPhoneNumber) {
        return new ErrorRes(transferWorkFailInfo, '作者和接收人相同')
    }

    // 判断接收者是否存在
    const receiver = await findOneUser({ phoneNumber: receiverPhoneNumber })
    if (receiver == null) return new ErrorRes(transferWorkFailInfo, '接收人未找到')

    // 根据 id, authorPhoneNumber 找到作品，然后将作品的authorPhoneNumber 改为 receiverPhoneNumber
    const res = await updateWorks(id, authorPhoneNumber, {
        authorPhoneNumber: receiverPhoneNumber,
    })
    return res
}

/**
 * 获取自己的作品或模板
 * @param {string} authorPhoneNumber 作者，作者电话号码
 * @param {object} queryInfo 查询条件
 * @param {object} pageInfo 分页条件
 */
async function findMyWorks(authorPhoneNumber, queryInfo = {}, pageInfo = {}) {
    // 使用解构的一大好处就是当queryInfo里面没有uuid，id的时候，
    // 也可以使用，只是解构出undefined，不会报错
    const { id, uuid, title, status, isTemplate } = queryInfo

    let { pageIndex, pageSize } = pageInfo

    // 将字符串转成数字，如果参数是undefined，那么parseInt方法会返回NaN，然后使用默认值
    pageIndex = parseInt(pageIndex, 10) || 0
    pageSize = parseInt(pageSize, 10) || DEFAULT_PAGE_SIZE

    const { list, count } = await findWorkListService(
        {
            id,
            uuid,
            title,
            status,
            authorPhoneNumber,
            isTemplate: isTemplate === '1', // 将isTemplate从字符串转为boolean值
        },
        {
            pageIndex,
            pageSize,
        }
    )
    return new SuccessRes({ list, count })
}

function formatTemplate(template = {}) {
    // 典型的递归，当传入的是array
    if (Array.isArray(template)) {
        // 传入了 list
        return template.map(t => formatTemplate(t))
    }

    // 当传入了单个 template
    const result = template
    // 隐藏 authorPhoneNumber
    result.authorPhoneNumber = hidePhoneNumber(result.authorPhoneNumber)
    // 用户名若是手机号，则隐藏userName
    if (result.user) {
        const user = result.user.dataValues
        user.userName = hidePhoneNumber(user.userName)
    }
    return result
}

/**
 * 查询公共模板
 * @param {object} queryInfo 查询条件
 * @param {object} pageInfo 分页
 */
async function findPublicTemplates(queryInfo = {}, pageInfo = {}) {
    // 这种所有人进来之后都看到一样的
    // 公共的东西就放入缓存中，提高性能 试图从 cache 中获取
    const templatesFromCache = await publicTemplatesCacheGet(queryInfo, pageInfo)
    if (templatesFromCache != null) {
        // 从缓存中获取，其他人打开首页看到的模板列表也是从缓存中获取的，只要模板列表没有过期
        return new SuccessRes(templatesFromCache)
    }

    const { id, uuid, title } = queryInfo
    let { pageIndex, pageSize } = pageInfo
    pageIndex = parseInt(pageIndex, 10) || 0
    pageSize = parseInt(pageSize, 10) || DEFAULT_PAGE_SIZE

    // 缓存中没有，从数据库获取
    const { list, count } = await findWorkListService(
        {
            id,
            uuid,
            title,
            isTemplate: true, // isTemplate=1    。这里写的是true，但是数据库里这个栏位对应的值是1
            isPublic: true, // isPublic =1 公开的 。这里写的是true，但是数据库里这个栏位对应的值是1
        },
        {
            pageIndex,
            pageSize,
        }
    )

    // 格式化模板
    // 将用户电话号码，用户名隐藏,因为没有登录限制，谁都可以获取，所以要隐藏
    const formatList = formatTemplate(list)

    // 记录到缓存
    publicTemplatesCacheSet(queryInfo, pageInfo, { list: formatList, count })

    // 返回
    return new SuccessRes({ list: formatList, count })
}

/**
 * 查询单个作品
 * @param {string} id id
 */
async function findOneTemplate(id) {
    if (!id) return new ErrorRes(findOneWorkFailInfo, 'id 为空')

    let template
    try {
        template = await findOneTemplateService({
            id,
            isTemplate: true,
            isPublic: true, // 公开的
        })
    } catch (ex) {
        console.error('查询单个模板', ex)
        // 报警功能
        emailAlarm(`查询单个模板 - ${ex.message}`, ex)
        return new ErrorRes(findOneWorkDbErrorFailInfo) // 数据库错误
    }

    // 查询失败
    if (template == null) return new ErrorRes(findOneWorkFailInfo)

    // 格式忽视
    template = formatTemplate(template)

    // 查询成功
    return new SuccessRes(template)
}

/**
 * 发布项目
 * @param {string} id id
 * @param {string} author 作者 username
 * @param {boolean} isTemplate 设置为模板
 */
async function publishWork(id, authorPhoneNumber, isTemplate = false) {
    const work = await findOneWorkService({
        id,
        authorPhoneNumber,
    })
    console.log(work)
    if (work == null) return new ErrorRes(publishWorkFailInfo, 'id 或者作者不匹配')

    // 是否强制下线
    if (parseInt(work.status, 10) === 3) {
        return new ErrorRes(forceOffLineFailInfo)
    }

    // // 第三方的内容审核服务，内容审核（非 dev 环境下使用）
    // if (!isDev) {
    //     const censorResult = await contentCensor(work)
    //     if (censorResult) {
    //         // 审核失败，打印日志
    //         console.log(`id ${id} 作品内容检查失败`, JSON.stringify(censorResult, null, 4))

    //         // 需要输出 data ，所有就自定义 ErrorRes 了 ，不用 failInfo 了
    //         return new ErrorRes({
    //             errno: -1,
    //             data: censorResult,
    //             message: '内容审核失败',
    //         })
    //     }
    // }

    // 发布，需要更新的数据。要遵守 WorksModel 的属性规范
    const updateData = {
        status: 2,
        latestPublishAt: new Date(),
    }
    if (isTemplate) {
        // 发布为模板
        Object.assign(updateData, {
            isTemplate: true,
        })
    }

    let result
    try {
        // 更新发布的内容
        // 将mongodb里面未发布的内容 更新到 已发布内容的表里面
        const publishContentId = await updateContentToPublishContent(
            work.content,
            work.publishContentId
        )
        // 发布项目（更新 status）
        result = await updateWorkService(
            {
                publishContentId,
                ...updateData,
            },
            { id, authorPhoneNumber }
        )
    } catch (ex) {
        console.error('发布作品错误', id, ex)
        // 报警功能
        emailAlarm(`发布作品错误 - ${ex.message}`, ex)
        return new ErrorRes(publishWorkDbErrorFailInfo)
    }

    if (!result) return new ErrorRes(publishWorkFailInfo) // 发布失败

    // 重新发布，清空缓存
    // 这个方法涉及到 后面的h5-server项目
    // h5-server中的 '/:idAndUuid' 这个查询发布作品路由里有一个 findPublishWork 方法
    // 这个方法会找到发布作品后缓存该作品
    // 本项目lego-editor-server 如果修改了已发布作品，重新发布就要清空缓存
    // h5-server项目再次获取该作品时，就从数据库中取，然后又缓存该作品
    publishWorkClearCache(id)

    // 发布成功，返回一个h5页面用的url连接,
    // 注意，由于 uuid 是 4 位的，为了防止重复，再把 id 拼接上，这样就唯一了
    const url = `${h5Origin}/p/${work.id}-${work.uuid}`
    return new SuccessRes({ url })
}

module.exports = {
    createWorks,
    findOneWork,
    updateWorks,
    copyWork,
    deleteWork,
    putBackWork,
    transferWorks,
    findMyWorks,
    findPublicTemplates,
    findOneTemplate,
    publishWork,
}
