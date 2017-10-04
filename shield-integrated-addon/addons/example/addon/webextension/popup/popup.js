document.addEventListener("click", (e) => {
  if (e.target.id == "treatmentButton") {
    console.log("Clicked on Button!")
    browser.runtime.sendMessage({"clicked-button": true})
  }
});