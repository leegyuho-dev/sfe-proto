/**
 * @author takahirox / http://github.com/takahirox/
 *
 * Reference: https://en.wikipedia.org/wiki/Cel_shading
 *
 * // How to set default outline parameters
 * new THREE.OutlineEffect( renderer, {
 * 	defaultThickness: 0.01,
 * 	defaultColor: [ 0, 0, 0 ],
 * 	defaultAlpha: 0.8,
 * 	defaultKeepAlive: true // keeps outline material in cache even if material is removed from scene
 * } );
 *
 * // How to set outline parameters for each material
 * material.userData.outlineParameters = {
 * 	thickness: 0.01,
 * 	color: [ 0, 0, 0 ]
 * 	alpha: 0.8,
 * 	visible: true,
 * 	keepAlive: true
 * };
 *
 * TODO
 *  - support shader material without objectNormal in its vertexShader
 */

// FIXED: 모듈 익스포트 처리
var THREE = {}
import {
	ShaderMaterial,
} from '../three-r97.module.js';
THREE.ShaderMaterial = ShaderMaterial;
import { MeshOutlineMaterial } from '../materials/MeshOutlineMaterial.js'; 
export {
	THREE
}

var cache = {}
var removeThresholdCount = 60;
var originalMaterials = {}
var originalOnBeforeRenders = {}

