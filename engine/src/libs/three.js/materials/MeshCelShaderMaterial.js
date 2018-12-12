export {
    MeshCelShaderMaterial
}
// http://learningthreejs.com/data/THREEx/docs/THREEx.CelShader.html
// THREE.MeshCelShaderMaterial = class MeshCelShaderMaterial {
class MeshCelShaderMaterial {

    constructor(originalMaterial, options, forceDefault = false) {

        /* var outlineThickness = options.defaultThickness;
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
        } */

        var uniforms = {
            uDirLightPos: {
                type: "v3",
                value: new THREE.Vector3(1, 0, 0)
            },
            uDirLightColor: {
                type: "c",
                value: new THREE.Color(0xeeeeee)
            },
            uAmbientLightColor: {
                type: "c",
                value: new THREE.Color(0x050505)
            },
            uBaseColor: {
                type: "c",
                value: new THREE.Color(0xff0000)
            }
        };

        var vertexShader = [
            "varying vec3 vNormal;",
            "varying vec3 vRefract;",
      
            "void main() {",
      
              "vec4 mPosition = objectMatrix * vec4( position, 1.0 );",
              "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
              "vec3 nWorld = normalize ( mat3( objectMatrix[0].xyz, objectMatrix[1].xyz, objectMatrix[2].xyz ) * normal );",
      
              "vNormal = normalize( normalMatrix * normal );",
      
              "vec3 I = mPosition.xyz - cameraPosition;",
              "vRefract = refract( normalize( I ), nWorld, 1.02 );",
      
              "gl_Position = projectionMatrix * mvPosition;",
      
            "}"	
        ].join( "\n" );

        var fragmentShader = [
            "uniform vec3 uBaseColor;",
  
            "uniform vec3 uDirLightPos;",
            "uniform vec3 uDirLightColor;",
      
            "uniform vec3 uAmbientLightColor;",
      
            "varying vec3 vNormal;",
      
            "varying vec3 vRefract;",
      
            "void main() {",
      
              "float directionalLightWeighting = max( dot( normalize( vNormal ), uDirLightPos ), 0.0);",
              "vec3 lightWeighting = uAmbientLightColor + uDirLightColor * directionalLightWeighting;",
      
              "float intensity = smoothstep( - 0.5, 1.0, pow( length(lightWeighting), 20.0 ) );",
              "intensity += length(lightWeighting) * 0.2;",
      
              "float cameraWeighting = dot( normalize( vNormal ), vRefract );",
              "intensity += pow( 1.0 - length( cameraWeighting ), 6.0 );",
              "intensity = intensity * 0.2 + 0.3;",
      
              "if ( intensity < 0.50 ) {",
      
                "gl_FragColor = vec4( 2.0 * intensity * uBaseColor, 1.0 );",
      
              "} else {",
      
                "gl_FragColor = vec4( 1.0 - 2.0 * ( 1.0 - intensity ) * ( 1.0 - uBaseColor ), 1.0 );",
      
              "}",
      
            "}"
        ].join('\n');


        /* var shaderIDs = {
            MeshBasicMaterial: 'basic',
            MeshLambertMaterial: 'lambert',
            MeshPhongMaterial: 'phong',
            MeshToonMaterial: 'phong',
            MeshStandardMaterial: 'physical',
            MeshPhysicalMaterial: 'physical',
        };

        var shaderID = shaderIDs[originalMaterial.type];
        var originalVertexShader;

        var shader = THREE.ShaderLib[shaderID];
        originalVertexShader = shader.vertexShader;
        // originalUniforms = shader.uniforms;

        var uniforms = Object.assign({}, uniformsChunk);

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
            !/#include\s+<begin_vertex>/.test(originalVertexShader)) defines.DECLARE_TRANSFORMED = true; */

        return new THREE.RawShaderMaterial({
            defines: {
                DECLARE_TRANSFORMED: true,
            },
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            // side: THREE.BackSide,
            // wireframe: false,
            // depthWrite: false,

            skinning: originalMaterial.skinning,
            morphTargets: originalMaterial.morphTargets,
            morphNormals: originalMaterial.morphNormals,
            // transparent: (outlineAlpha < 1.0)? true : false,
            // transparent: true,
            // blending: THREE.MultiplyBlending,

            // fog: originalMaterial.fog,
            // visible: outlineVisible,
        });
    }
}