const CANVAS_ID = "html-canvas"
const SWATCH_ID = "color-swatch"
const SWATCH_WIDTH = 50
const SIDEPANEL_ID = "color-palette-sidepanel"

const styles = `
  #${SWATCH_ID} {
    position: fixed;
    top: 0px;
    left: 0px;
    z-index: 10000000;
  }
  .color-circle {
    box-shadow: 0px 0px 8px 3px rgba(0, 0, 0, 0.1);
    background-color: white;
    height: ${SWATCH_WIDTH}px;
    width: ${SWATCH_WIDTH}px;
    border-radius: 25px;
    margin-right: 10px;
    position: relative;
  }
  #${CANVAS_ID} {
    position: fixed;
    top: 0px;
    opacity: 0;
  }
  #${SIDEPANEL_ID} {
    position: fixed;
    top: 0px;
    right: 0px;
    height: 100vh;
    background-color: white;
    z-index: 1000000;
    width: 25vw;
    box-shadow: 5px 0px 8px 3px rgba(0, 0, 0, 0.06);
    font-family: 'Roboto', sans-serif;
  }
  #${SIDEPANEL_ID} h3 {
    font-weight: 400;
    letter-spacing: 0.05em;
    font-family: 'Oswald', sans-serif;
    padding: 0 1rem 0 1rem;
  }
  .palette {
    padding: 0 1rem 1rem 1rem;
    background-color: white;
    border-top: 1px solid #F8F8F8;
    cursor: pointer;
  }
  .palette:hover {
    background-color: #F8F8F8;
  }
  .active-palette {
    background-color: #F8F8F8;
  }
  .colors-container {
    display: flex;
    flex-wrap: wrap;
  }
  .delete-color-button {
    position: absolute;
    top: 0px;
    right: 0px;
    width: 15px;
    height: 15px;
    border-radius: 7.5px;
    background-color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-bottom: 1px;
    font-size: 10pt;
    color: #808080;
  }
  .delete-color-button:hover {
    background-color: #f24e4e;
    color: white;
  }
`

const createPaletteElement = ({ name, colors }, idx, palettes) => {
  const paletteTitle = document.createElement("p")
  paletteTitle.classList.add("palette-title")
  paletteTitle.innerText = name

  const paletteDiv = document.createElement("div")
  paletteDiv.classList.add("palette")
  if (idx === 0) {
    paletteDiv.classList.add("active-palette")
  }
  paletteDiv.appendChild(paletteTitle)

  const colorsContainer = document.createElement("div")
  colorsContainer.classList.add("colors-container")
  paletteDiv.appendChild(colorsContainer)

  colors.forEach((color) => {
    const colorDiv = document.createElement("div")
    colorDiv.classList.add("color-circle")
    colorDiv.style.backgroundColor = color

    const deleteButton = document.createElement("div")
    deleteButton.classList.add("delete-color-button")
    deleteButton.innerText = "x"
    deleteButton.addEventListener("click", () => {
      const newPalletes = palettes.map((p) => {
        if (p.name !== name) {
          return p
        }
        const newPalette = { ...p }
        newPalette.colors = newPalette.colors.filter((c) => c !== color)
        return newPalette
      })
      chrome.storage.sync.set({ palettes: newPalletes }, () =>
        colorDiv.remove()
      )
    })
    colorDiv.appendChild(deleteButton)

    colorsContainer.appendChild(colorDiv)
  })

  return paletteDiv
}

// TODO - remove these
const MOCK_PALETTES = [
  { name: "palette 1", colors: ["#F5891B", "#1C3984", "#23A0DD", "#EE3D55"] },
  { name: "palette 2", colors: ["#EAB39D", "#E62E3B", "#C5CAB3", "#135142"] },
]

const cleanUp = () => {
  document.getElementById(SWATCH_ID).remove()
  document.getElementById(CANVAS_ID)?.remove()
  document.getElementById(SIDEPANEL_ID)?.remove()
}

chrome.runtime.onMessage.addListener(() => {
  if (document.getElementById(SWATCH_ID)) {
    // TODO - remove event handlers
    cleanUp()
    return
  }
  // inject new styles
  const styleElement = document.createElement("style")
  styleElement.textContent = styles
  const fontsLink = document.createElement("link")
  fontsLink.href =
    "https://fonts.googleapis.com/css2?family=Oswald&family=Roboto&display=swap"
  fontsLink.rel = "stylesheet"
  const iconsScript = document.createElement("script")
  iconsScript.src = "https://kit.fontawesome.com/d5c186569c.js"
  iconsScript.crossOrigin = "anonymous"

  document.head.append(styleElement)
  document.head.append(fontsLink)
  document.head.append(iconsScript)

  // create sidepanel
  document.body.style.width = "75vw"
  const sidepanelTitle = document.createElement("h3")
  sidepanelTitle.innerText = "COLOR PALETTES"
  const sidepanel = document.createElement("div")
  sidepanel.setAttribute("id", SIDEPANEL_ID)
  sidepanel.appendChild(sidepanelTitle)
  document.body.appendChild(sidepanel)

  // fill sidepanel with saved palettes
  chrome.storage.sync.get(["palettes"], function (result) {
    if (result.palettes?.length) {
      result.palettes.forEach((palette, idx) => {
        const paletteDiv = createPaletteElement(palette, idx, result.palettes)
        sidepanel.appendChild(paletteDiv)
      })
    }
  })

  // create swatch element
  const swatchDiv = document.createElement("div")
  swatchDiv.setAttribute("id", SWATCH_ID)
  swatchDiv.classList.add("color-circle")
  document.body.appendChild(swatchDiv)

  html2canvas(document.body).then((canvas) => {
    canvas.id = CANVAS_ID
    document.body.appendChild(canvas)

    document.addEventListener("mousemove", (ev) => {
      if (ev.pageX > document.body.clientWidth) {
        return
      }
      const context = document.getElementById(CANVAS_ID).getContext("2d")
      const data = context.getImageData(ev.pageX * 2, ev.pageY * 2, 1, 1).data
      const color = `rgb(${data[0]}, ${data[1]}, ${data[2]})`
      if (ev.pageX + SWATCH_WIDTH < document.body.clientWidth) {
        swatchDiv.style.left = ev.pageX + "px"
        swatchDiv.style.top = ev.pageY + "px"
      }
      swatchDiv.style.backgroundColor = color
    })
  })
})