THREE.OutlineEffect = class {}
// class THREE.OutlineEffect.Custom {
THREE.OutlineEffect.Custom = class extends THREE.OutlineEffect {

	constructor(renderer, options) {
		super();
		this.enabled = options.enabled;
		this.renderer = renderer;
		this.options = options;
	}

	createInvisibleMaterial() {
		return new THREE.ShaderMaterial({
			name: 'invisible',
			visible: false
		});
	}

	createMaterial(originalMaterial) {
        var shaderIDs = {
            MeshBasicMaterial: 'basic',
            MeshLambertMaterial: 'lambert',
            MeshPhongMaterial: 'phong',
            MeshToonMaterial: 'phong',
            MeshStandardMaterial: 'physical',
            MeshPhysicalMaterial: 'physical',
        };

		var shaderID = shaderIDs[originalMaterial.type];
		if (shaderID !== undefined) {
			return new MeshOutlineMaterial(originalMaterial, this.options);
		} else {
			return this.createInvisibleMaterial();
		}
	}

	getOutlineMaterialFromCache(originalMaterial) {
		var data = cache[originalMaterial.uuid];

		if (data === undefined) {
			data = {
				material: this.createMaterial(originalMaterial),
				used: true,
				keepAlive: this.options.defaultKeepAlive,
				count: 0
			};
			cache[originalMaterial.uuid] = data;
		}

		data.used = true;
		return data.material;
	}

	getOutlineMaterial(originalMaterial) {
		var outlineMaterial = this.getOutlineMaterialFromCache(originalMaterial);
		originalMaterials[outlineMaterial.uuid] = originalMaterial;
		// this.updateOutlineMaterial(outlineMaterial, originalMaterial);


		return outlineMaterial;
	}

	setOutlineMaterial(object) {
		if (object.material === undefined) return;

		if (Array.isArray(object.material)) {
			for (var i = 0, il = object.material.length; i < il; i++) {
				object.material[i] = this.getOutlineMaterial(object.material[i]);
			}
		} else {
			object.material = this.getOutlineMaterial(object.material);
		}

		originalOnBeforeRenders[object.uuid] = object.onBeforeRender;
		object.onBeforeRender = this.onBeforeRender.bind(this);
	}

	restoreOriginalMaterial(object) {
		if (object.material === undefined) return;

		if (Array.isArray(object.material)) {
			for (var i = 0, il = object.material.length; i < il; i++) {
				object.material[i] = originalMaterials[object.material[i].uuid];
			}
		} else {
			object.material = originalMaterials[object.material.uuid];
		}
		object.onBeforeRender = originalOnBeforeRenders[object.uuid];
	}

	onBeforeRender(renderer, scene, camera, geometry, material, group) {
		var originalMaterial = originalMaterials[material.uuid];

		// just in case
		if (originalMaterial === undefined) return;

		// this.updateUniforms(material, originalMaterial);
	}

	// TODO: 실시간 변경에만 사용
	updateUniforms(material, originalMaterial) {
		var outlineParameters = originalMaterial.userData.outlineParameters;
		material.uniforms.outlineAlpha.value = originalMaterial.opacity;

		if (outlineParameters !== undefined) {
			if (outlineParameters.thickness !== undefined) material.uniforms.outlineThickness.value = outlineParameters.thickness;
			if (outlineParameters.color !== undefined) material.uniforms.outlineColor.value.fromArray(outlineParameters.color);
			if (outlineParameters.alpha !== undefined) material.uniforms.outlineAlpha.value = outlineParameters.alpha;
		}
	}

	// TODO: 실시간 변경에만 사용
	updateOutlineMaterial(material, originalMaterial) {
		if (material.name === 'invisible') return;

		var outlineParameters = originalMaterial.userData.outlineParameters;

		material.skinning = originalMaterial.skinning;
		material.morphTargets = originalMaterial.morphTargets;
		material.morphNormals = originalMaterial.morphNormals;
		material.fog = originalMaterial.fog;

		if (outlineParameters !== undefined) {
			if (originalMaterial.visible === false) {
				material.visible = false;
			} else {
				material.visible = (outlineParameters.visible !== undefined) ? outlineParameters.visible : true;
			}
			material.transparent = (outlineParameters.alpha !== undefined && outlineParameters.alpha < 1.0) ? true : originalMaterial.transparent;
			if (outlineParameters.keepAlive !== undefined) { 
				cache[originalMaterial.uuid].keepAlive = outlineParameters.keepAlive;
			}
		} else {
			material.transparent = originalMaterial.transparent;
			material.visible = originalMaterial.visible;
		}

		if (originalMaterial.wireframe === true || originalMaterial.depthTest === false) material.visible = false;
	}

	cleanupCache() {
		var keys;

		// clear originialMaterials
		keys = Object.keys(originalMaterials);

		for (var i = 0, il = keys.length; i < il; i++) {
			originalMaterials[keys[i]] = undefined;
		}

		// clear originalOnBeforeRenders
		keys = Object.keys(originalOnBeforeRenders);

		for (var i = 0, il = keys.length; i < il; i++) {
			originalOnBeforeRenders[keys[i]] = undefined;
		}

		// remove unused outlineMaterial from cache
		keys = Object.keys(cache);

		for (var i = 0, il = keys.length; i < il; i++) {
			var key = keys[i];

			if (cache[key].used === false) {
				cache[key].count++;
				if (cache[key].keepAlive === false && cache[key].count > removeThresholdCount) {
					delete cache[key];
				}
			} else {
				cache[key].used = false;
				cache[key].count = 0;
			}
		}
	}

	render(scene, camera, renderTarget, forceClear) {
		if (this.enabled === false) {
			// this.renderer.render(scene, camera, renderTarget, forceClear);
			return;
		}

		var currentAutoClear = this.renderer.autoClear;
		this.renderer.autoClear = this.autoClear;

		// 1. render normally
		// this.renderer.render(scene, camera, renderTarget, forceClear);

		// 2. render outline
		var currentSceneAutoUpdate = scene.autoUpdate;
		var currentSceneBackground = scene.background;
		var currentShadowMapEnabled = this.renderer.shadowMap.enabled;

		scene.autoUpdate = false;
		scene.background = null;
		this.renderer.autoClear = false;
		this.renderer.shadowMap.enabled = false;
		
		scene.traverse(this.setOutlineMaterial.bind(this));

		this.renderer.render(scene, camera, renderTarget);

		scene.traverse(this.restoreOriginalMaterial.bind(this));

		this.cleanupCache();

		scene.autoUpdate = currentSceneAutoUpdate;
		scene.background = currentSceneBackground;
		this.renderer.autoClear = currentAutoClear;
		this.renderer.shadowMap.enabled = currentShadowMapEnabled;

	};

};