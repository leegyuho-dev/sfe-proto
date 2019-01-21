importScripts('../libs/localforage/localforage-1.7.3.min.js');

// localforage 초기화
localforage.config({
    name: 'Viewer3D-dev',
    storeName: 'assets'
});

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
            }).catch((error) => {
                console.log(error);
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
            }).catch((error) => {
                console.log(error);
            });
        break;
    }
}
