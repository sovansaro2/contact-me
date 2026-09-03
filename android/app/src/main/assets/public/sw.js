/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-7e5eb42b'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "index.html",
    "revision": "74eac3814e1ed27b184987817259a185"
  }, {
    "url": "assets/workbox-window.prod.es5-BBnX5xw4.js",
    "revision": null
  }, {
    "url": "assets/web-Cx8ZHs-F.js",
    "revision": null
  }, {
    "url": "assets/user-BN_Wkw8f.js",
    "revision": null
  }, {
    "url": "assets/save-vQl5yq6Y.js",
    "revision": null
  }, {
    "url": "assets/profileService-B7HoguId.js",
    "revision": null
  }, {
    "url": "assets/index-D9TNH5aN.css",
    "revision": null
  }, {
    "url": "assets/index-BYpbigcQ.js",
    "revision": null
  }, {
    "url": "assets/external-link-BnnM3Ru0.js",
    "revision": null
  }, {
    "url": "assets/contactMethodService-D2agVmib.js",
    "revision": null
  }, {
    "url": "assets/SettingsPage-CKHK1RMs.js",
    "revision": null
  }, {
    "url": "assets/ProfilePage-DftNfRYU.js",
    "revision": null
  }, {
    "url": "assets/LoginPage-B0508pRP.js",
    "revision": null
  }, {
    "url": "assets/ContactMethodsPage-JlFO0t2f.js",
    "revision": null
  }, {
    "url": "assets/AdminPage-BWp-rjJm.js",
    "revision": null
  }, {
    "url": "assets/AdminLayout-C5tOvD7w.js",
    "revision": null
  }, {
    "url": "icon.png",
    "revision": "9a6539a623d5a7f34a3d77ccd36a1698"
  }, {
    "url": "manifest.webmanifest",
    "revision": "6aa9a14453db7b62372ba754c582c768"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));

}));
