// PlayerController.js
const LAYER = 'SFEViewer: ';

export class ViewerController {

    constructor(SFEPlayer) {
        // SFEPlayer 데이터
        this.SFEPlayer = SFEPlayer;
        this.SFEOptions = this.SFEPlayer.options;

        // 로더
        this.Loader = this.SFEPlayer.Loader;

        // SFEPlayer 객체
        this.SFECanvas = this.SFEPlayer.canvas;
        this.SFEScene = this.SFEPlayer.scene;
        this.SFERenderer = this.SFEPlayer.renderer;
        this.SFECamera = this.SFEPlayer.camera;
        this.SFEControls = this.SFEPlayer.controls;
        this.SFEAssets;
        // 플레이어 데이터
        this.SFEModel, this.SFEAnimation,
        this.SFEMixer, this.SFEAction;

        // VueUI 데이터
        this.VueUI = SFEPlayer.VueUI;
        this.VueData = SFEPlayer.VueData;
        // 캔버스
        this.canvas = this.VueData.canvas;
        // 메시지
        this.message = this.VueData.message;
        // 툴 데이터
        // this.tools = this.VueData.tools;
        this.share = this.VueData.share;
        this.camera = this.VueData.camera;
        this.player = this.VueData.player;
        this.setting = this.VueData.setting;

        // 메뉴 데이터
        this.menus = {}

        // 입력감지
        this.onInput = false;
        this.onInputData = false;
        this.onClick = false;
        // this.onStepPlay = false;
    }

    // UI 준비
    // 로드타임 이후 실행
    readyUI() {
        const Controller = this;

        // UI 컨테이너
        this.VueData.ui.events.mouseInput = function(event) {
            if (event.type === 'mousedown') {
                event.stopPropagation();
            } 
            Controller.checkInput(event);
            Controller.toggleControls(event);
        }
        // UI 컨테이너
        this.VueData.ui.events.touch = (event) => {
            // console.log(this.SFEControls.enabled)
            if (event.type === 'touchstart') {
                event.stopPropagation();
            } 
            Controller.checkInput(event);
            Controller.toggleControls(event);
        }

        let eventTargets = [
            this.VueData.message,
            this.VueData.info,
            this.VueData.stats,
            this.VueData.share,
            this.VueData.camera,
            this.VueData.player,
            this.VueData.setting,
        ]
        // 모든 UI 엘리먼트
        for (const key in eventTargets) {
            const targets = eventTargets[key];
            targets.events.hover = function(event, data) {
                if (event.sourceCapabilities.firesTouchEvents === false) {
                    Controller.toggleControls(event, data);
                }
            }
            // 모든 버튼
            for (const id in targets) {
                if (targets[id].button !== undefined) {
                    targets[id].button.events.hover = function(event, data) { 
                        Controller.togglePopup(event, data);
                    }
                }
            }
        }

        // 플레이어 이벤트

        // 플레이버튼
        this.player.play.button.events.click = function(event, data) { 
            Controller.togglePlay(event, data);
        }
        // 스탭포워드 버튼
        this.player.forward.button.events.click = function(event, data) { 
            Controller.step(event, data);
        }
        this.player.forward.button.events.mouseInput = function(event, data) { 
            Controller.stepPlay(event, data);
        }
        // 스탭백워드 버튼
        this.player.backward.button.events.click = function(event, data) { 
            Controller.step(event, data);
        }
        this.player.backward.button.events.mouseInput = function(event, data) { 
            Controller.stepPlay(event, data);
        }
        // 타임라인
        this.player.timeline.menu.events.input = function(event, data) { 
            Controller.changeTime(event, data);
        }
        this.player.timeline.menu.events.mouseInput = function(event, data) { 
            Controller.checkInput(event, data);
        }
        this.player.timeline.menu.events.hover = function(event, data) { 
            Controller.togglePopup(event, data);
        }

        // 카운터
        this.player.counter.button.events.hover = function(event, data) { 
            Controller.togglePopup(event, data);
        }
        this.player.counter.button.events.click = function(event, data) { 
            Controller.changePlayMode(event, data);
        }
        // 반복 버튼
        this.player.repeat.button.events.click = function(event, data) { 
            Controller.changeLoopMode(event, data);
        }
        // 애니메이션 설정 버튼
        this.menus[this.player.tune.name] = this.player.tune;
        this.player.tune.button.events.click = function(event, data) { 
            Controller.toggleMenu(event, Controller.player.tune);
        }
        this.player.tune.menu.events.click = function(event, data) { 
            Controller.handleAnimationMenu(event, data);
        }
        this.player.tune.menu.events.input = function(event, data) { 
            Controller.changeTimeScale(event, data);
        }
        this.player.tune.menu.events.mouseInput = function(event, data) { 
            Controller.checkInput(event, data);
        }
        this.player.tune.menu.events.hover = function(event, data) { 
            Controller.togglePopup(event, data);
        }

        // 카메라 이벤트

        // 카메라 회전 버튼
        this.camera.rotate.button.events.click = function(event, data) { 
            Controller.changeCameraMode(event, data);
        }
        // 카메라 이동 버튼
        this.camera.pan.button.events.click = function(event, data) { 
            Controller.changeCameraMode(event, data);
        }
        // 카메라 확대 버튼
        this.camera.zoom.button.events.click = function(event, data) { 
            Controller.changeCameraMode(event, data);
        }
        // 카메라 포커스 버튼
        this.camera.focus.button.events.click = function(event, data) { 
            Controller.changeFocus(event, data);
        }
        // 카메라 리셋 버튼
        this.camera.reset.button.events.click = function(event, data) { 
            Controller.resetCamera(event, data);
        }

        // 설정 이벤트

        // 화면 설정 버튼
        this.menus[this.setting.display.name] = this.setting.display;
        this.setting.display.button.events.click = function(event, data) { 
            Controller.toggleMenu(event, Controller.setting.display);
        }
        /* this.setting.display.menu.events.click = function(event, data) { 
            Controller.toggleMenu(event, Controller.setting.display);
        } */
        this.setting.display.menu.events.click = function(event, data) { 
            Controller.handleDisplayMenu(event, data);
        }
        this.setting.display.menu.events.change = function(event, data) { 
            Controller.handleDisplayMenu(event, data);
        }
        this.setting.display.menu.events.input = function(event, data) { 
            Controller.handleDisplayMenu(event, data);
        }
        this.setting.display.menu.events.mouseInput = function(event, data) { 
            Controller.checkInput(event, data);
        }
        this.setting.display.menu.events.hover = function(event, data) { 
            Controller.togglePopup(event, data);
        }
        // 랜더링 설정 버튼
        this.menus[this.setting.rendering.name] = this.setting.rendering;
        this.setting.rendering.button.events.click = function(event, data) { 
            Controller.toggleMenu(event, Controller.setting.rendering);
        }
        this.setting.rendering.menu.events.click = function(event, data) { 
            Controller.handleRenderingMenu(event, data);
        }
        this.setting.rendering.menu.events.change = function(event, data) { 
            Controller.handleRenderingMenu(event, data);
        }
        this.setting.rendering.menu.events.input = function(event, data) { 
            Controller.handleRenderingMenu(event, data);
        }

        // 공유 이벤트

        // 다운로드 버튼
        this.share.download.button.events.click = function(event, data) { 
            Controller.downloadModel(event, data);
        }
        // 스크린샷 버튼
        this.share.screenshot.button.events.click = function(event, data) { 
            Controller.takeScreenshot(event, data);
        }
        this.menus[this.share.link.name] = this.share.link;
        // 링크 버튼
        this.share.link.button.events.click = function(event, data) { 
            Controller.toggleLinkMenu(event, data);
        }
        // 링크 메뉴
        this.share.link.menu.events.click = function(event, data) { 
            Controller.handleLinkMenu(event, data);
        }
        this.share.link.menu.events.change = function(event, data) { 
            Controller.handleLinkMenu(event, data);
        }


        // UI 준비
        this.showUI();
    }

