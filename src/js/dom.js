window.dom = {
  el: (selector) => {
    const els = document.querySelectorAll(selector)
    if(els.length === 1) return els[0]
    return els
  },
  html: (selector, content) => {
    if (typeof selector !== 'string') return selector.innerHTML = content
    document.querySelectorAll(selector).forEach((e)=>{e.innerHTML = content})
  },
  style: (selector, style) => {
    if (typeof selector !== 'string') return selector.style = style
    document.querySelectorAll(selector).forEach((e)=>{e.style = style})
  },
  class: (selector, className) => {
    if (typeof selector !== 'string') return selector.className = className
    document.querySelectorAll(selector).forEach((e)=>{e.className = className})
  },
  listen: (selector, event, fx) => {
    if (typeof selector !== 'string') return selector.addEventListener(event, () => {fx(e)})
    document.querySelectorAll(selector).forEach((e)=>{e.addEventListener(event, () => {fx(e)})})
  },
  focus: (selector, event) => {
    if (typeof selector !== 'string') return selector.focus()
    document.querySelectorAll(selector).forEach((e)=>{e.focus()})
  }
}