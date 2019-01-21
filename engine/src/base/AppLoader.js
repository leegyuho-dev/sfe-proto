// AppLoader.js
const LAYER = 'AppLoader: ';

/* import {
    isEmpty,
} from '../common/functions.js'; */

import { ConfigLoader } from './ConfigLoader.js';
import { LibraryLoader } from './LibraryLoader.js';

export class AppLoader {

    constructor(USERDATA = null) {
        // TODO: 쿠키 검사, 모바일 검사 추가 요망.
        if (!USERDATA || SFE.isEmpty(USERDATA)) {
            throw Error(LAYER + 'USERDATA REQUIRED');
        }
        this.userData = USERDATA;
        // 전역객체 검사. 
        // 존재하면 참조. 없으면 추가.
        if (SFE.isEmpty(window.USERDATA)) {
            window.USERDATA = this.userData;
        } else {
            this.userData = USERDATA;
        }
    }

    async checkUserData() {
        var UserData = new ConfigLoader(this.userData);
        this.userData = await UserData.check();
    }

    // 로드 라이브러리. 
    // 라이브러리 체크 및 로드하고 로디드 플래그 추가.
    async loadLibrary() {
        var Library = new LibraryLoader(this.userData);
        return await Library.load();
    }

    // 앱 스타트. 
    // 앱 스타트 스크립트를 인젝트한다.
    startApp(startScript = null) {
        if (!startScript) {
            if (!SFE.isEmpty(this.userData.info.startScript)) {
                startScript = this.userData.info.startScript;
            } else {
                console.error('STARTSCRIPT REQUIRED');
            }
        }
        var script = document.createElement('script');
        script.id = 'scriptStartApp';
        script.type = 'module';
        script.src = this.userData.paths.appPath + startScript;
        var head = document.querySelector('head');
        head.insertBefore(script, head.lastChild.nextSibling);
        
        console.log(LAYER + 'START');
    }

}