    showUI() {
        // UI 준비
        this.VueData.overlay.dimming = false;
        this.VueData.overlay.events.transition = (event, data) => { 
            this.VueData.ui.ready = true;
            delete data.events.transition;
        }
        this.VueData.canvas.blur = -1;
        this.VueData.canvas.ready = true;
    }

    // 플레이어 기능

    // 플레이어 준비
    // 애니메이션이 존재할 경우 실행
    async readyPlayer(modelData) {
        // 어셋
        this.SFEAssets = this.SFEPlayer.Assets;
        // 모델 객체
        this.SFEModel = modelData;
        
        // 카메라 타겟 추가
        var sourceHandler = { 
            get: function (target, name) { 
                if (name in target) {
                    return target[name];
                }
            },
            set: function (target, name, value) { 
                return true;
            }
        }
        var offsetHandler = { 
            get: function (target, name) {
                if (name in target) {
                    if (name === 'x') {
                        return target.x + target.offset.x;
                    } else if (name === 'y') {
                        return target.y + target.offset.y;
                    }  else if (name === 'z') {
                        return target.z + target.offset.z;
                    }
                    return target[name];
                }
            },
            set: function (target, name, value) { 
                return true;
            }
        }

        if (!SFE.isEmpty(this.SFEModel.animations)) {
            this.SFEAnimation = this.SFEModel.animations[0];
            this.SFEMixer = this.SFEModel.mixer;
            this.SFEAction = this.SFEMixer.action;
            
            // 카메라 타겟 추가
            // 센터포지션
            const centerPosition = this.SFEModel.position;
            this.SFECamera.targets.center = new Proxy(centerPosition, sourceHandler);
            if (this.SFEModel.bones.root !== undefined) {
                // 루트포지션
                const rootPosition = this.SFEModel.bones.root.position;
                // this.SFECamera.targets.center = new Proxy(rootPosition, sourceHandler);
                if (JSON.stringify(this.SFEOptions.camera.offset) !== JSON.stringify([0, 0, 0])) {
                    rootPosition.offset = this.SFECamera.orbit.offset;
                    this.SFECamera.targets.root = new Proxy(rootPosition, offsetHandler);
                }
            }

            // 프레임데이터
            var frameTimes = this.SFEAnimation.tracks[0].times;
            var frameTime = frameTimes[1];
            var frameRate = Number((1 / frameTime).toFixed(2));
            var frameLength = frameTimes.length-1;
            this.SFEAnimation.frameTime = frameTime;
            this.SFEAnimation.frameTimes = frameTimes;
            this.SFEAnimation.frameRate = frameRate;
            this.SFEAnimation.frameLength = frameLength;
            this.SFEAnimation.frameCount = 0;

            // 데이터 링크
            this.player.use = true;
            this.player.duration = this.SFEAnimation.duration;
            // this.player.time = this.SFEAction.time;
            this.player.timeScale = this.SFEAction.timeScale;
            this.player.frameTime = this.SFEAnimation.frameTime;
            this.player.frameRate = this.SFEAnimation.frameRate;
            this.player.frameLength = this.SFEAnimation.frameLength;

            // this.VueUI.addPlayerData();
        } else {
            const modelPosition = this.SFEModel.position;
            this.SFECamera.targets.center = new Proxy(modelPosition, sourceHandler);
            if (JSON.stringify(this.SFEOptions.camera.offset) !== JSON.stringify([0, 0, 0])) {
                modelPosition.offset = this.SFECamera.orbit.offset;
                this.SFECamera.targets.root = new Proxy(modelPosition, offsetHandler);
            }
        }


        // 플레이어 옵션 적용

        // 카메라 포커스 변경
        var focusTarget = this.SFEOptions.camera.focusTarget;
        if (focusTarget === 'center' ||  focusTarget === 'root') {
            this.changeFocus(null, this.camera.focus.button, focusTarget);
        }
        // 시작 시간
        var startTime = this.SFEOptions.player.startTime;
        if (startTime > 0) {
            if (startTime >= this.player.duration) {
                this.SFEAction.time = this.player.duration;
            } else {
                this.SFEAction.time = startTime;
            }
        }

        // TODO: 로딩서클 1회전까지 지연
        await SFE.wait(200);
        // 오토스타트
        if (this.SFEOptions.player.autoStart === true) {
            this.startPlayer();
        }

    }

