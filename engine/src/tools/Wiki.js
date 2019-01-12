// Wiki.js
const LAYER = 'SFEWiki: ';

import {
    getJsonFile,
    isEmpty,
    isArray,
    isObject,
    getFileContents,
    getFileStrFromUrl as getFile,
    getPathDirFromUrl as getPath,
    getFileName as fileName,
    getFileExt as fileExt,
    wait,
} from '../common/functions.js';

import { VueUIModeler } from './wiki/VueUIModeler.js';

export class Wiki {

    constructor() {

    }

    async init() {
        console.log('WIKI START');
        Vue.use(VueMarkdown);

        // var mdText = await getFileContents('/documents/markdowntest.md');
        var mdText = await getFileContents('/documents/v1_30.md');

        Vue.component('wiki-contents', {
            template: '<vue-markdown>' + mdText + '</vue-markdown>',
        });

        var vm = new Vue({
            el: "#wiki_render"
        });

    }

}