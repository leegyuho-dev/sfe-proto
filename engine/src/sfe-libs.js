// Zlib Modules
import { Zlib as zlib } from './libs/three.js/libs/Zlib.js';
window.Zlib = zlib;
// window.Zlib = {}
// Object.assign(Zlib, zlib);

// TWEEN Modules
import { TWEEN as Tween } from './libs/three.js/libs/Tween.js';
window.TWEEN = Tween;
// window.TWEEN = {}
// Object.assign(TWEEN, Tween);

// THREE Modules
import * as Three from './libs/three.js/three-r97.module.js';
import { THREE as WEBGL } from './libs/three.js/WebGL.js';
import { THREE as FBXLoader } from './libs/three.js/loaders/FBXLoader.custom.module.js';
import { THREE as TGALoader } from './libs/three.js/loaders/TGALoader.module.js';
import { THREE as OrbitControls } from './libs/three.js/controls/OrbitControls.module.js';
import { THREE as OutlineEffect } from './libs/three.js/effects/OutlineEffect.custom.module.js';
import { THREE as SubdivisionModifier } from './libs/three.js/modifiers/SubdivisionModifier.module.js';
import { THREE as Stats } from './libs/three.js/libs/Stats.js';

window.THREE = {}
Object.assign(THREE, Three);
Object.assign(THREE, WEBGL);
Object.assign(THREE, TGALoader);
Object.assign(THREE, FBXLoader);
Object.assign(THREE, OrbitControls);
Object.assign(THREE, OutlineEffect);
Object.assign(THREE, SubdivisionModifier);
Object.assign(THREE, Stats);

import { MeshOutlineMaterial } from './libs/three.js/materials/MeshOutlineMaterial.js';
import { MeshCelShaderMaterial } from './libs/three.js/materials/MeshCelShaderMaterial.js';
THREE.MeshOutlineMaterial = MeshOutlineMaterial;
THREE.MeshCelShaderMaterial = MeshCelShaderMaterial;
