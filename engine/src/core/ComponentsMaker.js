// ComponentsMaker.js
const LAYER = 'ComponentsMaker: ';

export class ComponentsMaker {
    constructor() {
    }

    // 퍼스펙티브 카메라
    // https://threejs.org/docs/index.html#api/en/cameras/Camera
    // https://threejs.org/docs/index.html#api/en/cameras/PerspectiveCamera
    PerspectiveCamera(options, canvas) {
        var camera = new THREE.PerspectiveCamera(
            options.fov, 
            canvas.clientWidth / canvas.clientHeight,
            options.near,
            options.far
        );
        camera.name = 'PerspectiveCamera';
    
        camera.position.fromArray(options.position);
        camera.options = options;
    
        // 카메라 타겟
        camera.targets = {}
        camera.targets.focused = 'free';
        camera.targets.free = new THREE.Vector3().fromArray(options.target);
        camera.lookAt(camera.targets.free);
    
        camera.update = function() {
            const options = this.options;
            // 오비트 컨트롤 처리
            if (this.orbit !== undefined) {
                const minDistance = 100;
                const maxDistance = 300;
                const distance = this.orbit.distance;
                // 포커스 타겟 오프셋
                if (this.targets.focused !== 'free') {
                    const offsetX = options.focusOffset[0];
                    const offsetY = options.focusOffset[1];
                    const offsetZ = options.focusOffset[2];
                    let ratio = 0;
                    if (distance >= maxDistance) {
                        ratio = 0;
                    } else if (distance <= minDistance) {
                        ratio = 1;
                    } else {
                        ratio = 1 - ((distance-minDistance) / (maxDistance-minDistance));
                        ratio = ratio * ratio;
                    }
                    this.orbit.offset.x = offsetX * ratio;
                    this.orbit.offset.y = offsetY * ratio;
                    this.orbit.offset.z = offsetZ * ratio;
                }
            }
        }
        
        return camera;
    }

    // 오비트 컨트롤
    // https://threejs.org/docs/#examples/controls/OrbitControls
    OrbitControls(camera, options) {
        var controls = new THREE.OrbitControls(
            camera, 
            options.container
        );
    
        controls.target = camera.targets.free;
        controls.rotateSpeed = options.rotateSpeed;
        controls.panSpeed = options.panSpeed;
        controls.zoomSpeed = options.zoomSpeed;
        controls.screenSpacePanning = options.screenSpacePanning;
        controls.enableDamping = options.enableDamping;
        controls.dampingFactor = options.dampingFactor;
        controls.minDistance = 0;
    
        /* options.container.addEventListener('touchstart', (event) => {
            console.log(document.activeElement)
        }); */
    
        camera.orbit = {}
        var handler = { 
            get: function (target, name) { 
                if (name in target) {
                    if (name === 'distance') {
                        const data = target;
                        return data.position.distanceTo(data.targets[data.targets.focused]);
                    }
                    return target[name];
                }
            },
            set: function (target, name, value) {
                if (name === 'distance') {
                    return true;
                }
                target[name] = value; 
                return true;
            }
        }
        camera.orbit = new Proxy({
            distance: 0,
            angle: 0,
            position: camera.position,
            targets: camera.targets,
            offset: new THREE.Vector3(0, 0, 0),
        }, handler);
    
        controls.update();
    
        return controls;
    }

    // 씬
    // https://threejs.org/docs/index.html#api/en/scenes/Scene
    Scene(options = null) {
        var scene = new THREE.Scene();
        if (options) {
            scene.background = new THREE.Color(options.background);
            scene.fog = new THREE.Fog(
                options.fog[0], 
                options.fog[1], 
                options.fog[2]
            );
        }
        
        return scene;
    }

