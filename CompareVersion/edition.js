/**
 * 判断版本号
 * 返回 -1 代表前边的大
 * 返回 1 代表后边的大
 * @param first {string}
 * @param second {string}
 * @return {-1 | 0 | 1}
 */
const compareVersion = function (first, second) {
  const f = first.split('.').map(v => Number(v))
  const s = second.split('.').map(v => Number(v))
  let index = 0
  for (let i = 0; i < Math.max(f.length, s.length); ++i) {
    if (s[i] === undefined || f[i] > s[i]) {
      index = 1
      break
    }
    if (f[i] === undefined || f[i] < s[i]) {
      index = -1
      break
    }
  }
  return index
}