    // 플레이어 업데이트
    // SFEPlayer.js, animate() 에서 업데이트 주기마다 호출됨.
    // TODO: animate() 에서 계산된 데이터를 받아옴
    updatePlayer() {
        var time = this.SFEAction.time;
        var duration = this.SFEAnimation.duration;
        // console.log(time);

        // 프레임타임
        var frameTime = this.SFEAnimation.frameTime;
        var frameTimes = this.SFEAnimation.frameTimes;
        var frameCount = this.SFEAnimation.frameCount = Math.round(time / frameTime);
        var frameLength = this.SFEAnimation.frameLength;
        this.player.frameCount = frameCount;
        this.player.frame = String(frameCount) + '/' + String(frameLength);

        // 타임 업데이트
        // TODO: 분/시 이상 넘어가는 단위 처리.
        var times = String(time.toFixed(2)).split('.');
        if (times[0] === undefined) {
            times[0] = 0;
        }
        if (times[1] === undefined) {
            times[1] = 0;
        }
        this.player.time = SFE.padNumber(times[0],2)+':'+SFE.padNumber(times[1],2);

        var durations = String(duration.toFixed(2)).split('.');
        if (durations[0] === undefined) {
            durations[0] = 0;
        }
        if (durations[1] === undefined) {
            durations[1] = 0;
        }
        this.player.timeDuration = SFE.padNumber(durations[0],2)+':'+SFE.padNumber(durations[1],2);

        // 타임라인 업데이트
        this.player.timeProgress = ((this.SFEAction.time / this.SFEAnimation.duration)*100).toFixed(1);
    }

    // 플레이어 스타트
    startPlayer(event, data) {
        // TODO: 카메라 인트로 애니메이션 wait 추가
        // await SFE.wait(300);
        this.player.paused = false;
        this.SFEAction.paused = false;
    }

    // 일시정지
    togglePlay(event, data) {
        // console.log(data);
        // console.log(this.SFEAction);
        // console.log(this.SFEAnimation);
        // console.log(this.SFEMixer)
        // console.log(this.SFEAnimation.tracks[0].times);
        if (this.SFEAction.enabled === false) {
            this.SFEAction.enabled = true;
        }
        // 한번 반복 시간 보정
        if (this.player.loopMode === 'once') {
            if (this.SFEAction.time === this.SFEAnimation.duration) {
                this.SFEAction.time = 0;
            } else if (this.player.reverse === true && this.SFEAction.time === 0) {
                this.SFEAction.time = this.SFEAnimation.duration;
            }
        }
        if (this.player.paused === false) {
            this.player.paused = true;
            this.SFEAction.paused = true;
        } else if (this.player.paused === true) {
            this.player.paused = false;
            this.SFEAction.paused = false;
        }
    }

    // 일시정지
    changeTime(event, data) {
        var value = event.target.value;
        var playMode = this.player.playMode;
        if (playMode === 'time') {
            var time = (this.player.duration * value)/100;
        } else if (playMode === 'frame') {
            var time = this.player.frameTime * value;
        }

        this.SFEAction.time = time;
    }

