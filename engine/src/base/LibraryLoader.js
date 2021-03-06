// LibraryLoader.js
const LAYER = 'APPLOADER: ';

/* import {
    isEmpty,
    isArray,
    getFileStrFromUrl,
} from '../common/functions.js'; */

// FIXME: min 파일 체크 요망
export class LibraryLoader {

    constructor(userData) {
        // 라이브러리 로디드 플래그
        if (window.USERDATA.libs.Loaded === true) {
            return true;
        }
        this.basePath = userData.paths.appPath;
        this.libraries = userData.libs;
        this.fonts = this.libraries.fonts;
        this.styles = this.libraries.styles;
        this.scripts = this.libraries.scripts;
        this.modules = this.libraries.modules;
        this.lodedFont;
        this.lodedStyle;
        this.lodedScript;

        // 로드된 폰트
        let lodedFont = {}
        /* for (var fontFace of document.fonts.values()) {
            lodedFont[fontFace.family] = fontFace.loaded;
        } */
        // 파이어폭스 호환성
        var dFonts = document.fonts.values();
        for (var i = 0; i < document.fonts.size; i++) {
            var fontFace = dFonts.next().value;
            lodedFont[fontFace.family] = fontFace.loaded;
        }
        this.lodedFont = lodedFont;

        // 로드된 CSS
        var lodedStyle = {}
        for (var key in document.styleSheets) {
            var href = document.styleSheets[key].href
            if (href !== undefined) {
                var filename = SFE.getFileStrFromUrl(href);
                lodedStyle[filename] = href;
            }
        }
        this.lodedStyle = lodedStyle;

        // 로드된 스크립트
        var lodedScript = {}
        for (var key in document.scripts) {
            var src = document.scripts[key].src
            if (src !== undefined) {
                var filename = SFE.getFileStrFromUrl(src);
                lodedScript[filename] = src;
            }
        }
        this.lodedScript = lodedScript;

    }

    async load() {
        var i = 0;
        let promises = []
        /* await document.fonts.ready.then(function() {
            if (!isEmpty(loader.fonts)) {
                for (var key in loader.fonts) {
                    promises[i] = loader.checkFont(loader.fonts[key]);
                    i++;
                }
            }
        }); */
        if (!SFE.isEmpty(this.fonts)) {
            for (var key in this.fonts) {
                this.checkFont(this.fonts[key]);
                i++;
            }
        }
        if (!SFE.isEmpty(this.styles)) {
            for (var key in this.styles) {
                this.checkStyle(this.styles[key]);
            }
        }
        if (!SFE.isEmpty(this.scripts)) {
            for (var key in this.scripts) {
                this.checkScript(this.scripts[key]);
            }
        }
        if (!SFE.isEmpty(this.modules)) {
            for (var key in this.modules) {
                promises[i] = this.checkModule(this.modules[key]);
                i++;
            }
        }

        return Promise.all(promises)
        .then(function () {
            // 라이브러리 로디드 플래그
            window.USERDATA.libs.Loaded = true;
            console.log(LAYER + 'LIBRARY LOADED');
        });

    }

    checkFont(font) {
        let filename = SFE.getFileStrFromUrl(font.src)
        /* if(document.fonts.check('18px ' + font.fontFamily) === false) {
            this.injectCSS(font.css); */
        if (this.lodedFont[font.fontFamily] === undefined) {
            this.injectCSS(font.css);
        } else {
            // log(LAYER + 'FONT CHECKED:', filename);
        }
    }

    checkStyle(style) {
        let filename = SFE.getFileStrFromUrl(style)
        if (this.lodedStyle[filename] === undefined) {
            // log(LAYER + 'STYLE LOAD:', filename);
            this.injectCSS(style);
        } else {
            // log(LAYER + 'STYLE CHECKED:', filename);
        }
    }

    checkScript(script) {
        let filename = SFE.getFileStrFromUrl(script);
        if (this.lodedScript[filename] === undefined) {
            // log(LAYER + 'SCRIPT LOAD:', filename);
            this.injectScript(script);
        } else {
            // log(LAYER + 'SCRIPT CHECKED:', filename);
        }
    }

    async checkModule(script) {

        let loader = this;
        if (check(script.id) === undefined) {
            return load(loader, script);
        } else {
            if (script.src !== undefined) {
                // log(LAYER + 'MODULE CHECKED:', SFE.getFileStrFromUrl(script.src));
            } else if (script.roader !== undefined) {
                // log(LAYER + 'MODULE CHECKED:', SFE.getFileStrFromUrl(script.roader));
            }
        }

        function check(objectId) {
            // TODO: objectId 배열이 2개 초과일 경우 처리 수정.
            if (SFE.isArray(objectId)) {
                if (window[objectId[0]] !== undefined) {
                    return window[objectId[0]][objectId[1]];
                }
                return undefined;
            } else {
                return window[objectId];
            }
        }

        async function load(loader, script) {
            if (script.src !== undefined) {
                // log(LAYER + 'MODULE LOAD:', SFE.getFileStrFromUrl(script.src));
            }
            if (script.roader !== undefined) {
                // log(LAYER + 'MODULE LOAD:', SFE.getFileStrFromUrl(script.roader));
            }
            return loader.loadModule(loader.basePath, script);
        }

    }

    injectCSS(src) {
        let head = document.querySelector('head');
        let cssTag = document.createElement('link');
        cssTag.type = 'text/css';
        cssTag.rel = 'stylesheet';
        cssTag.href = this.basePath + src;
        head.insertBefore(cssTag, head.lastChild.nextSibling);
    }

    injectScript(src) {
        let head = document.querySelector('head');
        let scriptTag = document.createElement('script');
        scriptTag.type = 'text/javascript';
        scriptTag.src = this.basePath + src;
        head.insertBefore(scriptTag, head.lastChild.nextSibling);
    }

    async loadModule(basePath, script) {

        // ES6 임포트 (기본 함수)
        let importModule = (function (src) {
            // return import(src);
            return SystemJS.import(src);
        });

        // 전역객체 등록
        let registerModule = (function (objectId, result) {
            let OBJECT = {}
            if (SFE.isArray(objectId)) {
                window[objectId[0]][objectId[1]] = OBJECT;
                Object.assign(OBJECT, result);
            } else {
                window[objectId] = OBJECT;
                Object.assign(OBJECT, result);
            }
        });

        if (script.type === 'inject') {
            // 인젝트일 경우 헤더에 인젝트
            this.injectScript(script.src);
        } else if (script.type === 'ES5') {
            // ES5 일 경우 임포트함수를 SystemJS로 변경
            importModule = (function (src) {
                return SystemJS.import(src);
            });
        }

        let module;
        if (script.type === 'ES5' || script.type === 'ES6') {
            if (script.src !== undefined) {
                module = importModule(basePath + script.src);
                if (script.register === true) {
                    module.then(function (result) {
                        return registerModule(script.id, result);
                    });
                }
                if (script.roader !== undefined) {
                    module.then(function () {
                        return importModule(basePath + script.roader);
                    });
                }
            } else {
                if (script.roader !== undefined) {
                    module = importModule(basePath + script.roader);
                }
            }
        }
        return module;

    }

}