import { lowerCase } from 'lodash-es'
import CryptoJS from 'crypto-js'

const APPLICATION_NAME = 'StorageUtilDemo'
const APPLICATION_VERSION = '0.0.0'

const SECRET_KEY = CryptoJS.enc.Utf8.parse('3333e6e143439161')
const SECRET_IV = CryptoJS.enc.Utf8.parse('e3bbe7e3ba84431a')

const prefix = lowerCase(APPLICATION_NAME.replace(/[a-z]/g, '')) + '_' + APPLICATION_VERSION
const storage = window.localStorage

interface Data {
  value: any
  time: number
  expire: number
}

const encrypt = (data: string): string => {
  return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(data), SECRET_KEY, {
    iv: SECRET_IV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).ciphertext.toString()
}

const decrypt = (data: string): string => {
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

export const getStorage = <T = unknown>(key: string): T | null => {
  const s_key = prefix + '_' + key

  if (storage.getItem(s_key) === null) {
    return null
  }

  const data: Data = JSON.parse(decrypt(storage.getItem(s_key) as string))

  if (data.expire + data.time > Date.now()) {
    return data.value
  } else {
    removeStorage(key)
    return null
  }
}

export const setStorage = <T = unknown>(key: string, value: T | null, expire = 0): void => {
  const s_key = prefix + '_' + key
  if (value === null || value === undefined) {
    value = null
  }
  if (Number.isNaN(expire) || expire < 0) {
    expire = 0
  }

  const data = encrypt(
    JSON.stringify({
      value,
      time: Date.now(),
      expire,
    })
  )

  storage.setItem(s_key, data)
}

export const removeStorage = (key: string): void => {
  const s_key = prefix + '_' + key
  storage.removeItem(s_key)
}

export const clearStorage = (): void => {
  storage.clear()
}

export const length = (): number => storage.length

const Storage = {
  getStorage,
  setStorage,
  removeStorage,
  clearStorage,
  length,
}

export default Storage
