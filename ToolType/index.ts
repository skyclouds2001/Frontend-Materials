/**
 * Make all property type in T to be become never
 */
type Never<T> = {
  [K in keyof T]: never
}

/**
 * Make all property type in T to be become null
 */
type Null<T> = {
  [K in keyof T]: null
}

/**
 * Make all property type in T to be undefined
 */
type Undefined<T> = {
  [K in keyof T]: undefined
}

/**
 * Make all property type in T to be null or undefined
 */
type Nullish<T> = {
  [K in keyof T]: null | undefined
}
