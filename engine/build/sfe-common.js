(function () {
    'use strict';

    var fileTypes = {

        html: [
            'text/html',
        ],
        htm: [
            'text/html'
        ],
        php: [
            'text/html'
        ],
        css: [
            'text/css',
            // 'text/plain',
        ],
        js: [
            'text/javascript',
            'application/javascript',
            'application/x-javascript',
            // 'text/plain',
        ],
        json: [
            'text/json',
            'application/json',
            // 'application/ld+json',
            // 'application/manifest+json',
            // 'application/schema+json',
            // 'text/plain',
        ],
        json5: [
            'text/json5',
            'application/json5',
            'text/plain',
        ],
        xml: [
            'text/xml',
            'application/xml',
            // 'application/atom+xml',
            // 'application/rdf+xml',
            // 'application/rss+xml',
            // 'text/plain',
        ],
        md: [
            'text/markdown',
        ],
        jpg: [
            'image/jpg'
        ],
        bmp: [
            'image/bmp'
        ],
        gif: [
            'image/gif'
        ],
        png: [
            'image/png'
        ],
        svg: [
            'image/svg',
            'image/svg+xml'
        ],
        tga: [
            'image/tga',
            'text/plain'
        ],
        psd: [
            'image/psd',
            'text/plain'
        ],
        fbx: [
            'application/fbx',
            'text/plain'
        ],
        eot: [
            'font/eot',
            'application/vnd.ms-fontobject'
        ],
        otf: [
            'font/otf',
            "font/opentype"
        ],
        ttf: [
            'font/ttf'
        ],
        woff: [
            'font/woff'
        ],
        woff2: [
            'font/woff2'
        ],

        // zip: '',
        // rar: '',
        // gzip: '',
        // br: '',

        // ext: 'application/x-x509-ca-cert',
        // ext: 'application/x-pkcs7-crl',
    };

    // Common Functions module

    // Promise XMLHttpRequest
    async function requestData(url, option = null) {

        try {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            // TODO: 옵션 처리
            /* if (!isEmpty(option.header)) {
                option.header.forEach((value, key) => {
                   xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest"); 
                });
            } */

            xhr.send();
            const request = await new Promise((resolve, reject) => {
                xhr.onload = function () {
                    if (xhr.status == 200) {
                        resolve(xhr.response);
                    } else {
                        reject(Error(xhr.statusText));
                    }
                };
            });
            return request;
        }
        catch (error) {
            throw Error(error);
        }

    }

    // fetch 파일
    // 다운로드 프로그레스를 감시할 필요가 없는 kb 단위 소용량 파일에만 사용함.
    async function fetchFile(url, option = null) {
        
        try {
            const file = await fetch(url, option);
            if (file.ok === false) {
                return false;
            }

            // 파일 타입 검사
            // TODO: 파일 헤더 체크 추가.
            // filetypes.js 참고.
            const ext = getFileExt(url);
            let type = 'text';
            // if (isEmpty(fileTypes[ext]) || fileTypes[ext].indexOf(blob.type) === -1) {
            if (isEmpty(fileTypes[ext])) {
                throw Error('fetchFile: ' + 'FILETYPE ERROR');
            } else {
                if (!isEmpty(option) && !isEmpty(option.type)) {
                    type = option.type;
                } else {
                    type = fileTypes[ext][0].split('/')[0];
                }
            }

            // 파일타입에 따라 처리.
            // https://developer.mozilla.org/ko/docs/Web/API/Fetch_API/Fetch%EC%9D%98_%EC%82%AC%EC%9A%A9%EB%B2%95#Body
            var request;

            if (type === 'blob') {
                request = await file.blob();
            } else if (type === 'array') {
                request = await file.arrayBuffer();
            } else if (type === 'json') {
                request = await file.json();
            } else if (type === 'text') {
                request = await file.text();
            } else {
                request = await file.text();
            }

            return request;
        }
        catch (error) {
            throw Error(error);
        }

    }
    async function getData(url) {
        const option = {};
        return await requestData(url, option);
    }
    async function getFileContents(url) {
        const option = {
            type: 'text',
        };
        return await fetchFile(url, option);
    }
    async function getJsonFile(url) {
        let file = await getFileContents(url);
        return JSON5.parse(file);
    }
    async function getAssetsFile(url) {
        const option = {
            type: 'blob',
        };
        return await fetchFile(url, option);
    }

    // JSON 처리
    function parseJson(string) {
        return JSON5.parse(string);
    }
    /* function stringifyJson(string) {
        return JSON5.stringify(string);
    } */

    // 빈 객체 검사
    // REF: https://stackoverflow.com/questions/4994201/is-object-empty
    function isEmpty(value) {
        if (!value || value === 0 || value === false) {
            return true;
        }
        return Boolean(value && typeof value === 'object') && !Object.keys(value).length;
    }

    // 배열여부 검사
    // REF: https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
    function isArray(value) {
        if (!Array.isArray) {
            return Object.prototype.toString.call(value) === '[object Array]';
        } else {
            return Array.isArray(value);
        }
    }
    // 오브젝트 검사
    function isObject(object) {
        return (typeof object === "object" && object !== null) || typeof object === "function";
    }

    // Url에서 파일네임을 추출
    function getFileStrFromUrl(url) {
        let filename = url.split('/');
        return filename[filename.length-1];
    }
    // Url에서 경로를 추출
    function getPathDirFromUrl(url) {
        let filename = getFileStrFromUrl(url);
        return url.replace(filename, '');
    }
    // 문자열에서 파일네임(확장자 제외)을 추출
    function getFileName(string) {
        if (string.indexOf('/') !== -1) {
            string = getFileStrFromUrl(string);
        } else if (string.indexOf('\\') !== -1) {
            string = getFileStrFromDir(string);
        }
        return string.substring(0, string.lastIndexOf('.')).toLowerCase();
    }
    // 문자열에서 확장자를 추출
    function getFileExt(string) {
        if (string.indexOf('/') !== -1) {
            string = getFileStrFromUrl(string);
        } else if (string.indexOf('\\') !== -1) {
            string = getFileStrFromDir(string);
        }
        return string.substring(string.lastIndexOf('.') + 1, string.length).toLowerCase();
    }

    // Dir에서 파일네임을 추출
    function getFileStrFromDir(dir) {
        let filename = dir.split('\\');
        return filename[filename.length-1];
    }
    // Dir 에서 경로를 추출
    function getPathDirFromDir(dir) {
        let filename = getFileStrFromDir(dir);
        return dir.replace(filename, '');
    }

    // 숫자 자리수 맞추기
    // https://programmers.co.kr/learn/questions/52
    function padNumber(number, width) {
        number = number + '';
        return number.length >= width ? number : new Array(width - number.length + 1).join('0') + number;
    }

    // 시간 지연
    // https://developers.google.com/web/fundamentals/primers/async-functions?hl=ko
    function wait(ms) {
        return new Promise(r => setTimeout(r, ms));
    }

    // uuid 생성
    function genUUID() {
        function s4() {
          return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

    // 문자열 첫문자 대문자
    function capFirst(string) {
        if (typeof string !== 'string') {
            return '';
        }
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // 문자열 다듬기
    function beautifyString(string) {
        var strArray;

        if (string.indexOf('_') !== -1) {
            strArray = string.split('_');
        } else {
            strArray = string.split(/(?=[A-Z])/);
        }

        for (var str in strArray) {
            strArray[str] = capFirst(strArray[str]);
        }

        return strArray.join(' ');
    }

    // 언어 문자열 겟
    // SFE.getLang(() => targetObj, 'targetStr');
    // https://stackoverflow.com/questions/14782232/how-to-avoid-cannot-read-property-of-undefined-errors
    function getLang(targetObj, key) {
        try {
            if (targetObj()[key] === undefined) {
                return beautifyString(key);
            } else {
                return targetObj()[key];
            }
        } catch (e) {
            return beautifyString(key);
        }
    }

    var SFECommon = /*#__PURE__*/Object.freeze({
        requestData: requestData,
        fetchFile: fetchFile,
        getData: getData,
        getFileContents: getFileContents,
        parseJson: parseJson,
        getJsonFile: getJsonFile,
        getAssetsFile: getAssetsFile,
        isEmpty: isEmpty,
        isArray: isArray,
        isObject: isObject,
        getFileStrFromUrl: getFileStrFromUrl,
        getPathDirFromUrl: getPathDirFromUrl,
        getFileStrFromDir: getFileStrFromDir,
        getPathDirFromDir: getPathDirFromDir,
        getFileName: getFileName,
        getFileExt: getFileExt,
        padNumber: padNumber,
        wait: wait,
        genUUID: genUUID,
        capFirst: capFirst,
        beautifyString: beautifyString,
        getLang: getLang
    });

    // SFE Common
    // Object.assign(window, SFECommon);
    if (window.SFE === undefined) {
        window.SFE = {};
    }
    Object.assign(SFE, SFECommon);

}());
