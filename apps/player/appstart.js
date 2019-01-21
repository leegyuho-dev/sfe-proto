
function startPlayer() {
    // 뷰어옵션
    let userOptions = {
        global: {
            // title: '테스트 타이틀',
            description: '테스트 설명입니다',
            author: '만든이',
            containerId: 'viewer3d',
            assetsPaths: {
                models: '/assets/models/',
                meshes: '/assets/meshes/',
                textures: '/assets/textures/',
                shaders: '/assets/shaders/',
                samples: '/assets/samples/',
            },
            // userConfig: 'conf/viewer3d.user.json5',
            useUrlOptions: true,
        },
        player: {
            // autoStart: true,
            // startTime: 1.13,
        },
        ui: {
            stats: {
                use: true,
            }
        },
        camera: {
            // focusTarget: 'root',
            position: [-100, 120, 200],
            focusOffset: [0, 50, 0],
            fov: 60,
        },
        light: {
            directionalLight: {
                shadow: {
                    mapSize: 1024,
                    radius: 2,
                }
            },
        },
        loader: {
            model: 'Pink_master.fbx',
            // character: 'Pink_master.fbx',
            background: 'AudienceRoom_master.fbx',
        },
        models: [
            {
                name: 'Pink_master.fbx',
                category: 'character',
                relativePath: '',
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                scale: [1, 1, 1],
            },
            {
                name: 'AudienceRoom_master.fbx',
                category: 'background',
                relativePath: '',
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                scale: [1, 1, 1],
                mesh: {
                    castShadow: false,
                    receiveShadow: true,
                    frustumCulled: true,
                },
            }
        ],
        groundMesh: {
            use: false,  
        }
        /* renderer: {
            antialias: false,
            gammaInput: false,
            gammaOutput: false,
            shadowMap: {
                enabled: false,
                // BasicShadowMap, PCFShadowMap, PCFSoftShadowMap
                type: 'BasicShadowMap',
            }
        }, */
    }

    // Viewer3D
    const Player = new SFE.Player(userOptions);
    // window.Player = Player;

    // 뷰어 실행
    Player.init();
}

startPlayer();

// 단독 실행
/* var USERDATA = {
    APPID: 'player',
    APPMODE: 'start',
    LANG: 'ko',
    BASEPATH: '/apps/player/',
}

var Loader = new SFE.AppLoader(USERDATA);
Loader.checkUserData()
.then(() => Loader.loadLibrary())
// .then(() => Loader.startApp())
.then(() => startPlayer()); */
