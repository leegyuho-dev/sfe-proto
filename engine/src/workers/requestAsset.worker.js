// 아웃풋을 arrayBuffer 로 통일. asset.data = arrayBuffer
// 캐시파일은 각 로드 함수에서 처리.
// 일반 이미지의 경우 이하 방법으로 처리
// window.URL.createObjectURL(new Blob([new Uint8Array(arrayBuffer)], { type: type }));
async function requestAsset(url) {

    var file = await fetch(url, { type: 'array' });
    if (file.ok === false) {
        return false;
    }

    var request = await file.arrayBuffer();
    return request;

}

onmessage = function(event) {
    var taskId = event.data.taskId;
    var name = event.data.name;
    var value = event.data.value;

    switch (name) {
        case 'test':
            console.log(this);
        break;

        case 'request':
            requestAsset(value.url)
            .then((result) => {
                postMessage({
                    taskId: taskId,
                    name: 'request',
                    value: result
                });
            });
        break;

    }
}