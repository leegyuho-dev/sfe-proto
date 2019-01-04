// ViewModeler.js
const LAYER = 'SFE:';

import {
    getFileContents,
} from '../common/functions.js';

export class VueSiteModeler {

    constructor(SFEData) {
        this.SFEData = SFEData;
        this.SiteData = {}
        this.VueSite = {}
    }

    // 템플릿 초기화
    async makeSite() {

        await this.defineSiteData();
        this.makeVueSite();

        return this.VueSite;
    }

    async defineSiteData() {
        var SFEData = this.SFEData;

        var mainFile = this.SFEData.paths.appPath + this.SFEData.conf.appHtml;
        var appTemplate = await getFileContents(mainFile);

        this.SiteData = {
            appId: SFEData.info.appId,
            appName: SFEData.info.appName,
            appTitle: SFEData.info.title,
            // appMode: SFEData.langs[SFEData.info.appMode],
            appMode: SFEData.info.appMode,
            appVersion: SFEData.info.appVersion,
            // baseUrl: ((SFEData.server['HTTPS'] == 'on') ? 'https://' : 'http://') + SFEData.server['HTTP_HOST'],
            appUrl: ((SFEData.server['HTTPS'] == 'on') ? 'https://' : 'http://') + SFEData.server['HTTP_HOST'] + '/' + SFEData.info.appId,
            appIcon: SFEData.paths.icons + SFEData.libs.icons['favicon-16x16'],
            homepage: SFEData.conf.homepage,
            appTemplate: appTemplate,
            appInfo: {
                target: '',
                status: '',
            },
            siteName: SFEData.conf.siteName,
            siteOwner: SFEData.conf.siteOwner,
        }
    }

    makeVueSite() {

        Vue.component('sfe-site-title', {
            props: ['data'],
            template: `
                <div id="apptitle" class="navbar top">
                    <app-logo :appicon="data.appIcon"></app-logo>
                    <app-menu></app-menu>
                    <app-title 
                        :url="data.appUrl"
                        :sitename="data.siteName"
                        :title="data.appTitle"
                        :info="data.appInfo"
                    ></app-title>
                    <app-user></app-user>
                </div>
            `,
            components: {
                'app-logo': {
                    props: ['appicon'],
                    template: '<i class="BI iconSS"></i>'
                },
                // FIXME: Dummy menu
                'app-menu': {
                    // props: ['appicon'],
                    template: `
                        <div class="menu">
                            <div class="item">파일</div>
                            <div class="item">장면</div>
                            <div class="item">보기</div>
                        </div>
                    `,
                },
                'app-title': {
                    props: ['url', 'sitename', 'title', 'info'],
                    template: `
                        <div class="title">
                            <a v-bind:href="url">
                                {{ titles }}
                            </a>
                        </div>
                    `,
                    computed: {
                        titles: function () {
                            this.sitename;
                            this.title;
                            this.info.target;

                            var siteTile = this.sitename + ' : ' + this.title;
                            document.querySelector('title').text = siteTile;

                            var appTitle = this.title;
                            if (this.info.target) {
                                appTitle = this.title + ' : ' + this.info.target;
                            }

                            return appTitle;
                        },
                    }
                },
                'app-user': {
                    template: '<div class="user"><i class="xi xi-user"></i></div>'
                },
            }
        });

        Vue.component('sfe-site-footer', {
            props: ['data'],
            template: `
                <div id="appfooter" class="navbar bottom">
                    <app-status
                        :info="data.appInfo"
                    ></app-status>
                    <app-version
                        :homepage="data.homepage"
                        :siteowner="data.siteOwner"
                        :appname="data.appName"
                        :version="data.appVersion"
                    ></app-version>
                </div>
            `,
            components: {
                'app-status': {
                    props: ['info'],
                    template: `
                        <div class="status">
                            <i class="xi xi-info-o"></i>
                            {{ info.status }}
                        </div>
                    `
                },
                'app-version': {
                    props: ['homepage', 'siteowner', 'appname', 'version'],
                    template: `
                        <div class="version">
                            <i class="xi xi-twitter text-twitter"></i>
                            <a v-bind:href="homepage">
                            <!-- {{ appname }} {{ version }} -->
                            {{ siteowner }}
                            </a>
                        </div>
                    `,
                }
            }
        });

        Vue.component('sfe-site-main', {
            props: ['data'],
            template: `
                <div id="appmain" class="contents" 
                    :class="data.appId"
                    v-html="data.appTemplate"
                >
                </div>
            `,
        });

        this.VueSite = new Vue({
            el: '#appbody',
            data: {
                SiteData: this.SiteData,
            },
        });

    }

}
