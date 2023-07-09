/**
 * @file a rich-text editor based on canvas
 * @author skyclouds2001
 * @version 0.0.0
 * @since 2023.6.26
 * @see https://juejin.cn/post/7245922875181826108
 * @see https://segmentfault.com/a/1190000043930131
 * @see https://github.com/wanglin2/canvas-editor-demo
 * @see https://wanglin2.github.io/canvas-editor-demo/
 * @see https://github.com/Hufe921/canvas-editor
 * @see https://hufe.club/canvas-editor/
 */

/**
 * The editor instance class
 */
class Editor {
  /**
   * @typedef {Object} Options 编辑器选项
   * @property {number} pageWidth 页面宽度
   * @property {number} pageHeight 页面高度
   * @property {[number, number, number, number]} pagePadding 页面内边距
   * @property {[number, number, number, number]} pageMargin 页面外边距
   * @property {string} pageBackgroundColor 页面背景颜色
   * @property {string} pageBoxShadow 页面背景阴影
   * @property {number} pagePaddingIndicatorSize 页面内边距指示器大小
   * @property {string} pagePaddingIndicatorColor 页面内边距指示器颜色
   * @property {number} lineHeight 文字行高
   * @property {number} fontSize 文字大小
   * @property {string} textColor 文字颜色
   * @property {string} fontFamily 文字字体
   * @property {string} rangeColor
   * @property {number} rangeOpacity
   */

  /**
   * @typedef {Object} Line 行块
   * @property {number} width 行宽
   * @property {number} height 行高
   * @property {Array<Word & { font: string } & { info: Record<'width' | 'height' | 'ascent' | 'descent', number> }>} elements 行的文字
   * @property {number} rawHeight 原始字高
   * @property {number} ascent 上高
   * @property {number} descent 下高
   */

  /**
   * @typedef {Object} Word 文字块
   * @property {string} value 文字内容
   * @property {string} [color] 文字颜色
   * @property {number} [size] 文字大小
   * @property {string} [backgroundColor] 文字背景颜色
   * @property {number} [lineHeight] 文字行高
   * @property {boolean} [bold] 文字粗体
   * @property {boolean} [italic] 文字斜体
   * @property {boolean} [underline] 文字下划线
   * @property {boolean} [lineThrough] 文字删除线
   * @property {string} [fontFamily] 文字字体
   */

  /**
   * 编辑器默认选项
   * @type {Options}
   * @readonly
   */
  static options = {
    pageWidth: 794,
    pageHeight: 1123,
    pagePadding: [100, 120, 100, 120],
    pageMargin: [20, 20, 20, 20],
    pageBackgroundColor: '#fff',
    pageBoxShadow: '#9ea1a566 0 2px 12px',
    pagePaddingIndicatorSize: 35,
    pagePaddingIndicatorColor: '#BABABA',
    lineHeight: 1.5,
    textColor: '#333',
    fontSize: 16,
    fontFamily: 'Yahei',
    rangeColor: '#bbdfff',
    rangeOpacity: 0.6,
  }

  /**
   * 容器元素
   * @type {HTMLElement}
   */
  #container

  /**
   * 文本内容
   * @type {Word[]}
   */
  #text

  /**
   * 编辑器选项
   * @type {Options}
   */
  #options

  /**
   * 页面列表
   * @type {HTMLCanvasElement[]}
   */
  #pages

  /**
   * 行列表
   * @type {Line[]}
   */
  #lines

  /**
   * 数据元组
   * @type {Array<Word & { font: string } & { info: Record<'width' | 'height' | 'ascent' | 'descent', number> } & { pageIndex: number } & { rowIndex: number } & { rect: Record<'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom', [number, number]> }>}
   */
  #positions

  /**
   * 选区位置
   */
  #range

  /**
   * 光标元素
   * @type {HTMLDivElement}
   */
  #cursor

  /**
   * 光标位置
   * @type {number}
   */
  #cursorPosition

