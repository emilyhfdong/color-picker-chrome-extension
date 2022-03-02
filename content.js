const CANVAS_ID = "html-canvas"
const SWATCH_ID = "color-swatch"
const SIDEPANEL_ID = "color-palette-sidepanel"

const styles = `
  #${SWATCH_ID} {
    position: fixed;
    top: 0px;
    left: 0px;
    height: 50px;
    width: 50px;
    border-radius: 25px;
    z-index: 10000000;
    box-shadow: 0px 0px 8px 3px rgba(0, 0, 0, 0.05);
    background-color: white;
  }
  #${SIDEPANEL_ID} {
    position: fixed;
    top: 0px;
    right: 0px;
    height: 100vh;
    background-color: white;
    z-index: 1000000;
    width: 25vw;
    box-shadow: 5px 0px 8px 3px rgba(0, 0, 0, 0.1);
  }
`

chrome.runtime.onMessage.addListener(() => {
  // clean up old stuff
  if (document.getElementById(SWATCH_ID)) {
    document.getElementById(SWATCH_ID).remove()
    if (document.getElementById(CANVAS_ID)) {
      document.getElementById(CANVAS_ID).remove()
    }
    return
  }
  // inject new styles
  const styleElement = document.createElement("style")
  styleElement.textContent = styles
  document.head.append(styleElement)

  // create sidepanel

  document.body.style.width = "75vw"
  const sidepanel = document.createElement("div")
  sidepanel.id = SIDEPANEL_ID
  document.body.appendChild(sidepanel)

  // create swatch element
  const swatchDiv = document.createElement("div")
  swatchDiv.id = SWATCH_ID
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
