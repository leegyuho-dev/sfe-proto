(function () {
    'use strict';

    // LoadingManager.js

    /* import {
        wait,
    } from '../common/functions.js'; */

    class LoadingManager {
        constructor() {
            Vue.directive('ready', {});

            this.loading = true;
            this.queue = [];
            this.status = 'ready';
            this.models = {};
            this.textures = {};
            this.progress = {
                initialize: 0,
                load_model: 0,
                load_texture: 0,
                make_assets: 0,
            };
            this.onStart, this.onFinish, this.onChange, this.onError;

            this.loadingCircle = {};

            // 뷰모델 검사
            if (window.VIEWMODEL === undefined) {
                window.VIEWMODEL = {};
            }
        }

        reset() {
            this.queue = [];
            this.status = 'ready';
            this.models = {};
            this.textures = {};
            this.progress = {
                initialize: 0,
                load_model: 0,
                load_texture: 0,
                make_assets: 0,
            };
            this.onStart = null;
            this.onChange = null;
            this.onFinish = null;
            this.onError = null;
        }

        start() {
            this.reset();
            this.status = 'initialize';

            makeLoadingCircle(this);

            // 뷰모델에 appLoader 병합
            if (window.VIEWMODEL.appLoader === undefined) {
                window.VIEWMODEL['VueLoader'] = this.loadingCircle;
            }
            if (typeof this.onStart === 'function') {
                this.onStart();
            }
        }

        changeFileProgress(asset) {
            var files;
            var statusType;
            if (asset.type === 'model') {
                files = this.models;
                statusType = 'load_model';
            } else if (asset.type === 'texture') {
                files = this.textures;
                statusType = 'load_texture';
            }
            if (statusType !== this.status) {
                return false;
            }

            if (files[asset.name] === undefined) {
                files[asset.name] = {};
            }
            files[asset.name].size = asset.size;
            files[asset.name].loaded = asset.loaded;
            
            var totalSize = 0;
            var totalLoaded = 0;
            for (var key in files) {
                totalSize = totalSize + files[key].size;
                totalLoaded = totalLoaded + files[key].loaded;
            }
            var progress = Math.round(totalLoaded / totalSize * 100);
            if (progress >= 100) {
                progress = 100; 
            }
            if (progress < this.progress[statusType]) {
                progress = this.progress[statusType];
            }

            if (progress !== this.progress[statusType]) {
                this.progress[statusType] = progress;
                this.changeStatus();
            }
        }

        async changeStatus(status = null) {
            // console.log(this.status, this.progress[this.status]);
            // this.status = status;
            if (status) {
                if (status === 'finish') {
                    this.finish();
                } else {
                    this.status = status;
                }
            } else {
                if (this.status === 'initialize' && this.progress.initialize >= 100) {
                    await SFE.wait(350);
                    this.status = 'load_model';
                } 
                if (this.status === 'load_model' && this.progress.load_model >= 100) {
                    await SFE.wait(350);
                    this.status = 'load_texture';
                } 
                if (this.status === 'load_texture' && this.progress.load_texture >= 100) {
                    await SFE.wait(350);
                    this.status = 'make_assets';
                }
                if (this.status === 'make_assets' && this.progress.make_assets >= 100) {
                    this.finish();
                }
            }

            if (typeof this.onProgress === 'function') {
                this.onChange();
            }
        }

        error() {
            if (typeof this.onError === 'function') {
                this.onError();
            }
        }

        async finish() {
            await SFE.wait(500);
            this.loading = false;
            if (typeof this.onFinish === 'function') {
                this.onFinish();
            }
            this.reset();
        }

    }

    function makeLoadingCircle(Loader) {

        // 프로그레스 로더
        Vue.component('v3d-progress', {
            props: ['data'],
            template: `
            <div v-if="data.loading" id="ui_loader" :class="classes">
                <div class="info">
                <span class="persent">{{ progress }}</span>
                <span class="status">{{ status }}</span>
                </div>
                <svg class="loadingcircle" :height="radius*2" :width="radius*2">
                    <!--
                        <circle class="backcircle" fill="transparent" 
                            :stroke-width="stroke" 
                            :r="normalizedRadius" 
                            :cx="radius" :cy="radius" 
                        />
                    -->
                    <circle class="frontcircle initialize" fill="transparent" 
                        v-if="data.progress.initialize > 0"
                        :stroke-dasharray="dasharray" 
                        :style="{ strokeDashoffset: progresses.initialize }" 
                        :stroke-width="stroke" 
                        :r="normalizedRadius" 
                        :cx="radius" :cy="radius" 
                    />
                    <circle class="frontcircle load_model" fill="transparent"
                        v-if="data.progress.load_model > 0"
                        :stroke-dasharray="dasharray" 
                        :style="{ strokeDashoffset: progresses.load_model }" 
                        :stroke-width="stroke" 
                        :r="normalizedRadius" 
                        :cx="radius" :cy="radius" 
                    />
                    <circle class="frontcircle load_texture" fill="transparent" 
                        v-if="data.progress.load_texture > 0"
                        :stroke-dasharray="dasharray" 
                        :style="{ strokeDashoffset: progresses.load_texture }" 
                        :stroke-width="stroke" 
                        :r="normalizedRadius" 
                        :cx="radius" :cy="radius" 
                    />
                    <circle class="frontcircle make_assets" fill="transparent" 
                        v-if="data.progress.make_assets > 0"
                        :stroke-dasharray="dasharray" 
                        :style="{ strokeDashoffset: progresses.make_assets }" 
                        :stroke-width="stroke" 
                        :r="normalizedRadius" 
                        :cx="radius" :cy="radius" 
                    />
                </svg>
            </div>
        `,
            data: function() {
                const radius = 60;
                const stroke = 4;
                const normalizedRadius = radius - stroke * 2;
                const circumference = normalizedRadius * 2 * Math.PI;
                return {
                    radius: radius,
                    stroke: stroke,
                    dasharray: circumference + ' ' + circumference,
                    normalizedRadius: normalizedRadius,
                    circumference: circumference
                };
            },
            computed: {
                progress: function () {
                    return this.data.progress[this.data.status] + '%';
                },
                // 스테이터스 텍스트
                status: function () {
                    return this.data.status.replace( /_/g, ' ').toUpperCase();
                },
                classes: function () {
                    return [
                        this.data.status,
                        {
                            loading: this.data.loading,
                        }
                    ]
                },
                // 프로그레스는 반드시 퍼센트로 입력
                progresses: function () {
                    return {
                        initialize: this.circumference - this.data.progress.initialize / 100 * this.circumference,
                        load_model: this.circumference - this.data.progress.load_model / 100 * this.circumference,
                        load_texture: this.circumference - this.data.progress.load_texture / 100 * this.circumference,
                        make_assets: this.circumference - this.data.progress.make_assets / 100 * this.circumference,
                    };
                }
            }
        });

        // 로더
        // TODO: 미사용. 프로그레스 로더로 대체
        Vue.component('v3d-loader', {
            props: ['data'],
            template: [
                '<div v-if="data.loading" id="ui_loader" class="blue" :class="{ loading:data.loading }">',
                '<div class="progress">{{ progress }}</div>',
                '</div>'
            ].join('\n'),
            computed: {
                progress: function () {
                    const progress = this.data.progress;
                    return padNumber(progress, 2) + '%';
                }
            },
        });

        Loader.loadingCircle = new Vue({
            el: '#v3d_splash',
            data: {
                loader: Loader
            },
        });

    }

    // TaskManager.js

    /* import {
        getFileStrFromUrl,
        getFileStrFromDir,
        genUUID,
    } from '../common/functions.js'; */

    /* var option = {
        name: processName,
        basePath: workerPath,
    } */
    class TaskManager {
        constructor(options) {
            // 전역 TASKS 객체에 등록
            if (window.TASKS === undefined) {
                window.TASKS = {};
            }
            window.TASKS[options.name] = this;

            this.taskList = {};
            this.basePath = options.basePath;
            // TODO: onTaskRun, onTasking, onTaskEnd 핸들링 추가. 
            this.onTaskRun, this.onTasking, this.onTaskEnd;
        }

        make(workerScript) {
            var uuid = SFE.genUUID();
            this.taskList[uuid] = new Task(this.basePath + workerScript, this);
            this.taskList[uuid].uuid = uuid;
            return this.taskList[uuid];
        }

        delete(uuid) {

        }

    }

    class Task {
        constructor(workerScript, TaskManager) {
            // super();
            this.name = '';
            if (workerScript.indexOf('/') !== -1) {
                this.name = SFE.getFileStrFromUrl(workerScript);
            } else if (workerScript.indexOf('\\') !== -1) {
                this.name = SFE.getFileStrFromDir(workerScript);
            } else {
                this.name = workerScript;
            }
            this.queue = {};
            this.num = 0;
            
            this.thread = new Worker(workerScript);

            var Task = this;   
            this.thread.onmessage = function(event) {
                var taskId = event.data.taskId;
                var name = event.data.name;
                var value = event.data.value;
                Task.queue[taskId].resolve(value);
                delete Task.queue[taskId];
            };

            // TODO: onTaskRun, onTasking, onTaskEnd 핸들링 추가. 
            this.onTaskRun, this.onTasking, this.onTaskEnd;

        }

        post(name, value) {
            var taskId = name + '-' + this.num++;
            var task = {
                taskId: taskId,
                name: name,
                value: value,
            };
            this.thread.postMessage(task);  

            var methods = {};
            this.queue[taskId] = new Promise((resolve, reject) => {
                methods.resolve = resolve;
                methods.reject = reject;
            });
            this.queue[taskId].resolve = methods.resolve;
            this.queue[taskId].reject = methods.reject;

            return this.queue[taskId];
        }

    }

    // AssetsManager.js
    const LAYER$2 = 'AssetsManager: ';

    class AssetsManager {
        constructor(Viewer3D) {
            this.assetsPaths = Viewer3D.options.global.assetsPaths;
            // this.options = Viewer3D.options.loader;
            // this.useCache = this.options.useCache;
            // TODO: 오브젝트 분류
            this.models = {};
            this.meshes = {};
            this.textures = {};
            this.materials = {};
            this.animations = {};
            this.lights = {};
            this.cameras = {};
            this.helpers = {};

            this.Loader = Viewer3D.Loader;

            this.Tasks = new TaskManager({
                name: 'AssetsManager',
                // basePath: USERDATA.BASEPATH,
                basePath: '/engine/src/',
            });
            // this.Cache = this.Tasks.make('workers/localforage.worker.js');
            this.FBXParser = this.Tasks.make('workers/FBXLoader.custom.worker.js');

            // TODO: DB 삭제
            // 개발버전 및 버전업 검사
            if (USERDATA.info.version === '0.0.1') {
                localforage.dropInstance({ name: 'localforage' });
            }
            // localforage.dropInstance({ name: 'Viewer3D-dev' });

            this.makeDefaultAssets();
        }

        // 기본 어셋
        makeDefaultAssets() {
            var dummyTexture = this.makeTexture('dummy.png');
            dummyTexture.load();
        }

        // 모델
        makeModel(fileName, category = null, relativePath = '') {
            const Assets = this;

            this.models[fileName] = {
                name: fileName,
                file: this.assetsPaths.models + relativePath + fileName,
                type: 'model',
                category: category,
                mimeType: null,
                cacheUsed: false,
                embed: null,
                modified: 0,
                size: 0,
                loaded: 0,
                progress: 0,
                status: 'NONE',
                data: null,
                buffer: null,
                load: async function(forceUpdate) {
                    return await loadModel(this, Assets, forceUpdate);
                },
                onStart: null,
                onLoad: null,
                onProgress: null,
                onError: null,
            };
            
            return this.models[fileName];
        }

        // 텍스쳐
        makeTexture(fileName, category = null, relativePath = '') {
            const Assets = this;

            this.textures[fileName] = {
                name: fileName,
                file: this.assetsPaths.textures + relativePath + fileName,
                type: 'texture',
                category: category,
                mimeType: null,
                cacheUsed: false,
                embedded: null,
                modified: 0,
                size: 0,
                loaded: 0,
                width: 0,
                height: 0,
                progress: 0,
                status: 'NONE',
                data: null,
                buffer: null,
                load: async function(forceUpdate) {
                    return await loadTexture(this, Assets, forceUpdate);
                },
                onStart: null,
                onLoad: null,
                onProgress: null,
                onError: null,
            };

            return this.textures[fileName];
        }

        async getCache(asset) {

            return null;
            // var cachedFile = await localforage.getItem(asset.name);
            // var cachedFile = await this.Cache.post('getItem', { key: asset.name });

            // corrupted data
            if (!cachedFile || cachedFile.size === 0 || cachedFile.modified === 0 ||
                cachedFile.data instanceof Blob === true) {
                return null;
            }

            return cachedFile;
        }

        async setCache(asset) {

            return false;

            var item = {
                name: asset.name,
                file: asset.file,
                modified: asset.modified,
                size: asset.size,
                data: asset.buffer,
            };
            if (asset.embed) {
                item.embed = asset.embed;
            }
            /* if (asset.width && asset.height) {
                item.width = asset.width;
                item.height = asset.height;
            } */

            // localforage.setItem(asset.name, item);
            /* this.Cache.post('setItem', { 
                key: asset.name,
                item: item 
            }); */
        }

    }

    // TODO: 캐시 로드, 캐시 세이브 처리.
    async function loadModel(model, Assets, forceUpdate = false) {

        // 로드 시작
        console.log(LAYER$2 + 'LOAD:', model.name);
        if (typeof model.onStart === 'function') {
            model.onStart();
        }
        // var clock = new THREE.Clock();
        // clock.start();

        // try {
            // 파일 확장자 검사
            if (!model.mimeType) {
                const fileExt = model.name.substring(model.name.lastIndexOf('.') + 1, model.name.length).toLowerCase();
                if (fileExt === 'fbx') {
                    model.mimeType = 'application/fbx';
                } else {
                    console.error(LAYER$2 + 'MODEL LOAD ERROR: ' + model.name);
                }
            }

            // 캐시 로드
            // return fbxTree
            if (forceUpdate === false) {
                var cachedFile = await Assets.getCache(model);
            } else {
                var cachedFile = null;
            }

            // 모델 로드
            // 캐시사용시 return fbxTree, 사용하지 않을시 return arrayBuffer
            model = await requestAsset(model, cachedFile, forceUpdate);

            if (model.cacheUsed === false) {
                // arrayBuffer 파싱
                model.buffer = await Assets.FBXParser.post('parse', model.buffer);
            }

            // fbxTree 파싱
            var FBXTreeParser = new THREE.FBXTreeParser.Custom(model, Assets);
            var modelData = FBXTreeParser.parse(model.buffer);

            // 캐시 저장
            if (model.cacheUsed === false) {
                Assets.setCache(model);
            }
            model.buffer = null;
            delete model.buffer;

            // 추가 파라미터
            modelData.name = model.name;
            // modelData.parentOverride = false;

            model.data = modelData;
        /* }
        catch (error) {
            throw Error(error);
        } */

        // clock.getDelta();
        // console.log(model.name, clock.elapsedTime);
        // clock = null;

        if (typeof model.onLoad === 'function') {
            model.onLoad();
        }
        return model.data;
    }

    // TODO: 캐시 로드, 캐시 세이브 처리.
    async function loadTexture(texture, Assets, forceUpdate = false) {

        // 로드 시작
        // console.log(LAYER + 'LOAD:', texture.name);
        if (typeof texture.onStart === 'function') {
            texture.onStart();
        }

        // 파일 확장자 검사
        if (!texture.mimeType) {
            var fileExt = texture.name.substring(texture.name.lastIndexOf('.') + 1, texture.name.length).toLowerCase();
            if (fileExt === 'bmp') {
                texture.mimeType = 'image/bmp';
            } else if (fileExt === 'jpg' || fileExt === 'jpeg') {
                texture.mimeType = 'image/jpeg';
            } else if (fileExt === 'png') {
                texture.mimeType = 'image/png';
            } else if (fileExt === 'tif') {
                texture.mimeType = 'image/tiff';
            } else if (fileExt === 'tga') {
                texture.mimeType = 'image/tga';
            } else if (fileExt === 'svg') {
                texture.mimeType = 'image/svg+xml';
            } else {
                console.error(LAYER$2 + 'TEXTURE LOAD ERROR: ' + texture.name);
            }
        }

        setTimeout(function(){
            updateTexture(texture, Assets, forceUpdate);
        }, 10);

        // 더미 텍스쳐
        var dummyTexture = new THREE.Texture();
        texture.data = dummyTexture;
        if (texture.name !== 'dummy.png') {
            texture.data.image = Assets.textures['dummy.png'].data.image;
            texture.data.needsUpdate = true;
        }

        // 더미 텍스쳐 반환
        return texture.data;

    }

    async function updateTexture(texture, Assets, forceUpdate = false) {

        var textureData;
        if (forceUpdate === false) {
            var cachedFile = await Assets.getCache(texture);
        } else {
            var cachedFile = null;
        }

        // TODO: dds 텍스쳐 지원 추가
        // https://github.com/mrdoob/three.js/pull/13227
        try {
            // 임베디드 텍스쳐일 경우 리퀘스트 스킵
            if (texture.embedded && texture.buffer) {
                if (cachedFile && Assets.models[texture.embedded].cacheUsed === true) {
                    textureData = cachedFile.data;
                    texture.cacheUsed = true;
                } else {
                    textureData = texture.buffer;
                }

                if (textureData instanceof ArrayBuffer) {
                    texture.size = textureData.byteLength;
                } else {
                    texture.size = textureData.size;
                }
                
                texture.modified = Assets.models[texture.embedded].modified;
            } else {
                // var Task = Assets.Tasks.make('workers/requestAsset.worker.js');
                // Task.post('request', { url: texture.file });
                texture = await requestAsset(texture, cachedFile, forceUpdate);
                textureData = texture.buffer;
            }

            if (texture.mimeType === 'image/tga') {
                var loader = new THREE.TGALoader();
                texture.data.image = loader.parse(textureData);
                // texture.width = texture.data.image.width;
                // texture.height = texture.data.image.height;
                texture.data.needsUpdate = true;
            } else if (texture.mimeType === 'image/svg+xml') {
                var image = new Image();
                image.crossorigin = 'anonymous';
                image.src = window.URL.createObjectURL(new Blob([new Uint8Array(textureData)], { type: texture.mimeType }));
                image.width = 1024;
                image.height = 1024;
                texture.data.image = image;
                // console.dir(image)

                image.onload = () => {
                    texture.data.needsUpdate = true;
                };
            } else {
                var image = new Image();
                image.crossorigin = 'anonymous';
                image.src = window.URL.createObjectURL(new Blob([new Uint8Array(textureData)], { type: texture.mimeType }));
                texture.data.image = image;
                if (image.src.search(/\.jpe?g$/i) > 0 || image.src.search(/^data\:image\/jpeg/) === 0) {
                    texture.data.format = THREE.RGBFormat;
                } else {
                    texture.data.format = THREE.RGBAFormat;
                }

                image.onload = () => {
                    texture.data.needsUpdate = true;
                };
            }

            // 캐시 저장
            if (texture.cacheUsed === false) {
                Assets.setCache(texture);
            }
            texture.buffer = null;
            delete texture.buffer;

        }
        catch (error) {
            throw Error(error);
        }

        if (typeof texture.onLoad === 'function') {
            texture.onLoad();
        }
    }

    // TODO: progress 를 LoadingManager 를 통해 통합 계산 
    async function requestAsset(asset, cachedFile = null, forceUpdate = false) {

        try {
            var assetData;
            var useCache = false;
            
            // 캐시 체크
            if (cachedFile && cachedFile.file === asset.file) {
                useCache = true;
            }

            // XHR 다운로드 시작
            var xhr = new XMLHttpRequest();
            xhr.open('GET', asset.file, true);
            xhr.responseType = 'arraybuffer';
            if (forceUpdate === true) {
                xhr.setRequestHeader("Cache-Control", "no-cache");
            }
            xhr.send();

            asset.status = 'READY';
            var lengthComputable = false;
            var totalLength = 0;

            // 헤더 체크
            await new Promise((resolve) => {
                xhr.onreadystatechange = async function (event) {
                    if (this.readyState == this.HEADERS_RECEIVED) {
                        if (xhr.lengthComputable) {
                            lengthComputable = true;
                            totalLength = xhr.total;
                        } else {
                            totalLength = Number(xhr.getResponseHeader('content-length'));
                            if (totalLength > 0) {
                                lengthComputable = true;
                                var encoding = xhr.getResponseHeader('content-encoding');
                            }
                        }
                        asset.modified = Date.parse(xhr.getResponseHeader('Last-Modified'))/1000;
                        if (useCache === true && asset.modified === cachedFile.modified) {
                            useCacheData(xhr);
                        } else {
                            await continueRequest(xhr);
                        }
                        setTimeout(function(){
                            finishRequest();
                            resolve();  
                        }, 0);       
                    }
                };
            });

            async function continueRequest(xhr) {
                console.log('REDOWNLOAD', asset.name);
                asset.cacheUsed = false;
                var loadedLength = 0;
                xhr.onprogress = function (event) {
                    asset.status = 'DOWNLOADING';
                    loadedLength = event.loaded;
                    if (lengthComputable === true) {
                        asset.size = totalLength;
                        asset.loaded = loadedLength;
                        var progress = Math.round(loadedLength / totalLength * 100);
                        if (progress >= 100) {
                            progress = 100;
                            asset.status = 'LOADING';
                        }
                        asset.progress = progress;
                    } else {
                        asset.loaded = loadedLength;
                        asset.progress = 100;
                    }

                    if (typeof asset.onProgress === 'function') {
                        asset.onProgress();
                    }
                };

                // 다운로드 완료까지 대기
                assetData = await new Promise((resolve, reject) => {
                    xhr.onload = function (event) {
                        // console.log(xhr);
                        if (xhr.status == 200) {
                            asset.size = event.loaded;
                            resolve(xhr.response);
                        } else {
                            reject(Error(xhr.statusText));
                        }
                    };
                });
            }

            async function useCacheData(xhr) {
                console.log(LAYER$2 + 'USE CACHED:', asset.name);

                xhr.abort();
                // xhr = null;
                asset.cacheUsed = true;
                assetData = cachedFile.data;
                asset.size = cachedFile.size;
                asset.loaded = cachedFile.size;
                asset.progress = 100;
                asset.status = 'USE CACHED';
                // asset.status = 'LOADING';

                if (typeof asset.onProgress === 'function') {
                    asset.onProgress();
                }
            }

            async function finishRequest() {
                asset.buffer = assetData;
                asset.progress = 100;
                asset.status = 'DONE';

                if (typeof asset.onProgress === 'function') {
                    asset.onProgress();
                }
            }

        }
        catch (error) {
            asset.status = 'ERROR';
            if (typeof asset.onError === 'function') {
                asset.onError();
            }
            throw Error(error);
        }

        return asset;
    }

    // ComponentsMaker.js

    class ComponentsMaker {
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
            camera.targets = {};
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
            };
            
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
        
            camera.orbit = {};
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
            };
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

    // SFE Core

    if (window.SFE === undefined) {
        window.SFE = {};
    }
    SFE.LoadingManager = LoadingManager;
    SFE.TaskManager = TaskManager;
    SFE.AssetsManager = AssetsManager;
    SFE.ComponentsMaker = ComponentsMaker;

}());