    // 스탭포워드 및 스탭백워드
    step(event, data) {
        if (this.player.onStepPlay === true) {
            this.player.onStepPlay = false;
            return false;
        }
        const frameLength = this.SFEAnimation.frameLength;
        const frameCount = this.SFEAnimation.frameCount;
        const frameTimes = this.SFEAnimation.frameTimes;
        if (this.player.paused === false) {
            this.SFEAction.paused = true;
            this.player.paused = true;
        }
        if (data.name === 'forward' && frameCount < frameLength) {
            console.log(LAYER+'STEP FORWARD');
            this.SFEAction.time = frameTimes[frameCount+1];
        } else if (data.name === 'backward' && frameCount > 0) {
            console.log(LAYER+'STEP BACKWARD');
            this.SFEAction.time = frameTimes[frameCount-1];
        }
    }

    // 플레이포워드 및 플레이백워드
    async stepPlay(event, data) {
        this.onInputData = data;
        await SFE.wait(400);
        // console.log(event);
        if (this.onClick === false) {
            return false;
        }
        if (this.onInputData !== false && document.querySelector('button:hover') === event.target) {
            await SFE.wait(100);
            if (this.onClick === true) {
                if (this.SFEAction.enabled === false) {
                    this.SFEAction.enabled = true;
                }
                if (this.player.reverse === true) {
                    this.onInputData.reverse = true;
                } else {
                    this.onInputData.reverse = false;
                }
                this.player.onStepPlay = true;
                data.active = true;
                this.player.paused = true;
                if (data.name === 'forward') {
                    console.log(LAYER+'STEPPLAY FORWARD');
                    // 한번 반복 시간 보정
                    if (this.player.loopMode === 'once') {
                        if (this.SFEAction.time === this.SFEAnimation.duration) {
                            this.SFEAction.time = 0;
                        }
                    }
                    this.player.reverse = false;
                    this.SFEAction.paused = false;
                } else if (data.name === 'backward') {
                    console.log(LAYER+'STEPPLAY BACKWARD');
                    // 한번 반복 시간 보정
                    if (this.player.loopMode === 'once') {
                        if (this.SFEAction.time === 0) {
                            this.SFEAction.time = this.SFEAnimation.duration;
                        }
                    }
                    this.player.reverse = true;
                    this.SFEAction.paused = false;
                }
            }
        }
    }

    // 루프모드 변경
    changeLoopMode(event, data, targetMode = null) {

        if (!targetMode) {
            var loopMode = this.player.loopMode;
            if (loopMode === 'repeat') {
                var targetMode = 'once';
            } else if (loopMode === 'once') {
                var targetMode = 'pingpong';
            } else if (loopMode === 'pingpong') {
                var targetMode = 'repeat';
            }
        }

        if (targetMode === 'repeat') {
            this.player.loopMode = 'repeat';
            this.SFEAction.loop = THREE.LoopRepeat;
        } else if (targetMode === 'once') {
            this.player.loopMode = 'once';
            this.SFEAction.loop = THREE.LoopOnce;
        } else if (targetMode === 'pingpong') {
            this.player.loopMode = 'pingpong';
            this.SFEAction.loop = THREE.LoopOnce;
        }
        
    }

    // 플레이모드 변경
    changePlayMode(event, data, targetMode = null) {

        if (!targetMode) {
            var playMode = this.player.playMode;
            if (playMode === 'time') {
                var targetMode = 'frame';
                this.SFEPlayer.clock.stop();
            } else if (playMode === 'frame') {
                var targetMode = 'time';
            }
        }

        if (targetMode === 'frame') {
            this.player.playMode = 'frame';
            this.SFEPlayer.clock.stop();
        } else if (targetMode === 'time') {
            this.player.playMode = 'time';
            this.SFEPlayer.clock.start();
        }
        
        // 시간 싱크
        if (this.SFEAction.time === 0 || 
            this.SFEAction.time === this.SFEAnimation.duration) {
            // this.SFEAction.time = 0;
        } else {
            const frameCount = this.SFEAnimation.frameCount;
            const frameTime = this.SFEAnimation.frameTime;
            this.SFEAction.time = frameTime * frameCount;
        }

    }

    // 타임스케일 변경
    changeTimeScale(event, data) {
        const value = event.target.value;
        data.value = value;
        this.SFEAction.timeScale = value;
        this.player.timeScale = value;
    }


    // 카메라 기능

    // 카메라 리셋
    // 초기 옵션값으로 리셋
    async resetCamera(event, data) {
        const duration = 500;

        const SFEControls = this.SFEControls;
        const SFECamera = this.SFECamera;

        const cameraOptions = this.SFEOptions.camera;
        const camPos = cameraOptions.position;
        const camTag = cameraOptions.target;
        
        // 카메라 모드 리셋
        this.resetCameraMode();
        // 카메라 포커스 리셋
        this.resetFocus();

        // 컨트롤 중지
        SFEControls.enabled = false;
        data.active = true;

        const resetPosition = new TWEEN.Tween(SFECamera.position)
        .to(SFECamera.position.clone().set(camPos[0], camPos[1], camPos[2]), duration)
        .easing(TWEEN.Easing.Cubic.Out);

        const resetTarget = new TWEEN.Tween(SFEControls.target)
        .to(SFEControls.target.clone().set(camTag[0], camTag[1], camTag[2]), duration)
        .easing(TWEEN.Easing.Cubic.Out);

        resetPosition.start();
        resetTarget.start();

        await SFE.wait(duration);
        // 컨트롤 재개
        SFEControls.enabled = true;
        data.active = false;
    }

