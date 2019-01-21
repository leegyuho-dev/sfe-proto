// AssetsManager.js
const LAYER = 'AssetsManager: ';

import { TaskManager } from './TaskManager.js';

export class AssetsManager {
    constructor(Viewer3D) {
        this.assetsPaths = Viewer3D.options.global.assetsPaths;
        // this.options = Viewer3D.options.loader;
        // this.useCache = this.options.useCache;
        // TODO: 오브젝트 분류
        this.models = {}
        this.meshes = {}
        this.textures = {}
        this.materials = {}
        this.animations = {}
        this.lights = {}
        this.cameras = {}
        this.helpers = {}

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
        }
        
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
        }

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
        }
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
    console.log(LAYER + 'LOAD:', model.name);
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
                console.error(LAYER + 'MODEL LOAD ERROR: ' + model.name);
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
            console.error(LAYER + 'TEXTURE LOAD ERROR: ' + texture.name);
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
            }
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
            }
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
        var compressed = false;

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
                            if (encoding === 'br' || encoding === 'gzip' || encoding === 'deflate') {
                                compressed = true;
                            }
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
            }
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
            }

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
                }
            });
        }

        async function useCacheData(xhr) {
            console.log(LAYER + 'USE CACHED:', asset.name);

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