    // 디렉셔널 라이트
    // https://threejs.org/docs/#api/lights/DirectionalLight
    DirectionalLight(scene, options) {
        var lightTarget = new THREE.Object3D();
        var ltPos = options.lightTarget.position;
        lightTarget.position.set(ltPos[0], ltPos[1], ltPos[2]);
        scene.add(lightTarget);
    
        var directionalLight = new THREE.DirectionalLight(
            options.color,
            options.intensity
        );
        directionalLight.target = lightTarget;
        var DLightPos = options.position;
        directionalLight.position.set(DLightPos[0], DLightPos[1], DLightPos[2]);
        directionalLight.castShadow = options.castShadow;
        
        // https://threejs.org/docs/#api/lights/shadows/LightShadow
        var DLShadowOption =  options.shadow;
        var SmapSize = DLShadowOption.mapSize;
        directionalLight.shadow.mapSize.set(SmapSize, SmapSize);
        directionalLight.shadow.bias = DLShadowOption.bias;
        directionalLight.shadow.radius = DLShadowOption.radius;
    
        var DLShadowCamOption = DLShadowOption.camera;
        directionalLight.shadow.camera.near = DLShadowCamOption.near;
        directionalLight.shadow.camera.far = DLShadowCamOption.far;
        directionalLight.shadow.camera.top = DLShadowCamOption.top;
        directionalLight.shadow.camera.bottom = DLShadowCamOption.bottom;
        directionalLight.shadow.camera.left = DLShadowCamOption.left;
        directionalLight.shadow.camera.right = DLShadowCamOption.right;
        scene.add(directionalLight);
    
        return scene;
    }

    // 앰비언트 라이트
    // https://threejs.org/docs/#api/en/lights/AmbientLight
    AmbientLight(scene, options) {
        var ambientLight = new THREE.AmbientLight(options.color, options.intensity);
        scene.add(ambientLight);
    
        return scene;
    }

    // 헤미스피어 라이트
    // https://threejs.org/docs/#api/en/lights/HemisphereLight
    HemisphereLight(scene, options) {
        var hemisphereLight = new THREE.HemisphereLight(options.skyColor, 
                                                        options.groundColor,
                                                        options.intensity);
        var HLightPos = options.position;
        hemisphereLight.position.set(HLightPos[0], HLightPos[1], HLightPos[2]);
        scene.add(hemisphereLight);

        return scene;
    }

    GroundMesh(scene, options) {
        if (options.use === false) {
            return scene;
        }
    
        // 그라운드메시
        // https://threejs.org/docs/#api/en/objects/Mesh
        let meshOptions = options.mesh;
        if (meshOptions.use === true) {
            let meshSize = meshOptions.size;
            let groundMesh = new THREE.Mesh(
                new THREE.PlaneBufferGeometry(meshSize[0], meshSize[1]),
                new THREE.MeshPhongMaterial({
                    color: meshOptions.color,
                    depthWrite: meshOptions.depthWrite,
                })
            );
            groundMesh.rotation.x = -Math.PI / 2;
            groundMesh.receiveShadow = meshOptions.receiveShadow;
            scene.add(groundMesh);
        }
    
        // 그리드
        // https://threejs.org/docs/#api/en/helpers/GridHelper
        let gridOptions = options.grid;
        if (gridOptions.use === true) {
            let grid = new THREE.GridHelper(gridOptions.size, 
                                            gridOptions.divisions, 
                                            gridOptions.colorCenterLine, 
                                            gridOptions.colorGrid);
            grid.material.opacity = gridOptions.opacity;
            grid.material.transparent = gridOptions.transparent;
            scene.add(grid);
        }
    
        return scene;
    }

    // 렌더러
    // https://threejs.org/docs/index.html#api/en/renderers/WebGLRenderer
    WebGLRenderer(options, canvas) {
        // 캔버스. WebGL2 지원
        // https://github.com/mrdoob/three.js/pull/13717
        // var canvas = document.createElement('canvas');
        // https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
        var context = canvas.getContext('webgl2', {
            antialias: true,
            // precision: 'lowp',
            powerPreference: 'high-performance',
        });
        // console.log(context)

        var renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            context: context,
            antialias: options.antialias,
            // precision: 'lowp',
            alpha: true,
            // preserveDrawingBuffer: true,
            // powerPreference: 'high-performance',
            // logarithmicDepthBuffer: true,
        });

        /* if (options.canvasId && options.canvasId !== undefined && options.canvasId !== '') {
            renderer.domElement.setAttribute("id", options.canvasId);
        } */

        // renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setPixelRatio(1);
        renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
        renderer.autoClear = true;
        renderer.gammaInput = options.gammaInput;
        renderer.gammaOutput = options.gammaOutput;
        renderer.shadowMap.enabled = options.shadowMap.enabled;
        renderer.shadowMap.type = THREE[options.shadowMap.type];

        // console.log(renderer);

        return renderer;
    }

}