    // 카메라 포커스 변경
    async changeFocus(event, data, setTarget = null) {
        let target;
        let focused = this.camera.focused;
        
        if (setTarget) {
            target = setTarget;
        } else {
            if (focused === 'free') {
                target = 'center';
            } else if (focused === 'center') {
                if (this.SFECamera.targets.root !== undefined) {
                    target = 'root';
                } else {
                    target = 'free';
                }
            } else {
                target = 'free';
            }
        }
        
        if (target === 'free') {
            data.active = false;
            this.camera.focused = 'free';

            this.SFEControls.enablePan = true;
            this.camera.pan.button.deactive = false;
            this.SFECamera.targets.free = this.SFECamera.targets[focused].clone();
            this.SFEControls.target = this.SFECamera.targets.free;
            this.SFECamera.targets.focused = 'free';
        } else {
            data.active = true;
            this.camera.focused = target;
            this.SFECamera.targets.focused = target;
            this.SFEControls.enablePan = false;
            this.camera.pan.button.deactive = true;

            const duration = 300;
            this.SFEControls.target = this.SFECamera.targets[focused].clone();
            const targetChange = new TWEEN.Tween(this.SFEControls.target)
            .to(this.SFECamera.targets[target], duration)
            .easing(TWEEN.Easing.Exponential.Out)

            targetChange.start();
            await SFE.wait(duration);
            this.SFEControls.target = this.SFECamera.targets[target];
        }
    }
    resetFocus() {
        const data = this.camera.focus.button;
        this.changeFocus(null, data, 'free');
    }

    changeCameraMode(event, data, reset = false) {
        const mode = this.camera.mode;
        if (reset === true || data.name === mode) {
            this.camera.mode = 'free';
            this.camera.rotate.button.active = false;
            this.camera.pan.button.active = false;
            this.camera.zoom.button.active = false;

            this.SFEControls.enableRotate = true;
            this.SFEControls.enablePan = true;
            this.SFEControls.enableZoom = true;
            this.SFEControls.mouseButtons = {
                LEFT: THREE.MOUSE.LEFT,
                MIDDLE: THREE.MOUSE.MIDDLE,
                RIGHT: THREE.MOUSE.RIGHT
            }
        } else {
            this.camera.mode = data.name;
            this.SFEControls.enableRotate = false;
            this.SFEControls.enablePan = false;
            this.SFEControls.enableZoom = false;
            if (data.name === 'rotate') {
                this.camera.rotate.button.active = true;
                this.camera.pan.button.active = false;
                this.camera.zoom.button.active = false;

                this.SFEControls.enableRotate = true;
                this.SFEControls.mouseButtons = {
                    LEFT: THREE.MOUSE.LEFT,
                }
            } else if (data.name === 'pan') {
                this.camera.rotate.button.active = false;
                this.camera.pan.button.active = true;
                this.camera.zoom.button.active = false;

                this.SFEControls.enablePan = true;
                this.SFEControls.mouseButtons = {
                    RIGHT: THREE.MOUSE.LEFT,
                }
            } else if (data.name === 'zoom') {
                this.camera.rotate.button.active = false;
                this.camera.pan.button.active = false;
                this.camera.zoom.button.active = true;

                this.SFEControls.enableZoom = true;
                this.SFEControls.mouseButtons = {
                    MIDDLE: THREE.MOUSE.LEFT,
                }
            }
        }
    }
    resetCameraMode() {
        this.changeCameraMode(null, null, true);
    }

    // 랜더링 기능