  /**
   * 文本框元素
   * @type {HTMLTextAreaElement}
   */
  #textarea

  /**
   * 是否拼音输入模式
   * @type {boolean}
   */
  #isComposition

  /**
   * 是否鼠标落下
   * @type {boolean}
   */
  #isMouseDown

  /**
   * @param {HTMLElement} container 容器元素
   * @param {Word[]} text 初始文本内容
   * @param {Partial<Options>} options 编辑器选项
   */
  constructor(container, text, options) {
    this.#container = container
    this.#text = text
    this.#options = { ...Editor.options, ...options }
    this.#pages = []
    this.#range = []

    this.#cursorPosition = -1
    this.#isComposition = false
    this.#isMouseDown = false

    document.body.addEventListener('mousemove', this.#onMouseMove.bind(this))
    document.body.addEventListener('mouseup', this.#onMouseUp.bind(this))

    this.render()
  }

  /**
   * 新建页面
   * @param {number} pageIndex 页面下标
   */
  #createPage(pageIndex) {
    const { pageWidth, pageHeight, pageMargin, pageBackgroundColor, pageBoxShadow } = this.#options

    const canvas = document.createElement('canvas')
    canvas.width = pageWidth
    canvas.height = pageHeight
    canvas.style.width = `${pageWidth}px`
    canvas.style.height = `${pageHeight}px`
    canvas.style.margin = pageMargin.reduce((pre, cur) => pre + cur + 'px ', '').trim()
    canvas.style.backgroundColor = pageBackgroundColor
    canvas.style.boxShadow = pageBoxShadow
    canvas.style.cursor = 'text'

    canvas.addEventListener('mousedown', (e) => {
      this.#onMousedown(e, pageIndex)
    })

    this.#renderPagePaddingIndicators(canvas)

    this.#pages.push(canvas)
    this.#container.appendChild(canvas)
  }

  /**
   * 绘制页面四个直角指示器
   * @param {HTMLCanvasElement} canvas
   */
  #renderPagePaddingIndicators(canvas) {
    const { pageWidth, pageHeight, pagePadding, pagePaddingIndicatorColor, pagePaddingIndicatorSize } = this.#options

    const context = canvas.getContext('2d')
    if (context === null) return

    context.save()
    context.strokeStyle = pagePaddingIndicatorColor

    /** @type {Array<Array<[number, number]>>}  */
    const points = [
      // 左上
      [
        [pagePadding[3], pagePadding[0] - pagePaddingIndicatorSize],
        [pagePadding[3], pagePadding[0]],
        [pagePadding[3] - pagePaddingIndicatorSize, pagePadding[0]],
      ],
      // 右上
      [
        [pageWidth - pagePadding[1], pagePadding[0] - pagePaddingIndicatorSize],
        [pageWidth - pagePadding[1], pagePadding[0]],
        [pageWidth - pagePadding[1] + pagePaddingIndicatorSize, pagePadding[0]],
      ],
      // 左下
      [
        [pagePadding[3], pageHeight - pagePadding[2] + pagePaddingIndicatorSize],
        [pagePadding[3], pageHeight - pagePadding[2]],
        [pagePadding[3] - pagePaddingIndicatorSize, pageHeight - pagePadding[2]],
      ],
      // 右下
      [
        [pageWidth - pagePadding[1], pageHeight - pagePadding[2] + pagePaddingIndicatorSize],
        [pageWidth - pagePadding[1], pageHeight - pagePadding[2]],
        [pageWidth - pagePadding[1] + pagePaddingIndicatorSize, pageHeight - pagePadding[2]],
      ],
    ]

    points.forEach((line) => {
      line.forEach((point, index) => {
        if (index === 0) {
          context.beginPath()
          context.moveTo(...point)
        } else {
          context.lineTo(...point)
        }
        if (index == line.length - 1) {
          context.stroke()
        }
      })
    })
    context.restore()
  }

