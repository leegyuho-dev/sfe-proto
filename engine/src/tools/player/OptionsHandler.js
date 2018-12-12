// OptionsHandler
const LAYER = 'SFEPlayer: ';

import {
    getFileContents,
    parseJson,
    isEmpty,
    isArray,
    getFileStrFromUrl as getFile,
    getPathDirFromUrl as getPath,
    getFileName as fileName,
    getFileExt as fileExt,
} from '../../common/functions.js';

export class OptionsHandler {

    async getDefault() {
        const url = USERDATA.paths.appPath + 
                    USERDATA.info.defaultConfig;
        try {
            const config = await getFileContents(url);
            if (config === false) {
                throw Error(LAYER + 'CONFIG ERROR');
            }
            return parseJson(config);
        }
        catch (error) {
            throw Error(error);
        }
    }

    async getConfig(userConfig) {
        const url = USERDATA.paths.appPath + userConfig;
        const ext = fileExt(url);
        if (ext !== 'json' && ext !== 'json5') {
            console.error(LAYER + 'CONFIGFILE IS NOT JSON');
            this.getDefault();
        }
        try {
            const config = await getFileContents(url);
            if (config === false) {
                return this.getDefault();
            }
            console.log(LAYER + 'USERCONFIG LOADED');
            return parseJson(config);
        }
        catch (error) {
            throw Error(error);
        }
    }

    // TODO: 현재 플레이시간, 플레이모드, 카메라타겟, 오토스타트, 랜더링모드 등도 포함.
    getFromUrl(options) {
        // var newOptions = {}
        var url = location.search;
        var qs = url.substring(url.indexOf('?') + 1).split('&')
    
        for (var i = 0; i < qs.length; i++) {
            qs[i] = qs[i].split('=');
            var key = qs[i][0];
            var value = decodeURIComponent(qs[i][1]);
            if (!value || value == 'null' || value == 'undefined') {
                continue;
            }

            // 옵션 검사 및 세팅
            if (key == 'model') {
                var model = {}
                Object.assign(model, options.defaultModel);
                model.name = value;
                options['models'] = [model];
            }
            
            else if (key == 'models') {
                var models = value.split(',');
                options['models'] = []
                for (var key in models) {
                    var model = {}
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
                ]
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
                ]
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
        var newOption = {}
        for (var key in options) {
            if (userOptions[key] === undefined) {
                newOption[key] = options[key];
            } else {
                if (zeroDepth === true && key === 'models') {
                    var defaultModel = options.defaultModel;
                    if (!isEmpty(userOptions.models)) {
                        newOption.models = []
                        for (var index in userOptions.models) {
                            var model = this.assignNew(defaultModel, userOptions.models[index], false);
                            newOption.models.push(model);
                        }
                    } else {
                        newOption.models = [defaultModel]
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