    // 랜더링 메뉴
    handleRenderingMenu(event, data) {
        var name = event.target.name;
        var value = event.target.value;

        if (name === 'closeMenu') {
            this.toggleMenu(event, this.setting.rendering);
        } else if (name === 'changeShading') {
            this.setting.shadingMode = value;
            this.changeShadingMode(value);
        } else if (name === 'outlineEnabled') {
            value = event.target.checked;
            this.setting.outlineEnabled = value;
            this.changeShadingMode(this.setting.shadingMode);
        } else if (name === 'gammaCorrection') {
            value = event.target.checked;
            this.setting.gammaInput = value;
            this.setting.gammaOutput = value;
            this.SFERenderer.gammaInput = value;
            this.SFERenderer.gammaOutput = value;
            this.SFERenderer.dispose();
        } else if (name === 'shadowMapEnabled') {
            value = event.target.checked;
            this.setting.shadowMapEnabled = value;
            this.SFERenderer.shadowMap.enabled = value;
            this.SFERenderer.dispose();
            /* for (var key in this.SFEScene.children) {
                var child = this.SFEScene.children[key];
                if (child.type === 'DirectionalLight') {
                    child.castShadow = value;
                }
            } */
        } else if (name === 'shadowMapType') {
            this.setting.shadowMapType = value;
            this.SFERenderer.shadowMap.type = THREE[value];
            this.SFERenderer.dispose();
        } else if (name === 'shadowMapSize') {
            // console.log(value);
            this.setting.shadowMapSize = [value, value];
            for (var key in this.SFEScene.children) {
                var child = this.SFEScene.children[key];
                if (child.type === 'DirectionalLight') {
                    child.shadow.mapSize.set(value, value);
                }
            }
        } else if (name === 'textureFilter' || name === 'textureMipMap') {
            value = event.target.checked;
            this.setting[name] = value;
            
            for (var key in this.SFEAssets.textures) {
                var child = this.SFEAssets.textures[key];
                if (this.setting.textureFilter === true) {
                    child.data.magFilter = THREE.LinearFilter;
                    if (this.setting.textureMipMap === true) {
                        child.data.minFilter = THREE.LinearMipMapLinearFilter;
                    } else if (this.setting.textureMipMap === false) {
                        child.data.minFilter = THREE.LinearFilter;
                    }
                } else if (this.setting.textureFilter === false) {
                    child.data.magFilter = THREE.NearestFilter;
                    if (this.setting.textureMipMap === true) {
                        child.data.minFilter = THREE.NearestMipMapNearestFilter;
                    } else if (this.setting.textureMipMap === false) {
                        child.data.minFilter = THREE.NearestFilter;
                    }
                }
                // child.data.needUpdate = true;
            }
            this.SFERenderer.dispose();
        } else if (name === 'anisotropicFilter') {
            this.setting.anisotropicFilter = value;
            for (var key in this.SFEAssets.textures) {
                var child = this.SFEAssets.textures[key];
                child.data.anisotropy = value;
            }
            this.SFERenderer.dispose();
        } 
        
        else if (name === 'recompile') {
            this.SFERenderer.compile(this.SFEScene, this.SFECamera);
        } else if (name === 'dispose') {
            this.SFERenderer.dispose();
        } else if (name === 'test') {
            for (var key in this.SFEAssets.textures) {
                var texture = this.SFEAssets.textures[key];
                texture.data.image.width = 2560;
                texture.data.image.height = 2560;
                texture.data.needsUpdate = true;
            }
            this.SFERenderer.dispose();
        }
        // console.log(name, value);
    }

    // 쉐이딩 모드 전환
    changeShadingMode(shadingMode = null) {

        function changeMaterial(mesh, shadingMode) {
            if (SFE.isObject(mesh.materialSlots)) {
                for (var index in mesh.materialSlots) {
                    mesh.material[index] = materials[mesh.materialSlots[index]][shadingMode];
                }
            } else {
                mesh.material = materials[mesh.materialSlots][shadingMode];
            }
        }

        var outlineEnabled = this.setting.outlineEnabled;
        var OutlineEffect = this.SFEPlayer.effects.outline;
        var models = this.SFEAssets.models;
        var meshes = this.SFEAssets.meshes;
        var materials = this.SFEAssets.materials;
        var mode = this.setting.shadingMode;

        if (!shadingMode) {
            var shadingMode = 'default';
            if (mode === 'default') {
                shadingMode = 'diffuse';
            } else if (mode === 'diffuse') {
                shadingMode = 'edgedFace';
            } else if (mode === 'edgedFace') {
                shadingMode = 'default';
            } else {
                shadingMode = 'default';
            }
        }
        this.setting.shadingMode = shadingMode;

        for (var key in meshes) {
            changeMaterial(meshes[key], shadingMode);
        }

        for (var key in models) {
            var model = models[key].data;
            var wireframes = model.wireframes;
    
            if (shadingMode === 'default') {
                wireframes.visible = false;
                OutlineEffect.enabled = outlineEnabled;
            } else if (shadingMode === 'diffuse') {
                wireframes.visible = false;
                OutlineEffect.enabled = outlineEnabled;
            } else if (shadingMode === 'edgedFace') {
                wireframes.visible = true;
                OutlineEffect.enabled = outlineEnabled;
            }
        }

    }

    handleDisplayMenu(event, data) {
        var name = event.target.name;
        var value = event.target.value;

        if (name === 'fieldOfView') {
            this.changefieldOfView(event, data);
        } else if (name === 'pixelRatio') {
            this.changePixelRatio(event, data);
        } else if (name === 'closeMenu') {
            this.toggleMenu(event, this.setting.display);
        } else if (name === 'canvasSmooth') {
            value = event.target.checked;
            this.VueData.canvas.smooth = value;
        } else if (name === 'fitScreen') {
            value = event.target.checked;
            this.VueData.canvas.fitScreen = value;
        } else if (name === 'aspectRatio') {
            if (value !== 'auto') {
                value = Number(value);
            }
            this.VueData.canvas.aspectRatio = value;
            this.changeAspectRatio(value);
        } else if (name === 'gammaCorrection') {
            value = event.target.checked;
            this.setting.gammaInput = value;
            this.setting.gammaOutput = value;
            this.SFERenderer.gammaInput = value;
            this.SFERenderer.gammaOutput = value;
            this.SFERenderer.dispose();
        } 
        
        // console.log(name, value)
    }

    changefieldOfView(event, data) {
        var value = event.target.value;
        this.setting.fov = value;
        this.SFECamera.fov = value;
        this.SFECamera.updateProjectionMatrix();
    }

    changePixelRatio(event, data) {
        var value = event.target.value;
        this.setting.pixelRatio = value;
        this.SFERenderer.setPixelRatio(value);
    }

