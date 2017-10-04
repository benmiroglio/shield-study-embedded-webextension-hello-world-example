function telemetry (data) {
  function throwIfInvalid (obj) {
    // simple, check is all keys and values are strings
    for (const k in obj) {
      if (typeof k !== 'string') throw new Error(`key ${k} not a string`);
      if (typeof obj[k] !== 'string') throw new Error(`value ${k} ${obj[k]} not a string`);
    }
    return true
  }
  throwIfInvalid(data);
  msgStudy('telemetry', data);
}

// template code for talking to `studyUtils` using `browser.runtime`
async function msgStudy(msg, data) {
  const allowed = ['endStudy', 'telemetry', 'info'];
  if (!allowed.includes(msg)) throw new Error(`shieldUtils doesn't know ${msg}, only knows ${allowed}`);
  try {
    const ans = await browser.runtime.sendMessage({shield: true, msg, data});
    return ans;
  } catch (e) {
    console.log('msgStudy failed:', e);
  }
}

function triggerPopup() {
  browser.runtime.sendMessage({"trigger-popup": true})
} 


class EmbeddedWebExtensionExample {

  logStorage() {
    browser.storage.local.get().then(console.log)
  }

  async start() {
    browser.runtime.sendMessage({"init": true})
    this.info = await msgStudy('info')


    // for enrollment into test for demo
    this.info.variation.name = 'test';
    console.log("Variation:", this.info.variation.name)
    if (this.info.variation.name == "test") {
        this.deployTreatment()
    }
  }

  deployTreatment () {
    function webNavListener(info) {
        let storedTabId = browser.storage.local.get('tabId')
        storedTabId.then(function(result) {
        if (!result['tabId'] ) { // value is missing
            console.log("Heard a web nav...")
            // grab locale and force to lower case
            let locale = browser.i18n.getUILanguage().replace("_", "-").toLowerCase()

            // work around to work in any locale
            // for testing/demo
            if (locale != "en-us") {
              locale = "en-us"
            }
            
            const tabId = info.tabId; // id for current tab
            browser.pageAction.show(tabId) // show pageAction icon on current tab
            browser.pageAction.setPopup({ //  map html file to popup
                          tabId,
                          popup: "/popup/locales/" + locale + "/popup.html"
                        });

            // wait 500 milliseconds then call triggerPopup()
            setTimeout(triggerPopup, 500);

            // store boolean -- client saw popup
            browser.storage.local.set({'tabId': tabId})
      } else {
        browser.pageAction.hide(result['tabId']) //hide pageAction icon
        //stop running this function on webNavs
        browser.webNavigation.onCompleted.removeListener(webNavListener)
      }
    })
  }
    // run webNavListener() every successful URI load
    browser.webNavigation.onCompleted.addListener(webNavListener, 
      {url: [{schemes: ["http", "https"]}]});
  }
}

let experiment = new EmbeddedWebExtensionExample();
experiment.start();








