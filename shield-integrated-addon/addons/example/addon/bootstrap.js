"use strict";

const {utils: Cu} = Components;
const CONFIGPATH = `${__SCRIPT_URI_SPEC__}/../Config.jsm`;
const { config } = Cu.import(CONFIGPATH, {});
const studyConfig = config.study;
Cu.import("resource://gre/modules/TelemetryEnvironment.jsm");
Cu.import('resource://gre/modules/Services.jsm');
const STUDYUTILSPATH = `${__SCRIPT_URI_SPEC__}/../${studyConfig.studyUtilsPath}`;
const { studyUtils } = Cu.import(STUDYUTILSPATH, {});



///////////////////////////////////////////////////////////////
//  Sets up Shield and Starts up the webExtension Component  //
///////////////////////////////////////////////////////////////
async function startup(addonData, reason) {
    const webExtension = addonData.webExtension;

    // specify study
    var studySetup =
     {
        studyName: studyConfig.studyName,
        endings: studyConfig.endings,
        addon: {id: addonData.id, version: addonData.version},
        telemetry: studyConfig.telemetry
      }

    studyUtils.setup(studySetup);
    studyUtils.setLoggingLevel(config.log.studyUtils.level);
    const variation = await chooseVariation();
    studyUtils.setVariation(variation);

    if ((REASONS[reason]) === "ADDON_INSTALL") {
      studyUtils.firstSeen();  // sends telemetry "enter"
      const eligible = await config.isEligible(); // addon-specific
      if (!eligible) {
        // sends UT for "ineligible"
        // then uninstalls addon
        console.log("ENDING STUDY DUE TO INELIGIBILITY")
        await studyUtils.endStudy({reason: "ineligible"});
        return;
      }
    }
    await studyUtils.startup({reason});

    //startup webExtension
    webExtension.startup().then(api => {
      // client.activeAddons = getNonSystemAddons()
      // client.addonHistory = getNonSystemAddons()
      // TelemetryEnvironment.registerChangeListener("addonListener", function(x) {
      //   addonChangeListener(x, client)
      // });

      const {browser} = api;
      browser.runtime.onMessage.addListener(studyUtils.respondToWebExtensionMessage);
      browser.runtime.onMessage.addListener((msg, sender, sendReply) => {
        ///////////// message handers ////////////////////////////////////
        if (msg["init"]) {
          console.log("TelemetryEnvironment:",TelemetryEnvironment.currentEnvironment)
          console.log("Starting Experiment and sending init ping")
          var dataOut = {
             "pingType": "init",
             "time": String(Date.now())
          }
          studyUtils.telemetry(dataOut)
        }
        else if (msg['trigger-popup']) {
          console.log("triggering popup")
          var window = Services.wm.getMostRecentWindow('navigator:browser')
          var pageAction = window.document.getElementById("embedded-webextension-example_mozilla_com-page-action")
          pageAction.click()
        }
        else if (msg["clicked-button"]) {
          console.log("Sending telemetry since button was clicked")
          // Send ping indicating the button was clicked
          var dataOut = {
             "time": String(Date.now()),
             "pingType": "clicked"
          }
          studyUtils.telemetry(dataOut)
        }

      });
    });
}


/////////////////////////////////
/////// boiler-plate from here on
/////////////////////////////////



function shutdown(addonData, reason) {
  console.log("shutdown", REASONS[reason] || reason);
  // are we uninstalling?
  // if so, user or automatic?
  if (reason === REASONS.ADDON_UNINSTALL || reason === REASONS.ADDON_DISABLE) {
    console.log("uninstall or disable");
    if (!studyUtils._isEnding) {
      // we are the first requestors, must be user action.
      console.log("user requested shutdown");
      studyUtils.endStudy({reason: "user-disable"});
      return;
    }

  // normal shutdown, or 2nd attempts
    console.log("Jsms unloading");
    Jsm.unload(config.modules);
    Jsm.unload([CONFIGPATH, STUDYUTILSPATH]);
    Cu.unload("resource://gre/modules/Services.jsm");
    Cu.import("resource://gre/modules/Console.jsm");
  }
}

function uninstall(addonData, reason) {
  console.log("uninstall", REASONS[reason] || reason);
}

function install(addonData, reason) {
  console.log("install", REASONS[reason] || reason);
  // handle ADDON_UPGRADE (if needful) here
}



/** CONSTANTS and other bootstrap.js utilities */

// addon state change reasons
const REASONS = {
  APP_STARTUP: 1,      // The application is starting up.
  APP_SHUTDOWN: 2,     // The application is shutting down.
  ADDON_ENABLE: 3,     // The add-on is being enabled.
  ADDON_DISABLE: 4,    // The add-on is being disabled. (Also sent during uninstallation)
  ADDON_INSTALL: 5,    // The add-on is being installed.
  ADDON_UNINSTALL: 6,  // The add-on is being uninstalled.
  ADDON_UPGRADE: 7,    // The add-on is being upgraded.
  ADDON_DOWNGRADE: 8,  // The add-on is being downgraded.
};
for (const r in REASONS) { REASONS[REASONS[r]] = r; }


async function chooseVariation() {
  let toSet, source;
  const sample = studyUtils.sample;

  if (studyConfig.variation) {
    source = "startup-config";
    toSet = studyConfig.variation;
  } else {
    source = "weightedVariation";
    // this is the standard arm choosing method
    const clientId = await studyUtils.getTelemetryId();
    const hashFraction = await sample.hashFraction(studyConfig.studyName + clientId, 12);
    toSet = sample.chooseWeighted(studyConfig.weightedVariations, hashFraction);
  }
  console.log(`variation: ${toSet} source:${source}`);
  return toSet;
}

// jsm loader / unloader
class Jsm {
  static import(modulesArray) {
    for (const module of modulesArray) {
      log.debug(`loading ${module}`);
      Cu.import(module);
    }
  }
  static unload(modulesArray) {
    for (const module of modulesArray) {
      log.debug(`Unloading ${module}`);
      Cu.unload(module);
    }
}
}



