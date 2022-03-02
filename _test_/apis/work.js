/**
 * @description works API test
 * @author zhanghaifeng
 */

const { get, post, patch, del } = require('./_server')

// 随机数
const R = Math.random().toString().slice(-4)

// 临时存储作品信息
let WORK_ID = ''
const WORK_INFO = {
    title: `新建作品-${R}`,
    desc: `作品描述-${R}`,
}
const CONTENT = {
    components: [
        {
            id: '123',
            name: 'l-text',
            props: { text: 'hello', top: '0', left: '20px' },
        },
    ],
    props: { x: 100 },
    setting: { y: 200 },
}

// 建立一个作品，但是components 为空
test('创建空白作品', async () => {
    const url = '/api/work/create'
    const { errno, data } = await post(url, WORK_INFO)
    expect(errno).toBe(0)

    WORK_ID = data.id
})

// 添加content到刚建立的作品中去
test('修改作品信息', async () => {
    const url = `/api/work/update/${WORK_ID}`
    const { errno, data } = await patch(url, {
        content: CONTENT,
    })
})

test('查询作品信息', async () => {
    const url = `/api/work/getWork/${WORK_ID}`
    const { errno, data } = await get(url)
    expect(errno).toBe(0)

    expect(data.title).toBe(WORK_INFO.title)
    expect(data.desc).toBe(WORK_INFO.desc)
    expect(data.contentId).not.toBeNull()

    expect(data.content.components).toEqual(CONTENT.components)
    expect(data.content.props).toEqual(CONTENT.props)
    expect(data.content.setting).toEqual(CONTENT.setting)
})

test('拷贝作品', async () => {
    const url = `/api/work/copy/${WORK_ID}`
    const { errno, data } = await post(url)
    expect(errno).toBe(0)
})

test('删除作品', async () => {
    const url = `/api/work/${WORK_ID}`
    const { errno, data } = await del(url)
    expect(errno).toBe(0)
})

test('恢复删除', async () => {
    const url = `/api/work/put-back/${WORK_ID}`
    const { errno, data } = await patch(url)
    expect(errno).toBe(0)
})

// 把这个test放最后面的话会报错
// You are trying to `import` a file after the Jest environment has been torn down
// Torn down means: Jest already finished running and some part of your code is trying to execute after jest torn down or exited your test.
// 把这个test放中间就不会报错
// 为什么呢？

test('获取自己的作品和模板', async () => {
    const url = '/api/work/getMyWorks'
    const { errno, data } = await get(url)
    const { count, list = [] } = data
    expect(errno).toBe(0)
    expect(count).toBeGreaterThan(0)
    expect(list.length).toBeGreaterThan(0)
})

// //转增之后，作品就不能由我发布了，
// test('转增作品给15912345678', async () => {
//    const url = `/api/work/transfer/${WORK_ID}/15912345678`
//    const { errno, data } = await post(url)
//    expect(errno).toBe(0)
// })

// 发布作品得到一个这个样子的url localhost:3000/p/21-2785
test('发布作品', async () => {
    const url = `/api/work/publish/${WORK_ID}`
    const { errno, data } = await post(url)
    console.log({ errno, data })

    const { url: publishUrl } = data
    console.log('publish url: ', url)
    expect(publishUrl).not.toBeNull()
})

test('发布为模板', async () => {
    const url = `/api/work/publish-template/${WORK_ID}`
    const { errno, data } = await post(url)
    expect(errno).toBe(0)
})

test('发布后，再来查询一次作品信息', async () => {
    const url = `/api/work/getWork/${WORK_ID}`
    const { errno, data } = await get(url)
    expect(errno).toBe(0)

    expect(data.status).toBe('2')
    expect(data.isTemplate).toBe(true)
})
