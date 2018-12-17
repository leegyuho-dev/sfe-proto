import {
    isEmpty,
    isArray,
    isObject,
} from '../../../common/functions.js';
var THREE = {}
import {
	Color,
	VertexColors,
	ShaderLib,
	ShaderMaterial,
	BackSide,
	MultiplyBlending,
} from '../three-r97.module.js';
THREE.Color = Color;
THREE.VertexColors = VertexColors;
THREE.ShaderLib = ShaderLib;
THREE.ShaderMaterial = ShaderMaterial;
THREE.BackSide = BackSide;
THREE.MultiplyBlending = MultiplyBlending;
export {
    MeshOutlineMaterial
}

// THREE.MeshOutlineMaterial = class MeshOutlineMaterial {
class MeshOutlineMaterial {

    constructor(originalMaterial, options, forceDefault = false) {

        // 아웃라인 데이터 기본값
		var outlineData = {
			outlineMode: 0, // Default
			outlineBlending: options.defaultBlending,
			outlineTransparent: options.defaultTransparent,
			outlinePremultipliedAlpha: options.defaultPremultipliedAlpha,
            outlineVisible: true,
            outlineThickness: options.defaultThickness,
			outlineColor: options.defaultColor,
			outlineAlpha: options.defaultAlpha,
			outlineThicknessSrc: 1, // FixedThickness
			outlineColorSrc: 1, // FixedColor
			outlineAlphaSrc: 1, // FixedAlpha
			outlineThickRandom: 1.0, // random ratio
        }

        // 유저데이터 적용
        var userData = originalMaterial.userData.outline;
        if (forceDefault !== true) {
            // outlineMode === Material
            if (userData.outlineMode === undefined || userData.outlineMode === 1) {
                outlineData.outlineMode = 1;
                // outlineData.outlineColor = originalMaterial.color.toArray();
                // outlineData.outlineAlpha = originalMaterial.opacity;
                
                if (userData.outlineTransparent) {
                    outlineData.outlineTransparent = userData.outlineTransparent;
                } else {
                    outlineData.outlineTransparent = true;
                }

                if (userData.outlinePremultipliedAlpha) {
                    outlineData.outlinePremultipliedAlpha = userData.outlinePremultipliedAlpha;
                } else {
                    outlineData.outlinePremultipliedAlpha = false;
                }

                if (userData.outlineVisible) {
                    outlineData.outlineVisible = userData.outlineVisible;
                } else {
                    if (originalMaterial.opacity < 1.0) {
                        outlineData.outlineVisible = false;
                    }
                }

                if (userData.outlineBlending) {
                    outlineData.outlineBlending = userData.outlineBlending;
                } else {
                    outlineData.outlineBlending = 4;
                }
            // outlineMode === Material
            } else if (userData.outlineMode === 2) {
                for (var key in userData) {
                    if (outlineData[key] !== undefined) {
                        outlineData[key] = userData[key];
                    }
                }
            }
        }

        // 유니폼 
        var uniformsChunk = {}
        for (var key in outlineData) {
            uniformsChunk[key] = {}
            uniformsChunk[key].value = outlineData[key];
        }
        // 추가 유니폼
        uniformsChunk.diffuse = {};
        uniformsChunk.diffuse.value = originalMaterial.color.toArray();
        uniformsChunk.opacity = {};
        uniformsChunk.opacity.value = originalMaterial.opacity;

        // https://stackoverflow.com/questions/42738689/threejs-creating-cel-shading-for-objects-that-are-close-by
        var vertexShaderChunk = `
            #include <fog_pars_vertex>

            attribute float alpha;
            varying float vAlpha;
            varying vec3 randomColor;
            varying float randomAlpha;

            uniform int outlineMode;
            uniform float outlineThickness;
            uniform int outlineThicknessSrc;
            uniform float outlineThickRandom;
            uniform int outlineColorSrc;
            uniform int outlineAlphaSrc;

            vec3 defineVertexColor(vec3 color) {
                return color;
            }
            float defineVertexAlpha(float alpha) {
                return alpha;
            }

            vec4 calculateOutline( vec4 pos, vec3 objectNormal, vec4 skinned ) {
                float thickness = outlineThickness;
                float outline = thickness * pos.w;

                if (outlineMode == 2) {
                    if (outlineThicknessSrc == 2) { // VertexAlpha
                        outline = thickness * pos.w * vAlpha;
                    }
                }
                if (outlineThickRandom != 1.0) {
                    outline *= (rand(uv) * outlineThickRandom);
                }
                outline *= (rand(uv) * 2.0);
                
            	vec4 pos2 = projectionMatrix * modelViewMatrix * vec4( skinned.xyz + objectNormal, 1.0 );
                vec4 norm = normalize( pos - pos2 );
                return pos + norm * outline;
            }
        `;

        var vertexShaderChunk2 = `
            #if ! defined( LAMBERT ) && ! defined( PHONG ) && ! defined( TOON ) && ! defined( PHYSICAL )
            	#ifndef USE_ENVMAP
            		vec3 objectNormal = normalize( normal );
            	#endif
            #endif
            #ifdef FLIP_SIDED
            	objectNormal = -objectNormal;
            #endif
            #ifdef DECLARE_TRANSFORMED
            	vec3 transformed = vec3( position );
            #endif

            vColor = defineVertexColor(color);
            vAlpha = defineVertexAlpha(alpha);

            gl_Position = calculateOutline( gl_Position, objectNormal, vec4( transformed, 1.0 ) );
            #include <fog_vertex>
        `;

        var fragmentShader = `
            #include <common>
            #include <fog_pars_fragment>
            uniform vec3 diffuse;
            uniform float opacity;

            uniform int outlineMode;
            uniform vec3 outlineColor;
            uniform float outlineAlpha;
            uniform int outlineColorSrc;
            uniform int outlineAlphaSrc;

            varying vec3 vColor;
            varying float vAlpha;

            void main() {     
                vec3 materialColor = outlineColor;
                float materialOpacity = outlineAlpha;
                if (outlineMode == 1) {

                    materialColor = diffuse;
                    materialOpacity = opacity;

                } else if (outlineMode == 2) {

                    if (outlineColorSrc == 0) {
                        materialColor = diffuse;
                    } else if (outlineColorSrc == 1) {
                        materialColor = outlineColor;
                    } else if (outlineColorSrc == 2) {
                        materialColor = vColor;
                    }

                    if (outlineAlphaSrc == 0) {
                        materialOpacity = opacity;
                    } else if (outlineAlphaSrc == 1) {
                        materialOpacity = outlineAlpha;
                    } else if (outlineAlphaSrc == 2) {
                        materialOpacity = vAlpha;
                    }

                } 

                gl_FragColor = vec4( materialColor, materialOpacity );
            	#include <fog_fragment>
            }
        `;


        var shaderIDs = {
            MeshBasicMaterial: 'basic',
            MeshLambertMaterial: 'lambert',
            MeshPhongMaterial: 'phong',
            MeshToonMaterial: 'phong',
            MeshStandardMaterial: 'physical',
            MeshPhysicalMaterial: 'physical',
        };

        var shaderID = shaderIDs[originalMaterial.type];
        var originalVertexShader;
        var originalUniforms;

        var shader = THREE.ShaderLib[shaderID];
        originalVertexShader = shader.vertexShader;
        originalUniforms = shader.uniforms;

        // var uniforms = Object.assign({}, uniformsChunk);
        var uniforms = Object.assign( {}, originalUniforms, uniformsChunk );

        var vertexShader = originalVertexShader
            .replace(/void\s+main\s*\(\s*\)/, vertexShaderChunk + '\nvoid main()')
            .replace(/\}\s*$/, vertexShaderChunk2 + '\n}')
            .replace(/#include\s+<[\w_]*light[\w_]*>/g, '');

        var defines = {};

        if (!/vec3\s+transformed\s*=/.test(originalVertexShader) &&
            !/#include\s+<begin_vertex>/.test(originalVertexShader)) { 
            defines.DECLARE_TRANSFORMED = true;
        }

        // originalMaterial.visible = false;

        return new THREE.ShaderMaterial({
            defines: defines,
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            side: THREE.BackSide,
            wireframe: false,
            // depthWrite: false,

            vertexColors: THREE.VertexColors,

            skinning: originalMaterial.skinning,
            morphTargets: originalMaterial.morphTargets,
            // morphNormals: originalMaterial.morphNormals,
            morphNormals: (originalMaterial.morphNormals !== undefined)? originalMaterial.morphNormals : null,
            transparent: outlineData.outlineTransparent,
            premultipliedAlpha: outlineData.outlinePremultipliedAlpha,
            blending: outlineData.outlineBlending,

            fog: originalMaterial.fog,
            visible: outlineData.outlineVisible,
        });
    }
}