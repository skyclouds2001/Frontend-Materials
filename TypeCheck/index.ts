export const isNumber = (v: unknown): v is number => {
  return typeof v === 'number'
}

export const isString = (v: unknown): v is string => {
  return typeof v === 'string'
}

export const isBoolean = (v: unknown): v is boolean => {
  return typeof v === 'boolean'
}

export const isNull = (v: unknown): v is null => {
  return v === null
}

export const isUndefined = (v: unknown): v is undefined => {
  return v === undefined
}

export const isSymbol = (v: unknown): v is symbol => {
  return typeof v === 'symbol'
}

export const isBigInt = (v: unknown): v is bigint => {
  return typeof v === 'bigint'
}

export const isFunction = (v: unknown): v is Function => {
  return typeof v === 'function'
}

export const isObject = (v: unknown): v is object => {
  return typeof v === 'object' && v !== null
}

export const isArray = <T>(v: unknown): v is Array<T> => {
  return Array.isArray(v)
}

export const isRegExp = (v: unknown): v is RegExp => {
  return Object.prototype.toString.call(v) === '[object RegExp]'
}

export const isDate = (v: unknown): v is Date => {
  return Object.prototype.toString.call(v) === '[object Date]'
}

export const isError = (v: unknown): v is Error => {
  return Object.prototype.toString.call(v) === '[object Error]'
}

export const getTypeString = (v: unknown): string => (Object.prototype.toString.call(v) as string).slice(1, -1).split(' ')[1].toLowerCase()

const TypeCheck = {
  isNumber,
  isString,
  isBoolean,
  isNull,
  isUndefined,
  isSymbol,
  isBigInt,
  isFunction,
  isObject,
  isArray,
  isRegExp,
  isDate,
  isError,
  getTypeString,
}

export default TypeCheck
