# Shield Study Embedded WebExtension Hello World 

This repository was created in the beginning of October 2017 specifically to help new Shield/Pioneer engineers to quickly get up and running with a Shield add-on.
Much of this repo contains shield boilerplate and the best way to get familiar with the structure is to browse the directories / files on your own. 
It is particularly useful to compare the source code of previously deployed shield studies with this template (and each other) to get an idea of what is actually relevant to change between studies vs what is mostly untouched boilerplate. 

# Similar repositories

https://github.com/gregglind/template-shield-study - According to Shield engineers, the most up to date shield study template as of 4th October 2017, albeit with incomplete documentation. 
https://github.com/mozilla/shield-studies-addon-template - An old "official" template for shield study add-ons, not updated since October 2016. Do not use. 

# Anatomy of a shield study add-on

Shield study add-ons are legacy (`shield-integrated-addon/addons/example/addon/bootstrap.js`) add-ons with an embedded webextension (`shield-integrated-addon/addons/example/addon/webextension/background.js`). 

It needs to be built using a legacy add-on in order to be able to access Telemetry data, user preferences etc that are required for collecting relevant data for [Shield Studies](https://wiki.mozilla.org/Firefox/Shield/Shield_Studies).

It is recommended to build necessary logic and user interface using in the context of the webextension and communicate with the legacy add-on code through messaging whenever privileged access is required.

For more information about the legacy add-on part of the code, see https://github.com/mozilla/shield-studies-addon-utils.

# Functionality

This add-on assigns users to `test` and `control` groups at random. The `test` group will receive a pop-up after successfully loading a URI. The pop-up has a "Click Here!" button, and a telemetry ping is sent if the button is clicked. The pop-up should collapse itself after clicking anywhere outside the pop-up and never be displayed again. 

# Getting Started

First, make sure you are on NPM 5+ installed so that the proper dependencies are installed using the package-lock.json file.

`$ npm install -g npm`

After cloning the repo, you can run the following commands from the top level directory, one after another:

`$ cd shield-integrated-addon/ && npm install`

`$ cd addons/example/ && npm run build`

This packages the add-on into `addon.xpi` which is stored in `shield-integrated-addon/addons/example/dist/`. This file is what you load into Firefox. 

# Loading

Once you package your `.xpi` file, open (preferably) the [Developer Edition of Firefox](https://www.mozilla.org/firefox/developer/). You can load the `.xpi` using the following steps: 

* Navigate to *about:config* and set `extensions.legacy.enabled` to `true`. This permits the loading of the embedded WebExtension since new versions of Firefox are becoming restricted to pure WebExtensions only. 
* Navigate to *about:debugging* in your URL bar
* Select "Load Temporary Add-on"
* Find and select the `.xpi` file you just built.

# Seeing the add-on in action

I recommend using the Browser Console which can be opened from Firefox's top toolbar in Tools > Web Developer > Browser Console. This will display Shield (loading/telemetry) and `console.log()` output.

To see the Add-on at work, navigate to any url (for instance http://example.com) and you should see a green puzzle piece icon in the browser address bar. You should also see the following in the Browser Console, which comes from this add-on:

```
Heard a web nav...  background.js:55:13
```

If it's the first web navigation you do, you'll also notice a popup and the following log messages:

```
triggering popup  bootstrap.js:69
```

You can also manually trigger the popup by clicking the green puzzle icon in the address bar. 

After clicking the "Click here!" in the popup, you should see the following in the Browser Console:

```
Clicked on Button!  popup.js:3:5
Sending telemetry since button was clicked  bootstrap.js:75
1507315880284	shield-study-utils	DEBUG	telemetry {"time":"1507315880284","pingType":"clicked"}
1507315880284	shield-study-utils	DEBUG	telemetry in:  shield-study-addon {"attributes":{"time":"1507315880284","pingType":"clicked"}}
1507315880284	shield-study-utils	DEBUG	getting info
1507315880285	shield-study-utils	DEBUG	telemetry: {"version":3,"study_name":"EmbeddedWebExtensionExample","branch":"test","addon_version":"1.0.0","shield_version":"4.0.0","type":"shield-study-addon","data":{"attributes":{"time":"1507315880284","pingType":"clicked"}},"testing":true}
```

That's it! The rest is up to you. Fork the repo and hack away :)

# Developing

If you want to tweak the add-on, you can automatically build recent changes and package them into a `.xpi`. I recommended running the following commands from the top level directory:

(the `example` directory contains all add-on functionality)

`$ cd shield-integrated-addon/addons/example/`

`$ npm run watch`

Now, anytime a file is changed and saved, node will repackage the add-on. You must reload the add-on as before, or by clicking the "reload" button under the add-on in *about:debugging*. Note that a hard reload is recommended to clear local storage. To do this, simply remove the add-on and reload as before. 

# Getting Data

Telemetry pings are loaded into S3 and re:dash. You can use this [Example Query](https://sql.telemetry.mozilla.org/queries/46999/source#table) as a starting point. 







