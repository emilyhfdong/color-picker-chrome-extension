document.addEventListener("DOMContentLoaded", () => {
  chrome.runtime.onConnect.addListener(function (port) {
    console.assert(port.name === "blah")
    port.onMessage.addListener(function (msg) {
      const div = document.getElementById("color-swatch")
      div.style.backgroundColor = msg.color
    })
  })

  const button = document.getElementById("get-colors-button")
  button.addEventListener("click", () => {
    chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, "hi")
    })
  })
})
