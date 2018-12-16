// Vue.js UI Modeler
const LAYER = 'SFEPlayer: ';

import {
    isEmpty,
    isArray,
    padNumber,
} from '../../common/functions.js';

export class VueUIModeler {

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
        if (isEmpty(elementId)) {
            console.error(LAYER + 'VueUI:', 'ELEMENTID REQUIRED');
            return false;
        }
        if (elementId.substring(0, 1) !== '#') {
            elementId = '#' + elementId;
        }
        if (!document.querySelector(elementId)) {
            console.error(LAYER + 'VueUI:', 'UI CONTAINER NOT EXIST');
            return false;
        }

        this.defineVueData();
        this.makeVueComponents();

        this.VueUI = new Vue({
            el: '#viewer3d_ui',
            data: this.VueData,
            methods: {
                touch: function (event) {
                    if (!isEmpty(this.ui.events) && typeof this.ui.events.touch === "function") {
                        this.ui.events.touch(event);
                    }
                },
                mouseInput: function (event) {
                    if (!isEmpty(this.ui.events) && typeof this.ui.events.mouseInput === "function") {
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
        }

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
                if (!isEmpty(this.data.events) && typeof this.data.events.click === "function") {
                    this.data.events.click(event, this.data);
                }
            },
            hover: function (event) {
                if (!isEmpty(this.data.events) && typeof this.data.events.hover === "function") {
                    this.data.events.hover(event, this.data);
                }
            },
            touch: function (event) {
                if (!isEmpty(this.data.events) && typeof this.data.events.touch === "function") {
                    this.data.events.touch(event);
                }
            },
            input: function (event) {
                if (!isEmpty(this.data.events) && typeof this.data.events.input === "function") {
                    this.data.events.input(event, this.data);
                }
            },
            mouseInput: function (event) {
                if (!isEmpty(this.data.events) && typeof this.data.events.mouseInput === "function") {
                    this.data.events.mouseInput(event, this.data);
                }
            },
            change: function (event) {
                if (!isEmpty(this.data.events) && typeof this.data.events.change === "function") {
                    this.data.events.change(event, this.data);
                }
            },
            transition: function (event) {
                if (!isEmpty(this.data.events) && typeof this.data.events.transition === "function") {
                    this.data.events.transition(event, this.data);
                }
            },
        }

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
                    return LANGS[category][name];
                },
                classes: function () {
                    return [
                        this.data.name,
                        {
                            active: this.data.active,
                            deactive: (this.data.deactive || isEmpty(this.data.events.click)),
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
                    if (isEmpty(title)) {
                        title = this.data.model;
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
                        title: LANGS[category][name],
                        info: LANGS[category][name+'_info'],
                        copyUrl: LANGS.share.copyUrl,
                        autoStart: LANGS.player.autoStart,
                        startTime: LANGS.player.startTime,
                    };
                },
                startTime: function() {
                    // console.log(VueData.player.time)
                    /* if (this.playMode === 'time') {
                        return this.$parent.data.time;
                    } else if (this.playMode === 'frame') {
                        return this.$parent.data.frame;
                    } */
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
                                return LANGS['player']['realTime'];
                            } else if (this.mode === 'frame') {
                                return LANGS['player']['keyFrame'];
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
                        <div v-if="text.info" class="info">{{ text.info }}</div>
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
                                    {{ text.realTime }}
                                </button>
                                <button name="playMode" value="frame" class="text" :class="playMode.frame" v-on:click="click">
                                    {{ text.keyFrame }}
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
                        title: LANGS[category][name],
                        info: LANGS[category][name+'_info'],

                        infom: LANGS.info,
                        playSpeed: LANGS.player.playSpeed,
                        loopMode: LANGS.player.loopMode,
                        playMode: LANGS.player.playMode,
                        forwardPlay: LANGS.player.forwardPlay,
                        backwardPlay: LANGS.player.backwardPlay,
                        realTime: LANGS.player.realTime,
                        keyFrame: LANGS.player.keyFrame,
                        once: LANGS.player.repeatOne,
                        repeat: LANGS.player.repeatInfinity,
                        pingpong: LANGS.player.repeatPingpong,
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
                    }
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
                                var popupHalfWidth = (popup.clientWidth / 2)

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
                        <div v-if="text.info" class="info">{{ text.info }}</div>
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
                            <label>시야각</label>
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
                                    자동
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
                                        <span class="label">감마 보정</span>
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
                        title: LANGS[category][name],
                        info: LANGS[category][name+'_info'],

                        infom: LANGS.info,
                        smoothing: LANGS.setting.smoothing,
                        fitScreen: LANGS.setting.fitScreen,
                        fitScreen: LANGS.setting.fitScreen,
                        resolution: LANGS.setting.resolution,
                        aspectRatio: LANGS.setting.aspectRatio,
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
                        <div v-if="text.info" class="info">{{ text.info }}</div>
                        <div class="info">

                        </div>
                    </div>
                    
                    <div class="items">

                        <!-- <div class="item label">라벨</div> -->

                        <div class="ui row">
                            <label>퀵 쉐이딩 모드</label>
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
                                <span class="label">아웃라인</span>
                                <input type="checkbox" name="outlineEnabled" id="outlineEnabled"
                                    :checked="rendering.outlineEnabled"
                                    v-on:change="change"
                                >
                            </label>
                        </div>

                        <div class="ui row">
                            <div class="item input">
                                <label>
                                    <span class="label">텍스쳐 필터링</span>
                                    <input type="checkbox" name="textureFilter" id="textureFilter"
                                        :checked="rendering.textureFilter"
                                        v-on:change="change"
                                    >
                                </label>
                            </div>
                            <div class="item input">
                                <label>
                                    <span class="label">밉맵</span>
                                    <input type="checkbox" name="textureMipMap" id="textureMipMap"
                                        :checked="rendering.textureMipMap"
                                        v-on:change="change"
                                    >
                                </label>
                            </div>
                            <div class="item input">
                                <label>이방성 필터링</label>
                                <input name="anisotropicFilter" id="anisotropicFilter" type="number" 
                                    min="0" max="16"
                                    :value="rendering.anisotropicFilter"
                                    v-on:input="input"
                                >
                            </div>
                        </div>

                        <div class="ui row">
                            <label>
                                <span class="label">쉐도우맵</span>
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
                        title: LANGS[category][name],
                        info: LANGS[category][name+'_info'],

                        infom: LANGS.info,
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