import {
    isEmpty,
    isArray,
    getJsonFile,
    getFileStrFromUrl as getFile,
    getPathDirFromUrl as getPath,
} from '../common/functions.js';

const LAYER = 'APPLOADER: ';
export class ConfigLoader {

    constructor(userData) {
        this.userData = userData;
        this.appConfig;
        this.appLibraries;
        this.appLang;
    }

    async check() {
        // 컨피그 체크
        this.awaitConfigs = [
            this.appConfig = this.checkAppConfig(),
            this.appLibraries = this.checkAppLibraries(),
            this.appLang = this.checkAppLang(),
        ];
        return Promise.all(this.awaitConfigs)
            .then(results => {
                if (results[0] === true &&
                    results[1] === true &&
                    results[2] === true) {
                    console.log(LAYER + 'USERDATA CHECKED');
                    return this.userData;
                } else {
                    console.log(LAYER + 'USERDATA LOADED');
                    return this.userData;
                }
            }); 
    }

    async checkAppConfig() {
        let appConfig;
        // 유저 데이터 컨피그 검사
        // 존재하지 않을 경우 파일로드해서 선언
        if (isEmpty(this.userData.APPID) ||
            isEmpty(this.userData.APPMODE) ||
            isEmpty(this.userData.INFO)) {
            const url = this.userData.paths.appPath+'configs/appconfig.json5';
            appConfig = await getJsonFile(url);
            // TODO: 쿠키 검사, 모바일 검사 추가 요망.
            // this.userData.info.appId = appConfig.appId;
            // this.userData.info.appMode = 'start';
            let info = appConfig;
            info.appMode = 'start';
            info.lang = this.userData.lang;
            info.isMobile = false;
            info.useCache = true;
            this.userData.info = info;
        } else {
            appConfig = true;
        }
        return appConfig;
    }

    async checkAppLibraries() {
        let appLibraries;
        // 라이브러리 컨피그 검사
        // 존재하지 않을 경우 파일로드해서 선언
        if (isEmpty(this.userData.libs)) {
            const url = this.userData.paths.appPath+'configs/applibraries.json5';
            appLibraries = await getJsonFile(url);
            this.userData.libs = appLibraries;
        } else {
            appLibraries = true;
        }
        return appLibraries;
    }

    async checkAppLang() {
        let appLang;
        // 라이브러리 컨피그 검사
        // 존재하지 않을 경우 파일로드해서 선언
        if (isEmpty(this.userData.langs)) {
            const url = this.userData.paths.appPath+'configs/lang/'+this.userData.info.lang+'.json5';
            appLang = await getJsonFile(url);
            this.userData.langs = appLang;
        } else {
            appLang = true;
        }
        return appLang;
    }

}