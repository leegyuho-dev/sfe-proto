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
			outlineBlending: 4, // MultiplyBlending
			outlineTransparent: true,
			outlinePremultipliedAlpha: false,
            outlineVisible: true,
            outlineThickness: options.defaultThickness,
            outlineThicknessMin: options.defaultThicknessMin,
            outlineThicknessMax: options.defaultThicknessMax,
			outlineColor: options.defaultColor, // black
			outlineAlpha: options.defaultAlpha,
			outlineThicknessSrc: 2, // VertexAlpha
			outlineColorSrc: 0, // Default
			outlineAlphaSrc: 0, // Default
			outlineRandomFactor: 3.0, // random ratio
        }

        // 유저데이터 적용
        var userData = originalMaterial.userData.outline;
        if (forceDefault !== true) {
            // outlineMode === Default
            if (userData.outlineMode === undefined || userData.outlineMode === 0) {
                outlineData.outlineColor = originalMaterial.color.toArray();
                outlineData.outlineAlpha = originalMaterial.opacity;
                if (originalMaterial.opacity < 1.0) {
                    outlineData.outlineVisible = false;
                }
            } else {
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


        // https://stackoverflow.com/questions/42738689/threejs-creating-cel-shading-for-objects-that-are-close-by
        var vertexShaderChunk = `
            #include <fog_pars_vertex>
            // vertex alpha
            #ifdef USE_COLOR
                attribute float alpha;
            #endif
            uniform int outlineMode;
            uniform float outlineThickness;
            uniform float outlineThicknessMin;
            uniform float outlineThicknessMax;
            uniform int outlineThicknessSrc;

            // generate 0.0 ~ 0.999 random number
            float random(vec2 p) {
                const vec2 r = vec2(23.1406926327792690, 2.6651441426902251);
                return fract(cos(mod(123456789., 1e-7 + 256. * dot(p, r))));
            }

            vec4 calculateOutline( vec4 pos, vec3 objectNormal, vec4 skinned ) {
                vec3 vertexColor = vColor.rgb;
                float vertexAlpha = alpha;

                float thickness = outlineThickness;
                float outline = thickness * pos.w;

                if (outlineMode == 2) {
                    if (outlineThicknessSrc == 2) { // VertexAlpha
                        outline = thickness * pos.w * vertexAlpha;
                    } else if (outlineThicknessSrc == 3) { // Random
                        outline = thickness * pos.w * vertexAlpha * (random(uv) + 3.0);
                    }
                }

                if (outline < outlineThicknessMin) {
                    outline = outlineThicknessMin;
                }
                
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
            gl_Position = calculateOutline( gl_Position, objectNormal, vec4( transformed, 1.0 ) );
            #include <fog_vertex>
        `;

        var fragmentShader = `
            #include <common>
            #include <fog_pars_fragment>
            uniform vec3 outlineColor;
            uniform float outlineAlpha;
            void main() {
            	gl_FragColor = vec4( outlineColor, outlineAlpha );
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
            // put vertexShaderChunk right before "void main() {...}"
            .replace(/void\s+main\s*\(\s*\)/, vertexShaderChunk + '\nvoid main()')
            // put vertexShaderChunk2 the end of "void main() {...}"
            // Note: here assums originalVertexShader ends with "}" of "void main() {...}"
            .replace(/\}\s*$/, vertexShaderChunk2 + '\n}')
            // remove any light related lines
            // Note: here is very sensitive to originalVertexShader
            // TODO: consider safer way
            .replace(/#include\s+<[\w_]*light[\w_]*>/g, '');

        var defines = {};

        if (!/vec3\s+transformed\s*=/.test(originalVertexShader) &&
            !/#include\s+<begin_vertex>/.test(originalVertexShader)) defines.DECLARE_TRANSFORMED = true;

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
            // transparent: (outlineAlpha < 1.0)? true : false,
            transparent: true,
            blending: THREE.MultiplyBlending,

            fog: originalMaterial.fog,
            visible: outlineData.outlineVisible,
        });
        // mt.defaultAttributeValues.alpha = 1;
        // return mt;
    }
}