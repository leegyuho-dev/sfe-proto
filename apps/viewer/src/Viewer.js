// Viewer.js
const LAYER = 'SFEViewer: ';

import { OptionsHandler } from './modules/OptionsHandler.js';
import { Object3DHandler } from './modules/Object3DHandler.js';
import { VueUIModeler } from './modules/VueUIModeler.js';
import { ViewerController } from './modules/ViewerController.js';

var Make = new SFE.ComponentsMaker();

// export class Player {
SFE.Viewer = class {

    constructor(userOptions = null) {
        // 전역 USERDATA 필수
        if (window.USERDATA === undefined) {
            throw Error(LAYER + 'USERDATA REQUIRED');
        }

        this.userOptions = userOptions;
        this.options;
        this.container;
        this.Loader;
        this.VueUI, this.VueData, this.stats;
        this.VueCanvas;

        this.Sequence, this.targetSequence;
        this.canvas, this.scene, this.renderer;
    
        this.camera, this.controls, this.light;
        this.models, this.helpers, this.clock, this.frameClock, this.mixers;
        this.effects = {}
        
        this.Controller;
        this.Assets;
    }

    // 뷰어 실헹
    init() {
        // 로더
        this.startLoad();

        // webGL 검사
        if (!THREE.WEBGL.isWebGLAvailable()) { 
            THREE.WEBGL.getWebGLErrorMessage();
            throw Error(LAYER + 'WEBGL SUPPORTED BROWSER REQUIRED');
        }
        
        // 스타팅 로그
        console.log(LAYER + 'SFE Viewer v0.0.1. based on three.js r97');

        // webGL2 메시지
        console.log(LAYER + 'WebGL2:', THREE.WEBGL.isWebGL2Available());

        // 옵션값
        this.getOptions(this.userOptions)
        .then(result => {
            this.options = result;
            // 컨테이너
            this.container = this.getContainer();
            // 시퀀스 생성
            this.makeSequence();
            // three.js 컴포넌트 생성
            this.makeComponents();
            // vue.js UI 생성
            this.makeVueUI();
            // 어셋 로드
            this.loadAssets();
            // 랜더 & 애니메이트
            this.animate();
        });

    }

    startLoad() {
        this.Loader = new SFE.LoadingManager();
        this.Loader.start();
    }

    async getOptions(userOptions) {
        const Options = new OptionsHandler();
        const userConfig = userOptions.global.userConfig;

        let options;
        // 유저 컨피그 사용
        if (userConfig) {
            options = await Options.getConfig(userOptions.global.userConfig);
        } else {
            // 컨피그 파일이 없을 경우 기본값
            options = await Options.getDefault();
        }

        // 유저 옵션과 병합
        if (userOptions) {
            options = Options.assignNew(options, userOptions);
        }
        // URL 파라미터 사용 
        if (options.global.useUrlOptions === true) {
            options = Options.getFromUrl(options);
        }

        console.log(LAYER + 'Options:', options);
        return options;
    }

    getContainer() {
        let containerId = this.options.global.containerId;
        if (containerId.substring(0, 1) !== '#') {
            containerId = '#' + containerId;
        }
        let container = document.querySelector(containerId);
        if (!container || container.length === 0) {
            console.error('containerId:', this.options.global.containerId);
            throw Error(LAYER + 'CONTAINER IS NOT EXIST');
        }
        return container;
    }

    // TODO: SequenceEditor 로 클래스 분리
    makeSequence(target = 0) {
        this.Sequence = {
            container: this.container,
            target: target,
            scenes: [],
            timeline: [],
        }

        var options = this.options;
        var canvasId = 'viewer3d_render'
        var canvas = this.makeCanvas(canvasId);
        var scene = Make.Scene(options.scene);
        var renderer = Make.WebGLRenderer(options.renderer, canvas);
        var camera = Make.PerspectiveCamera(options.camera, canvas);

        var targetScene = {
            canvas: canvas,
            scene: scene,
            renderer: renderer,
            camera: camera,
        }
        this.Sequence.scenes.push(targetScene);

        // 타겟시퀀스
        this.targetSequence = this.Sequence.scenes[target];
        this.canvas = this.targetSequence.canvas;
        this.scene = this.targetSequence.scene;
        this.renderer = this.targetSequence.renderer;
        this.camera = this.targetSequence.camera;
    }

    makeCanvas(canvasId = 'viewer3d_render') {
        var container = this.container;

        this.VueCanvas = new Vue({
            el: '#' + canvasId,
            data: {
                data: {
                    name: 'canvas',
                    id: canvasId,
                    use: true,
                    display: true,
                    type: 'WebGL',
                    ready: false,
                    events: {},
                    
                    blur: 16,
                    smooth: true,
                    fitScreen: true,
                    aspectRatio: 'auto',
                    width: 0,
                    height: 0,
                }
            },
            template: '<canvas id="viewer3d_render" :class="classes" :style="styles"></canvas>',
            computed: {
                classes: function () {
                    var aspectRatio = this.data.aspectRatio;
                    var maxwidth = false;
                    var maxheight = false;

                    if (this.data.fitScreen === true) {
                        if (aspectRatio === 'auto') {
                            maxwidth = true;
                            maxheight = true;
                        } else {
                            // TODO: 모바일 세로화면 지원
                            if (this.data.width === 0 || this.data.height === 0 ) {
                                return false;
                            }
                            var screenRatio = container.clientHeight / container.clientWidth;

                            if (this.data.width === this.data.height) {
                                if (container.clientWidth === container.clientHeight) {
                                    maxwidth = true;
                                    maxheight = true;
                                } else if (container.clientWidth > container.clientHeight) {
                                    maxheight = true;
                                } else if (container.clientWidth < container.clientHeight) {
                                    maxwidth = true;
                                }
                            } else if (this.data.width > this.data.height) {
                                if (aspectRatio === screenRatio) {
                                    maxwidth = true;
                                    maxheight = true;
                                } else if (aspectRatio < screenRatio) {
                                    maxwidth = true;
                                } else if (aspectRatio > screenRatio) {
                                    maxheight = true;
                                }
                            } else if (this.data.width < this.data.height) {
                                if (aspectRatio === screenRatio) {
                                    maxwidth = true;
                                    maxheight = true;
                                } else if (aspectRatio < screenRatio) {
                                    maxheight = true;
                                } else if (aspectRatio > screenRatio) {
                                    maxwidth = true;
                                }
                            }
                        }
                    }

                    return [
                        this.data.type,
                        {
                            // blur: this.data.blur,
                            smooth: this.data.smooth,
                            ready: this.data.ready,
                            maxwidth: maxwidth,
                            maxheight: maxheight,
                        }
                    ]
                },
                styles: function() {
                    if (this.data.smooth === true && this.data.blur >= 0) {
                        return 'filter:blur(' + this.data.blur + 'px)';
                    }
                }
            }
        });
        return this.VueCanvas.$el;
    }

    makeComponents() {
        this.Loader.progress.initialize = 25;
        this.Loader.changeStatus();

        this.Assets = new SFE.AssetsManager(this);
        this.models = {}
        this.clock = new THREE.Clock();
        this.frameClock = new THREE.Clock();
        this.mixers = [];

        // 컨테이너
        // this.container = this.getContainer();
        // let viewerWidth = this.container.clientWidth;
        // let viewerHeight = this.container.clientHeight;
        // var viewerWidth = this.VueCanvas.$el.clientWidth;
        // var viewerHeight = this.VueCanvas.$el.clientHeight;

        // 씬
        // https://threejs.org/docs/index.html#api/en/scenes/Scene
        /* let sceneOptions = this.options.scene
        this.scene = Make.Scene(sceneOptions); */


        // 헬퍼
        this.helpers = new THREE.Group();
        this.helpers.name = 'Helpers';
        // this.helpers.visible = false;
        this.scene.add(this.helpers);

        // 더미
        var dummyBox = new THREE.Mesh( 
            new THREE.BoxGeometry(30, 30, 30), 
            new THREE.MeshBasicMaterial({
                color: 0x00ff00,
                wireframe: true,
            })
        );
        var dummySphere = new THREE.Mesh( 
            new THREE.SphereGeometry(10), 
            new THREE.MeshBasicMaterial({
                color: 0x00ff00,
                wireframe: true,
            })
        );

        // 카메라
        // https://threejs.org/docs/index.html#api/en/cameras/Camera
        // https://threejs.org/docs/index.html#api/en/cameras/PerspectiveCamera
        /* let cameraOptions = this.options.camera;
        cameraOptions['width'] = viewerWidth;
        cameraOptions['height'] = viewerHeight;
        this.camera = Make.PerspectiveCamera(cameraOptions); */
        // this.helpers.camera = new THREE.CameraHelper( this.camera );
        // this.scene.add( this.helpers.camera );

        // 오비트컨트롤
        // https://threejs.org/docs/#examples/controls/OrbitControls
        var controlsOptions = this.options.controls;
        controlsOptions['container'] = this.container;
        this.controls = Make.OrbitControls(this.camera, controlsOptions);

        /* this.helpers.cameraTarget = dummyBox;
        this.helpers.cameraTarget.position
            .set(cameraOptions.target[0], cameraOptions.target[1], cameraOptions.target[2]);
        this.scene.add(this.helpers.cameraTarget);
        this.controls.target = this.helpers.cameraTarget.position; */

        // 라이트
        // https://threejs.org/docs/#api/en/lights/Light
        var lightOptions = this.options.light;

        // 디렉셔널 라이트
        // https://threejs.org/docs/#api/lights/DirectionalLight
        // https://threejs.org/docs/#api/lights/shadows/LightShadow
        var DLightOptions = lightOptions.directionalLight;
        if (!SFE.isEmpty(DLightOptions)) {
            this.scene = Make.DirectionalLight(this.scene, DLightOptions);
        }

        // 앰비언트 라이트
        // https://threejs.org/docs/#api/en/lights/AmbientLight
        var ALightOptions = lightOptions.ambientLight;
        if (!SFE.isEmpty(ALightOptions)) {
            this.scene = Make.AmbientLight(this.scene, ALightOptions);
        }

        // 헤미스피어 라이트
        // https://threejs.org/docs/#api/en/lights/HemisphereLight
        var HLightOptions = lightOptions.hemisphereLight;
        if (!SFE.isEmpty(HLightOptions)) {
            this.scene = Make.HemisphereLight(this.scene, HLightOptions);
        }

        // 지면
        // https://threejs.org/docs/#api/en/objects/Mesh
        // https://threejs.org/docs/#api/en/helpers/GridHelper
        var groundMeshOptions = this.options.groundMesh;
        if (!SFE.isEmpty(groundMeshOptions)) {
            this.scene = Make.GroundMesh(this.scene, groundMeshOptions);
        }

        // 랜더러
        // https://threejs.org/docs/#api/renderers/WebGLRenderer
        // https://threejs.org/docs/#api/en/renderers/WebGLRenderer.shadowMap
        /* var rendererOptions = this.options.renderer;
        rendererOptions['width'] = viewerWidth;
        rendererOptions['height'] = viewerHeight;
        this.renderer = Make.WebGLRenderer(rendererOptions, this.VueCanvas.$el); */
        // this.container.prepend(this.renderer.domElement);
        // console.log(this.renderer)

        // 캔버스 사이즈
        this.VueCanvas.data.width = this.VueCanvas.$el.width;
        this.VueCanvas.data.height = this.VueCanvas.$el.height;
        // 캔버스 사이즈 감시
        var observer = new MutationObserver((mutationsList, observer) => {
            for(var mutation of mutationsList) {
                if (mutation.type == 'attributes') {
                    if (mutation.attributeName === 'width') {
                        this.VueCanvas.data.width = mutation.target.width;
                    }
                    if (mutation.attributeName === 'height') {
                        this.VueCanvas.data.height = mutation.target.height;
                    }
                }
            }
        });
        observer.observe(this.renderer.domElement, { 
            attributes: true
        });
        
        // 아웃라인 이펙트
        // TODO: 아웃라인 이펙트 재수정
        var outlineOptions = this.options.effect.outline;
        this.effects.outline = new THREE.OutlineEffect.Custom(this.renderer, outlineOptions);

        // 리사이즈
        // https://stackoverflow.com/questions/40744566/three-js-in-a-class
        // window.addEventListener('resize', this.onWindowResize, false)
        window.addEventListener('resize', this.onWindowResize.bind(this), false);

    }

    makeVueUI() {
        this.Loader.progress.initialize = 50;
        this.Loader.changeStatus();

        // 뷰모델 검사
        if (window.VIEWMODEL === undefined) {
            window.VIEWMODEL = {};
        }
        // 뷰모델 검사
        if (window.VIEWMODEL.VueUI === undefined) {
            window.VIEWMODEL['VueUI'] = {};
        }

        const uiOptions = this.options.ui;
        const UI = new VueUIModeler(this);
        // this.VueUI = VueUI;

        this.VueUI = UI.makeVueUI();
        this.VueData = UI.VueData;

        // 스탯
        // https://github.com/mrdoob/stats.js/
        this.stats = new THREE.Stats();
        this.stats.info = this.VueData.stats;
        if (this.stats.info === false) {
            uiOptions.stats.use = false;
        } else {
            this.defineStatData();
        }

        // 뷰모델에 APPID로 병합
        window.VIEWMODEL.VueUI[USERDATA.info.appId] = this.VueUI;
        console.log(LAYER + 'VueData:', this.VueData);

        // 컨트롤러 클래스
        this.Controller = new ViewerController(this);

    }

    loadAssets() {
        var firstLoad = true;

        if (!SFE.isEmpty(this.options.models[0])) {
            for (var index in this.options.models) {
                var modelOption =  this.options.models[index];
                var model = this.Assets.makeModel(modelOption.name, modelOption.category, modelOption.relativePath);
                this.loadModel(model, modelOption, firstLoad);
                firstLoad = false;
            }
        } else {
            var modelOption =  this.options.defaultModel;
            var model = this.Assets.makeModel(modelOption.name, modelOption.category, modelOption.relativePath);
            this.loadModel(model, modelOption, firstLoad);
        }
    }

    // 모델 로드
    // TODO: 모델 배열 동시로드 처리.
    async loadModel(model, options = null, firstLoad = false) { 
        if (firstLoad === true) {
            this.Loader.progress.initialize = 100;
            await this.Loader.changeStatus();
        }
        if (!options) {
            options = this.options.defaultModel;
        }

        const fileName = model.name;
        const Assets = this.Assets;
        const Loader = this.Loader;
        const Controller = this.Controller;

        var Object3D = new Object3DHandler();

        // TODO: 에러가 있을 경우 컨트롤러를 통해 로드 중단 처리.
        /* model.onError = function() {
            Controller.loader.error();
        } */

        model.onStart = function() {
            Loader.queue.push(
                new Promise((resolve) => {
                    model.onLoad = function() {
                        setTimeout(function(){
                            resolve(true);
                        }, 0);
                    } 
                })
            );
        }
        model.onProgress = function() {
            Loader.changeFileProgress(this);
        }
        var modelData = await model.load();
        // await Loader.finish();

        // 모델 메시, 매터리얼, 본 처리.
        modelData = Object3D.ready(modelData, Assets, options);

        this.scene.add(modelData);
        this.models[fileName] = modelData;
        this.stats.refresh = true;

        // 모델 애니메이션 처리
        // if (modelData.animations[0]) {
        if (modelData.animations) {
            modelData.mixer = new THREE.AnimationMixer(modelData);
            this.mixers.push(modelData.mixer);
            const action = modelData.mixer.clipAction(modelData.animations[0]);
            modelData.mixer.action = action;

            // 루프 이벤트 추가
            // modelData.mixer.action.reverse = false;
            // modelData.mixer.action.loopMode = this.options.player.loopMode;
            modelData.mixer.addEventListener('loop', function(event) {
                if (this.action.onLoop !== undefined) {
                    if (typeof this.action.onLoop === "function") {
                        this.action.onLoop(event, this);
                    }
                }
            });
            modelData.mixer.addEventListener('finished', function(event) {
                if (this.action.onLoop !== undefined) {
                    if (typeof this.action.onLoop === "function") {
                        this.action.onLoop(event, this);
                    }
                }
            });
            modelData.mixer.action.onLoop = function(event, data) {
                var loopMode = Controller.player.loopMode;
                if (loopMode === 'once') {
                    Controller.player.paused = true;
                    // Controller.V3Daction.paused = true;
                } else if (loopMode === 'repeat') {
                    return false;
                } else if (loopMode === 'pingpong') {
                    if (Controller.player.reverse === false) {
                        Controller.player.reverse = true;
                    } else {
                        Controller.player.reverse = false;
                    }
                    Controller.V3Daction.enabled = true;
                    Controller.V3Daction.paused = false; 
                }
            }

            // 애니메이션 정지
            modelData.mixer.action.play();
            modelData.mixer.action.paused = true;
        }

        if (firstLoad === true) {
            // 로더 대기열 완료까지 지연
            await Promise.all(Loader.queue);
            this.Loader.progress.make_assets = 50;
            this.Loader.changeStatus();

            console.log(LAYER + 'Assets:', this.Assets);
            console.log(LAYER + 'Sequence:', this.Sequence);
            console.log(LAYER + 'LOADING COMPLETE');

            this.Loader.progress.make_assets = 100;
            // this.Loader.changeStatus('finish');
            await this.Loader.finish();
            await SFE.wait(100);

            // UI 준비
            Controller.readyUI();
            // 플레이어 준비
            await Controller.readyPlayer(modelData); 
        }

        // 추가 매터리얼 및 메시복사
        modelData = Object3D.add(modelData, Assets, options);
        
        // 서브디비전
        /* let subdivsionLevel = 2;
        let modifier = new THREE.SubdivisionModifier( subdivsionLevel );
        let meshName = Object.keys(modelData.meshes)[0];
        let subdividedGeometry = modelData.meshes[meshName].geometry.clone();
        subdividedGeometry = modifier.modify( subdividedGeometry, subdivsionLevel );

        let material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );
        let subdividedMesh = new THREE.Mesh( subdividedGeometry, material );
        this.scene.add(subdividedMesh);
        console.log(subdividedMesh); */

        // 서브디비전 테스트
        /* let originalGeometry = new THREE.BoxGeometry(20, 20, 20);
        let material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );

        let subdivisionModifier = new THREE.SubdivisionModifier(1);
        let subdividedGeometry = originalGeometry.clone();
        subdividedGeometry = subdivisionModifier.modify(subdividedGeometry);

        let subdividedMesh = new THREE.Mesh( subdividedGeometry, material );

        this.scene.add(subdividedMesh); */

    }

    // 애니메이션
    // TODO: 계산 간소화. 시간 보정. 계산된 값들을 updatePlayer() 로 넘김.
    animate() {
        // https://stackoverflow.com/questions/40744566/three-js-in-a-class
        // requestAnimationFrame(Viewer.animate)
        requestAnimationFrame(this.animate.bind(this));
        if (this.mixers.length > 0) {
            var reverse = this.Controller.player.reverse;

            // 키프레임 모드
            if (this.Controller.player.playMode === 'frame') {

                var frameTime = this.Controller.SFEAnimation.frameTime;
                var timeScale = this.Controller.SFEAction.timeScale;
                var targetTime = frameTime / timeScale;

                this.frameClock.getDelta();
                var elapsedTime = this.frameClock.elapsedTime;

                if (reverse === false) { // 재생
                    // 시간 보정
                    // elapsedTime = Number(elapsedTime.toFixed(2));
                    // targetTime = Number(targetTime.toFixed(2));
                    if (Number(elapsedTime.toFixed(2)) >= Number(targetTime.toFixed(2))) {
                        for (var i = 0; i < this.mixers.length; i++) {
                            this.mixers[i].update(targetTime);
                        }
                        this.frameClock.elapsedTime = 0;
                    }
                } else if (reverse === true) { // 역재생
                    // 시간 보정
                    // elapsedTime = Number(elapsedTime.toFixed(2));
                    // targetTime = Number(targetTime.toFixed(2));
                    elapsedTime = 0 - elapsedTime; 
                    targetTime = 0 - targetTime; 
                    if (Number(elapsedTime.toFixed(2)) <= Number(targetTime.toFixed(2))) {
                        for (var i = 0; i < this.mixers.length; i++) {
                            this.mixers[i].update(targetTime);
                        }
                        this.frameClock.elapsedTime = 0;
                    }
                }

            // 리얼타임 모드
            } else {

                var targetTime = this.clock.getDelta();
                if (reverse === true) { // 역재생
                    targetTime = 0 - targetTime; 
                }
                for (var i = 0; i < this.mixers.length; i++) { 
                    this.mixers[i].update(targetTime);
                }

            }
        }

        // 카메라 업데이트
        this.camera.update();

        // 컨트롤 업데이트
        this.controls.update();

        // TWEEN 업데이트
        TWEEN.update();

        // 스킨모프 테스트
        if (this.options.models[0].name === 'SkinMorphTest.fbx') {
            this.skinMorphTest();
        }

        this.render();
        // this.renderer.render(this.scene, this.camera);
        
        if (this.options.ui.stats.use === true) {
            // this.stats.refresh = true;
            this.updateStatData();
        }

        if (!SFE.isEmpty(this.models) && this.Controller.player.use === true) {
            this.Controller.updatePlayer();
            // this.helpers.boundingBox.update();
        }
    }

    // 스킨모프 테스트
    skinMorphTest() {
        const modelData = this.Assets.models['SkinMorphTest.fbx'].data;
        if (modelData !== null) {
            const triggerBone = modelData.bones.Rig_Cylinder_2;
            const rotZ = (triggerBone.rotation.z*57.2958).toFixed(1);
            const rotY = (triggerBone.rotation.y*57.2958).toFixed(1);
            
            const dictionary = modelData.meshes.Cylinder_Skinned_top.morphTargetDictionary;
            const influences = modelData.meshes.Cylinder_Skinned_top.morphTargetInfluences;
            /* let morphFront = influences[dictionary.front];
            let morphBack = influences[dictionary.back];
            let morphLeft = influences[dictionary.left];
            let morphRight = influences[dictionary.right]; */

            if (rotZ > 0) {
                influences[dictionary.front] = (rotZ/90).toFixed(2);
            } else if (rotZ < 0) {
                influences[dictionary.back] = ((0-rotZ)/90).toFixed(2);
            }

            if (rotY > 0) {
                influences[dictionary.right] = (rotY/90).toFixed(2);
            } else if (rotY < 0) {
                influences[dictionary.left] = ((0-rotY)/90).toFixed(2);
            }
        }
    }

    // 랜더링
    render() {
        this.renderer.render(this.scene, this.camera);
        for (var key in this.effects) {
            this.effects[key].render(this.scene, this.camera);
        }
    }

    defineStatData() {
        if (this.options.ui.stats.use === false) {
            return false;
        }
        if (this.options.ui.stats.rendererInfo === true) {
            var statInfo = this.stats.info;
            var WebGLMode = 'WebGL1';
            if (this.renderer.capabilities.isWebGL2 == true) {
                WebGLMode = 'WebGL2';
            }
            statInfo.title = WebGLMode+': THREE.'+
                             this.renderer.constructor.name+' r'+
                             THREE.REVISION;
        }

        this.stats.refresh = true;
        this.updateStatData();
    }

    updateStatData() {
        if (this.options.ui.stats.use === false) {
            return false;
        }
        var statList = this.options.ui.stats.data;
        var data = this.stats.info.lists;
        var context = this.renderer.context;
        var renderInfo = this.renderer.info.render;

        function updateInfo(id, dataObject) {
            if (statList[id] === true) {
                data[id] = dataObject;
            }
        }

        this.stats.update();
        if (this.stats.refresh === true) { // 일회성 업데이트

            // 본 개수 계산
            var bonesTotalLength = 0;
            var models = this.Assets.models;
            for (var key in models) {
                var bonesLength = Object.keys(models[key].data.bones).length;
                if (bonesLength !== 0) {
                    bonesTotalLength = bonesTotalLength + (bonesLength - 1);
                }
            }

            updateInfo('drawCalls', renderInfo.calls);
            updateInfo('points', renderInfo.points);
            updateInfo('lines', renderInfo.lines);
            updateInfo('triangles', renderInfo.triangles);
            updateInfo('bones', bonesTotalLength);
            this.stats.refresh = false;
        }

        // 상시 업데이트
        updateInfo('bufferSize', context.drawingBufferWidth + ' X ' + context.drawingBufferHeight);
        updateInfo('frameCount', renderInfo.frame);
        updateInfo('memory', Math.round(this.stats.memVal) + 'MB' + ' / ' + Math.round(this.stats.memMax) + 'MB');
        updateInfo('frameTime', Math.round(this.stats.ftime) + 'MS');
        updateInfo('FPS', Math.round(this.stats.fps));
    }


    // 뷰어 리사이즈
    onWindowResize() {
        var aspectRatio = this.VueCanvas.data.aspectRatio;
        var screenWidth = this.container.clientWidth;
        if (aspectRatio === 'auto') {
            var screenHeight = this.container.clientHeight;
        } else {
            var screenHeight = this.container.clientWidth * aspectRatio;
        }

        this.camera.aspect = screenWidth / screenHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(screenWidth, screenHeight, false);
        // this.stats.refresh = true;
    }
}