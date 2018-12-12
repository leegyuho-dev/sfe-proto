importScripts('../libs/three.js/three-r97.min.js');
importScripts('../libs/three.js/libs/inflate.min.js');
importScripts('../libs/three.js/loaders/TGALoader.js');
importScripts('../libs/three.js/loaders/FBXLoader.module.js');

// 로딩매니저, 텍스쳐로더
var manager = THREE.DefaultLoadingManager;
var textureLoader = new THREE.TextureLoader(manager);

// FBX Loader Custom
THREE.FBXLoader = FBXLoader;
THREE.FBXLoader.Custom = class extends THREE.FBXLoader {
	// FIXED: Assets 인수
    constructor() {
		super();
		// FIXED: manager 를 무조건 DefaultLoadingManager 로 지정
		// this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
		this.manager = manager;
	}

	// FIXED: 모델어셋 인수
    parse(FBXBuffer) {
        if (isFbxFormatBinary(FBXBuffer)) {
			fbxTree = new BinaryParser().parse(FBXBuffer);
        } else {
            var FBXText = convertArrayBufferToString(FBXBuffer);
            if (!isFbxFormatASCII(FBXText)) {
                throw new Error('THREE.FBXLoader: Unknown format.');
            }
            if (getFbxVersion(FBXText) < 7000) {
                throw new Error('THREE.FBXLoader: FBX version not supported, FileVersion: ' + getFbxVersion(FBXText));
            }
            fbxTree = new TextParser().parse(FBXText);
		}

        // FIXED: FBX 포함 텍스쳐에 URL 잘못 들어가는 버그를 해결
        // var textureLoader = new THREE.TextureLoader( this.manager ).setPath( this.resourcePath || path ).setCrossOrigin( this.crossOrigin );
		textureLoader.setPath(this.resourcePath).setCrossOrigin(this.crossOrigin);
		// FIXED: fbxTree 반환
        // return new FBXTreeParser.Custom(textureLoader).parse(fbxTree);
		return fbxTree;
    }

}

onmessage = async function(event) {
    var taskId = event.data.taskId;
    var name = event.data.name;
    var value = event.data.value;

    switch (name) {
        case 'test':
            console.log(this);
		break;
		
		case 'parse':
			var Parser = new THREE.FBXLoader.Custom();
			var fbxTree = Parser.parse(value);
			// console.log(model)
			postMessage({
				taskId: taskId,
				name: 'parse',
				value: fbxTree
			});
    }

}