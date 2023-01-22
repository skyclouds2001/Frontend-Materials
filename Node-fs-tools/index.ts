const fs = require('node:fs')
const path = require('node:path')

/**
 * 复制文件夹
 *
 * @param src 源文件夹
 * @param tar 目标文件夹
 */
const copyDir = (src: string, tar: string) => {
  for (const v of fs.readdirSync(src)) {
    const s = path.resolve(src, v)
    const t = path.resolve(tar, v)
    const stat = fs.statSync(s)
    if (stat.isDirectory()) {
      if (!fs.existsSync(t)) {
        fs.mkdirSync(t)
      }
      copyDir(s, t)
    } else {
      fs.copyFileSync(s, t, fs.constants.COPYFILE_FICLONE)
    }
  }
}

/**
 * 删除文件夹
 *
 * @param src 目标文件夹
 */
const deleteDir = (src: string) => {
  for (const v of fs.readdirSync(src)) {
    const s = path.resolve(src, v)
    const stat = fs.statSync(s)
    if (stat.isDirectory()) {
      deleteDir(s)
    } else {
      fs.unlinkSync(s)
    }
  }
  fs.rmdirSync(src)
}
