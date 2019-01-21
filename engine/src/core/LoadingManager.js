// LoadingManager.js
const LAYER = 'LoadingManager: ';

/* import {
    wait,
} from '../common/functions.js'; */

export class LoadingManager {
    constructor() {
        Vue.directive('ready', {});

        this.loading = true;
        this.queue = []
        this.status = 'ready';
        this.models = {}
        this.textures = {}
        this.progress = {
            initialize: 0,
            load_model: 0,
            load_texture: 0,
            make_assets: 0,
        };
        this.onStart, this.onFinish, this.onChange, this.onError;

        this.loadingCircle = {}

        // 뷰모델 검사
        if (window.VIEWMODEL === undefined) {
            window.VIEWMODEL = {};
        }
    }

    reset() {
        this.queue = []
        this.status = 'ready';
        this.models = {}
        this.textures = {}
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
            files[asset.name] = {}
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