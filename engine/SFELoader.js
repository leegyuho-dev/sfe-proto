// import * as EngineModules from './src/sfe.js';
import * as SFEBase from './src/sfe-base.js';
// import * as SFECommon from './src/sfe-common.js';
import * as SFECore from './src/sfe-core.js';
import * as SFETools from './src/sfe-tools.js';
import './src/sfe-libs.js';

window.SFE = {}
// Object.assign(SFE, EngineModules);
Object.assign(SFE, SFEBase);
// Object.assign(SFE, SFECommon);
Object.assign(SFE, SFECore);
Object.assign(SFE, SFETools);

export class SFELoader {
    constructor() {
    }

    async loadModules() {
        var Three = await import('./src/libs/three.js/three-r97.module.js');
        window.THREE = {}
        Object.assign(THREE, Three);
        var ThreeModules = await import('./src/sfe-libs.js');
        return [Three, ThreeModules];
    }
}