const CANVAS_ID = "html-canvas"
const CURSOR_SWATCH_ID = "cursor-color-swatch"
const SWATCH_WIDTH = 50
const SIDEPANEL_ID = "color-palette-sidepanel"

const styles = `
  #${CURSOR_SWATCH_ID} {
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
    font-size: 10pt;
    overflow: scroll;
  }
  .sidepanel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 1rem 0 1rem;
  }
  #${SIDEPANEL_ID} h3 {
    font-weight: 400;
    letter-spacing: 0.05em;
    font-family: 'Oswald', sans-serif;
  }
  .add-palette-button {
    color: 808080;
    background-color: white;
    border: 1px solid white;
    font-size: 18pt;
    border-radius: 5px;
    cursor: pointer;
  }
  .add-palette-button:hover {
    background-color: #F8F8F8;
  }
  .palette {
    padding: 0 1rem 1rem 1rem;
    background-color: white;
    border-top: 1px solid #F8F8F8;
    cursor: pointer;
  }
  .palette-header {
    display: inline-block;
    position: relative;
  }
  .palette:hover {
    background-color: #F8F8F8;
  }
  .swatch-color-circle {
    display: none;
  }
  .active-palette .swatch-color-circle {
    display: inline-block;
  }
  .active-palette {
    background-color: #F8F8F8;
    font-weight: bold;
  }
  .colors-container {
    display: flex;
    flex-wrap: wrap;
    min-height: ${SWATCH_WIDTH}px;
  }
  .delete-button {
    width: 15px;
    height: 15px;
    border-radius: 7.5px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-bottom: 1px;
    font-size: 10pt;
    color: #808080;
  }
  .delete-palette-button {
    border: 1px solid #F8F8F8;
    background-color: white;
    margin-left: 2px;

    position: absolute;
    top: 3px;
    right: -15px;
  }
  .delete-color-button {
    position: absolute;
    top: 0px;
    right: 0px;
    background-color: white;
  }
  .hidden {
    display: none;
  }
  .delete-button:hover {
    background-color: #f24e4e;
    color: white;
  }
`

const createColorDiv = (color, parentPalette, palettes) => {
  const colorDiv = document.createElement("div")
  colorDiv.classList.add("color-circle")
  colorDiv.style.backgroundColor = color

  const deleteButton = document.createElement("div")
  deleteButton.classList.add("delete-color-button", "delete-button", "hidden")
  deleteButton.innerText = "x"
  deleteButton.addEventListener("click", () => {
    const newPalettes = palettes.map((p) => {
      if (p.name !== parentPalette.name) {
        return p
      }
      const newPalette = { ...p }
      newPalette.colors = newPalette.colors.filter((c) => c !== color)
      return newPalette
    })
    chrome.storage.sync.set({ palettes: newPalettes }, () => colorDiv.remove())
  })
  colorDiv.addEventListener("click", () => navigator.clipboard.writeText(color))
  colorDiv.addEventListener("mouseenter", () => {
    deleteButton.classList.remove("hidden")
  })
  colorDiv.addEventListener("mouseleave", () => {
    deleteButton.classList.add("hidden")
  })
  colorDiv.appendChild(deleteButton)
  return colorDiv
}

const createPaletteElement = (
  { name, colors },
  palettes,
  palettesContainer
) => {
  const paletteDiv = document.createElement("div")
  paletteDiv.classList.add("palette")

  const paletteTitle = document.createElement("p")
  paletteTitle.classList.add("palette-title")
  paletteTitle.innerText = name
  const deletePaletteButton = document.createElement("div")
  deletePaletteButton.classList.add(
    "delete-button",
    "delete-palette-button",
    "hidden"
  )
  deletePaletteButton.innerText = "x"
  deletePaletteButton.addEventListener("click", () => {
    const newPalettes = palettes.filter((p) => p.name !== name)
    chrome.storage.sync.set({ palettes: newPalettes }, () => {
      if (paletteDiv.classList.contains("active-palette")) {
        palettesContainer
          .querySelector(".palette:not(.active-palette)")
          ?.classList.add("active-palette")
      }
      paletteDiv.remove()
    })
  })
  const paletteHeader = document.createElement("div")
  paletteHeader.classList.add("palette-header")
  paletteHeader.addEventListener("mouseenter", () =>
    deletePaletteButton.classList.remove("hidden")
  )
  paletteHeader.addEventListener("mouseleave", () =>
    deletePaletteButton.classList.add("hidden")
  )
  paletteHeader.appendChild(paletteTitle)
  paletteHeader.appendChild(deletePaletteButton)

  paletteDiv.appendChild(paletteHeader)

  const colorsContainer = document.createElement("div")
  colorsContainer.classList.add("colors-container")
  paletteDiv.appendChild(colorsContainer)

  colors.forEach((color) => {
    const colorDiv = createColorDiv(color, { name, colors }, palettes)
    colorsContainer.appendChild(colorDiv)
  })

  const swatchColorCircle = document.createElement("div")
  swatchColorCircle.classList.add("color-circle", "swatch-color-circle")
  colorsContainer.appendChild(swatchColorCircle)

  paletteDiv.addEventListener("click", () => {
    if (paletteDiv.classList.contains("active-palette")) {
      return
    }
    palettesContainer
      .querySelector(".active-palette")
      ?.classList.remove("active-palette")

    paletteDiv.classList.add("active-palette")
  })
  document.addEventListener("click", (ev) => {
    if (ev.pageX > document.body.clientWidth) {
      return
    }
    if (paletteDiv.classList.contains("active-palette")) {
      const newColor = getColorAt(ev.pageX, ev.pageY)

      const newPalettes = palettes.map((p) => {
        if (p.name !== name) {
          return p
        }
        const newPalette = { ...p }
        newPalette.colors = [...newPalette.colors, newColor]
        return newPalette
      })
      navigator.clipboard.writeText(newColor)
      chrome.storage.sync.set({ palettes: newPalettes }, () => {
        const newColorDiv = createColorDiv(
          newColor,
          { name, colors },
          newPalettes
        )
        colorsContainer.insertBefore(newColorDiv, swatchColorCircle)
      })
    }
  })
  return paletteDiv
}

