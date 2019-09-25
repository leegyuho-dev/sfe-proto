(function () {
    'use strict';

    // OptionsHandler.js
    const LAYER = 'SFEPlayer: ';

    /* import {
        getFileContents,
        parseJson,
        isEmpty,
        getFileExt,
    } from '../../common/functions.js'; */

    class OptionsHandler {

        async getDefault() {
            const url = USERDATA.paths.appPath + 
                        USERDATA.info.defaultConfig;
            try {
                const config = await SFE.getFileContents(url);
                if (config === false) {
                    throw Error(LAYER + 'CONFIG ERROR');
                }
                return SFE.parseJson(config);
            }
            catch (error) {
                throw Error(error);
            }
        }

        async getConfig(userConfig) {
            const url = USERDATA.paths.appPath + userConfig;
            const ext = SFE.getFileExt(url);
            if (ext !== 'json' && ext !== 'json5') {
                console.error(LAYER + 'CONFIGFILE IS NOT JSON');
                this.getDefault();
            }
            try {
                const config = await SFE.getFileContents(url);
                if (config === false) {
                    return this.getDefault();
                }
                console.log(LAYER + 'USERCONFIG LOADED');
                return SFE.parseJson(config);
            }
            catch (error) {
                throw Error(error);
            }
        }

        // TODO: 현재 플레이시간, 플레이모드, 카메라타겟, 오토스타트, 랜더링모드 등도 포함.
        getFromUrl(options) {
            // var newOptions = {}
            var url = location.search;
            var qs = url.substring(url.indexOf('?') + 1).split('&');
        
            for (var i = 0; i < qs.length; i++) {
                qs[i] = qs[i].split('=');
                var key = qs[i][0];
                var value = decodeURIComponent(qs[i][1]);
                if (!value || value == 'null' || value == 'undefined') {
                    continue;
                }

                // 옵션 검사 및 세팅
                if (key == 'model') {
                    var model = {};
                    Object.assign(model, options.defaultModel);
                    model.name = value;
                    options['models'] = [model];
                }
                
                else if (key == 'models') {
                    var models = value.split(',');
                    options['models'] = [];
                    for (var key in models) {
                        var model = {};
                        Object.assign(model, options.defaultModel);
                        model.name = models[key];
                        options['models'].push(model);
                    }
                }
                
                else if (key == 'camera_position' || key == 'camera-position') {
                    var values = value.split(',');
                    if (values.length != 3) {
                        continue;
                    }
                    value = [
                        Number(values[0]),
                        Number(values[1]),
                        Number(values[2])
                    ];
                    options['camera']['position'] = value;
                } 
                
                else if (key == 'camera_target' || key == 'camera-target') {
                    var values = value.split(',');
                    if (values.length != 3) {
                        continue;
                    }
                    value = [
                        Number(values[0]),
                        Number(values[1]),
                        Number(values[2])
                    ];
                    options['camera']['target'] = value;
                } 
                
                else if (key == 'autostart') {
                    if (value == 'true' || value == '1') {
                        value = true;
                    } else if (value == 'false' || value == '0') {
                        value = false;
                    }
                    options['player']['autoStart'] = value;
                }

                else if (key == 'starttime') {
                    if (value.indexOf(':') !== -1) {
                        value = value.replace(/:/g, '.');
                    }
                    options['player']['startTime'] = Number(value);
                }

                else if (key == 'focustarget') {
                    if (value === 'center' ||  value === 'root') {
                        options['camera']['focusTarget'] = value;
                    }
                }

                else if (key == 'outline') {
                    if (value == 'true' || value == '1') {
                        value = true;
                    } else if (value == 'false' || value == '0') {
                        value = false;
                    }
                    options['effect']['outline']['enabled'] = value;
        
                }
            }
            return options;
        }

        assignNew(options, userOptions, zeroDepth = true) {
            var newOption = {};
            for (var key in options) {
                if (userOptions[key] === undefined) {
                    newOption[key] = options[key];
                } else {
                    if (zeroDepth === true && key === 'models') {
                        var defaultModel = options.defaultModel;
                        if (!SFE.isEmpty(userOptions.models)) {
                            newOption.models = [];
                            for (var index in userOptions.models) {
                                var model = this.assignNew(defaultModel, userOptions.models[index], false);
                                newOption.models.push(model);
                            }
                        } else {
                            newOption.models = [defaultModel];
                        }
                    } else {
                        if (typeof options[key] == 'object') {
                            newOption[key] = this.assignNew(options[key], userOptions[key], false);
                        } else {
                            newOption[key] = userOptions[key];
                        }
                    }
                }
            }
            return newOption;
        }

    }

    // Object3DHandler.js

    /* import {
        isEmpty,
        isArray,
        isObject,
    } from '../../common/functions.js'; */

    class Object3DHandler {
        constructor() {
        }

        ready(model, Assets, options) {
            // 메시 객체
            model.meshes = {};
            // 매터리얼 객체
            model.materials = {};
            // 본 객체
            model.bones = {};
        
            const defaultMaterials = {};
            // https://threejs.org/docs/#api/en/core/Object3D.traverse
            model.traverse(function (child) {
                if (child.isMesh) {
                    var childMesh = child;
                    model.meshes[childMesh.name] = childMesh;
                    Assets.meshes[childMesh.name] = childMesh;
                    // 모델 메시 및 매터리얼 처리
                    childMesh.castShadow = options.mesh.castShadow;
                    childMesh.receiveShadow = options.mesh.receiveShadow;
                    childMesh.frustumCulled = options.mesh.frustumCulled;
                    // child.visible = false;
        
                    childMesh.materialSlots = {};
                    if (SFE.isArray(childMesh.material)) {
                        for (var key in childMesh.material) {
                            var materialName = childMesh.material[key].name;
                            childMesh.material[key].fog = options.material.fog;
                            defaultMaterials[materialName] = childMesh.material[key];
                            childMesh.materialSlots[key] = materialName;
        
                            if (Assets.materials[materialName] === undefined) {
                                Assets.materials[materialName] = {};
                            }
                            Assets.materials[materialName].default = childMesh.material[key];
                        }
                    } else {
                        var materialName = childMesh.material.name;
                        childMesh.material.fog = options.material.fog;
                        defaultMaterials[materialName] = childMesh.material;
                        childMesh.materialSlots = materialName;
        
                        if (Assets.materials[materialName] === undefined) {
                            Assets.materials[materialName] = {};
                        }
                        Assets.materials[materialName].default = childMesh.material;
                    }
                } else if (child.isBone && child.name !== child.parent.name) {
                    var childBone = child;
                    // 본 객체 생성
                    model.bones[child.name] = childBone;
                }
            });
            model.materials = defaultMaterials;
        
            // 본 객체 참조 추가
            if (!SFE.isEmpty(model.bones)) {
                // 루트본 그룹
                // const rootName = model.animations[0].tracks[0].name.split('.')[0];
                for (var key in model.children) {
                    if (model.children[key].type === 'Group' && !SFE.isEmpty(model.children[key].children) ||
                        model.children[key].type === 'Bone' && !SFE.isEmpty(model.children[key].children)) {
                        if (model.children[key].children[0].type === 'Bone') {
                            model.bones.root = model.children[key];
                        }
                    }
                }
                // 스켈레톤 헬퍼 추가
                /* this.helpers.skeleton = new THREE.SkeletonHelper( model.bones.root );
                // this.helpers.skeleton.material.linewidth = 10;
                this.helpers.add(this.helpers.skeleton);
                console.log(this.helpers.skeleton);
        
                // https://discourse.threejs.org/t/object-bounds-not-updated-with-animation/3749/7
                this.helpers.boundingBox = new THREE.BoxHelper(this.helpers.skeleton, 0x00ff00);
                this.helpers.add(this.helpers.boundingBox); */
        
            }
        
            return model;
        
        }

        add(model, Assets, options) {
            const defaultMaterials = model.materials;
            /* var defaultMaterials = {}
            for (var index in model.children) {
                var child = model.children[index];
                if (child.materialSlots !== undefined) {
                    if (SFE.isObject(child.materialSlots)) {
                        for (var i in child.materialSlots) {
                            var materialName = child.materialSlots[i];
                            if (defaultMaterials[materialName] === undefined) {
                                defaultMaterials[materialName] = Assets.materials[materialName].default; 
                            }
                        }
                    } else {
                        var materialName = child.materialSlots;
                        if (defaultMaterials[materialName] === undefined) {
                            defaultMaterials[materialName] = Assets.materials[materialName].default; 
                        }
                    }
                }
            } */
        
            // 추가 매터리얼 및 메시
            // model.materials.diffuse = {}
            // model.materials.flat = {}
            // model.materials.edgedFace = {}
            // model.materials.wireframe = {}
            // model.materials.toon = {}
            // model.materials.cel = {}
            // model.materials.outline = {}
            // model.materials.outlineDefault = {}
        
            // 매터리얼 복사
            for (var materialName in defaultMaterials) {
        
                // 디퓨즈 매터리얼
                var diffuseMaterial = new THREE.MeshBasicMaterial();
                diffuseMaterial.copy(defaultMaterials[materialName]);
                diffuseMaterial.lights = false;
                diffuseMaterial.specularMap = null;
                diffuseMaterial.envMap = null;
                diffuseMaterial.emissiveMap = null;
                diffuseMaterial.normalMap = null;
                Assets.materials[materialName].diffuse = diffuseMaterial;
        
                // 플랫 매터리얼
                var flatMaterial = new THREE.MeshPhongMaterial();
                flatMaterial.copy(defaultMaterials[materialName]);
                flatMaterial.flatShading = true;
                flatMaterial.color = new THREE.Color(0.8, 0.8, 0.8);
                flatMaterial.side = 0;
                flatMaterial.opacity = 1;
                flatMaterial.transparent = false;
                flatMaterial.blending = 1;
                flatMaterial.map = null;
                flatMaterial.specularMap = null;
                flatMaterial.specular = new THREE.Color(0x000000);
                flatMaterial.envMap = null;
                flatMaterial.reflectivity = 0;
                flatMaterial.shininess = 0;
                flatMaterial.emissive = new THREE.Color(0x000000);
                flatMaterial.emissiveIntensity = 0;
                flatMaterial.emissiveMap = null;
                flatMaterial.normalMap = null;
                flatMaterial.polygonOffset = true;
                flatMaterial.polygonOffsetFactor = 1;
                flatMaterial.polygonOffsetUnits = 1;
                Assets.materials[materialName].flat = flatMaterial;
                Assets.materials[materialName].edgedFace = flatMaterial;
        
                // 플랫 매터리얼 (블랙)
                /* var flatMaterial = new THREE.MeshPhongMaterial();
                flatMaterial.copy(defaultMaterials[materialName]);
                flatMaterial.color = new THREE.Color(0x000000);
                flatMaterial.side = 0;
                flatMaterial.opacity = 1;
                flatMaterial.transparent = false;
                flatMaterial.blending = 1;
                flatMaterial.map = null;
                flatMaterial.specularMap = null;
                flatMaterial.specular = new THREE.Color(0.2, 0.2, 0.2);
                flatMaterial.shininess = 0;
                flatMaterial.envMap = null;
                flatMaterial.reflectivity = 0;
                flatMaterial.emissive = new THREE.Color(0x000000);
                flatMaterial.emissiveIntensity = 0;
                flatMaterial.emissiveMap = null;
                flatMaterial.normalMap = null;
                flatMaterial.polygonOffset = true;
                flatMaterial.polygonOffsetFactor = 1;
                flatMaterial.polygonOffsetUnits = 1; */
        
                // 와이어프레임 매터리얼
                var wireframeMaterial = new THREE.MeshPhongMaterial();
                wireframeMaterial.copy(flatMaterial);
                wireframeMaterial.wireframe = true;
                wireframeMaterial.color = new THREE.Color(0x000000);
                wireframeMaterial.opacity = 0.2;
                wireframeMaterial.transparent = true;
                // wireframeMaterial.depthWrite = false;
                Assets.materials[materialName].wireframe = wireframeMaterial;
        
                // 와이어프레임 매터리얼 (화이트)
                /* var wireframeMaterial = new THREE.MeshPhongMaterial();
                wireframeMaterial.copy(flatMaterials[materialName]);
                wireframeMaterial.wireframe = true;
                wireframeMaterial.color = new THREE.Color(0.1, 0.1, 0.1);
                wireframeMaterial.opacity = 0.5;
                wireframeMaterial.transparent = true;
                wireframeMaterial.specular = new THREE.Color(0.8, 0.8, 0.8);
                wireframeMaterial.shininess = 12; */
        
                // 툰 매터리얼
                // var toonMaterial = new THREE.MeshToonMaterial();
                // toonMaterial.copy(defaultMaterials[materialName]);
                // toonMaterial.gradientMap = null;
                // toonMaterial.emissiveIntensity = 0;
                // toonMaterial.emissiveMap = null;
                // Assets.materials[materialName].toon = toonMaterial;
        
                // 셀 매터리얼
                // var celMaterial = new THREE.MeshCelShaderMaterial(defaultMaterials[materialName]);
                // Assets.materials[materialName].cel = celMaterial;
        
                // 아웃라인 매터리얼
                // var outlineMaterial = new THREE.MeshOutlineMaterial(defaultMaterials[materialName], options.outline);
                // var outlineMaterialDefault = new THREE.MeshOutlineMaterial(defaultMaterials[materialName], options.outline, true);
                // Assets.materials[materialName].outline = outlineMaterial;
                // Assets.materials[materialName].outlineDefault = outlineMaterialDefault;
            }
            
            // 메시 복사
            // objectId = shadingMode
            const clonesMeshes = {
                wireframes: 'wireframe',
                // outlines: (options.outline.enabled === true)? 'outline' : 'outlineDefault',
            };
        
            for (var objectId in clonesMeshes) {
                const group = new THREE.Group();
                group.name = objectId;
                group.visible = false;
                var shadingMode = clonesMeshes[objectId]; 
                for (var key in model.meshes) {
                    var clonedMesh = model.meshes[key].clone();
                    clonedMesh.material = [];
                    if (clonedMesh.type === 'SkinnedMesh') {
                        clonedMesh.bind(model.meshes[key].skeleton, model.meshes[key].matrix);
                    }
                    clonedMesh.morphTargetDictionary = model.meshes[key].morphTargetDictionary;
                    clonedMesh.morphTargetInfluences = model.meshes[key].morphTargetInfluences;
                    clonedMesh.materialSlots = model.meshes[key].materialSlots;
                    if (objectId === 'wireframes' || objectId === 'outlines') {
                        clonedMesh.castShadow = false;
                        clonedMesh.receiveShadow = false;
                    }
        
                    if (SFE.isObject(clonedMesh.materialSlots)) {
                        for (var index in clonedMesh.materialSlots) {
                            var materialName = clonedMesh.materialSlots[index];
                            clonedMesh.material.push(Assets.materials[materialName][shadingMode]);
                        }
                    } else {
                        var materialName = clonedMesh.materialSlots;
                        clonedMesh.material = Assets.materials[materialName][shadingMode];
                    }
        
                    group.add(clonedMesh);
                }
                model[objectId] = group;
                model.add(group);
            }
            /* if (options.outline.enabled === true) {
                model.outlines.visible = true;
            } */
        
            // 스켈레톤 헬퍼 추가
            /* if (!SFE.isEmpty(model.bones)) {
                this.helpers.skeleton = new THREE.SkeletonHelper( model.bones.root );
                // this.helpers.skeleton.material.linewidth = 10;
                this.helpers.add(this.helpers.skeleton);
                console.log(this.helpers.skeleton);
        
                // https://discourse.threejs.org/t/object-bounds-not-updated-with-animation/3749/7
                this.helpers.boundingBox = new THREE.BoxHelper(this.helpers.skeleton, 0x00ff00);
                this.helpers.add(this.helpers.boundingBox);
        
            } */
        
            return model;
        
        }

    }

    // VueUIModeler.js
    const LAYER$2 = 'SFEPlayer: ';

    /* import {
        isEmpty,
    } from '../../common/functions.js'; */

    class VueUIModeler {

        constructor(Viewer3D) {
            Vue.directive('ready', {});

            // Viewer3D 데이터
            this.Viewer3D = Viewer3D;
            this.V3Doptions = this.Viewer3D.options; 

            // Viewer3D 객체
            this.V3Dcontrols = this.Viewer3D.controls;
            this.V3Dcamera = this.Viewer3D.camera;
            // 플레이어 데이터
            this.V3Dmodel, this.V3Danimation,
            this.V3Dmixer, this.V3Daction;

            this.Viewer;
            this.VueUI, this.VueData;
            // this.Controller;
        }

        makeVueUI() {
            const options = this.V3Doptions;

            // UI 엘리먼트 검사
            let elementId = options.ui.elementId;
            if (SFE.isEmpty(elementId)) {
                console.error(LAYER$2 + 'VueUI:', 'ELEMENTID REQUIRED');
                return false;
            }
            if (elementId.substring(0, 1) !== '#') {
                elementId = '#' + elementId;
            }
            if (!document.querySelector(elementId)) {
                console.error(LAYER$2 + 'VueUI:', 'UI CONTAINER NOT EXIST');
                return false;
            }

            this.defineVueData();
            this.makeVueComponents();

            this.VueUI = new Vue({
                el: '#viewer3d_ui',
                data: this.VueData,
                methods: {
                    touch: function (event) {
                        if (!SFE.isEmpty(this.ui.events) && typeof this.ui.events.touch === "function") {
                            this.ui.events.touch(event);
                        }
                    },
                    mouseInput: function (event) {
                        if (!SFE.isEmpty(this.ui.events) && typeof this.ui.events.mouseInput === "function") {
                            this.ui.events.mouseInput(event);
                        }
                    },
                },
            });

            return this.VueUI;
        }

        defineVueData() {
            const Viewer3D = this.Viewer3D;
            const VueCanvas = this.Viewer3D.VueCanvas;
            const V3Doptions = this.V3Doptions;

            // UI 옵션
            const globalOptions = V3Doptions.global;
            const modelsOptions = V3Doptions.models;
            const uiOptions = V3Doptions.ui;

            // 스탯 데이터
            const statsOptions = uiOptions.stats;
            let statsLists = {};
            for (var key in statsOptions.data) {
                if (statsOptions.data[key] === true) {
                    statsLists[key] = null;
                }
            }

            this.VueData = {
                canvas: VueCanvas.data,
                ui: {
                    name: 'ui',
                    use: true,
                    display: uiOptions.display,
                    ready: false,
                    events: {},
                },
                overlay: {
                    name: 'overlay',
                    use: true,
                    display: true,
                    color: 'black',
                    dimming: true,
                    events: {},
                },
                message: {
                    name: 'message',
                    use: true,
                    display: true,
                    class: 'info', // info, success, warning, danger
                    value: '',
                    icon: 'xi-info-o',
                    events: {},
                },
                info: {
                    name: 'info',
                    use: true,
                    display: true,
                    title: globalOptions.title,
                    model: modelsOptions[0].name,
                    description: globalOptions.description,
                    author: globalOptions.author,
                    icon: 'xi-info-o',
                    events: {},
                },

                stats: {
                    name: 'stats',
                    use: statsOptions.use,
                    display: true,
                    title: 'WebGL',
                    lists: statsLists,
                    events: {},
                },

                share: {
                    name: 'share',
                    use: true,
                    display: true,
                    linkUrl: 'linkUrl',
                    events: {},

                    download: {
                        name: 'download',
                        icon: 'xi-download',
                        button: {
                            name: '',
                            icon: '',
                            active: false,
                            deactive: false,
                            popup: false,
                            events: {
                                click: {},
                            },
                        }
                    },
                    screenshot: {
                        name: 'screenshot',
                        icon: 'xi-image-o',
                        button: {
                            name: '',
                            icon: '',
                            active: false,
                            deactive: false,
                            popup: false,
                            events: {
                                click: {},
                            },
                        }
                    },
                    link: {
                        name: 'link',
                        icon: 'xi-link',
                        button: {
                            name: '',
                            icon: '',
                            active: false,
                            deactive: false,
                            popup: false,
                            events: {
                                click: {},
                            },
                        },
                        menu: {
                            name: '',
                            icon: '',
                            type: 'window',
                            show: false,
                            active: false,
                            deactive: false,
                            popup: false,
                            /* items: {
                                url: '',
                            }, */
                            events: {},
                        },
                    },
                    share: {
                        name: 'share',
                        icon: 'xi-share-alt',
                        button: {
                            name: '',
                            icon: '',
                            active: false,
                            deactive: false,
                            popup: false,
                            events: {
                                click: {},
                            },
                        }
                    },

                },

                camera: {
                    name: 'camera',
                    use: true,
                    display: true,
                    mode: 'free',
                    focused: 'free',
                    events: {},

                    rotate: {
                        name: 'rotate',
                        icon: 'xi-renew',
                        button: {
                            name: '',
                            icon: '',
                            active: false,
                            deactive: false,
                            popup: false,
                            events: {
                                click: {},
                            },
                        }
                    },
                    pan: {
                        name: 'pan',
                        icon: 'xi-arrows',
                        button: {
                            name: '',
                            icon: '',
                            active: false,
                            deactive: false,
                            popup: false,
                            events: {
                                click: {},
                            },
                        }
                    },
                    zoom: {
                        name: 'zoom',
                        icon: 'xi-zoom-in',
                        button: {
                            name: '',
                            icon: '',
                            active: false,
                            deactive: false,
                            popup: false,
                            events: {
                                click: {},
                            },
                        }
                    },
                    focus: {
                        name: 'focus',
                        icon: 'xi-focus-frame',
                        button: {
                            name: '',
                            icon: '',
                            active: false,
                            deactive: false,
                            popup: false,
                            events: {
                                click: {},
                            },
                        }
                    },
                    reset: {
                        name: 'reset',
                        icon: 'xi-close-circle-o',
                        button: {
                            name: '',
                            icon: '',
                            active: false,
                            deactive: false,
                            popup: false,
                            events: {
                                click: {},
                            },
                        }
                    },

                },

                player: {
                    name: 'player',
                    use: false,
                    display: true,
                    paused: true,
                    reverse: false,
                    loopMode: V3Doptions.player.loopMode,
                    playMode: 'time',
                    onStepPlay: false,
                    duration: 0,
                    time: 0,
                    timeDuration: 0,
                    timeScale: 1,
                    // timeline: 0,
                    timeProgress: 0,
                    frame: 0,
                    frameTime: 0,
                    frameRate: 0,
                    frameCount: 0,
                    frameLength: 0,
                    events: {},

                    play: {
                        name: 'play',
                        // name: 'pause',
                        icon: 'xi-play',
                        // icon: 'xi-pause',
                        button: {
                            name: '',
                            icon: '',
                            active: true,
                            deactive: false,
                            popup: false,
                            events: {
                                click: {},
                            },
                        }
                    },
                    forward: {
                        name: 'forward',
                        icon: 'xi-step-forward',
                        button: {
                            name: '',
                            icon: '',
                            active: false,
                            deactive: false,
                            popup: false,
                            events: {
                                click: {},
                            },
                        }
                    },
                    backward: {
                        name: 'backward',
                        icon: 'xi-step-backward',
                        button: {
                            name: '',
                            icon: '',
                            active: false,
                            deactive: false,
                            popup: false,
                            events: {
                                click: {},
                            },
                        }
                    },
                    repeat: {
                        name: 'repeat',
                        icon: 'xi-repeat',
                        button: {
                            name: '',
                            icon: '',
                            active: false,
                            deactive: false,
                            popup: false,
                            events: {
                                click: {},
                            },
                        }
                    },
                    tune: {
                        name: 'tune',
                        icon: 'xi-tune',
                        button: {
                            name: '',
                            icon: '',
                            active: false,
                            deactive: false,
                            popup: false,
                            events: {
                                click: {},
                            },
                        },
                        menu: {
                            name: '',
                            icon: '',
                            type: 'window',
                            show: false,
                            active: false,
                            deactive: false,
                            popup: false,
                            /* items: {
                                url: '',
                            }, */
                            events: {},
                        },
                    },

                    timeline: {
                        name: 'timeline',
                        icon: 'xi-time-o xi-flip-horizontal',
                        menu: {
                            name: '',
                            icon: '',
                            type: 'slide',
                            orient: 'horizontal',
                            show: true,
                            active: false,
                            deactive: false,
                            popup: false,
                            events: {},
                        }
                    },
                    counter: {
                        name: 'counter',
                        icon: 'xi-time-o xi-flip-horizontal',
                        button: {
                            name: '',
                            icon: '',
                            active: false,
                            deactive: false,
                            popup: false,
                            events: {
                                click: {},
                            },
                        }
                    },

                },

                setting: {
                    name: 'setting',
                    use: true,
                    display: true,
                    events: {},

                    blur: VueCanvas.data.blur,
                    fitScreen: VueCanvas.data.fitScreen,
                    aspectRatio: VueCanvas.data.aspectRatio,
                    screenWidth: Viewer3D.container.clientWidth,
                    screenHeight: Viewer3D.container.clientHeight,
                    renderingWidth: VueCanvas.data.width,
                    renderingHeight: VueCanvas.data.height,

                    fov: V3Doptions.camera.fov,
                    
                    pixelRatio: 1,
                    shadingMode: 'default',
                    outlineEnabled: V3Doptions.effect.outline.enabled,
                    // antialias: true,
                    gammaFactor: 2,
                    gammaInput: true,
                    gammaOutput: true,
                    shadowMapEnabled: true,
                    shadowMapType: 'PCFSoftShadowMap',
                    shadowMapSize: V3Doptions.light.directionalLight.shadow.mapSize,

                    textureFilter: true,
                    textureMipMap: true,
                    anisotropicFilter: 1,
                    
                    help: {
                        name: 'help',
                        icon: 'xi-help-o',
                        button: {
                            name: '',
                            icon: '',
                            active: false,
                            deactive: false,
                            popup: false,
                            events: {
                                click: {},
                            },
                        }
                    },
                    display: {
                        name: 'display',
                        icon: 'xi-desktop',
                        button: {
                            name: '',
                            icon: '',
                            active: false,
                            deactive: false,
                            popup: false,
                            events: {
                                click: {},
                            },
                        },
                        menu: {
                            name: '',
                            icon: '',
                            type: 'window',
                            show: false,
                            active: false,
                            deactive: false,
                            popup: {
                                pixelRatio: false,
                                fieldOfView: false,
                            },
                            events: {},
                        },
                    },
                    rendering: {
                        name: 'rendering',
                        icon: 'xi-library-books-o',
                        button: {
                            name: '',
                            icon: '',
                            active: false,
                            deactive: false,
                            popup: false,
                            events: {
                                click: {},
                            },
                        },
                        menu: {
                            name: '',
                            icon: '',
                            type: 'window',
                            show: false,
                            active: false,
                            deactive: false,
                            popup: false,
                            events: {},
                        },
                    },
                    setting: {
                        name: 'setting',
                        icon: 'xi-cog',
                        button: {
                            name: '',
                            icon: '',
                            active: false,
                            deactive: false,
                            popup: false,
                            events: {
                                click: {},
                            },
                        }
                    },

                },
            };

        }

        makeVueComponents() {
            const Viewer3D = this.Viewer3D;
            const VueData = this.VueData;
            const options = this.V3Doptions;
            const iPrefix = 'xi ';
            // 시간
            const date = new Date();
            // 언어
            const LANGS = USERDATA.langs[USERDATA.info.appId];

            // 이벤트 메소드
            const methods = {
                click: function (event) {
                    if (!SFE.isEmpty(this.data.events) && typeof this.data.events.click === "function") {
                        this.data.events.click(event, this.data);
                    }
                },
                hover: function (event) {
                    if (!SFE.isEmpty(this.data.events) && typeof this.data.events.hover === "function") {
                        this.data.events.hover(event, this.data);
                    }
                },
                touch: function (event) {
                    if (!SFE.isEmpty(this.data.events) && typeof this.data.events.touch === "function") {
                        this.data.events.touch(event);
                    }
                },
                input: function (event) {
                    if (!SFE.isEmpty(this.data.events) && typeof this.data.events.input === "function") {
                        this.data.events.input(event, this.data);
                    }
                },
                mouseInput: function (event) {
                    if (!SFE.isEmpty(this.data.events) && typeof this.data.events.mouseInput === "function") {
                        this.data.events.mouseInput(event, this.data);
                    }
                },
                change: function (event) {
                    if (!SFE.isEmpty(this.data.events) && typeof this.data.events.change === "function") {
                        this.data.events.change(event, this.data);
                    }
                },
                transition: function (event) {
                    if (!SFE.isEmpty(this.data.events) && typeof this.data.events.transition === "function") {
                        this.data.events.transition(event, this.data);
                    }
                },
            };

            // 포지션 클래스 메소드
            const getPositionClasses = this.getPositionClasses;


            // Vue Components
            
            // 오버레이
            Vue.component('v3d-overlay', {
                props: ['data', 'message'],
                template: `
                <div id="ui_overlay">
                    <v3d-message :data="message"></v3d-message>
                    <div class="dimming" :class="classes" 
                    v-on:transitionend="transition"></div>
                </div>
            `,
                computed: {
                    classes: function () {
                        return [
                            this.data.color,
                            {
                                show: this.data.dimming,
                            }
                        ]
                    },
                },
                methods: {
                    transition: methods.transition,
                },
            });

            // 메시지
            Vue.component('v3d-message', {
                props: ['data'],
                template: `
                <div v-if="data.value" id="ui_message" class="info"
                    v-on:mouseenter="hover"
                    v-on:mouseleave="hover"
                >
                    <div class="msg" :class="data.class">
                        <i :class="icon"></i>{{ data.value }}
                    </div>
                </div>
            `,
                computed: {
                    icon: function () {
                        // TODO: 메시지 타입에 따라 아이콘 변경
                        return iPrefix + this.data.icon;
                    }
                },
                methods: {
                    hover: methods.hover,
                },
            });

            // 슬라이드메뉴
            Vue.component('v3d-menu-slide', {
                props: ['data'],
                template: `
                <div v-if="data" class="menu" :class="classes">
                    <div class="line">
                        <input :name="data.name" type="range" class="pointer" orient="vertical" 
                        v-on:input="input"
                        step="0.1" min="0.1" max="1" :value="1">
                    </div>
                </div>
            `,
                computed: {
                    classes: function () {
                        return [
                            this.data.type,
                            this.data.orient, 
                            {
                                show: this.data.show,
                            }
                        ]
                    },
                },
                methods: { 
                    input: methods.input, 
                },
            });

            // 팝업 타이틀
            Vue.component('v3d-popup-title', {
                props: ['data', 'text', 'offset'],
                template: `
                <div class="popup" :class="show" :style="offsets">
                    {{ text }}
                </div>
            `,
                computed: {
                    show: function () {
                        if (this.$parent.data.menu !== undefined) {
                            if (this.$parent.data.menu.show !== true) {
                                return (this.data? 'show' : null);
                            }
                        } else {
                            return (this.data? 'show' : null);
                        }
                    },
                    offsets: function () {
                        if (this.offset !== undefined) {
                            return 'left:' + this.offset + 'px';
                        }
                    },
                },
            });

            // 버튼
            Vue.component('v3d-button', {
                props: ['name', 'icon', 'data', 'menu'],
                template: `
                <div :id="id" class="button">
                <button type="button" :class="classes" 
                    v-on:click="click"
                    v-on:mouseover="hover"
                    v-on:mouseout="hover"
                    v-on:mousedown="mouseInput"
                >
                <i :class="icons"></i>
                </button>
                <v3d-popup-title :data="data.popup" :text="title"></v3d-popup-title>
                <v3d-menu-slide v-if="data.menu && data.menu.type==='slide'" :data="data.menu"></v3d-menu-slide>
                </div>
            `,
                computed: {
                    id: function () {
                        if (this.name !== undefined) {
                            this.data.name = this.name;
                        }
                        if (this.icon !== undefined) {
                            this.data.icon = this.icon;
                        }
                        if (this.menu !== undefined) {
                            this.data.menu = this.menu;
                        }
                        return 'button_' + this.data.name;
                    },
                    icons: function () {
                        return iPrefix + this.data.icon;
                    },
                    title: function () {
                        const category = this.$parent.data.name;
                        const name = this.data.name;
                        return SFE.getLang(() => LANGS[category], name);
                    },
                    classes: function () {
                        return [
                            this.data.name,
                            {
                                active: this.data.active,
                                deactive: (this.data.deactive || SFE.isEmpty(this.data.events.click)),
                            }
                        ]
                    },
                },
                methods: { 
                    click: methods.click, 
                    hover: methods.hover,
                    mouseInput: methods.mouseInput,
                },
            });

            // 스탯
            Vue.component('v3d-stats', {
                props: ['data'],
                template: `
                <div v-if="data.use" id="ui_stats" class="info" 
                    v-on:mouseenter="hover"
                    v-on:mouseleave="hover"
                >
                    <div class="title">{{ data.title }}</div>
                    <v3d-statslist 
                        v-for="(value, key) in data.lists" 
                        :key="key" :value="value"
                    >
                    </v3d-statslist>
                </div>
            `,
                components: {
                    'v3d-statslist': {
                        props: ['value'],
                        template: `
                        <div class="list">
                            <span class="label">{{ this.$vnode.key }}: </span>
                            <span class="value">{{ value }}</span>
                        </div>
                    `,
                    }
                },
                methods: { 
                    hover: methods.hover,
                },
            });

            // 타이틀
            Vue.component('v3d-title', {
                props: ['data'],
                template: `
                <div id="ui_title" class="info" 
                    v-on:mouseenter="hover"
                    v-on:mouseleave="hover"
                >
                    {{ title }}
                </div>
            `,
                computed: {
                    title: function () {
                        let title = this.data.title;
                        if (SFE.isEmpty(title)) {
                            title = this.data.model;
                        }
                        // FIXME: 임시코드, 차후 앱 체인지 기능 추가후 교체
                        if (VIEWMODEL.VueSite !== undefined) {
                            VIEWMODEL.VueSite.SiteData.appInfo.target = title;
                        }
                        return title;
                    }
                },
                methods: { 
                    hover: methods.hover,
                },
            });
            // 설명
            Vue.component('v3d-description', {
                props: ['data'],
                template: `
                <div v-if="data.description" id="ui_info" class="info" 
                    v-on:mouseenter="hover"
                    v-on:mouseleave="hover"
                >
                    <i :class="icon"></i>
                    {{ data.description }}
                </div>
            `,
                computed: {
                    icon: function () {
                        return iPrefix + this.data.icon;
                    }
                },
                methods: { 
                    hover: methods.hover,
                },
            });
            // 카피라이트
            // TODO: 라이센스 표시 기능 추가
            Vue.component('v3d-copyright', {
                props: ['data'],
                template: `
                <div v-if="data.author" id="ui_copyright" class="info" 
                    v-on:mouseenter="hover"
                    v-on:mouseleave="hover"
                >
                    {{ copyright }}
                </div>
            `,
                computed: {
                    copyright: function () {
                        return [
                            'Copyright ©',
                            date.getFullYear(),
                            this.data.author,
                        ].join(' ');
                    }
                },
                methods: { 
                    hover: methods.hover,
                },
            });
            // 카메라 메뉴
            Vue.component('v3d-camera', {
                props: ['data'],
                template: `
                <div v-if="data.use" id="ui_camera" class="tools" :class="classes" 
                    :focused="focused"
                    v-on:mouseenter="hover"
                    v-on:mouseleave="hover"
                >
                    <v3d-button :name="data.rotate.name" :icon="data.rotate.icon" :data="data.rotate.button"></v3d-button>
                    <v3d-button :name="data.pan.name" :icon="data.pan.icon" :data="data.pan.button"></v3d-button>
                    <v3d-button :name="data.zoom.name" :icon="data.zoom.icon" :data="data.zoom.button"></v3d-button>
                    <v3d-button :name="data.focus.name" :icon="data.focus.icon" :data="data.focus.button"></v3d-button>
                    <v3d-button :name="data.reset.name" :icon="data.reset.icon" :data="data.reset.button"></v3d-button>
                </div>
            `,
                data: function() {
                    return {
                        classes: getPositionClasses(this),
                    }
                },
                computed: {
                    focused: function () {
                        if (this.data.focused === 'free') {
                            this.data.focus.name = 'freeCamera';
                            this.data.focus.icon = 'xi-focus-frame';
                        } else if (this.data.focused === 'center') {
                            this.data.focus.name = 'fixedCamera';
                            this.data.focus.icon = 'xi-focus-center';
                        } else if (this.data.focused === 'root') {
                            this.data.focus.name = 'calibratedCamera';
                            this.data.focus.icon = 'xi-focus-weak';
                        }
                        return this.data.focused;
                    },
                },
                methods: { 
                    hover: methods.hover,
                },
            });

            // 공유 메뉴
            Vue.component('v3d-share', {
                props: ['data'],
                template: `
                <div v-if="data.use" id="ui_share" 
                    class="tools" :class="classes" 
                    v-on:mouseenter="hover"
                    v-on:mouseleave="hover"
                >
                    <v3d-button :name="data.download.name" :icon="data.download.icon" :data="data.download.button"></v3d-button>
                    <v3d-button :name="data.screenshot.name" :icon="data.screenshot.icon" :data="data.screenshot.button"></v3d-button>
                    <v3d-button :name="data.link.name" :icon="data.link.icon" :data="data.link.button" :menu="data.link.menu"></v3d-button>
                    <v3d-button :name="data.share.name" :icon="data.share.icon" :data="data.share.button"></v3d-button>

                    <v3d-menu-link :name="data.link.name" :icon="data.link.icon" :data="data.link.menu"></v3d-menu-link>
                </div>
            `,
                data: function() {
                    return {
                        classes: getPositionClasses(this),
                    }
                },
                methods: { 
                    hover: methods.hover,
                },
            });

            // 링크 메뉴
            Vue.component('v3d-menu-link', {
                props: ['name', 'icon', 'data'],
                template: `
                <div :id="id" class="menu" :class="classes">
                    <div class="header">
                        <div class="ui row">
                            <span class="title"><i :class="icons"></i>{{ text.title }}</span>
                            <button name="closeMenu" class="icon small close" v-on:click="click"><i class="xi xi-close"></i></button>
                        </div>
                        <div v-if="text.info" class="info">{{ text.info }}</div>
                    </div>
                    
                    <div class="items">
                        <div class="ui row">
                            <div class="item input">
                                <label>
                                    <span class="label">{{ text.autoStart }}</span>
                                    <input type="checkbox" name="checkautoStart" id="checkautoStart"
                                        v-on:change="change"
                                    >
                                </label>
                            </div>
                            <div class="item input">
                                <label>
                                    <span class="label">{{ text.startTime }}</span>
                                    <input type="checkbox" name="checkStartTime" id="checkStartTime"
                                        v-on:change="change"
                                    >
                                </label>
                                <input id="startTime" type="text" :value="startTime" readonly disabled>
                            </div>
                        </div>
                        <div class="item input">
                            <input id="linkUrl" type="text" :value="url" readonly>
                        </div>
                        <div class="item buttons right">
                            <button name="copyUrl" class="text" v-on:click="click">{{ text.copyUrl }}</button>
                        </div>
                    </div>
                </div>
            `,
                computed: {
                    id: function () {
                        if (this.name !== undefined) {
                            this.data.name = this.name;
                        }
                        if (this.icon !== undefined) {
                            this.data.icon = this.icon;
                        }
                        if (this.menu !== undefined) {
                            this.data.menu = this.menu;
                        }
                        return 'menu_' + this.data.name;
                    },
                    icons: function () {
                        return iPrefix + this.data.icon;
                    },
                    classes: function () {
                        return [
                            this.data.type,
                            {
                                show: this.data.show,
                            }
                        ]
                    },
                    
                    text: function () {
                        var category = this.$parent.data.name;
                        var name = this.data.name;
                        return {
                            title: SFE.getLang(() => LANGS[category], name),
                            info: SFE.getLang(() => LANGS[category], name+'_info'),
                            copyUrl: SFE.getLang(() => LANGS.share, 'copyUrl'),
                            autoStart: SFE.getLang(() => LANGS.player, 'autoStart'),
                            startTime: SFE.getLang(() => LANGS.player, 'startTime'),
                        };
                    },
                    startTime: function() {
                        return VueData.player.time;
                    },
                    url: function() {
                        return this.$parent.data.linkUrl;
                    }
                },
                methods: { 
                    click: methods.click,
                    change: methods.change,
                },
            });

            
            // 애니메이션 메뉴
            Vue.component('v3d-animator', {
                props: ['data'],
                template: `
                <div v-if="data.use" id="ui_animator" 
                    class="tools" :class="classes" 
                    v-on:mouseenter="hover"
                    v-on:mouseleave="hover"
                >
                    <v3d-button :name="data.tune.name" :icon="data.tune.icon" :data="data.tune.button" :menu="data.tune.menu"></v3d-button>
                    <v3d-button :name="loopMode.name" :icon="loopMode.icon" :data="data.repeat.button"></v3d-button>
                    <v3d-counter :name="data.counter.name" :icon="data.counter.icon" :data="data.counter.button" :mode="playMode"></v3d-counter>

                    <v3d-menu-animation :name="data.tune.name" :icon="data.tune.icon" :data="data.tune.menu"></v3d-menu-animation>
                </div>
                <div id="ui_animator" class="dummy" v-else></div>
            `,
                data: function() {
                    return {
                        classes: getPositionClasses(this),
                    }
                },
                computed: {
                    loopMode: function () {
                        var loopMode = this.data.loopMode;
                        var name = '';
                        var icon = '';
                        if (loopMode === 'repeat') {
                            name = 'repeatInfinity';
                            icon = 'xi-repeat';
                        } else if (loopMode === 'once') {
                            name = 'repeatOne';
                            icon = 'xi-repeat-one';
                        } else if (loopMode === 'pingpong') {
                            name = 'repeatPingpong';
                            icon = 'xi-exchange';
                        }
                        return {
                            name: name,
                            icon: icon,
                        }
                    },
                    playMode: function () {
                        this.data.counter.name = this.data.playMode;
                        return this.data.playMode;
                    }
                },
                methods: { 
                    hover: methods.hover,
                },
                components: {
                    'v3d-counter': {
                        props: ['name', 'icon', 'data', 'mode'],
                        template: `
                        <div :id="id" class="button">
                            <div class="counter" type="button" 
                                v-on:click="click"
                                v-on:mouseover="hover"
                                v-on:mouseout="hover"
                            >
                                <i :class="icons"></i>
                                <span :class="mode">{{ value }}</span>
                                <span class="info">{{ info }}</span>
                            </div>
                            <v3d-popup-title :data="data.popup" :text="title"></v3d-popup-title>
                        </div>
                    `,
                        computed: {
                            id: function () {
                                if (this.name !== undefined) {
                                    this.data.name = this.name;
                                }
                                if (this.icon !== undefined) {
                                    this.data.icon = this.icon;
                                }
                                return 'button_' + this.data.name;
                            },
                            icons: function () {
                                if (this.mode === 'time') {
                                    return iPrefix + this.data.icon;
                                } else if (this.mode === 'frame') {
                                    // return iPrefix + 'xi-time-o xi-flip-horizontal';
                                    // return iPrefix + 'xi-run';
                                    return iPrefix + 'xi-chart-line';
                                }
                            },
                            value: function () {
                                if (this.mode === 'time') {
                                    return this.$parent.data.time;
                                } else if (this.mode === 'frame') {
                                    return this.$parent.data.frame;
                                }
                            },
                            info: function () {
                                if (this.mode === 'time') {
                                    // return this.$parent.data.frameRate+'Frame/1Sec';
                                    return (this.$parent.data.frameRate * this.$parent.data.timeScale).toFixed(2)+'FPS';
                                } else if (this.mode === 'frame') {
                                    // return this.$parent.data.frameTime.toFixed(2)+'Sec/1Sec';
                                    return (this.$parent.data.frameTime / this.$parent.data.timeScale).toFixed(2)+'Sec.';
                                }
                            },
                            title: function () {
                                if (this.mode === 'time') {
                                    return SFE.getLang(() => LANGS.player, 'realtime');
                                } else if (this.mode === 'frame') {
                                    return SFE.getLang(() => LANGS.player, 'keyframe');
                                }
                            },
                        },
                        methods: { 
                            click: methods.click, 
                            hover: methods.hover,
                        },
                    }
                },
            });

            // 애니메이션 메뉴
            Vue.component('v3d-menu-animation', {
                props: ['name', 'icon', 'data'],
                template: `
                <div :id="id" class="menu" :class="classes">
                    <div class="header">
                        <div class="ui row">
                            <span class="title"><i :class="icons"></i>{{ text.title }}</span>
                            <button name="closeMenu" class="icon small close" v-on:click="click"><i class="xi xi-close"></i></button>
                        </div>
                        <!-- <div v-if="text.info" class="info">{{ text.info }}</div> -->
                        <div class="info">
                            <label>{{ text.infom }}</label>
                            <i :class="playInfo.timeScale.icon"></i>
                            <span class="timeScale">{{ playInfo.timeScale.value }}</span>
                            <i :class="playInfo.time.icon"></i>
                            <span class="time">{{ playInfo.time.value }}</span>
                            <span class="info">{{ playInfo.time.info }}</span>
                            <i :class="playInfo.frame.icon"></i>
                            <span class="frame">{{ playInfo.frame.value }}</span>
                            <span class="info">{{ playInfo.frame.info }}</span>
                        </div>
                    </div>
                    
                    <div class="items">
                        <div class="ui row">
                            <label>{{ text.playSpeed }}</label>
                            <div class="item input slide horizontal">
                                <input name="timeScale" type="range"
                                    step="0.1" min="0.1" max="2" :value="timeScale.value"
                                    v-on:mouseover="hover"
                                    v-on:mouseout="hover"
                                    v-on:mousedown.stop="mouseInput"
                                    v-on:input="input"
                                >
                                <div class="line timeScale">
                                    <div class="value" :class="timeScale.overhalf" :style="timeScale.style">
                                        <div class="half"></div>
                                        <div class="pointer"></div>
                                        <v3d-popup-title :data="data.popup" :text="timeScale.unit"></v3d-popup-title>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="ui row">
                            <label>{{ text.loopMode }}</label>
                            <div class="item buttons continuous center">
                                <button name="loopMode" value="repeat" class="text" :class="loopMode.repeat" v-on:click="click">
                                    <!-- <i class="xi xi-repeat"></i> -->
                                    {{ text.repeat }}
                                </button>
                                <button name="loopMode" value="once" class="text" :class="loopMode.once" v-on:click="click">
                                    <!-- <i class="xi xi-repeat-one"></i> -->
                                    {{ text.once }}
                                </button>
                                <button name="loopMode" value="pingpong" class="text" :class="loopMode.pingpong" v-on:click="click">
                                    <!-- <i class="xi xi-exchange"></i> -->
                                    {{ text.pingpong }}
                                </button>
                            </div>
                        </div>

                        <div class="ui row">
                            <div class="item buttons continuous">
                                <label>{{ text.playMode }}</label>
                                <button name="playMode" value="forward" class="text" :class="playMode.forward" v-on:click="click">
                                    {{ text.forwardPlay }}
                                </button>
                                <button name="playMode" value="backward" class="text" :class="playMode.backward" v-on:click="click">
                                    {{ text.backwardPlay }}
                                </button>
                            </div>
                            <div class="item buttons continuous">
                                <button name="playMode" value="time" class="text" :class="playMode.time" v-on:click="click">
                                    {{ text.realtime }}
                                </button>
                                <button name="playMode" value="frame" class="text" :class="playMode.frame" v-on:click="click">
                                    {{ text.keyframe }}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            `,
                computed: {
                    id: function () {
                        if (this.name !== undefined) {
                            this.data.name = this.name;
                        }
                        if (this.icon !== undefined) {
                            this.data.icon = this.icon;
                        }
                        if (this.menu !== undefined) {
                            this.data.menu = this.menu;
                        }
                        return 'menu_' + this.data.name;
                    },
                    icons: function () {
                        return iPrefix + this.data.icon;
                    },
                    classes: function () {
                        return [
                            this.data.type,
                            {
                                show: this.data.show,
                            }
                        ]
                    },
                    
                    text: function () {
                        var category = this.$parent.data.name;
                        var name = this.data.name;
                        return {
                            title: SFE.getLang(() => LANGS[category], name),
                            info: SFE.getLang(() => LANGS[category], name+'_info'),

                            infom: SFE.getLang(() => LANGS, 'info'),
                            playSpeed: SFE.getLang(() => LANGS.player, 'playSpeed'),
                            loopMode: SFE.getLang(() => LANGS.player, 'loopMode'),
                            playMode: SFE.getLang(() => LANGS.player, 'playMode'),
                            forwardPlay: SFE.getLang(() => LANGS.player, 'forwardPlay'),
                            backwardPlay: SFE.getLang(() => LANGS.player, 'backwardPlay'),
                            realtime: SFE.getLang(() => LANGS.player, 'realtime'),
                            keyframe: SFE.getLang(() => LANGS.player, 'keyframe'),
                            once: SFE.getLang(() => LANGS.player, 'repeatOne'),
                            repeat: SFE.getLang(() => LANGS.player, 'repeatInfinity'),
                            pingpong: SFE.getLang(() => LANGS.player, 'repeatPingpong'),
                        };
                    },
                    playInfo: function () {
                        // var playMode = this.$parent.data.playMode;

                        return {
                            time: {
                                icon: iPrefix + 'xi-time-o xi-flip-horizontal',
                                value: this.$parent.data.time +'/'+ this.$parent.data.timeDuration,
                                info: (this.$parent.data.frameRate * this.$parent.data.timeScale).toFixed(2)+'FPS',
                            },
                            frame: {
                                icon: iPrefix + 'xi-chart-line',
                                value: this.$parent.data.frame,
                                info: (this.$parent.data.frameTime / this.$parent.data.timeScale).toFixed(2)+'Sec.',
                            },
                            timeScale: {
                                icon: iPrefix + 'xi-run',
                                value: 'X' + Number(this.$parent.data.timeScale).toFixed(2),
                            }
                        }

                    },
                    loopMode: function () {
                        return {
                            once: (this.$parent.data.loopMode === 'once')? 'active' : '',
                            repeat: (this.$parent.data.loopMode === 'repeat')? 'active' : '',
                            pingpong: (this.$parent.data.loopMode === 'pingpong')? 'active' : '',
                        }
                    },
                    playMode: function () {
                        return {
                            forward: (this.$parent.data.reverse === false)? 'active' : '',
                            backward: (this.$parent.data.reverse === true)? 'active' : '',
                            time: (this.$parent.data.playMode === 'time')? 'active' : '',
                            frame: (this.$parent.data.playMode === 'frame')? 'active' : '',
                        }
                    },

                    timeScale: function () {
                        return {
                            value: this.$parent.data.timeScale,
                            unit: 'X' + Number(this.$parent.data.timeScale).toFixed(2),
                            style: 'width:' + (this.$parent.data.timeScale / 2 * 100) + '%',
                            overhalf: (this.$parent.data.timeScale > 1)? 'overhalf' : '',
                        };
                    },

                    /* popOffset: function () {
                        this.timeScale.value;
                        this.data.popup;

                        var offset = 0;
                        var element = this.$vnode.elm;
                        if (element !== undefined) {
                            var line = element.querySelector('.line.timeScale');
                            var value = element.querySelector('.value');
                            var popup = element.querySelector('.popup');

                            var lineWidth = line.clientWidth;
                            var valueWidth = value.clientWidth;
                            var popupHalfWidth = (popup.clientWidth / 2);

                            if (popupHalfWidth > valueWidth) {
                                offset = Number((popupHalfWidth - valueWidth).toFixed(1));
                            } else if (popupHalfWidth > lineWidth - valueWidth) {
                                offset = 0 - Number((popupHalfWidth - (lineWidth - valueWidth)).toFixed(1));
                            }
                        }
                        return offset;
                    }, */
                },
                methods: { 
                    click: methods.click,
                    input: methods.input,
                    mouseInput: methods.mouseInput,
                    hover: methods.hover,
                },
            });

            // 플레이어 메뉴
            Vue.component('v3d-player', {
                props: ['data'],
                template: `
                <div v-if="data.use" id="ui_player" 
                    class="tools" :class="classes" 
                    v-on:mouseenter="hover"
                    v-on:mouseleave="hover"
                >
                    <!-- <v3d-button :name="data.backward.name" :icon="data.backward.icon" :data="data.backward.button"></v3d-button> -->
                    <!-- <v3d-button :name="data.play.name" :icon="data.play.icon" :data="data.play.button"></v3d-button> -->
                    <!-- <v3d-button :name="data.forward.name" :icon="data.forward.icon" :data="data.forward.button"></v3d-button> -->

                    <v3d-button :name="player.backward.name" :icon="player.backward.icon" :data="data.backward.button"></v3d-button>
                    <v3d-button :name="player.play.name" :icon="player.play.icon" :data="data.play.button"></v3d-button>
                    <v3d-button :name="player.forward.name" :icon="player.forward.icon" :data="data.forward.button"></v3d-button>
                </div>
                <div id="ui_player" class="dummy" v-else></div>
            `,
                data: function() {
                    return {
                        classes: getPositionClasses(this),
                    }
                },
                computed: {
                    timeDuration: function () {
                        return this.data.time;
                    },
                    player: function() {
                        var player = {
                            forward: {
                                name: 'forward',
                                icon: 'xi-step-forward',
                            },
                            play: {
                                name: 'play',
                                icon: 'xi-play',
                            },
                            backward: {
                                name: 'backward',
                                icon: 'xi-step-backward',
                            },
                        };
                        if (this.data.paused === true) {
                            if (this.data.reverse === false) {
                                player.play.name = 'play';
                                player.play.icon = 'xi-play';
                            } else if (this.data.reverse === true) {
                                player.play.name = 'playReverse';
                                player.play.icon = 'xi-play xi-flip-horizontal';
                            }
                            this.data.play.button.active = true;
                        } else {
                            player.play.name = 'pause';
                            player.play.icon = 'xi-pause';
                            this.data.play.button.active = false;
                        }
                        if (this.data.onStepPlay === true) {
                            player.forward.name = 'playForward';
                            player.backward.name = 'playBackward';
                        }
                        
                        return player;
                    }
                },
                methods: { 
                    hover: methods.hover,
                },
            });
            // 타임라인
            Vue.component('v3d-timeline', {
                props: ['data'],
                template: `
                <div v-if="data.use" id="ui_timeline" 
                    class="tools" :class="classes" 
                    v-on:mouseenter="hover"
                    v-on:mouseleave="hover"
                >
                    <v3d-timeline-input 
                        :name="data.timeline.name"
                        :icon="data.timeline.icon"
                        :playMode="data.playMode"
                        :timeProgress="data.timeProgress"
                        :data="data.timeline.menu"
                    ></v3d-timeline-input>
                </div>
            `,
                computed: {
                    classes: function () {
                        return [
                            this.data.timeline.name,
                            {
                                active: this.data.timeline.menu.active,
                            }
                        ]
                    },
                },
                methods: { 
                    hover: methods.hover,
                },
                components: {
                    'v3d-timeline-input': {
                        props: ['name', 'icon', 'playMode', 'timeProgress', 'data'],
                        template: `
                        <div :id="id" class="line" :class="playMode">
                            <input name="timeline" type="range"
                                :step="step.step" :min="step.min" :max="step.max" :value="value"
                                v-on:mouseover="hover"
                                v-on:mouseout="hover"
                                v-on:mousedown.stop="mouseInput"
                                v-on:input="input"
                            >
                            <div class="progress" :style="progress">
                                <div class="pointer"></div>
                                <v3d-popup-title :data="data.popup" :text="timelineValue" :offset="popOffset"></v3d-popup-title>
                            </div>
                            <div v-if="playMode === 'frame'" class="tickmarks">
                                <span v-for="n in tick" class="tick"></span>
                            </div>
                        </div>
                    `,
                        computed: {
                            id: function () {
                                if (this.name !== undefined) {
                                    this.data.name = this.name;
                                }
                                if (this.icon !== undefined) {
                                    this.data.icon = this.icon;
                                }
                                return 'input_' + this.data.name;
                            },
                            step: function () {
                                if (this.playMode === 'time') {
                                    // return 0.1;
                                    return {
                                        step: 0.1,
                                        min: 0,
                                        max: 100,
                                    };
                                } else if (this.playMode === 'frame') {
                                    // return 100/this.$parent.data.frameLength;
                                    return {
                                        step: 1,
                                        min: 0,
                                        max: this.$parent.data.frameLength,
                                    };
                                }
                            },
                            value: function () {
                                return this.timeProgress;
                            },
                            tick: function () {
                                if (this.playMode === 'frame') {
                                    return this.$parent.data.frameLength + 1;
                                }
                            },
                            progress: function () {
                                // return 'width:' + this.timeProgress + '%';
                                if (this.playMode === 'time') {
                                    return 'width:' + this.timeProgress + '%';
                                } else if (this.playMode === 'frame') {
                                    var frameCount = this.$parent.data.frameCount;
                                    var frameLength = this.$parent.data.frameLength;
                                    return 'width:' + (frameCount / frameLength * 100) + '%';
                                }
                            },
                            timelineValue: function () {
                                if (this.playMode === 'time') {
                                    return this.$parent.data.time;
                                } else if (this.playMode === 'frame') {
                                    return this.$parent.data.frame;
                                }
                            },
                            popOffset: function () {
                                this.timeProgress;
                                this.data.popup;

                                var offset = 0;
                                var timeline = this.$vnode.elm;
                                if (timeline !== undefined) {
                                    var progress = timeline.querySelector('.progress');
                                    var popup = timeline.querySelector('.popup');

                                    var timelineWidth = timeline.clientWidth;
                                    // var progressWidth = progress.clientWidth
                                    var progressWidth = Number((timelineWidth / 100 * this.timeProgress).toFixed(1));
                                    var popupHalfWidth = (popup.clientWidth / 2);

                                    if (popupHalfWidth > progressWidth) {
                                        offset = Number((popupHalfWidth - progressWidth).toFixed(1));
                                    } else if (popupHalfWidth > timelineWidth - progressWidth) {
                                        offset = 0 - Number((popupHalfWidth - (timelineWidth - progressWidth)).toFixed(1));
                                    }
                                }
                                // console.log(offset)
                                return offset;
                            }
                        },
                        methods: { 
                            input: methods.input,
                            mouseInput: methods.mouseInput,
                            hover: methods.hover,
                        },
                    }
                },
            });
            // 세팅 메뉴
            Vue.component('v3d-setting', {
                props: ['data'],
                template: `
                <div v-if="data.use" :id="id" 
                    class="tools" :class="classes"
                    v-on:mouseenter="hover"
                    v-on:mouseleave="hover"
                >
                    <v3d-button :name="data.help.name" :icon="data.help.icon" :data="data.help.button"></v3d-button>
                    <v3d-button :name="data.display.name" :icon="data.display.icon" :data="data.display.button"></v3d-button>
                    <v3d-button :name="data.rendering.name" :icon="data.rendering.icon" :data="data.rendering.button" :menu="data.rendering.menu"></v3d-button>
                    <v3d-button :name="data.setting.name" :icon="data.setting.icon" :data="data.setting.button"></v3d-button>

                    <v3d-menu-display :name="data.display.name" :icon="data.display.icon" :data="data.display.menu"></v3d-menu-display>
                    <v3d-menu-rendering :name="data.rendering.name" :icon="data.rendering.icon" :data="data.rendering.menu"></v3d-menu-rendering>
                </div>
            `,
                data: function() {
                    return {
                        classes: getPositionClasses(this),
                    }
                },
                computed: {
                    id: function () {
                        this.data.blur = VueData.canvas.blur;
                        this.data.fitScreen = VueData.canvas.fitScreen;
                        this.data.aspectRatio = VueData.canvas.aspectRatio;

                        this.data.renderingWidth = VueData.canvas.width;
                        this.data.renderingHeight = VueData.canvas.height;
                        this.data.screenWidth = Viewer3D.container.clientWidth;
                        this.data.screenHeight = Viewer3D.container.clientHeight;

                        return 'ui_setting';
                    },
                },
                methods: { 
                    hover: methods.hover,
                },
            });

            // 화면 메뉴
            Vue.component('v3d-menu-display', {
                props: ['name', 'icon', 'data'],
                template: `
                <div :id="id" class="menu" :class="classes">
                    <div class="header">
                        <div class="ui row">
                            <span class="title"><i :class="icons"></i>{{ text.title }}</span>
                            <button name="closeMenu" class="icon small close" v-on:click="click"><i class="xi xi-close"></i></button>
                        </div>
                        <!-- <div v-if="text.info" class="info">{{ text.info }}</div> -->
                        <div class="info">
                            <label>{{ text.infom }}</label>
                            <i :class="displayInfo.screen.icon"></i>
                            <span class="screen">{{ displayInfo.screen.value }}</span>
                            <i :class="displayInfo.size.icon"></i>
                            <span class="size">{{ displayInfo.size.value }}</span>
                            <span class="ratio">{{ displayInfo.size.info }}</span>
                            <i :class="displayInfo.fieldOfView.icon"></i>
                            <span class="size">{{ displayInfo.fieldOfView.value }}</span>
                            <i :class="displayInfo.aspect.icon"></i>
                            <span class="size">{{ displayInfo.aspect.value }}</span>
                        </div>
                    </div>
                    
                    <div class="items">

                        <div class="ui row">
                            <label>{{ text.resolution }}</label>
                            <div class="item input slide horizontal">
                                <input name="pixelRatio" type="range"
                                    step="0.05" min="0.05" max="4" :value="display.ratio"
                                    v-on:mouseover="hover"
                                    v-on:mouseout="hover"
                                    v-on:mousedown.stop="mouseInput"
                                    v-on:input="input"
                                >
                                <div class="line pixelRatio">
                                    <div class="value" :class="display.overhalf" :style="display.style">
                                        <div class="half quarter"></div>
                                        <div class="pointer"></div>
                                        <v3d-popup-title :data="data.popup.pixelRatio" :text="display.size"></v3d-popup-title>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="ui row">
                            <label>{{ text.fieldOfView }}</label>
                            <div class="item input slide horizontal">
                                <input name="fieldOfView" type="range"
                                    step="1" min="0" max="180" :value="display.fieldOfView"
                                    v-on:mouseover="hover"
                                    v-on:mouseout="hover"
                                    v-on:mousedown.stop="mouseInput"
                                    v-on:input="input"
                                >
                                <div class="line fieldOfView">
                                    <div class="value" :style="display.fieldOfViewStyle">
                                        <div class="pointer"></div>
                                        <v3d-popup-title :data="data.popup.fieldOfView" :text="display.fieldOfView"></v3d-popup-title>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="ui row">
                            <label>{{ text.aspectRatio }}</label>
                            <div class="item buttons continuous center">
                                <button name="aspectRatio" value="auto" class="text small" :class="aspectRatio.auto" v-on:click="click">
                                    {{ text.auto }}
                                </button>
                                <button name="aspectRatio" value="1" class="text small" :class="aspectRatio._1_1" v-on:click="click">
                                    1:1
                                </button>
                                <button name="aspectRatio" value="0.75" class="text small" :class="aspectRatio._4_3" v-on:click="click">
                                    4:3
                                </button>
                                <button name="aspectRatio" value="0.5625" class="text small" :class="aspectRatio._16_9" v-on:click="click">
                                    16:9
                                </button>
                                <button name="aspectRatio" value="0.421875" class="text small" :class="aspectRatio._21_9" v-on:click="click">
                                    21:9
                                </button>
                            </div>
                        </div>

                        <div class="ui row">

                            <div class="item input">
                                <label>
                                    <span class="label">{{ text.fitScreen }}</span>
                                    <input type="checkbox" name="fitScreen" id="fitScreen"
                                        :checked="display.fitScreen"
                                        v-on:change="change"
                                    >
                                </label>
                            </div>

                            <div class="ui row">
                                <div class="item input">
                                    <label>
                                        <span class="label">{{ text.smoothing }}</span>
                                        <input type="checkbox" name="canvasSmooth" id="canvasSmooth"
                                            :checked="display.smooth"
                                            v-on:change="change"
                                        >
                                    </label>
                                </div>
                                <div class="item input">
                                    <label>
                                        <span class="label">{{ text.gammaCorrection }}</span>
                                        <input type="checkbox" name="gammaCorrection" id="gammaCorrection"
                                            :checked="display.gammaCorrection"
                                            v-on:change="change"
                                        >
                                    </label>
                                </div>
                            </div>
                            
                        </div>

                    </div>
                </div>
            `,
                computed: {
                    id: function () {
                        if (this.name !== undefined) {
                            this.data.name = this.name;
                        }
                        if (this.icon !== undefined) {
                            this.data.icon = this.icon;
                        }
                        if (this.menu !== undefined) {
                            this.data.menu = this.menu;
                        }
                        return 'menu_' + this.data.name;
                    },
                    icons: function () {
                        return iPrefix + this.data.icon;
                    },
                    classes: function () {
                        return [
                            this.data.type,
                            {
                                show: this.data.show,
                            }
                        ]
                    },
                    
                    text: function () {
                        var category = this.$parent.data.name;
                        var name = this.data.name;
                        return {
                            title: SFE.getLang(() => LANGS[category], name),
                            info: SFE.getLang(() => LANGS[category], name+'_info'),
                            infom: SFE.getLang(() => LANGS, 'info'),

                            auto: SFE.getLang(() => LANGS.setting, 'auto'),
                            smoothing: SFE.getLang(() => LANGS.setting, 'smoothing'),
                            fitScreen: SFE.getLang(() => LANGS.setting, 'fitScreen'),
                            resolution: SFE.getLang(() => LANGS.setting, 'resolution'),
                            aspectRatio: SFE.getLang(() => LANGS.setting, 'aspectRatio'),
                            fieldOfView: SFE.getLang(() => LANGS.setting, 'fieldOfView'),
                            gammaCorrection: SFE.getLang(() => LANGS.setting, 'gammaCorrection'),
                        };
                    },

                    display: function () {
                        return {
                            fieldOfView: this.$parent.data.fov,
                            fieldOfViewStyle: 'width:' + (this.$parent.data.fov / 180 * 100) + '%',
                            smooth: VueData.canvas.smooth,
                            size: this.$parent.data.renderingWidth + 'X' + this.$parent.data.renderingHeight,
                            // screen: Viewer3D.container.clientWidth + 'X' + Viewer3D.container.clientHeight,
                            screen: this.$parent.data.screenWidth + 'X' + this.$parent.data.screenHeight,
                            // size: width + 'X' + height,
                            ratio: this.$parent.data.pixelRatio,
                            fitScreen: this.$parent.data.fitScreen,
                            style: 'width:' + (this.$parent.data.pixelRatio / 4 * 100) + '%',
                            overhalf: (this.$parent.data.pixelRatio > 1)? 'overhalf' : '',
                            gammaCorrection: (this.$parent.data.gammaInput && this.$parent.data.gammaOutput),
                        }
                    },

                    displayInfo: function () {
                        var aspectRatio = this.$parent.data.aspectRatio;
                        var aspectRatioValue = 'auto';
                        if (aspectRatio === 'auto') {
                            aspectRatioValue = 'auto';
                        } else if (aspectRatio === 1) {
                            aspectRatioValue = '1:1';
                        } else if (aspectRatio === 0.75) {
                            aspectRatioValue = '4:3';
                        } else if (aspectRatio === 0.5625) {
                            aspectRatioValue = '16:9';
                        } else if (aspectRatio === 0.421875) {
                            aspectRatioValue = '21:9';
                        }

                        return {
                            screen: {
                                icon: iPrefix + 'xi-desktop',
                                value: this.display.screen,
                            },
                            size: {
                                icon: iPrefix + 'xi-image-o',
                                value: this.display.size,
                                info: '(X' + Number(this.display.ratio).toFixed(2) + ')',
                            },
                            fieldOfView: {
                                icon: iPrefix + 'xi-eye-o',
                                value: this.display.fieldOfView,
                            },
                            aspect: {
                                icon: iPrefix + 'xi-overscan',
                                value: aspectRatioValue,
                            }
                        }
                    },

                    aspectRatio: function () {
                        return {
                            auto: (this.$parent.data.aspectRatio === 'auto')? 'active' : '',
                            _1_1: (this.$parent.data.aspectRatio === 1)? 'active' : '',
                            _4_3: (this.$parent.data.aspectRatio === 0.75)? 'active' : '',
                            _16_9: (this.$parent.data.aspectRatio === 0.5625)? 'active' : '',
                            _21_9: (this.$parent.data.aspectRatio === 0.421875)? 'active' : '',
                        }
                    },

                    /* popOffset: function () {
                        this.display.ratio;
                        // this.display.style;
                        this.data.popup;

                        var offset = 0;
                        var element = this.$vnode.elm;
                        if (element !== undefined) {
                            var line = element.querySelector('.line.pixelRatio');
                            var value = element.querySelector('.value');
                            var popup = element.querySelector('.popup');

                            var lineWidth = line.clientWidth;
                            var valueWidth = value.clientWidth;
                            var popupHalfWidth = (popup.clientWidth / 2);

                            if (popupHalfWidth > valueWidth) {
                                offset = Number((popupHalfWidth - valueWidth).toFixed(1));
                            } else if (popupHalfWidth > lineWidth - valueWidth) {
                                offset = 0 - Number((popupHalfWidth - (lineWidth - valueWidth)).toFixed(1));
                            }
                        }
                        return offset;
                    } */

                },
                methods: { 
                    click: methods.click,
                    input: methods.input,
                    mouseInput: methods.mouseInput,
                    hover: methods.hover,
                    change: methods.change,
                    getAspect: function(width, height) {
                        function gcd (a, b) {
                            return (b == 0) ? a : gcd (b, a%b);
                        }
                        var ratio = gcd(width, height);
                        return width/ratio + ':' + height/ratio;
                    }
                },
            });

            // 랜더링 메뉴
            Vue.component('v3d-menu-rendering', {
                props: ['name', 'icon', 'data'],
                template: `
                <div :id="id" class="menu" :class="classes">
                    <div class="header">
                        <div class="ui row">
                            <span class="title"><i :class="icons"></i>{{ text.title }}</span>
                            <button name="closeMenu" class="icon small close" v-on:click="click"><i class="xi xi-close"></i></button>
                        </div>
                        <!-- <div v-if="text.info" class="info">{{ text.info }}</div> -->
                        <div class="info">
                        </div>
                    </div>
                    
                    <div class="items">

                        <div class="ui row">
                            <label>{{ text.quickShading }}</label>
                            <div class="item buttons continuous left">
                                <button name="changeShading" value="default" class="text small" :class="shadingMode.default" v-on:click="click">
                                    Default
                                </button>
                                <button name="changeShading" value="diffuse" class="text small" :class="shadingMode.diffuse" v-on:click="click">
                                    Diffuse
                                </button>
                                <button name="changeShading" value="edgedFace" class="text small" :class="shadingMode.edgedFace" v-on:click="click">
                                    EdgedFace
                                </button>
                            </div>
                            <label>
                                <span class="label">{{ text.outline }}</span>
                                <input type="checkbox" name="outlineEnabled" id="outlineEnabled"
                                    :checked="rendering.outlineEnabled"
                                    v-on:change="change"
                                >
                            </label>
                        </div>

                        <div class="ui row">
                            <div class="item input">
                                <label>
                                    <span class="label">{{ text.textureFiltering }}</span>
                                    <input type="checkbox" name="textureFilter" id="textureFilter"
                                        :checked="rendering.textureFilter"
                                        v-on:change="change"
                                    >
                                </label>
                            </div>
                            <div class="item input">
                                <label>
                                    <span class="label">{{ text.mipmap }}</span>
                                    <input type="checkbox" name="textureMipMap" id="textureMipMap"
                                        :checked="rendering.textureMipMap"
                                        v-on:change="change"
                                    >
                                </label>
                            </div>
                            <div class="item input">
                                <label>{{ text.anisotropicFiltering }}</label>
                                <input name="anisotropicFilter" id="anisotropicFilter" type="number" 
                                    min="0" max="16"
                                    :value="rendering.anisotropicFilter"
                                    v-on:input="input"
                                >
                            </div>
                        </div>

                        <div class="ui row">
                            <label>
                                <span class="label">{{ text.shadowMap }}</span>
                                <input type="checkbox" name="shadowMapEnabled" id="shadowMapEnabled"
                                    :checked="rendering.shadowMapEnabled"
                                    v-on:change="change"
                                >
                            </label>

                            <div class="item buttons continuous center">
                                <button name="shadowMapType" value="BasicShadowMap" class="text small" :class="shadowMapType.BasicShadowMap" v-on:click="click">
                                    Basic
                                </button>
                                <button name="shadowMapType" value="PCFShadowMap" class="text small" :class="shadowMapType.PCFShadowMap" v-on:click="click">
                                    PCF
                                </button>
                                <button name="shadowMapType" value="PCFSoftShadowMap" class="text small" :class="shadowMapType.PCFSoftShadowMap" v-on:click="click">
                                    PCFSoft
                                </button>
                            </div>
                            <div class="item input">
                                <input name="shadowMapSize" id="shadowMapSize" type="number" 
                                    :value="rendering.shadowMapSize"
                                    v-on:input="input"
                                >
                            </div>
                        </div>

                        <!--
                            <div class="item buttons right">
                                <button name="test" class="text" v-on:click="click">
                                    test
                                </button>
                                <button name="recompile" class="text" v-on:click="click">
                                    recompile
                                </button>
                                <button name="dispose" class="text" v-on:click="click">
                                    dispose
                                </button>
                            </div>
                        -->

                    </div>
                </div>
            `,
                computed: {
                    id: function () {
                        if (this.name !== undefined) {
                            this.data.name = this.name;
                        }
                        if (this.icon !== undefined) {
                            this.data.icon = this.icon;
                        }
                        if (this.menu !== undefined) {
                            this.data.menu = this.menu;
                        }
                        return 'menu_' + this.data.name;
                    },
                    icons: function () {
                        return iPrefix + this.data.icon;
                    },
                    classes: function () {
                        return [
                            this.data.type,
                            {
                                show: this.data.show,
                            }
                        ]
                    },
                    
                    text: function () {
                        var category = this.$parent.data.name;
                        var name = this.data.name;
                        return {
                            title: SFE.getLang(() => LANGS[category], name),
                            info: SFE.getLang(() => LANGS[category], name+'_info'),
                            infom: SFE.getLang(() => LANGS, 'info'),

                            quickShading: SFE.getLang(() => LANGS.setting, 'quickShading'),
                            outline: SFE.getLang(() => LANGS.setting, 'outline'),
                            textureFiltering: SFE.getLang(() => LANGS.setting, 'textureFiltering'),
                            mipmap: SFE.getLang(() => LANGS.setting, 'mipmap'),
                            anisotropicFiltering: SFE.getLang(() => LANGS.setting, 'anisotropicFiltering'),
                            shadowMap: SFE.getLang(() => LANGS.setting, 'shadowMap'),
                        };
                    },

                    rendering: function () {
                        return {
                            outlineEnabled: this.$parent.data.outlineEnabled, 
                            shadowMapEnabled: this.$parent.data.shadowMapEnabled,
                            shadowMapSize: this.$parent.data.shadowMapSize,
                            textureFilter: this.$parent.data.textureFilter,
                            textureMipMap: this.$parent.data.textureMipMap,
                            anisotropicFilter: this.$parent.data.anisotropicFilter,
                        }
                    },

                    renderingInfo: function () {
                        var aspectRatio = this.$parent.data.aspectRatio;
                        var aspectRatioValue = 'auto';
                        if (aspectRatio === 'auto') {
                            aspectRatioValue = 'auto';
                        } else if (aspectRatio === 1) {
                            aspectRatioValue = '1:1';
                        } else if (aspectRatio === 0.75) {
                            aspectRatioValue = '4:3';
                        } else if (aspectRatio === 0.5625) {
                            aspectRatioValue = '16:9';
                        } else if (aspectRatio === 0.421875) {
                            aspectRatioValue = '21:9';
                        }

                        return {
                            screen: {
                                icon: iPrefix + 'xi-desktop',
                                value: this.display.screen,
                            },
                            size: {
                                icon: iPrefix + 'xi-image-o',
                                value: this.display.size,
                                info: '(X' + Number(this.display.ratio).toFixed(2) + ')',
                            },
                            aspect: {
                                icon: iPrefix + 'xi-overscan',
                                value: aspectRatioValue,
                            }
                        }
                    },

                    shadingMode: function () {
                        return {
                            default: (this.$parent.data.shadingMode === 'default')? 'active' : '',
                            diffuse: (this.$parent.data.shadingMode === 'diffuse')? 'active' : '',
                            edgedFace: (this.$parent.data.shadingMode === 'edgedFace')? 'active' : '',
                        }
                    },

                    shadowMapType: function () {
                        return {
                            BasicShadowMap: (this.$parent.data.shadowMapType === 'BasicShadowMap')? 'active' : '',
                            PCFShadowMap: (this.$parent.data.shadowMapType === 'PCFShadowMap')? 'active' : '',
                            PCFSoftShadowMap: (this.$parent.data.shadowMapType === 'PCFSoftShadowMap')? 'active' : '',
                        }
                    },

                    /* popOffset: function () {
                        this.display.ratio;
                        // this.display.style;
                        this.data.popup;

                        var offset = 0;
                        var element = this.$vnode.elm;
                        if (element !== undefined) {
                            var line = element.querySelector('.line.pixelRatio');
                            var value = element.querySelector('.value');
                            var popup = element.querySelector('.popup');

                            var lineWidth = line.clientWidth;
                            var valueWidth = value.clientWidth;
                            var popupHalfWidth = (popup.clientWidth / 2);

                            if (popupHalfWidth > valueWidth) {
                                offset = Number((popupHalfWidth - valueWidth).toFixed(1));
                            } else if (popupHalfWidth > lineWidth - valueWidth) {
                                offset = 0 - Number((popupHalfWidth - (lineWidth - valueWidth)).toFixed(1));
                            }
                        }
                        return offset;
                    } */

                },
                methods: { 
                    click: methods.click,
                    input: methods.input,
                    mouseInput: methods.mouseInput,
                    hover: methods.hover,
                    change: methods.change,
                },
            });

        }

        // 포지션 클래스 겟
        // tools, 도구 엘리먼트에서 사용. 
        // 현재 엘리먼트가 ui 블록 내부에서 어느 위치에 있는지 검사하여 클래스 문자열로 반환한다.
        getPositionClasses(component) {
            function checkPosition(tag) {
                let verticalPos, horizontalPos;
                if (document.querySelector('#ui_header '+tag)) {
                    verticalPos = 'top';
                } else if (document.querySelector('#ui_main '+tag)) { 
                    verticalPos = 'middle';
                } else if (document.querySelector('#ui_footer '+tag)) { 
                    verticalPos = 'bottom';
                }
                // console.log('verticalPos', verticalPos);
                const target = document.querySelector(tag);
                const parentNode = target.parentNode;
                // console.log(tag,parentNode.classList);
                if (parentNode.classList.contains('left')) {
                    horizontalPos = 'left';
                } else if (parentNode.classList.contains('right')) {
                    horizontalPos = 'right';
                } else if (parentNode.firstElementChild.localName === tag) {
                    horizontalPos = 'left';
                } else if (parentNode.lastElementChild.localName === tag) {
                    horizontalPos = 'right';
                } else {
                    horizontalPos = 'center';
                }
                // console.log('horizontalPos', horizontalPos);
                return {
                    vertical: verticalPos,
                    horizontal: horizontalPos,
                }
            }
            const position = checkPosition(component.$vnode.componentOptions.tag);
            let verticalPos, horizontalPos;
            if (position !== undefined) {
                verticalPos = (position.vertical? position.vertical: null);
                horizontalPos = (position.horizontal? position.horizontal: null);
                return [verticalPos, horizontalPos].join(' ');
            }
        }

    }

    // PlayerController.js
    const LAYER$3 = 'SFEViewer: ';

    class ViewerController {

        constructor(SFEPlayer) {
            // SFEPlayer 데이터
            this.SFEPlayer = SFEPlayer;
            this.SFEOptions = this.SFEPlayer.options;

            // 로더
            this.Loader = this.SFEPlayer.Loader;

            // SFEPlayer 객체
            this.SFECanvas = this.SFEPlayer.canvas;
            this.SFEScene = this.SFEPlayer.scene;
            this.SFERenderer = this.SFEPlayer.renderer;
            this.SFECamera = this.SFEPlayer.camera;
            this.SFEControls = this.SFEPlayer.controls;
            this.SFEAssets;
            // 플레이어 데이터
            this.SFEModel, this.SFEAnimation,
            this.SFEMixer, this.SFEAction;

            // VueUI 데이터
            this.VueUI = SFEPlayer.VueUI;
            this.VueData = SFEPlayer.VueData;
            // 캔버스
            this.canvas = this.VueData.canvas;
            // 메시지
            this.message = this.VueData.message;
            // 툴 데이터
            // this.tools = this.VueData.tools;
            this.share = this.VueData.share;
            this.camera = this.VueData.camera;
            this.player = this.VueData.player;
            this.setting = this.VueData.setting;

            // 메뉴 데이터
            this.menus = {};

            // 입력감지
            this.onInput = false;
            this.onInputData = false;
            this.onClick = false;
            // this.onStepPlay = false;
        }

        // UI 준비
        // 로드타임 이후 실행
        readyUI() {
            const Controller = this;

            // UI 컨테이너
            this.VueData.ui.events.mouseInput = function(event) {
                if (event.type === 'mousedown') {
                    event.stopPropagation();
                } 
                Controller.checkInput(event);
                Controller.toggleControls(event);
            };
            // UI 컨테이너
            this.VueData.ui.events.touch = (event) => {
                // console.log(this.SFEControls.enabled)
                if (event.type === 'touchstart') {
                    event.stopPropagation();
                } 
                Controller.checkInput(event);
                Controller.toggleControls(event);
            };

            let eventTargets = [
                this.VueData.message,
                this.VueData.info,
                this.VueData.stats,
                this.VueData.share,
                this.VueData.camera,
                this.VueData.player,
                this.VueData.setting,
            ];
            // 모든 UI 엘리먼트
            for (const key in eventTargets) {
                const targets = eventTargets[key];
                targets.events.hover = function(event, data) {
                    if (event.sourceCapabilities.firesTouchEvents === false) {
                        Controller.toggleControls(event, data);
                    }
                };
                // 모든 버튼
                for (const id in targets) {
                    if (targets[id].button !== undefined) {
                        targets[id].button.events.hover = function(event, data) { 
                            Controller.togglePopup(event, data);
                        };
                    }
                }
            }

            // 플레이어 이벤트

            // 플레이버튼
            this.player.play.button.events.click = function(event, data) { 
                Controller.togglePlay(event, data);
            };
            // 스탭포워드 버튼
            this.player.forward.button.events.click = function(event, data) { 
                Controller.step(event, data);
            };
            this.player.forward.button.events.mouseInput = function(event, data) { 
                Controller.stepPlay(event, data);
            };
            // 스탭백워드 버튼
            this.player.backward.button.events.click = function(event, data) { 
                Controller.step(event, data);
            };
            this.player.backward.button.events.mouseInput = function(event, data) { 
                Controller.stepPlay(event, data);
            };
            // 타임라인
            this.player.timeline.menu.events.input = function(event, data) { 
                Controller.changeTime(event, data);
            };
            this.player.timeline.menu.events.mouseInput = function(event, data) { 
                Controller.checkInput(event, data);
            };
            this.player.timeline.menu.events.hover = function(event, data) { 
                Controller.togglePopup(event, data);
            };

            // 카운터
            this.player.counter.button.events.hover = function(event, data) { 
                Controller.togglePopup(event, data);
            };
            this.player.counter.button.events.click = function(event, data) { 
                Controller.changePlayMode(event, data);
            };
            // 반복 버튼
            this.player.repeat.button.events.click = function(event, data) { 
                Controller.changeLoopMode(event, data);
            };
            // 애니메이션 설정 버튼
            this.menus[this.player.tune.name] = this.player.tune;
            this.player.tune.button.events.click = function(event, data) { 
                Controller.toggleMenu(event, Controller.player.tune);
            };
            this.player.tune.menu.events.click = function(event, data) { 
                Controller.handleAnimationMenu(event, data);
            };
            this.player.tune.menu.events.input = function(event, data) { 
                Controller.changeTimeScale(event, data);
            };
            this.player.tune.menu.events.mouseInput = function(event, data) { 
                Controller.checkInput(event, data);
            };
            this.player.tune.menu.events.hover = function(event, data) { 
                Controller.togglePopup(event, data);
            };

            // 카메라 이벤트

            // 카메라 회전 버튼
            this.camera.rotate.button.events.click = function(event, data) { 
                Controller.changeCameraMode(event, data);
            };
            // 카메라 이동 버튼
            this.camera.pan.button.events.click = function(event, data) { 
                Controller.changeCameraMode(event, data);
            };
            // 카메라 확대 버튼
            this.camera.zoom.button.events.click = function(event, data) { 
                Controller.changeCameraMode(event, data);
            };
            // 카메라 포커스 버튼
            this.camera.focus.button.events.click = function(event, data) { 
                Controller.changeFocus(event, data);
            };
            // 카메라 리셋 버튼
            this.camera.reset.button.events.click = function(event, data) { 
                Controller.resetCamera(event, data);
            };

            // 설정 이벤트

            // 화면 설정 버튼
            this.menus[this.setting.display.name] = this.setting.display;
            this.setting.display.button.events.click = function(event, data) { 
                Controller.toggleMenu(event, Controller.setting.display);
            };
            /* this.setting.display.menu.events.click = function(event, data) { 
                Controller.toggleMenu(event, Controller.setting.display);
            } */
            this.setting.display.menu.events.click = function(event, data) { 
                Controller.handleDisplayMenu(event, data);
            };
            this.setting.display.menu.events.change = function(event, data) { 
                Controller.handleDisplayMenu(event, data);
            };
            this.setting.display.menu.events.input = function(event, data) { 
                Controller.handleDisplayMenu(event, data);
            };
            this.setting.display.menu.events.mouseInput = function(event, data) { 
                Controller.checkInput(event, data);
            };
            this.setting.display.menu.events.hover = function(event, data) { 
                Controller.togglePopup(event, data);
            };
            // 랜더링 설정 버튼
            this.menus[this.setting.rendering.name] = this.setting.rendering;
            this.setting.rendering.button.events.click = function(event, data) { 
                Controller.toggleMenu(event, Controller.setting.rendering);
            };
            this.setting.rendering.menu.events.click = function(event, data) { 
                Controller.handleRenderingMenu(event, data);
            };
            this.setting.rendering.menu.events.change = function(event, data) { 
                Controller.handleRenderingMenu(event, data);
            };
            this.setting.rendering.menu.events.input = function(event, data) { 
                Controller.handleRenderingMenu(event, data);
            };

            // 공유 이벤트

            // 다운로드 버튼
            this.share.download.button.events.click = function(event, data) { 
                Controller.downloadModel(event, data);
            };
            // 스크린샷 버튼
            this.share.screenshot.button.events.click = function(event, data) { 
                Controller.takeScreenshot(event, data);
            };
            this.menus[this.share.link.name] = this.share.link;
            // 링크 버튼
            this.share.link.button.events.click = function(event, data) { 
                Controller.toggleLinkMenu(event, data);
            };
            // 링크 메뉴
            this.share.link.menu.events.click = function(event, data) { 
                Controller.handleLinkMenu(event, data);
            };
            this.share.link.menu.events.change = function(event, data) { 
                Controller.handleLinkMenu(event, data);
            };


            // UI 준비
            this.showUI();
        }

        showUI() {
            // UI 준비
            this.VueData.overlay.dimming = false;
            this.VueData.overlay.events.transition = (event, data) => { 
                this.VueData.ui.ready = true;
                delete data.events.transition;
            };
            this.VueData.canvas.blur = -1;
            this.VueData.canvas.ready = true;
        }

        // 플레이어 기능

        // 플레이어 준비
        // 애니메이션이 존재할 경우 실행
        async readyPlayer(modelData) {
            // 어셋
            this.SFEAssets = this.SFEPlayer.Assets;
            // 모델 객체
            this.SFEModel = modelData;
            
            // 카메라 타겟 추가
            var sourceHandler = { 
                get: function (target, name) { 
                    if (name in target) {
                        return target[name];
                    }
                },
                set: function (target, name, value) { 
                    return true;
                }
            };
            var offsetHandler = { 
                get: function (target, name) {
                    if (name in target) {
                        if (name === 'x') {
                            return target.x + target.offset.x;
                        } else if (name === 'y') {
                            return target.y + target.offset.y;
                        }  else if (name === 'z') {
                            return target.z + target.offset.z;
                        }
                        return target[name];
                    }
                },
                set: function (target, name, value) { 
                    return true;
                }
            };

            if (!SFE.isEmpty(this.SFEModel.animations)) {
                this.SFEAnimation = this.SFEModel.animations[0];
                this.SFEMixer = this.SFEModel.mixer;
                this.SFEAction = this.SFEMixer.action;
                
                // 카메라 타겟 추가
                // 센터포지션
                const centerPosition = this.SFEModel.position;
                this.SFECamera.targets.center = new Proxy(centerPosition, sourceHandler);
                if (this.SFEModel.bones.root !== undefined) {
                    // 루트포지션
                    const rootPosition = this.SFEModel.bones.root.position;
                    // this.SFECamera.targets.center = new Proxy(rootPosition, sourceHandler);
                    if (JSON.stringify(this.SFEOptions.camera.offset) !== JSON.stringify([0, 0, 0])) {
                        rootPosition.offset = this.SFECamera.orbit.offset;
                        this.SFECamera.targets.root = new Proxy(rootPosition, offsetHandler);
                    }
                }

                // 프레임데이터
                var frameTimes = this.SFEAnimation.tracks[0].times;
                var frameTime = frameTimes[1];
                var frameRate = Number((1 / frameTime).toFixed(2));
                var frameLength = frameTimes.length-1;
                this.SFEAnimation.frameTime = frameTime;
                this.SFEAnimation.frameTimes = frameTimes;
                this.SFEAnimation.frameRate = frameRate;
                this.SFEAnimation.frameLength = frameLength;
                this.SFEAnimation.frameCount = 0;

                // 데이터 링크
                this.player.use = true;
                this.player.duration = this.SFEAnimation.duration;
                // this.player.time = this.SFEAction.time;
                this.player.timeScale = this.SFEAction.timeScale;
                this.player.frameTime = this.SFEAnimation.frameTime;
                this.player.frameRate = this.SFEAnimation.frameRate;
                this.player.frameLength = this.SFEAnimation.frameLength;

                // this.VueUI.addPlayerData();
            } else {
                const modelPosition = this.SFEModel.position;
                this.SFECamera.targets.center = new Proxy(modelPosition, sourceHandler);
                if (JSON.stringify(this.SFEOptions.camera.offset) !== JSON.stringify([0, 0, 0])) {
                    modelPosition.offset = this.SFECamera.orbit.offset;
                    this.SFECamera.targets.root = new Proxy(modelPosition, offsetHandler);
                }
            }


            // 플레이어 옵션 적용

            // 카메라 포커스 변경
            var focusTarget = this.SFEOptions.camera.focusTarget;
            if (focusTarget === 'center' ||  focusTarget === 'root') {
                this.changeFocus(null, this.camera.focus.button, focusTarget);
            }
            // 시작 시간
            var startTime = this.SFEOptions.player.startTime;
            if (startTime > 0) {
                if (startTime >= this.player.duration) {
                    this.SFEAction.time = this.player.duration;
                } else {
                    this.SFEAction.time = startTime;
                }
            }

            // TODO: 로딩서클 1회전까지 지연
            await SFE.wait(200);
            // 오토스타트
            if (this.SFEOptions.player.autoStart === true) {
                this.startPlayer();
            }

        }

        // 플레이어 업데이트
        // SFEPlayer.js, animate() 에서 업데이트 주기마다 호출됨.
        // TODO: animate() 에서 계산된 데이터를 받아옴
        updatePlayer() {
            var time = this.SFEAction.time;
            var duration = this.SFEAnimation.duration;
            // console.log(time);

            // 프레임타임
            var frameTime = this.SFEAnimation.frameTime;
            var frameTimes = this.SFEAnimation.frameTimes;
            var frameCount = this.SFEAnimation.frameCount = Math.round(time / frameTime);
            var frameLength = this.SFEAnimation.frameLength;
            this.player.frameCount = frameCount;
            this.player.frame = String(frameCount) + '/' + String(frameLength);

            // 타임 업데이트
            // TODO: 분/시 이상 넘어가는 단위 처리.
            var times = String(time.toFixed(2)).split('.');
            if (times[0] === undefined) {
                times[0] = 0;
            }
            if (times[1] === undefined) {
                times[1] = 0;
            }
            this.player.time = SFE.padNumber(times[0],2)+':'+SFE.padNumber(times[1],2);

            var durations = String(duration.toFixed(2)).split('.');
            if (durations[0] === undefined) {
                durations[0] = 0;
            }
            if (durations[1] === undefined) {
                durations[1] = 0;
            }
            this.player.timeDuration = SFE.padNumber(durations[0],2)+':'+SFE.padNumber(durations[1],2);

            // 타임라인 업데이트
            this.player.timeProgress = ((this.SFEAction.time / this.SFEAnimation.duration)*100).toFixed(1);
        }

        // 플레이어 스타트
        startPlayer(event, data) {
            // TODO: 카메라 인트로 애니메이션 wait 추가
            // await SFE.wait(300);
            this.player.paused = false;
            this.SFEAction.paused = false;
        }

        // 일시정지
        togglePlay(event, data) {
            // console.log(data);
            // console.log(this.SFEAction);
            // console.log(this.SFEAnimation);
            // console.log(this.SFEMixer)
            // console.log(this.SFEAnimation.tracks[0].times);
            if (this.SFEAction.enabled === false) {
                this.SFEAction.enabled = true;
            }
            // 한번 반복 시간 보정
            if (this.player.loopMode === 'once') {
                if (this.SFEAction.time === this.SFEAnimation.duration) {
                    this.SFEAction.time = 0;
                } else if (this.player.reverse === true && this.SFEAction.time === 0) {
                    this.SFEAction.time = this.SFEAnimation.duration;
                }
            }
            if (this.player.paused === false) {
                this.player.paused = true;
                this.SFEAction.paused = true;
            } else if (this.player.paused === true) {
                this.player.paused = false;
                this.SFEAction.paused = false;
            }
        }

        // 일시정지
        changeTime(event, data) {
            var value = event.target.value;
            var playMode = this.player.playMode;
            if (playMode === 'time') {
                var time = (this.player.duration * value)/100;
            } else if (playMode === 'frame') {
                var time = this.player.frameTime * value;
            }

            this.SFEAction.time = time;
        }

        // 스탭포워드 및 스탭백워드
        step(event, data) {
            if (this.player.onStepPlay === true) {
                this.player.onStepPlay = false;
                return false;
            }
            const frameLength = this.SFEAnimation.frameLength;
            const frameCount = this.SFEAnimation.frameCount;
            const frameTimes = this.SFEAnimation.frameTimes;
            if (this.player.paused === false) {
                this.SFEAction.paused = true;
                this.player.paused = true;
            }
            if (data.name === 'forward' && frameCount < frameLength) {
                console.log(LAYER$3+'STEP FORWARD');
                this.SFEAction.time = frameTimes[frameCount+1];
            } else if (data.name === 'backward' && frameCount > 0) {
                console.log(LAYER$3+'STEP BACKWARD');
                this.SFEAction.time = frameTimes[frameCount-1];
            }
        }

        // 플레이포워드 및 플레이백워드
        async stepPlay(event, data) {
            this.onInputData = data;
            await SFE.wait(400);
            // console.log(event);
            if (this.onClick === false) {
                return false;
            }
            if (this.onInputData !== false && document.querySelector('button:hover') === event.target) {
                await SFE.wait(100);
                if (this.onClick === true) {
                    if (this.SFEAction.enabled === false) {
                        this.SFEAction.enabled = true;
                    }
                    if (this.player.reverse === true) {
                        this.onInputData.reverse = true;
                    } else {
                        this.onInputData.reverse = false;
                    }
                    this.player.onStepPlay = true;
                    data.active = true;
                    this.player.paused = true;
                    if (data.name === 'forward') {
                        console.log(LAYER$3+'STEPPLAY FORWARD');
                        // 한번 반복 시간 보정
                        if (this.player.loopMode === 'once') {
                            if (this.SFEAction.time === this.SFEAnimation.duration) {
                                this.SFEAction.time = 0;
                            }
                        }
                        this.player.reverse = false;
                        this.SFEAction.paused = false;
                    } else if (data.name === 'backward') {
                        console.log(LAYER$3+'STEPPLAY BACKWARD');
                        // 한번 반복 시간 보정
                        if (this.player.loopMode === 'once') {
                            if (this.SFEAction.time === 0) {
                                this.SFEAction.time = this.SFEAnimation.duration;
                            }
                        }
                        this.player.reverse = true;
                        this.SFEAction.paused = false;
                    }
                }
            }
        }

        // 루프모드 변경
        changeLoopMode(event, data, targetMode = null) {

            if (!targetMode) {
                var loopMode = this.player.loopMode;
                if (loopMode === 'repeat') {
                    var targetMode = 'once';
                } else if (loopMode === 'once') {
                    var targetMode = 'pingpong';
                } else if (loopMode === 'pingpong') {
                    var targetMode = 'repeat';
                }
            }

            if (targetMode === 'repeat') {
                this.player.loopMode = 'repeat';
                this.SFEAction.loop = THREE.LoopRepeat;
            } else if (targetMode === 'once') {
                this.player.loopMode = 'once';
                this.SFEAction.loop = THREE.LoopOnce;
            } else if (targetMode === 'pingpong') {
                this.player.loopMode = 'pingpong';
                this.SFEAction.loop = THREE.LoopOnce;
            }
            
        }

        // 플레이모드 변경
        changePlayMode(event, data, targetMode = null) {

            if (!targetMode) {
                var playMode = this.player.playMode;
                if (playMode === 'time') {
                    var targetMode = 'frame';
                    this.SFEPlayer.clock.stop();
                } else if (playMode === 'frame') {
                    var targetMode = 'time';
                }
            }

            if (targetMode === 'frame') {
                this.player.playMode = 'frame';
                this.SFEPlayer.clock.stop();
            } else if (targetMode === 'time') {
                this.player.playMode = 'time';
                this.SFEPlayer.clock.start();
            }
            
            // 시간 싱크
            if (this.SFEAction.time === 0 || 
                this.SFEAction.time === this.SFEAnimation.duration) ; else {
                const frameCount = this.SFEAnimation.frameCount;
                const frameTime = this.SFEAnimation.frameTime;
                this.SFEAction.time = frameTime * frameCount;
            }

        }

        // 타임스케일 변경
        changeTimeScale(event, data) {
            const value = event.target.value;
            data.value = value;
            this.SFEAction.timeScale = value;
            this.player.timeScale = value;
        }


        // 카메라 기능

        // 카메라 리셋
        // 초기 옵션값으로 리셋
        async resetCamera(event, data) {
            const duration = 500;

            const SFEControls = this.SFEControls;
            const SFECamera = this.SFECamera;

            const cameraOptions = this.SFEOptions.camera;
            const camPos = cameraOptions.position;
            const camTag = cameraOptions.target;
            
            // 카메라 모드 리셋
            this.resetCameraMode();
            // 카메라 포커스 리셋
            this.resetFocus();

            // 컨트롤 중지
            SFEControls.enabled = false;
            data.active = true;

            const resetPosition = new TWEEN.Tween(SFECamera.position)
            .to(SFECamera.position.clone().set(camPos[0], camPos[1], camPos[2]), duration)
            .easing(TWEEN.Easing.Cubic.Out);

            const resetTarget = new TWEEN.Tween(SFEControls.target)
            .to(SFEControls.target.clone().set(camTag[0], camTag[1], camTag[2]), duration)
            .easing(TWEEN.Easing.Cubic.Out);

            resetPosition.start();
            resetTarget.start();

            await SFE.wait(duration);
            // 컨트롤 재개
            SFEControls.enabled = true;
            data.active = false;
        }

        // 카메라 포커스 변경
        async changeFocus(event, data, setTarget = null) {
            let target;
            let focused = this.camera.focused;
            
            if (setTarget) {
                target = setTarget;
            } else {
                if (focused === 'free') {
                    target = 'center';
                } else if (focused === 'center') {
                    if (this.SFECamera.targets.root !== undefined) {
                        target = 'root';
                    } else {
                        target = 'free';
                    }
                } else {
                    target = 'free';
                }
            }
            
            if (target === 'free') {
                data.active = false;
                this.camera.focused = 'free';

                this.SFEControls.enablePan = true;
                this.camera.pan.button.deactive = false;
                this.SFECamera.targets.free = this.SFECamera.targets[focused].clone();
                this.SFEControls.target = this.SFECamera.targets.free;
                this.SFECamera.targets.focused = 'free';
            } else {
                data.active = true;
                this.camera.focused = target;
                this.SFECamera.targets.focused = target;
                this.SFEControls.enablePan = false;
                this.camera.pan.button.deactive = true;

                const duration = 300;
                this.SFEControls.target = this.SFECamera.targets[focused].clone();
                const targetChange = new TWEEN.Tween(this.SFEControls.target)
                .to(this.SFECamera.targets[target], duration)
                .easing(TWEEN.Easing.Exponential.Out);

                targetChange.start();
                await SFE.wait(duration);
                this.SFEControls.target = this.SFECamera.targets[target];
            }
        }
        resetFocus() {
            const data = this.camera.focus.button;
            this.changeFocus(null, data, 'free');
        }

        changeCameraMode(event, data, reset = false) {
            const mode = this.camera.mode;
            if (reset === true || data.name === mode) {
                this.camera.mode = 'free';
                this.camera.rotate.button.active = false;
                this.camera.pan.button.active = false;
                this.camera.zoom.button.active = false;

                this.SFEControls.enableRotate = true;
                this.SFEControls.enablePan = true;
                this.SFEControls.enableZoom = true;
                this.SFEControls.mouseButtons = {
                    LEFT: THREE.MOUSE.LEFT,
                    MIDDLE: THREE.MOUSE.MIDDLE,
                    RIGHT: THREE.MOUSE.RIGHT
                };
            } else {
                this.camera.mode = data.name;
                this.SFEControls.enableRotate = false;
                this.SFEControls.enablePan = false;
                this.SFEControls.enableZoom = false;
                if (data.name === 'rotate') {
                    this.camera.rotate.button.active = true;
                    this.camera.pan.button.active = false;
                    this.camera.zoom.button.active = false;

                    this.SFEControls.enableRotate = true;
                    this.SFEControls.mouseButtons = {
                        LEFT: THREE.MOUSE.LEFT,
                    };
                } else if (data.name === 'pan') {
                    this.camera.rotate.button.active = false;
                    this.camera.pan.button.active = true;
                    this.camera.zoom.button.active = false;

                    this.SFEControls.enablePan = true;
                    this.SFEControls.mouseButtons = {
                        RIGHT: THREE.MOUSE.LEFT,
                    };
                } else if (data.name === 'zoom') {
                    this.camera.rotate.button.active = false;
                    this.camera.pan.button.active = false;
                    this.camera.zoom.button.active = true;

                    this.SFEControls.enableZoom = true;
                    this.SFEControls.mouseButtons = {
                        MIDDLE: THREE.MOUSE.LEFT,
                    };
                }
            }
        }
        resetCameraMode() {
            this.changeCameraMode(null, null, true);
        }

        // 랜더링 기능

        // 랜더링 메뉴
        handleRenderingMenu(event, data) {
            var name = event.target.name;
            var value = event.target.value;

            if (name === 'closeMenu') {
                this.toggleMenu(event, this.setting.rendering);
            } else if (name === 'changeShading') {
                this.setting.shadingMode = value;
                this.changeShadingMode(value);
            } else if (name === 'outlineEnabled') {
                value = event.target.checked;
                this.setting.outlineEnabled = value;
                this.changeShadingMode(this.setting.shadingMode);
            } else if (name === 'gammaCorrection') {
                value = event.target.checked;
                this.setting.gammaInput = value;
                this.setting.gammaOutput = value;
                this.SFERenderer.gammaInput = value;
                this.SFERenderer.gammaOutput = value;
                this.SFERenderer.dispose();
            } else if (name === 'shadowMapEnabled') {
                value = event.target.checked;
                this.setting.shadowMapEnabled = value;
                this.SFERenderer.shadowMap.enabled = value;
                this.SFERenderer.dispose();
                /* for (var key in this.SFEScene.children) {
                    var child = this.SFEScene.children[key];
                    if (child.type === 'DirectionalLight') {
                        child.castShadow = value;
                    }
                } */
            } else if (name === 'shadowMapType') {
                this.setting.shadowMapType = value;
                this.SFERenderer.shadowMap.type = THREE[value];
                this.SFERenderer.dispose();
            } else if (name === 'shadowMapSize') {
                // console.log(value);
                this.setting.shadowMapSize = [value, value];
                for (var key in this.SFEScene.children) {
                    var child = this.SFEScene.children[key];
                    if (child.type === 'DirectionalLight') {
                        child.shadow.mapSize.set(value, value);
                    }
                }
            } else if (name === 'textureFilter' || name === 'textureMipMap') {
                value = event.target.checked;
                this.setting[name] = value;
                
                for (var key in this.SFEAssets.textures) {
                    var child = this.SFEAssets.textures[key];
                    if (this.setting.textureFilter === true) {
                        child.data.magFilter = THREE.LinearFilter;
                        if (this.setting.textureMipMap === true) {
                            child.data.minFilter = THREE.LinearMipMapLinearFilter;
                        } else if (this.setting.textureMipMap === false) {
                            child.data.minFilter = THREE.LinearFilter;
                        }
                    } else if (this.setting.textureFilter === false) {
                        child.data.magFilter = THREE.NearestFilter;
                        if (this.setting.textureMipMap === true) {
                            child.data.minFilter = THREE.NearestMipMapNearestFilter;
                        } else if (this.setting.textureMipMap === false) {
                            child.data.minFilter = THREE.NearestFilter;
                        }
                    }
                    // child.data.needUpdate = true;
                }
                this.SFERenderer.dispose();
            } else if (name === 'anisotropicFilter') {
                this.setting.anisotropicFilter = value;
                for (var key in this.SFEAssets.textures) {
                    var child = this.SFEAssets.textures[key];
                    child.data.anisotropy = value;
                }
                this.SFERenderer.dispose();
            } 
            
            else if (name === 'recompile') {
                this.SFERenderer.compile(this.SFEScene, this.SFECamera);
            } else if (name === 'dispose') {
                this.SFERenderer.dispose();
            } else if (name === 'test') {
                for (var key in this.SFEAssets.textures) {
                    var texture = this.SFEAssets.textures[key];
                    texture.data.image.width = 2560;
                    texture.data.image.height = 2560;
                    texture.data.needsUpdate = true;
                }
                this.SFERenderer.dispose();
            }
            // console.log(name, value);
        }

        // 쉐이딩 모드 전환
        changeShadingMode(shadingMode = null) {

            function changeMaterial(mesh, shadingMode) {
                if (SFE.isObject(mesh.materialSlots)) {
                    for (var index in mesh.materialSlots) {
                        mesh.material[index] = materials[mesh.materialSlots[index]][shadingMode];
                    }
                } else {
                    mesh.material = materials[mesh.materialSlots][shadingMode];
                }
            }

            var outlineEnabled = this.setting.outlineEnabled;
            var OutlineEffect = this.SFEPlayer.effects.outline;
            var models = this.SFEAssets.models;
            var meshes = this.SFEAssets.meshes;
            var materials = this.SFEAssets.materials;
            var mode = this.setting.shadingMode;

            if (!shadingMode) {
                var shadingMode = 'default';
                if (mode === 'default') {
                    shadingMode = 'diffuse';
                } else if (mode === 'diffuse') {
                    shadingMode = 'edgedFace';
                } else if (mode === 'edgedFace') {
                    shadingMode = 'default';
                } else {
                    shadingMode = 'default';
                }
            }
            this.setting.shadingMode = shadingMode;

            for (var key in meshes) {
                changeMaterial(meshes[key], shadingMode);
            }

            for (var key in models) {
                var model = models[key].data;
                var wireframes = model.wireframes;
        
                if (shadingMode === 'default') {
                    wireframes.visible = false;
                    OutlineEffect.enabled = outlineEnabled;
                } else if (shadingMode === 'diffuse') {
                    wireframes.visible = false;
                    OutlineEffect.enabled = outlineEnabled;
                } else if (shadingMode === 'edgedFace') {
                    wireframes.visible = true;
                    OutlineEffect.enabled = outlineEnabled;
                }
            }

        }

        handleDisplayMenu(event, data) {
            var name = event.target.name;
            var value = event.target.value;

            if (name === 'fieldOfView') {
                this.changefieldOfView(event, data);
            } else if (name === 'pixelRatio') {
                this.changePixelRatio(event, data);
            } else if (name === 'closeMenu') {
                this.toggleMenu(event, this.setting.display);
            } else if (name === 'canvasSmooth') {
                value = event.target.checked;
                this.VueData.canvas.smooth = value;
            } else if (name === 'fitScreen') {
                value = event.target.checked;
                this.VueData.canvas.fitScreen = value;
            } else if (name === 'aspectRatio') {
                if (value !== 'auto') {
                    value = Number(value);
                }
                this.VueData.canvas.aspectRatio = value;
                this.changeAspectRatio(value);
            } else if (name === 'gammaCorrection') {
                value = event.target.checked;
                this.setting.gammaInput = value;
                this.setting.gammaOutput = value;
                this.SFERenderer.gammaInput = value;
                this.SFERenderer.gammaOutput = value;
                this.SFERenderer.dispose();
            } 
            
            // console.log(name, value)
        }

        changefieldOfView(event, data) {
            var value = event.target.value;
            this.setting.fov = value;
            this.SFECamera.fov = value;
            this.SFECamera.updateProjectionMatrix();
        }

        changePixelRatio(event, data) {
            var value = event.target.value;
            this.setting.pixelRatio = value;
            this.SFERenderer.setPixelRatio(value);
        }

        changeAspectRatio(aspectRatio) {
            var screenWidth = this.SFEPlayer.container.clientWidth;
            if (aspectRatio === 'auto') {
                var screenHeight = this.SFEPlayer.container.clientHeight;
            } else {
                var screenHeight = this.SFEPlayer.container.clientWidth * aspectRatio;
            }

            this.SFECamera.aspect = screenWidth / screenHeight;
            this.SFECamera.updateProjectionMatrix();
            this.SFERenderer.setSize(screenWidth, screenHeight, false);
            // this.SFEPlayer.stats.refresh = true;
        }

        // 공유 기능

        // 다운로드
        downloadModel(event, data) {
            const models = this.SFEAssets.models;
            
            for (var key in models) {
                var model = models[key];
                var link = document.createElement('a');
                document.body.appendChild(link);
                link.href = model.file;
                link.download = model.name;
                var tempInput = document.querySelector('#tempinput');
                tempInput.insertBefore(link, tempInput.lastChild);
                link.click();
                link.remove();
            }
        }

        // 스크린샷
        // https://stackoverflow.com/questions/10673122/how-to-save-canvas-as-an-image-with-canvas-todataurl
        // https://jsfiddle.net/codepo8/V6ufG/2/
        // https://stackoverflow.com/questions/26193702/three-js-how-can-i-make-a-2d-snapshot-of-a-scene-as-a-jpg-image
        // https://jsfiddle.net/2pha/art388yv/
        async takeScreenshot(event, data) {
            /* var w = window.open('', '');
            w.document.title = "Screenshot";
            //w.document.body.style.backgroundColor = "red";
            var img = new Image();
            // Without 'preserveDrawingBuffer' set to true, we must render now
            this.SFERenderer.render(this.SFEScene, this.SFECamera);
            img.src = this.SFERenderer.domElement.toDataURL();
            w.document.body.appendChild(img); */

            /* var link = document.createElement('a');
            document.body.appendChild(link);
            this.SFERenderer.render(this.SFEScene, this.SFECamera);
            link.href = this.SFERenderer.domElement.toDataURL('image/png').replace('image/png', 'image/octet-stream');
            link.download = 'SFEScreenshot.png';
            var tempInput = document.querySelector('#tempinput');
            tempInput.insertBefore(link, tempInput.lastChild);
            link.click();
            link.remove(); */

            /* var w = window.open('', '');
            w.document.title = "Screenshot";
            //w.document.body.style.backgroundColor = "red";
            var img = new Image();
            // Without 'preserveDrawingBuffer' set to true, we must render now
            this.SFERenderer.render(this.SFEScene, this.SFECamera);
            img.src = this.SFERenderer.domElement.toDataURL();
            w.document.body.appendChild(img); */

            /* var w = window.open('', '');
            w.document.title = "Screenshot";
            //w.document.body.style.backgroundColor = "red";
            var img = new Image();
            // Without 'preserveDrawingBuffer' set to true, we must render now
            this.SFERenderer.render(this.SFEScene, this.SFECamera);
            img.src = this.SFECanvas.toDataURL('image/png');
            w.document.body.appendChild(img); */

            /* var link = document.createElement('a');
            document.body.appendChild(link);
            this.SFERenderer.render(this.SFEScene, this.SFECamera, null, false);
            link.href = this.SFECanvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
            link.download = 'SFEScreenshot.png';
            var tempInput = document.querySelector('#tempinput');
            tempInput.insertBefore(link, tempInput.lastChild);
            link.click();
            link.remove(); */

            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');

            var w = window.open('', '');
            w.document.title = 'Screenshot';
            w.document.body.appendChild(canvas);

            var img = new Image();
            // this.SFERenderer.render(this.SFEScene, this.SFECamera);
            this.SFEPlayer.render();
            img.src = this.SFECanvas.toDataURL('image/png');
            
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                context.drawImage(img, 0, 0);
                // document.body.appendChild(canvas);
            };
        }

        toggleLinkMenu(event, data) {
            var linkButton = this.share.link.button;
            var linkMenu = this.share.link.menu;

            if (linkMenu.show === false) {
                this.closeAllMenu();
                linkButton.active = true;
                this.getLinkUrl();
                linkMenu.show = true; 
            } else if (linkMenu.show === true) {
                linkButton.active = false;
                linkMenu.show = false; 
            }

        }

        handleLinkMenu(event, data) {
            // console.log(event, data);
            var eventName = event.target.attributes.name.value;

            if (eventName === 'checkautoStart') {
                this.getLinkUrl();
            } else if (eventName === 'checkStartTime') {
                if (event.target.checked === true) {
                    document.getElementById('startTime').disabled = false;
                } else if (event.target.checked === false) {
                    document.getElementById('startTime').disabled = true;
                }
                this.getLinkUrl();
            }

            else if (eventName === 'closeMenu') {
                this.toggleLinkMenu(event, data);
            } else if (eventName === 'copyUrl') {
                this.getLinkUrl();
                setTimeout(() => {
                    this.copyLinkUrl();
                }, 10);
            }
        }

        getLinkUrl() {
            var camera_position = this.SFECamera.position;
            var camera_target = this.SFEControls.target;

            var modelNames = [];
            const models = this.SFEAssets.models;
            for (var key in models) {
                modelNames.push(models[key].name);
            }

            var params = {
                models: modelNames.join(','),
                camera_position: [
                    Math.round(camera_position.x),
                    Math.round(camera_position.y),
                    Math.round(camera_position.z),
                ],
                camera_target: [
                    Math.round(camera_target.x),
                    Math.round(camera_target.y),
                    Math.round(camera_target.z),
                ],
            };
            if (document.getElementById('checkautoStart').checked === true) {
                params.autostart = true;
            }
            if (document.getElementById('checkStartTime').checked === true) {
                params.starttime = this.VueData.player.time;
            }
            if (this.SFECamera.targets.focused !== 'free') {
                params.focustarget = this.SFECamera.targets.focused;
            }
            if (this.setting.outlineEnabled === true) {
                params.outline = true;
            }


            var urlParams = '';
    		for (var key in params) {
    			var value = params[key];
    			if (!SFE.isEmpty(value)) {
    				urlParams = urlParams + '&' + key + '=' + value;
    			}
            }
    		var url = decodeURIComponent(location.href).split('?')[0];
            var linkUrl = url + '?' + urlParams.substring(1);
            this.share.linkUrl = linkUrl;
        }

        copyLinkUrl() {
            var input = document.getElementById('linkUrl');
            input.focus();
            input.select();
            document.execCommand('copy', false);
        }

        handleAnimationMenu(event, data) {
            if (event.target.name === 'closeMenu') {
                this.toggleMenu(event, this.player.tune);
            } else if (event.target.name === 'loopMode') {
                this.changeLoopMode(event, data, event.target.value);
            } else if (event.target.name === 'playMode') {
                if (event.target.value === 'forward') {
                    this.player.reverse = false;
                } else if (event.target.value === 'backward') {
                    this.player.reverse = true;
                } else if (event.target.value === 'time') {
                    this.changePlayMode(null, null, 'time');
                } else if (event.target.value === 'frame') {
                    this.changePlayMode(null, null, 'frame');
                }
            }
        }

        // 기초 기능

        // 팝업 표시
        async togglePopup(event, data) { 
            await SFE.wait(200);
            if (SFE.isObject(data.popup)) {
                if (event.type === 'mouseover') {
                    data.popup[event.target.name] = true;
                } else if (event.type === 'mouseout') {
                    data.popup[event.target.name] = false;
                }
            } else {
                if (event.type === 'mouseover') {
                    data.popup = true;
                } else if (event.type === 'mouseout') {
                    data.popup = false;
                }
            }
        }

        // 메뉴 표시
        toggleMenu(event, data) {
            // console.log(data)
            if (data.menu.show === false) {
                this.closeAllMenu();
                data.button.active = true;
                data.menu.show = true;
            } else if (data.menu.show === true) {
                data.button.active = false;
                data.menu.show = false;
            }
        }
        closeAllMenu(exception = null) {
            for (var key in this.menus) {
                // this.menus[key].show = false;
                if (exception) {
                    if (this.menus[key].name !== exception) {
                        this.menus[key].button.active = false;
                        this.menus[key].menu.show = false;
                    }
                } else {
                    this.menus[key].button.active = false;
                    this.menus[key].menu.show = false;
                }
            }
        }

        // 마우스 입력 체크
        checkInput(event, data) {
            // TODO: 입력중에 hover 이벤트 막을것
            if (event.type === 'mousedown') {
                this.onClick = true;
                // three.js 컨트롤
                if (this.SFEControls.enabled === true) {
                    this.onInput = true;
                // UI 인풋
                } else if (event.target.localName === 'input' && event.target.type === 'range') {
                    if (data !== undefined && data.active !== undefined) {
                        data.active = true; 
                        this.onInputData = data;
                    } else {
                        this.onInput = true;
                    }
                    if (event.target.name === 'timeline') {
                        // this.onInputData.name = event.target.name;
                        if (this.SFEAction.paused === false) {
                            this.SFEAction.paused = true;
                        } 
                    }
                }
            } else if (event.type === 'mouseup') {
                this.onClick = false;
                if (this.onInputData) {
                    if (this.onInputData.active === true) {
                        this.onInputData.active = false;
                    }
                    if (
                        // this.onInputData.name === 'forward' || this.onInputData.name === 'backward' ||
                        this.onInputData.name === 'playForward' || this.onInputData.name === 'playBackward'
                    ) {
                        this.player.reverse = this.onInputData.reverse;
                        this.SFEAction.paused = true;
                    } else if (this.onInputData.name === 'timeline') {
                        if (this.player.paused === false) {
                            this.SFEAction.paused = false;
                        }
                    }
                }
                this.onInputData = false;
                this.onInput = false;
            }
            // console.log('onInput', this.onInput, this.onInputData);
        }

        // three.js 컨트롤 체크
        toggleControls(event) {
            // 컨트롤 중에는 return false.
            if (this.onInput !== false) {
                return false;
            }

            if (event.type === 'mouseenter' || event.type === 'touchstart') {
                this.SFEControls.enabled = false;
            } else if (event.type === 'mouseleave'|| event.type === 'touchend') {
                this.SFEControls.enabled = true;
            }
            // console.log(this.SFEControls.enabled)
        }

        test() {
            console.log(this);
        }


    }

    // Viewer.js
    const LAYER$4 = 'SFEViewer: ';

    var Make = new SFE.ComponentsMaker();

    // export class Player {
    SFE.Viewer = class {

        constructor(userOptions = null) {
            // 전역 USERDATA 필수
            if (window.USERDATA === undefined) {
                throw Error(LAYER$4 + 'USERDATA REQUIRED');
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
            this.effects = {};
            
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
                throw Error(LAYER$4 + 'WEBGL SUPPORTED BROWSER REQUIRED');
            }
            
            // 스타팅 로그
            console.log(LAYER$4 + 'SFE Viewer v0.0.1. based on three.js r97');

            // webGL2 메시지
            console.log(LAYER$4 + 'WebGL2:', THREE.WEBGL.isWebGL2Available());

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

            console.log(LAYER$4 + 'Options:', options);
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
                throw Error(LAYER$4 + 'CONTAINER IS NOT EXIST');
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
            };

            var options = this.options;
            var canvasId = 'viewer3d_render';
            var canvas = this.makeCanvas(canvasId);
            var scene = Make.Scene(options.scene);
            var renderer = Make.WebGLRenderer(options.renderer, canvas);
            var camera = Make.PerspectiveCamera(options.camera, canvas);

            var targetScene = {
                canvas: canvas,
                scene: scene,
                renderer: renderer,
                camera: camera,
            };
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
            this.models = {};
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
            console.log(LAYER$4 + 'VueData:', this.VueData);

            // 컨트롤러 클래스
            this.Controller = new ViewerController(this);

        }

        loadAssets() {
            var firstLoad = true;

            for (var index in this.options.models) {
                var modelOption =  this.options.models[index];
                var model = this.Assets.makeModel(modelOption.name, modelOption.category, modelOption.relativePath);
                this.loadModel(model, modelOption, firstLoad);
                firstLoad = false;
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
                        }; 
                    })
                );
            };
            model.onProgress = function() {
                Loader.changeFileProgress(this);
            };
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
                };

                // 애니메이션 정지
                modelData.mixer.action.play();
                modelData.mixer.action.paused = true;
            }

            if (firstLoad === true) {
                // 로더 대기열 완료까지 지연
                await Promise.all(Loader.queue);
                this.Loader.progress.make_assets = 50;
                this.Loader.changeStatus();

                console.log(LAYER$4 + 'Assets:', this.Assets);
                console.log(LAYER$4 + 'Sequence:', this.Sequence);
                console.log(LAYER$4 + 'LOADING COMPLETE');

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
                this.stats.refresh = true;
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
                updateInfo('bufferSize', context.drawingBufferWidth + ' X ' + context.drawingBufferHeight);
                updateInfo('drawCalls', renderInfo.calls);
                updateInfo('points', renderInfo.points);
                updateInfo('lines', renderInfo.lines);
                updateInfo('triangles', renderInfo.triangles);
                this.stats.refresh = false;
            }

            // 상시 업데이트
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
    };

}());
