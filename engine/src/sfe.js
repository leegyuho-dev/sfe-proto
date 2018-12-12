import * as SFEBase from './sfe-base.js';
import * as SFECore from './sfe-core.js';
import * as SFETools from './sfe-tools.js';
import './sfe-libs.js';

window.SFE = {}
Object.assign(SFE, SFEBase);
Object.assign(SFE, SFECore);
Object.assign(SFE, SFETools);