const renderPalettes = (palettes, parentDiv) => {
  if (palettes.length) {
    palettes.forEach((palette, idx) => {
      const paletteDiv = createPaletteElement(palette, palettes, parentDiv)
      if (idx === 0) {
        paletteDiv.classList.add("active-palette")
      }
      parentDiv.appendChild(paletteDiv)
    })
  }
}

// TODO - remove these
const MOCK_PALETTES = [
  { name: "palette 1", colors: ["#F5891B", "#1C3984", "#23A0DD", "#EE3D55"] },
  { name: "palette 2", colors: ["#EAB39D", "#E62E3B", "#C5CAB3", "#135142"] },
]

const cleanUp = () => {
  document.getElementById(CURSOR_SWATCH_ID).remove()
  document.getElementById(CANVAS_ID)?.remove()
  document.getElementById(SIDEPANEL_ID)?.remove()
  document.body.style.width = "100%"
}

chrome.runtime.onMessage.addListener(() => {
  if (document.getElementById(CURSOR_SWATCH_ID)) {
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
  const sidepanelHeader = document.createElement("div")
  sidepanelHeader.classList.add("sidepanel-header")
  const sidepanelTitle = document.createElement("h3")
  sidepanelTitle.innerText = "COLOR PALETTES"
  sidepanelHeader.appendChild(sidepanelTitle)
  const sidepanel = document.createElement("div")
  sidepanel.setAttribute("id", SIDEPANEL_ID)
  const palettesContainer = document.createElement("div")
  palettesContainer.classList.add("palettes-container")

  sidepanel.appendChild(sidepanelHeader)
  const addPaletteButton = document.createElement("button")
  addPaletteButton.classList.add("add-palette-button")
  addPaletteButton.innerText = "+"
  addPaletteButton.addEventListener("click", () => {
    const maxPaletteNumber = palettes
      .map(({ name }) => name)
      .filter((name) => name.includes("palette"))
      .map((name) => name.split(" ")[name.split(" ").length - 1])
      .reduce((acc, curr) => Math.max(acc, curr), 0)
    const newPalette = { name: `palette ${maxPaletteNumber + 1}`, colors: [] }
    const newPalettes = [newPalette, ...palettes]

    chrome.storage.sync.set({ palettes: newPalettes }, () => {
      const newPaletteDiv = createPaletteElement(
        newPalette,
        palettes.length,
        newPalettes,
        palettesContainer
      )
      palettesContainer.prepend(newPaletteDiv)
    })
  })
  sidepanelHeader.appendChild(addPaletteButton)
  sidepanel.appendChild(palettesContainer)

  document.body.appendChild(sidepanel)

  // fill sidepanel with saved palettes
  chrome.storage.sync.get(["palettes"], function (result) {
    const palettes = result.palettes || []
    renderPalettes(palettes, palettesContainer)
  })

  // create swatch element
  const swatchDiv = document.createElement("div")
  swatchDiv.setAttribute("id", CURSOR_SWATCH_ID)
  swatchDiv.classList.add("color-circle")
  document.body.appendChild(swatchDiv)

  html2canvas(document.body).then((canvas) => {
    canvas.id = CANVAS_ID
    document.body.appendChild(canvas)

    document.addEventListener("mousemove", (ev) => {
      if (ev.pageX > document.body.clientWidth) {
        return
      }
      const color = getColorAt(ev.pageX, ev.pageY)
      if (ev.pageX + SWATCH_WIDTH < document.body.clientWidth) {
        swatchDiv.style.left = ev.pageX + "px"
        swatchDiv.style.top = ev.pageY + "px"
      }
      palettesContainer
        .querySelectorAll(".swatch-color-circle")
        .forEach((swatchCircle) => (swatchCircle.style.backgroundColor = color))
      swatchDiv.style.backgroundColor = color
    })
  })
})

const getColorAt = (pageX, pageY) => {
  const context = document.getElementById(CANVAS_ID).getContext("2d")
  const data = context.getImageData(pageX * 2, pageY * 2, 1, 1).data
  const componentToHex = (c) => {
    const hex = c.toString(16)
    return hex.length == 1 ? "0" + hex : hex
  }
  return (
    "#" +
    componentToHex(data[0]) +
    componentToHex(data[1]) +
    componentToHex(data[2])
  )
}