  /**
   * 生成文字设置字符串
   * @param {Word} element 
   */
  #generateFontString(element) {
    const { fontSize, fontFamily } = this.#options
    return `${element.italic ? 'italic' : ''} ${element.bold ? 'bold' : ''} ${element.size || fontSize}px ${element.fontFamily || fontFamily}`.trim()
  }

  /**
   * 计算行数据
   */
  #calculateRows() {
    const { pageWidth, pagePadding, lineHeight, fontSize } = this.#options
    const contentWidth = pageWidth - pagePadding[1] - pagePadding[3]

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    /** @type {Line[]} */
    const rows = [{
      width: 0,
      height: 0,
      elements: [],
      rawHeight: 0,
      ascent: 0,
      descent: 0,
    }]

    this.#text.forEach((item) => {
      const actualLineHeight = item.lineHeight || lineHeight
      const font = this.#generateFontString(item)

      const info = {
        width: 0,
        height: 0,
        ascent: 0,
        descent: 0,
      }

      if (item.value === '\n') {
        info.height = fontSize
      } else {
        ctx.font = font
        const { width, actualBoundingBoxAscent, actualBoundingBoxDescent } = ctx.measureText(item.value)
        info.width = width
        info.height = actualBoundingBoxAscent + actualBoundingBoxDescent
        info.ascent = actualBoundingBoxAscent
        info.descent = actualBoundingBoxDescent
      }

      const element = {
        ...item,
        info,
        font,
      }

      const row = rows[rows.length - 1]
      if (row.width + info.width <= contentWidth && item.value !== '\n') {
        row.elements.push(element)
        row.width += info.width
        row.height = Math.max(row.height, info.height * actualLineHeight)
        row.rawHeight = Math.max(row.rawHeight, info.height)
        row.ascent = Math.max(row.ascent, info.ascent)
        row.descent = Math.max(row.descent, info.descent)
      } else {
        rows.push({
          width: info.width,
          height: info.height * actualLineHeight,
          rawHeight: info.height,
          elements: [element],
          ascent: info.ascent,
          descent: info.descent,
        })
      }
    })

    this.#lines = rows
  }

  /**
   * 渲染页方法
   */
  #renderPage() {
    const { pageHeight, pagePadding } = this.#options

    const contentHeight = pageHeight - pagePadding[0] - pagePadding[2]

    let renderHeight = 0
    let index = 0
    if (!this.#pages[index]) this.#createPage(index)
    let context = this.#pages[index]?.getContext('2d')

    this.#lines.forEach((line, i) => {
      if (renderHeight + line.height > contentHeight) {
        ++index
        if (!this.#pages[index]) this.#createPage(index)
        context = this.#pages[index]?.getContext('2d')
        renderHeight = 0
      }

      if (!context) return

      this.#renderLine(context, renderHeight, line, index, i)

      renderHeight += line.height
    })
  }

  /**
   * 渲染行方法
   * @param {CanvasRenderingContext2D} context 
   * @param {number} height 
   * @param {Line} line 
   * @param {number} pageIndex
   * @param {number} rowIndex
   */
  #renderLine(context, height, line, pageIndex, rowIndex) {
    const { textColor, pagePadding, rangeColor, rangeOpacity } = this.#options

    const offsetX = pagePadding[3]
    const offsetY = pagePadding[0]

    let renderWidth = offsetX
    let renderHeight = height + offsetY

    line.elements.forEach((el) => {
      this.#positions.push({
        ...el,
        pageIndex,
        rowIndex,
        rect: {
          leftTop: [renderWidth, renderHeight],
          leftBottom: [renderWidth, renderHeight + line.height],
          rightTop: [renderWidth + el.info.width, renderHeight],
          rightBottom: [renderWidth + el.info.width, renderHeight + line.height],
        },
      })

      if (el.value === '\n') return

      context.save()

      if (el.backgroundColor) {
        context.save()
        context.beginPath()
        context.fillStyle = el.backgroundColor
        context.fillRect(renderWidth, renderHeight, el.info.width, line.height)
        context.restore()
      }

      if (el.underline) {
        context.save()
        context.beginPath()
        context.moveTo(renderWidth, renderHeight + line.height)
        context.lineTo(renderWidth + el.info.width, renderHeight + line.height)
        context.stroke()
        context.restore()
      }

      if (el.lineThrough) {
        context.save()
        context.beginPath()
        context.moveTo(renderWidth, renderHeight + line.height / 2)
        context.lineTo(renderWidth + el.info.width, renderHeight + line.height / 2)
        context.stroke()
        context.restore()
      }

      context.font = el.font
      context.fillStyle = el.color || textColor
      context.fillText(el.value, renderWidth, renderHeight + line.height - (line.height - line.rawHeight) / 2 - line.descent)

      if (this.#range.length === 2 && this.#range[0] !== this.#range[1]) {
        const range = this.#getRange()
        const positionIndex = this.#positions.length - 1

        if (positionIndex >= range[0] && positionIndex <= range[1]) {
          context.save()
          context.beginPath()
          context.globalAlpha = rangeOpacity
          context.fillStyle = rangeColor
          context.fillRect(renderWidth, renderHeight, el.info.width, el.info.height)
          context.restore()
        }
      }

      renderWidth += el.info.width
      context.restore()
    })
  }

  /**
   * 渲染主方法
   */
  render() {
    this.clear()
    this.#lines = []
    this.#positions = []
    this.#initCursor()
    this.#initTextarea()
    this.#calculateRows()
    this.#renderPage()
  }

  /**
   * 清空画布方法
   */
  clear() {
    const { pageWidth, pageHeight } = this.#options
    this.#pages.forEach((page) => {
      const context = page.getContext('2d')
      if (!context) return
      context.clearRect(0, 0, pageWidth, pageHeight)
    })
  }

  /**
   * 转换获取鼠标事件
   * @param {MouseEvent} e 鼠标点击事件
   * @param {HTMLCanvasElement} canvas canvas 对象
   */
  #transformWindowPositionToCanvasPosition(e, canvas) {
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  /**
   * 转换canvas位置到容器元素位置
   * @param {number} x x值
   * @param {number} y y值
   * @param {HTMLCanvasElement} canvas canvas 对象
   */
  #transformCanvasPositionToContainerPosition(x, y, canvas) {
    return {
      x: x + canvas.offsetLeft,
      y: y + canvas.offsetTop,
    }
  }

  #getRange() {
    if (this.#range.length < 2) {
      return []
    }
    if (this.#range[1] > this.#range[0]) {
      return [this.#range[0] + 1, this.#range[1]]
    } else if (this.#range[1] < this.#range[0]) {
      return [this.#range[1] + 1, this.#range[0]]
    } else {
      return []
    }
  }

  /**
   * 获取鼠标点击位置
   * @param {number} x 页面下标
   * @param {number} y 页面下标
   * @param {number} pageIndex 页面下标
   */
  #getPositionByPos(x, y, pageIndex) {
    for (let i = 0; i < this.#positions.length; i++) {
      let cur = this.#positions[i]
      if (cur.pageIndex !== pageIndex) {
        continue
      }
      if (
        x >= cur.rect.leftTop[0] &&
        x <= cur.rect.rightTop[0] &&
        y >= cur.rect.leftTop[1] &&
        y <= cur.rect.leftBottom[1]
      ) {
        if (x < cur.rect.leftTop[0] + cur.info.width / 2) {
          return i - 1
        }
        return i
      }
    }
    // 是否点击在某一行
    let index = -1
    for (let i = 0; i < this.#positions.length; i++) {
      let cur = this.#positions[i]
      if (cur.pageIndex !== pageIndex) {
        continue
      }
      if (y >= cur.rect.leftTop[1] && y <= cur.rect.leftBottom[1]) {
        index = i
      }
    }
    if (index !== -1) {
      return index
    }
    // 返回当前页的最后一个元素
    for (let i = 0; i < this.#positions.length; i++) {
      let cur = this.#positions[i]
      if (cur.pageIndex !== pageIndex) {
        continue
      }
      index = i
    }
    return index
  }

  /**
   * 获取光标信息
   * @param {number} positionIndex 位置元组下标
   */
  #getCursor(positionIndex) {
    const { pagePadding, fontSize, lineHeight } = this.#options

    const position = this.#positions[positionIndex]
    const line = this.#lines[position?.rowIndex]
    const height = position?.size || fontSize

    if (!position) {
      const next = this.#positions[positionIndex + 1]
      if (next) {
        const nextCursor = this.#getCursor(positionIndex + 1)
        return {
          x: pagePadding[3],
          y: nextCursor.y,
          height: nextCursor.height,
        }
      } else {
        return {
          x: pagePadding[3],
          y: pagePadding[0] + (height * lineHeight - height * 1.5) / 2,
          height: height * 1.5,
        }
      }
    }

    return {
      x: position.value === '\n' ? position.rect.leftTop[0] : position.rect.rightTop[0],
      y: position.rect.rightTop[1] + line.height - (line.height - line.rawHeight) / 2 - height * 1.5 + (height * 1.5 - Math.max(height, position.info.height)),
      height: 1.5 * height,
    }
  }

  /**
   * 设置光标方法
   * @param {number} left 距页面左侧距离
   * @param {number} top 距页面顶侧距离
   * @param {number} height 光标高度
   */
  #setCursor(left, top, height) {
    this.#cursor.style.left = `${left}px`
    this.#cursor.style.top = `${top}px`
    this.#cursor.style.height = `${height}px`

    setTimeout(() => {
      this.#focus()
    }, 0)
  }

  /**
   * 计算渲染光标方法
   * @param {number} position 位置
   * @param {number} page 页码
   */
  #computeAndRenderCursor(position, page) {
    const cursor = this.#getCursor(position)
    const pos = this.#transformCanvasPositionToContainerPosition(cursor.x, cursor.y, this.#pages[page])
    this.#setCursor(pos.x, pos.y, cursor.height)
  }

  /**
   * 初始化光标方法
   */
  #initCursor() {
    if (this.#cursor) return

    const cursor = document.createElement('div')
    cursor.style.position = 'absolute'
    cursor.style.width = '2px'
    cursor.style.backgroundColor = '#333'
    cursor.style.opacity = '0'
    cursor.style.willChange = 'opacity'

    setInterval(() => {
      cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0'
    }, 500)

    this.#container.appendChild(cursor)

    this.#cursor = cursor
  }

  #focus() {
    this.#textarea.focus()
  }

  #blur() {
    this.#textarea.blur()
  }

  /**
   * 初始化文本框方法
   */
  #initTextarea() {
    if (this.#textarea) return

    const textarea = document.createElement('textarea')
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'

    textarea.addEventListener('input', this.#onInput.bind(this))
    textarea.addEventListener('keydown', this.#onKeyDown.bind(this))
    textarea.addEventListener('compositionstart', () => {
      this.#isComposition = true
    })
    textarea.addEventListener('compositionend', () => {
      this.#isComposition = false
    })

    document.body.appendChild(textarea)

    this.#textarea = textarea
  }

  /**
   * 获取鼠标点击的页码
   * @param {number} x 鼠标x坐标
   * @param {number} y 鼠标y坐标
   */
  #getPosInPageIndex(x, y) {
    const { left, top, right, bottom } = this.#container.getBoundingClientRect()
    if (x < left || x > right || y < top || y > bottom) return -1

    const { pageHeight, pageMargin } = this.#options

    const totalTop = y - top + this.#container.scrollTop

    for (let i = 0; i < this.#pages.length; ++i) {
      const pageStartTop = i * (pageHeight + pageMargin[0])
      const pageEndTop = pageStartTop + pageHeight
      if (totalTop >= pageStartTop && totalTop <= pageEndTop) {
        return i
      }
    }

    return -1
  }

  /**
   * 鼠标点击处理方法
   * @param {MouseEvent} e 鼠标点击事件
   * @param {number} pageIndex 页面下标
   */
  #onMousedown(e, pageIndex) {
    const { x, y } = this.#transformWindowPositionToCanvasPosition(e, this.#pages[pageIndex])

    this.#isMouseDown = true

    const positionIndex = this.#getPositionByPos(x, y, pageIndex)
    this.#cursorPosition = positionIndex

    this.#range[0] = positionIndex

    const { x: cx, y: cy, height } = this.#getCursor(positionIndex)

    const pos = this.#transformCanvasPositionToContainerPosition(cx, cy, this.#pages[pageIndex])

    this.#setCursor(pos.x, pos.y, height)
  }

  /**
   * 键盘输入回调事件
   * @param {InputEvent} e 输入事件
   */
  #onInput(e) {
    setTimeout(() => {
      if (!e.data || this.#isComposition) return

      const range = this.#getRange()
      if (range.length > 0) {
        this.#delete()
      }

      const arr = e.data.split('')
      this.#text.splice(this.#cursorPosition + 1, 0, ...arr.map((v) => ({
        ...(this.#positions[this.#cursorPosition] || {}),
        value: v,
      })))

      this.render()

      this.#cursorPosition += arr.length
      this.#computeAndRenderCursor(this.#cursorPosition, this.#positions[this.#cursorPosition].pageIndex)
    }, 0)
  }

  /**
   * 键盘按下回调事件
   * @param {KeyboardEvent} e 键盘按下事件
   */
  #onKeyDown(e) {
    if (e.code === 'Delete') {
      if (this.#cursorPosition < 0) return

      this.#text.splice(this.#cursorPosition + 1, 1)

      this.render()

      this.#computeAndRenderCursor(this.#cursorPosition, this.#positions[this.#cursorPosition].pageIndex)
    }
    if (e.code === 'Enter') {
      this.#text.splice(this.#cursorPosition + 1, 0, {
        value: '\n',
      })

      this.render()

      ++this.#cursorPosition

      this.#computeAndRenderCursor(this.#cursorPosition, this.#positions[this.#cursorPosition].pageIndex)
    }
  }

  /**
   * 鼠标移动处理方法
   * @param {MouseEvent} e 鼠标移动事件
   */
  #onMouseMove(e) {
    if (!this.#isMouseDown) return

    const pageIndex = this.#getPosInPageIndex(e.clientX, e.clientY)
    if (pageIndex === -1) return

    const { x, y } = this.#transformWindowPositionToCanvasPosition(e, this.#pages[pageIndex])

    const positionIndex = this.#getPositionByPos(x, y, pageIndex)

    if (positionIndex !== -1) {
      this.#range[1] = positionIndex
      if (Math.abs(this.#range[1] - this.#range[0]) > 0) {
        this.#cursorPosition = -1
        this.#cursor.hidden = true
      }
      this.render()
    }
  }

  #onMouseUp() {
    this.#isMouseDown = false
  }

  #delete() {
    if (this.#cursorPosition < 0) {
      let range = this.#getRange()
      if (range.length > 0) {
        // 存在选区，删除选区内容
        let length = range[1] - range[0] + 1
        this.#text.splice(range[0], length)
        this.cursorPositionIndex = range[0] - 1
      } else {
        return
      }
    } else {
      this.#text.splice(this.#cursorPosition, 1)
      this.render()
      --this.#cursorPosition
    }
    let position = this.#positions[this.#cursorPosition]
    this.#computeAndRenderCursor(
      this.#cursorPosition,
      position ? position.pageIndex : 0
    )
  }
}
