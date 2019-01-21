// SFE Dependancy
import JSON5 from './libs/common/json5-2.1.0.min.js';
window.JSON5 = JSON5;
import Cookies from './libs/common/js.cookie-2.2.0.min.js';
window.Cookies = Cookies;
import Vue from './libs/vue.js/vue-2.5.17.js';
window.Vue = Vue;

// SFE Common
import * as SFECommon from './common/functions.js';
if (window.SFE === undefined) {
    window.SFE = {}
}
Object.assign(SFE, SFECommon);

// SFE Base
// export { DataTransporter } from './base/DataTransporter.js';
// export { VueSiteModeler } from './base/VueSiteModeler.js';
// export { ConfigLoader } from './base/ConfigLoader.js';
// export { LibraryLoader } from './base/LibraryLoader.js';
// export { AppLoader } from './base/AppLoader.js';

import { DataTransporter } from './base/DataTransporter.js';
import { VueSiteModeler } from './base/VueSiteModeler.js';
import { ConfigLoader } from './base/ConfigLoader.js';
import { LibraryLoader } from './base/LibraryLoader.js';
import { AppLoader } from './base/AppLoader.js';

SFE.DataTransporter = DataTransporter;
SFE.VueSiteModeler = VueSiteModeler;
SFE.ConfigLoader = ConfigLoader;
SFE.LibraryLoader = LibraryLoader;
SFE.AppLoader = AppLoader;
