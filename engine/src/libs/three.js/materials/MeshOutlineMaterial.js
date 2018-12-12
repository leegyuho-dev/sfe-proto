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

        var outlineThickness = options.defaultThickness;
        var outlineColor = new THREE.Color().fromArray(options.defaultColor);
        var outlineAlpha = options.defaultAlpha;
        var outlineVisible = true;

        if (forceDefault !== true) {
            if (!isEmpty(originalMaterial.outlineThickness)) {
                outlineThickness = originalMaterial.outlineThickness;
            }
            if (!isEmpty(originalMaterial.outlineColor)) {
                outlineColor = originalMaterial.outlineColor;
            } else {
                outlineColor = originalMaterial.color;
            }
            if (originalMaterial.outline === false || originalMaterial.opacity < 1.0) {
                outlineVisible = false;
            }
        }

        var uniformsChunk = {
            outlineThickness: {
                type: "f",
                value: outlineThickness
            },
            outlineColor: {
                type: "c",
                value: outlineColor
            },
            outlineAlpha: {
                type: "f",
                value: outlineAlpha
            },
        };

        var vertexShaderChunk = `
            #include <fog_pars_vertex>
            uniform float outlineThickness;
            vec4 calculateOutline( vec4 pos, vec3 objectNormal, vec4 skinned ) {
                float thickness = outlineThickness;
                // TODO: support outline thickness ratio for each vertex
                const float ratio = 5.0;
                // vec3 vertexColor = vColor.rgb;
                float vRatio = vColor.rgb[0];
            	vec4 pos2 = projectionMatrix * modelViewMatrix * vec4( skinned.xyz + objectNormal, 1.0 );
                // NOTE: subtract pos2 from pos because BackSide objectNormal is negative
            	vec4 norm = normalize( pos - pos2 );
            	return pos + norm * thickness * pos.w * ratio * vRatio;
            }
        `;

        // https://stackoverflow.com/questions/42738689/threejs-creating-cel-shading-for-objects-that-are-close-by
        /* var vertexShaderChunk = `
            #include <fog_pars_vertex>
            uniform float outlineThickness;
            vec4 calculateOutline( vec4 pos, vec3 objectNormal, vec4 skinned ) {
                float thickness = outlineThickness;
                // TODO: support outline thickness ratio for each vertex
                const float ratio = 1.0;
                vec4 pos2 = projectionMatrix * modelViewMatrix * vec4( skinned.xyz + objectNormal, 1.0 );
                // NOTE: subtract pos2 from pos because BackSide objectNormal is negative
                vec4 norm = normalize( pos - pos2 );
                // ----[ added ] ----
                // compute a clipspace value
                vec4 pos3 = pos + norm * thickness * pos.w * ratio;
                // do the perspective divide in the shader
                pos3.xyz /= pos3.w;
                // just return screen 2d values at the back of the clips space
                return vec4(pos3.xy, 1, 1);
            }
        `; */

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
            visible: outlineVisible,
        });
    }
}