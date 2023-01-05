/**
 * 自定义 Storage 实现
 * 参见 https://juejin.cn/post/7104301566857445412
 */

import CryptoJS from 'crypto-js'

const SECRET_KEY = CryptoJS.enc.Utf8.parse("3333e6e143439161")
const SECRET_IV = CryptoJS.enc.Utf8.parse("e3bbe7e3ba84431a")

/**
 * Storage设置参数
 *
 * 类型
 * - window.localStorage
 * - window.sessionStorage
 */
const config = {
  storage: window.localStorage,   // 本地存储类型 window.localStorage/window.sessionStorage
  prefix: 'demo_0.0.1',           // 名称前缀 建议：项目名 + 项目版本
  expire: 1,                      //过期时间 单位：秒
  isEncrypt: true,                // 默认加密 为了调试方便, 开发过程中可以不加密
}

/** 判断是否支持 Storage isSupportStorage */
export const isSupportStorage = () => {
  if (!window) {
    throw new Error('当前环境非浏览器，无法消费全局window实例')
  }
  if (!window.localStorage) {
    throw new Error('当前环境非无法使用localStorage')
  }
  if (!window.sessionStorage) {
    throw new Error('当前环境非无法使用sessionStorage')
  }

  return typeof Storage !== 'undefined' ? true : false
}

/**
 * 设置 setStorage
 * @param {string} key
 * @param {any} value
 * @param {number} expire
 * @returns {void}
 */
export const setStorage = (key, value, expire) => {
  if (value === '' || value === undefined || value === null) {
    value = null
  }

  if (Number.isNaN(expire) || expire < 0 || Number.isFinite(expire)) {
    expire = 0
  }

  const data = {
    value: value,
    time: Date.now(),
    expire: (expire ?? config.expire) * 1000,
  }

  config.storage.setItem(autoAddPrefix(key), config.isEncrypt ? encrypt(JSON.stringify(data)) : JSON.stringify(data))
}

/**
 * 获取 getStorage
 * @param {string} key
 * @returns {any}
 */
export const getStorage = (key) => {
  key = autoAddPrefix(key)

  if (!config.storage.getItem(key) || JSON.stringify(config.storage.getItem(key)) === 'null') {
    return null
  }

  const storage = config.isEncrypt ? JSON.parse(decrypt(config.storage.getItem(key))) : JSON.parse(config.storage.getItem(key))

  if (storage.expire && storage.expire < Date.now() - storage.time) {
    removeStorage(key)
    return null
  } else {
    return isJSON(storage.value) ? JSON.parse(storage.value) : storage.value
  }
}

/**
 * 是否存在 hasStorage
 * @param {string} key
 * @returns {boolean}
 */
export const hasStorage = key => getStorageAll().filter(v => v.key === autoAddPrefix(key)).length === 0

/**
 * 获取所有key getStorageKeys
 * @returns {string[]}
 */
export const getStorageKeys = () => getStorageAll().map(v => v.key)

/**
 * 根据索引获取key getStorageForIndex
 * @param {number} index
 * @returns {string}
 */
export const getStorageForIndex = index => config.storage.key(index)

/**
 * 获取localStorage长度 getStorageLength
 * @returns {number}
 */
export const getStorageLength = () => config.storage.length

/**
 * 获取全部 getStorageAll
 * @returns {Array<{ key: string, value: any }>}
 */
export const getStorageAll = () => {
  return new Array(getStorageLength()).map((_v, i) => {
    const key = config.storage.key(i)

    const storage = config.isEncrypt ? JSON.parse(decrypt(config.storage.getItem(key))) : JSON.parse(config.storage.getItem(key))

    if (storage.expire && storage.expire < Date.now() - storage.time) {
      removeStorage(autoRemovePrefix(key))
      return null
    } else {
      return {
        key: autoRemovePrefix(key),
        value: isJSON(storage.value) ? JSON.parse(storage.value) : storage.value,
      }
    }
  }).filter(v => v !== null)
}

/**
 * 删除 removeStorage
 * @param {string} key
 * @returns {void}
 */
export const removeStorage = key => {
  config.storage.removeItem(autoAddPrefix(key))
}

/**
 * 清空 clearStorage
 * @returns {void}
 */
export const clearStorage = () => {
  config.storage.clear()
}

/**
 * 判断是否可用 JSON.parse 转换值
 * @param {} value
 * @returns {boolean}
 */
const isJSON = value => {
  if (Object.prototype.toString.call(value) === '[object String]') {
    try {
      return ['[object Object]', '[object Array]'].includes(Object.prototype.toString.call(JSON.parse(value)))
    } catch {
      return false
    }
  }
  return false
}

/**
 * 自动添加前缀方法
 * @param {string} key
 * @returns {string}
 */
const autoAddPrefix = key => config.prefix ? config.prefix + '_' : '' + key

/**
 * 自动移除前缀方法
 * @param {string} key
 * @returns {string}
 */
const autoRemovePrefix = key => key.substr(config.prefix ? config.prefix.length + 1 : 0)

/**
 * 加密方法
 * @param {any} data
 * @returns {string}
 */
const encrypt = (data) => {
  if (typeof data === 'object') {
    try {
      data = JSON.stringify(data)
    } catch (error) {
      console.log(error)
    }
  }

  return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(data), SECRET_KEY, {
    iv: SECRET_IV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).ciphertext.toString()
}

/**
 * 解密方法
 * @param {string} data
 * @returns {string}
 */
const decrypt = (data) => {
  return CryptoJS.AES.decrypt(
    CryptoJS.enc.Base64.stringify(CryptoJS.enc.Hex.parse(data)),
    SECRET_KEY,
    {
      iv: SECRET_IV,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  ).toString(CryptoJS.enc.Utf8).toString()
}
