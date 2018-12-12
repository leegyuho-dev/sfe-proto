importScripts('../libs/localforage/localforage-1.7.3.min.js');

// localforage 초기화
localforage.config({
    name: 'Viewer3D-dev',
    storeName: 'assets'
});


// getItem
// var cachedItem = await Task.post('getItem', { key: '' });
/* Task.post('getItem', { 
    key: ''
}).then((result) => {}); */

// setItem
/* Task.post('setItem', { 
    key: '',
    item: {} 
}).then((result) => {}); */

onmessage = function(event) {
    var taskId = event.data.taskId;
    var name = event.data.name;
    var value = event.data.value;

    switch (name) {
        case 'test':
            console.log(this);
        break;

        case 'config':
            localforage.config({
                name: value.name,
                storeName: value.storeName
            });
            postMessage({
                name: 'ready',
                value: true,
            });
        break;

        case 'getItem':
            localforage.getItem(value.key)
            .then((result) => {
                postMessage({
                    taskId: taskId,
                    name: 'getItem',
                    value: result
                });
            });
        break;

        case 'setItem':
            localforage.setItem(value.key, value.item)
            .then((result) => {
                postMessage({
                    taskId: taskId,
                    name: 'setItem',
                    value: result
                });
            });
        break;
    }
}
