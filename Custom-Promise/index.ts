/**
 * @file a custom promise
 * @author skyclouds2001
 * @version 0.0.0
 * @copyright skyclouds2001
 * @see https://www.ituring.com.cn/article/66566
 * @see https://zhuanlan.zhihu.com/p/144058361
 */

/**
 * a custom promise
 */
class _Promise <T = any> {
  private static readonly PENDING = 'pending'
  private static readonly FULFILLED = 'fulfilled'
  private static readonly REJECTED = 'rejected'

  private status: typeof _Promise.PENDING | typeof _Promise.FULFILLED | typeof _Promise.REJECTED
  private value: T
  private reason: any

  public constructor (executor: (resolve: (value: T) => void, reject: (reason: any) => void) => void) {
    this.status = _Promise.PENDING

    try {
      executor(this.resolve, this.reject)
    } catch (error) {
      this.reject(error)
    }
  }

  private resolve (value: T): void {
    if (this.status !== _Promise.PENDING) return

    this.status = _Promise.FULFILLED
    this.value = value
  }

  private reject (reason: any): void {
    if (this.status !== _Promise.PENDING) return

    this.status = _Promise.REJECTED
    this.reason = reason
  }

  // todo
  public then <P = T, Q = never> (onfulfilled: ((value: T) => P) | null | undefined, onrejected: ((reason: any) => Q) | null | undefined): _Promise<P | Q> {
    return new _Promise((resolve, reject) => {})
  }

  // todo
  public catch <S = never> (onrejected: ((reason: any) => S) | null | undefined): _Promise<T | S> {
    return new _Promise((resolve, reject) => {})
  }
}
