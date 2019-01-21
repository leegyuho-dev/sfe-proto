// TaskManager.js
const LAYER = 'TaskManager: ';

/* import {
    getFileStrFromUrl,
    getFileStrFromDir,
    genUUID,
} from '../common/functions.js'; */

/* var option = {
    name: processName,
    basePath: workerPath,
} */
export class TaskManager {
    constructor(options) {
        // 전역 TASKS 객체에 등록
        if (window.TASKS === undefined) {
            window.TASKS = {}
        }
        window.TASKS[options.name] = this;

        this.taskList = {}
        this.basePath = options.basePath;
        // TODO: onTaskRun, onTasking, onTaskEnd 핸들링 추가. 
        this.onTaskRun, this.onTasking, this.onTaskEnd;
    }

    make(workerScript) {
        var uuid = SFE.genUUID();
        this.taskList[uuid] = new Task(this.basePath + workerScript, this);
        this.taskList[uuid].uuid = uuid;
        return this.taskList[uuid];
    }

    delete(uuid) {

    }

}

class Task {
    constructor(workerScript, TaskManager) {
        // super();
        this.name = '';
        if (workerScript.indexOf('/') !== -1) {
            this.name = SFE.getFileStrFromUrl(workerScript);
        } else if (workerScript.indexOf('\\') !== -1) {
            this.name = SFE.getFileStrFromDir(workerScript);
        } else {
            this.name = workerScript;
        }
        this.queue = {}
        this.num = 0;
        
        this.thread = new Worker(workerScript);

        var Task = this;   
        this.thread.onmessage = function(event) {
            var taskId = event.data.taskId;
            var name = event.data.name;
            var value = event.data.value;
            Task.queue[taskId].resolve(value);
            delete Task.queue[taskId];
        }

        // TODO: onTaskRun, onTasking, onTaskEnd 핸들링 추가. 
        this.onTaskRun, this.onTasking, this.onTaskEnd;

    }

    post(name, value) {
        var taskId = name + '-' + this.num++;
        var task = {
            taskId: taskId,
            name: name,
            value: value,
        }
        this.thread.postMessage(task);  

        var methods = {}
        this.queue[taskId] = new Promise((resolve, reject) => {
            methods.resolve = resolve;
            methods.reject = reject;
        });
        this.queue[taskId].resolve = methods.resolve;
        this.queue[taskId].reject = methods.reject;

        return this.queue[taskId];
    }

}