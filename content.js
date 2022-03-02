const CANVAS_ID = "html-canvas"
const SWATCH_ID = "color-swatch"

const createSwatchDiv = () => {
  const div = document.createElement("div")
  div.id = SWATCH_ID
  div.style.position = "fixed"
  div.style.top = "0px"
  div.style.left = "0px"
  div.style.height = "50px"
  div.style.width = "50px"
  div.style.borderRadius = "25px"
  div.style.zIndex = "10000000"
  div.style.boxShadow = "0px 0px 8px 3px rgba(0, 0, 0, 0.05)"
  div.style.backgroundColor = "white"
  return div
}

chrome.runtime.onMessage.addListener(() => {
  // clean up old stuff
  if (document.getElementById(SWATCH_ID)) {
    document.getElementById(SWATCH_ID).remove()
    if (document.getElementById(CANVAS_ID)) {
      document.getElementById(CANVAS_ID).remove()
    }
    return
  }

  const swatchDiv = createSwatchDiv()
  document.body.appendChild(swatchDiv)

  html2canvas(document.body).then((canvas) => {
    canvas.id = CANVAS_ID
    canvas.style.position = "fixed"
    canvas.style.top = "0"
    canvas.style.opacity = "0"
    document.body.appendChild(canvas)

    document.addEventListener("mousemove", (ev) => {
      const context = document.getElementById(CANVAS_ID).getContext("2d")
      const data = context.getImageData(ev.pageX * 2, ev.pageY * 2, 1, 1).data
      const color = `rgb(${data[0]}, ${data[1]}, ${data[2]})`
      swatchDiv.style.top = ev.pageY + "px"
      swatchDiv.style.left = ev.pageX + "px"
      swatchDiv.style.backgroundColor = color
    })
    document.addEventListener("click", () => {})
  })
})
