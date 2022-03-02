/**
 * @description 同步数据库，以修改数据表的方式，不会清空数据，比较安全
 * 地检查 'src/models/ 跟 src/db/seq/ 两个文件夹里的文件否有被修改过。
 * 比如db_tables/userModel.js 的添加一个新字段，mysql数据库里也会添加一个新字段。
 * 如果是修改已有字段名，那么字段名会被更改，值也会被更改，
 * 比如db_tables/userModel.js 数据模型，还没有git commit ，那么下面这段代码就会被执行，
 * 如果git commit 了修改那么下面这段代码就不会被执行，
 * @author
 */

const path = require('path')
const simpleGit = require('simple-git')
const seq = require('../seq')
const { isDev } = require('../../../utils/env')

// 一次性获取所有 seq model
require('require-all')({
    dirname: path.resolve('src', 'models'), // src/models 中可能会有 mongoose 的 model ，不过这里获取了也没关系
    filter: /\.js$/,
    excludeDirs: /^\.(git|svn)$/,
    recursive: true, // 递归
})

// 同步数据表
async function syncDb() {
    let needToSyncDb = false

    // 只适用于开发环境！！！
    if (isDev) {
        // 开发环境下，修改频繁，每次重启都同步数据表，消耗太大
        // 所以，开发环境下，判断是否修改了 src/models 中的内容？
        // 如果是，则同步数据表。否则，不用同步数据表。

        const git = simpleGit()
        // 获取 git status 修改的文件，modified 格式如  [ '.gitignore', 'package.json', 'src/models/README.md' ]
        const { modified, not_added: nodeAdded, created, deleted, renamed } = await git.status()
        const fileChanged = modified
            .concat(nodeAdded)
            .concat(created)
            .concat(deleted)
            .concat(renamed)
        if (fileChanged.length) {
            // 到此，说明 git status 有改动

            // 是否改动了 db 相关的文件
            const changedDbFiles = fileChanged.some(f => {
                // 改动了 src/models ，需要同步数据库
                if (f.indexOf('src/models/') === 0) return true
                // 改动了 src/db/seq ，需要同步数据库
                if (f.indexOf('src/db/seq/') === 0) return true
                // 其他情况，不同步
                return false
            })

            // console.log('changedDbFiles', fileChanged)
            // console.log('changedDbFiles', changedDbFiles)
            // 没改动 db 文件，则不需要同步
            if (changedDbFiles) needToSyncDb = true
        }

        // 如果 git status 没有改动，则照常同步数据表，重要！！！
    }

    console.log('needToSyncDb', needToSyncDb)

    if (needToSyncDb) {
        await seq.sync({ alter: true })
    }
}

module.exports = syncDb

// 在bin/www/文件夹里面导入syncDb 方法
// 开发的时候如果，models文件夹里的数据模型被修改了，就先同步数据表，然后再启动server
