# Shield Study Embedded WebExtension Hello World 

This repo is intended as a jumping-off-point for those building an add-on for Shield. Much of this repo contains shield boilerplate and the best way to get familiar with the structure is to browse the directories / files on your own. 

# Functionality

This add-on assigns users to `test` and `control` groups at random. The `test` group will receive a pop-up after sucessfully loading a URI. The pop-up has a "Click Here!" button, and a telemetry ping is sent if the button is clicked. The pop-up should collapse itself after clicking anywhere outside the pop-up and never be displayed again. 

# Getting Started
After cloning the repo, you can run the following commands from the top level directory:

`$ npm install`
`$ cd shield-study-embedded-webextension-hello-world-example/shield-integrated-addon/addons/example/ && npm run build`

This packages the add-on into  `addon.xpi` which is stored in `/shield-integrated-addon/addons/example/dist/`. This file is what you load into Firefox. 

# Loading
Once you package your `.xpi` file, open (preferably) the [Developer Edition of Firefox](https://www.mozilla.org/firefox/developer/). You can load the `.xpi` using the following steps: 

* Naviagte to *about:config* and set `extensions.legacy.enabled` to `true`. This permits the loading of the embedded WebExtension since new versions of Firefox are becoming restricted to pure WebExtensions only. 
* Navigate to *about:debugging* in your url bar
* Select "Load Temporary Add-on"
* Find and select the `.xpi` file you just built.

# Developing

If you want to tweak the add-on, you can automatically build recent changes and package them into a `.xpi`. I recommended running the following commands from the `example` directory:

`$ cd shield-study-embedded-webextension-hello-world-example/shield-integrated-addon/addons/example/ `

`$ npm run watch`

Now, anytime a file is changed and saved, node will repackage the add-on. You must reload the add-on as before, or by clicking the "Reload" under the add-on in *about:debugging*. Note that a hard re-load is recommended to clear local storage. To do this, simply remove the add-on and reload as before. 



# Logging
To see the Add-on at work, I recommend using the Browser Console which can be open from Firefox's top toolbar in Tools > Web Developer > Browser Console. This will display Shield (loading/telemetry) and `console.log()` output.

# Getting Data

Telemetry pings are loaded into S3 and re:dash. You can use this [Example Query](https://sql.telemetry.mozilla.org/queries/46999/source#table) as a starting point. 







