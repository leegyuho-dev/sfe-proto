// SFE Common
// export * from './common/filetypes.js';
// export * from './common/functions.js';

import * as SFECommon from './common/functions.js';
// Object.assign(window, SFECommon);
if (window.SFE === undefined) {
    window.SFE = {}
}
Object.assign(SFE, SFECommon);
