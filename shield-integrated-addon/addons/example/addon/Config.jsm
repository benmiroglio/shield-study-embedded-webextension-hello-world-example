"use strict";

/* to use:
- this file has chrome privileges
- Cu.import will work for any 'general firefox things' (Services,etc)
  but NOT for addon-specific libs
*/
const {utils: Cu} = Components;
Cu.import("resource://gre/modules/TelemetryEnvironment.jsm");
Cu.import("resource://gre/modules/Console.jsm")
const EXPORTED_SYMBOLS = ["config"];

var config = {
  // Equal weighting for each  of the 2 variations
  // weight of 1 for each implies equal weighting.
  "study": {
    "studyName": "EmbeddedWebExtensionExample",
    "weightedVariations": [
      {"name": "test",
        "weight": 1},
      {"name": "control",
        "weight": 1}
    ],
    /** **endings**
      * - keys indicate the 'endStudy' even that opens these.
      * - urls should be static (data) or external, because they have to
      *   survive uninstall
      * - If there is no key for an endStudy reason, no url will open.
      * - usually surveys, orientations, explanations
      */
    "endings": {
      /** standard endings */
      "no-endings": {
        "url": "null",
      },
    },
    "telemetry": {
      "send": true, // assumed false. Actually send pings?
      "removeTestingFlag": false,  // Marks pings as testing, set true for actual release
      // TODO "onInvalid": "throw"  // invalid packet for schema?  throw||log
    },
    "studyUtilsPath": `./StudyUtils.jsm`,
  },
  "isEligible": async function() { 
    /*
    Filter to clients with "en-US" locale
    */
    // const locale = TelemetryEnvironment.currentEnvironment.settings.locale;
    // return locale == "en-us"
    return true
  },
  // addon-specific modules to load/unload during `startup`, `shutdown`
  "modules": [
  ],
  "log": {
      // Fatal: 70, Error: 60, Warn: 50, Info: 40, Config: 30, Debug: 20, Trace: 10, All: -1,
      "bootstrap":  {
        "level": "Debug",
      },
      "studyUtils":  {
        "level": "Trace",
      },
  },
};