    changeAspectRatio(aspectRatio) {
        var screenWidth = this.SFEPlayer.container.clientWidth;
        if (aspectRatio === 'auto') {
            var screenHeight = this.SFEPlayer.container.clientHeight;
        } else {
            var screenHeight = this.SFEPlayer.container.clientWidth * aspectRatio;
        }

        this.SFECamera.aspect = screenWidth / screenHeight;
        this.SFECamera.updateProjectionMatrix();
        this.SFERenderer.setSize(screenWidth, screenHeight, false);
        // this.SFEPlayer.stats.refresh = true;
    }

    // 공유 기능

    // 다운로드
    downloadModel(event, data) {
        const models = this.SFEAssets.models;
        
        for (var key in models) {
            var model = models[key];
            var link = document.createElement('a');
            document.body.appendChild(link);
            link.href = model.file;
            link.download = model.name;
            var tempInput = document.querySelector('#tempinput');
            tempInput.insertBefore(link, tempInput.lastChild);
            link.click();
            link.remove();
        }
    }

    // 스크린샷
    // https://stackoverflow.com/questions/10673122/how-to-save-canvas-as-an-image-with-canvas-todataurl
    // https://jsfiddle.net/codepo8/V6ufG/2/
    // https://stackoverflow.com/questions/26193702/three-js-how-can-i-make-a-2d-snapshot-of-a-scene-as-a-jpg-image
    // https://jsfiddle.net/2pha/art388yv/
    async takeScreenshot(event, data) {
        /* var w = window.open('', '');
        w.document.title = "Screenshot";
        //w.document.body.style.backgroundColor = "red";
        var img = new Image();
        // Without 'preserveDrawingBuffer' set to true, we must render now
        this.SFERenderer.render(this.SFEScene, this.SFECamera);
        img.src = this.SFERenderer.domElement.toDataURL();
        w.document.body.appendChild(img); */

        /* var link = document.createElement('a');
        document.body.appendChild(link);
        this.SFERenderer.render(this.SFEScene, this.SFECamera);
        link.href = this.SFERenderer.domElement.toDataURL('image/png').replace('image/png', 'image/octet-stream');
        link.download = 'SFEScreenshot.png';
        var tempInput = document.querySelector('#tempinput');
        tempInput.insertBefore(link, tempInput.lastChild);
        link.click();
        link.remove(); */

        /* var w = window.open('', '');
        w.document.title = "Screenshot";
        //w.document.body.style.backgroundColor = "red";
        var img = new Image();
        // Without 'preserveDrawingBuffer' set to true, we must render now
        this.SFERenderer.render(this.SFEScene, this.SFECamera);
        img.src = this.SFERenderer.domElement.toDataURL();
        w.document.body.appendChild(img); */

        /* var w = window.open('', '');
        w.document.title = "Screenshot";
        //w.document.body.style.backgroundColor = "red";
        var img = new Image();
        // Without 'preserveDrawingBuffer' set to true, we must render now
        this.SFERenderer.render(this.SFEScene, this.SFECamera);
        img.src = this.SFECanvas.toDataURL('image/png');
        w.document.body.appendChild(img); */

        /* var link = document.createElement('a');
        document.body.appendChild(link);
        this.SFERenderer.render(this.SFEScene, this.SFECamera, null, false);
        link.href = this.SFECanvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
        link.download = 'SFEScreenshot.png';
        var tempInput = document.querySelector('#tempinput');
        tempInput.insertBefore(link, tempInput.lastChild);
        link.click();
        link.remove(); */

        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');

        var w = window.open('', '');
        w.document.title = 'Screenshot';
        w.document.body.appendChild(canvas);

        var img = new Image();
        // this.SFERenderer.render(this.SFEScene, this.SFECamera);
        this.SFEPlayer.render();
        img.src = this.SFECanvas.toDataURL('image/png');
        
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);
            // document.body.appendChild(canvas);
        }
    }

    toggleLinkMenu(event, data) {
        var linkButton = this.share.link.button;
        var linkMenu = this.share.link.menu;

        if (linkMenu.show === false) {
            this.closeAllMenu();
            linkButton.active = true;
            this.getLinkUrl();
            linkMenu.show = true; 
        } else if (linkMenu.show === true) {
            linkButton.active = false;
            linkMenu.show = false; 
        }

    }

    handleLinkMenu(event, data) {
        // console.log(event, data);
        var eventName = event.target.attributes.name.value;

        if (eventName === 'checkautoStart') {
            this.getLinkUrl();
        } else if (eventName === 'checkStartTime') {
            if (event.target.checked === true) {
                document.getElementById('startTime').disabled = false;
            } else if (event.target.checked === false) {
                document.getElementById('startTime').disabled = true;
            }
            this.getLinkUrl();
        }

        else if (eventName === 'closeMenu') {
            this.toggleLinkMenu(event, data);
        } else if (eventName === 'copyUrl') {
            this.getLinkUrl();
            setTimeout(() => {
                this.copyLinkUrl();
            }, 10);
        }
    }

    getLinkUrl() {
        var camera_position = this.SFECamera.position;
        var camera_target = this.SFEControls.target;

        var modelNames = []
        const models = this.SFEAssets.models;
        for (var key in models) {
            modelNames.push(models[key].name);
        }

        var params = {
            models: modelNames.join(','),
            camera_position: [
                Math.round(camera_position.x),
                Math.round(camera_position.y),
                Math.round(camera_position.z),
            ],
            camera_target: [
                Math.round(camera_target.x),
                Math.round(camera_target.y),
                Math.round(camera_target.z),
            ],
        }
        if (document.getElementById('checkautoStart').checked === true) {
            params.autostart = true;
        }
        if (document.getElementById('checkStartTime').checked === true) {
            params.starttime = this.VueData.player.time;
        }
        if (this.SFECamera.targets.focused !== 'free') {
            params.focustarget = this.SFECamera.targets.focused;
        }
        if (this.setting.outlineEnabled === true) {
            params.outline = true;
        }


        var urlParams = '';
		for (var key in params) {
			var value = params[key];
			if (!SFE.isEmpty(value)) {
				urlParams = urlParams + '&' + key + '=' + value;
			}
        }
		var url = decodeURIComponent(location.href).split('?')[0];
        var linkUrl = url + '?' + urlParams.substring(1);
        this.share.linkUrl = linkUrl;
    }

    copyLinkUrl() {
        var input = document.getElementById('linkUrl');
        input.focus();
        input.select();
        document.execCommand('copy', false);
    }

    handleAnimationMenu(event, data) {
        if (event.target.name === 'closeMenu') {
            this.toggleMenu(event, this.player.tune);
        } else if (event.target.name === 'loopMode') {
            this.changeLoopMode(event, data, event.target.value);
        } else if (event.target.name === 'playMode') {
            if (event.target.value === 'forward') {
                this.player.reverse = false;
            } else if (event.target.value === 'backward') {
                this.player.reverse = true;
            } else if (event.target.value === 'time') {
                this.changePlayMode(null, null, 'time');
            } else if (event.target.value === 'frame') {
                this.changePlayMode(null, null, 'frame');
            }
        }
    }

    // 기초 기능

    // 팝업 표시
    async togglePopup(event, data) { 
        await SFE.wait(200);
        if (SFE.isObject(data.popup)) {
            if (event.type === 'mouseover') {
                data.popup[event.target.name] = true;
            } else if (event.type === 'mouseout') {
                data.popup[event.target.name] = false;
            }
        } else {
            if (event.type === 'mouseover') {
                data.popup = true;
            } else if (event.type === 'mouseout') {
                data.popup = false;
            }
        }
    }

    // 메뉴 표시
    toggleMenu(event, data) {
        // console.log(data)
        if (data.menu.show === false) {
            this.closeAllMenu();
            data.button.active = true;
            data.menu.show = true;
        } else if (data.menu.show === true) {
            data.button.active = false;
            data.menu.show = false;
        }
    }
    closeAllMenu(exception = null) {
        for (var key in this.menus) {
            // this.menus[key].show = false;
            if (exception) {
                if (this.menus[key].name !== exception) {
                    this.menus[key].button.active = false;
                    this.menus[key].menu.show = false;
                }
            } else {
                this.menus[key].button.active = false;
                this.menus[key].menu.show = false;
            }
        }
    }

    // 마우스 입력 체크
    checkInput(event, data) {
        // TODO: 입력중에 hover 이벤트 막을것
        if (event.type === 'mousedown') {
            this.onClick = true;
            // three.js 컨트롤
            if (this.SFEControls.enabled === true) {
                this.onInput = true;
            // UI 인풋
            } else if (event.target.localName === 'input' && event.target.type === 'range') {
                if (data !== undefined && data.active !== undefined) {
                    data.active = true; 
                    this.onInputData = data;
                } else {
                    this.onInput = true;
                }
                if (event.target.name === 'timeline') {
                    // this.onInputData.name = event.target.name;
                    if (this.SFEAction.paused === false) {
                        this.SFEAction.paused = true;
                    } 
                }
            }
        } else if (event.type === 'mouseup') {
            this.onClick = false;
            if (this.onInputData) {
                if (this.onInputData.active === true) {
                    this.onInputData.active = false;
                }
                if (
                    // this.onInputData.name === 'forward' || this.onInputData.name === 'backward' ||
                    this.onInputData.name === 'playForward' || this.onInputData.name === 'playBackward'
                ) {
                    this.player.reverse = this.onInputData.reverse;
                    this.SFEAction.paused = true;
                } else if (this.onInputData.name === 'timeline') {
                    if (this.player.paused === false) {
                        this.SFEAction.paused = false;
                    }
                }
            }
            this.onInputData = false;
            this.onInput = false;
        }
        // console.log('onInput', this.onInput, this.onInputData);
    }

    // three.js 컨트롤 체크
    toggleControls(event) {
        // 컨트롤 중에는 return false.
        if (this.onInput !== false) {
            return false;
        }

        if (event.type === 'mouseenter' || event.type === 'touchstart') {
            this.SFEControls.enabled = false;
        } else if (event.type === 'mouseleave'|| event.type === 'touchend') {
            this.SFEControls.enabled = true;
        }
        // console.log(this.SFEControls.enabled)
    }

    test() {
        console.log(this);
    }


}