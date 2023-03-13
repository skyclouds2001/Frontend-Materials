/**
 * Make all property type in T to be become never
 *
 * @deprecated *equal to Record<T, never>*
 */
type Never<T> = {
  [K in keyof T]: never
}

/**
 * Make all property type in T to be become null
 *
 * @deprecated *equal to Record<T, null>*
 */
type Null<T> = {
  [K in keyof T]: null
}

/**
 * Make all property type in T to be undefined
 *
 * @deprecated *equal to Record<T, undefined>*
 */
type Undefined<T> = {
  [K in keyof T]: undefined
}

/**
 * Make all property type in T to be null or undefined
 *
 * @deprecated *equal to Record<T, null | undefined>*
 */
type Nullish<T> = {
  [K in keyof T]: null | undefined
}
