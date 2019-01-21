// init.js
const LAYER = 'SFE:';

// 시작 메시지
console.log(LAYER, 'INIT');

// 초기화
async function initialize() {

    // SITEDATA
    const SFEDATA = {}
    window.SFEDATA = SFEDATA;
    
    // USERDATA
    const USERDATA = {}
    window.USERDATA = USERDATA;

    // vue 전역 객체 선언
    const VIEWMODEL = {}
    window.VIEWMODEL = VIEWMODEL;

    // DataTransporter
    const Data = new SFE.DataTransporter();
    const SFEData = await Data.getSessionData();

    // ViewModeler
    const Site = new SFE.VueSiteModeler(SFEData);
    const VueSite = await Site.makeSite();

    // APPDATA 에 할당
    // Object.assign(APPDATA, appData);
    // APPDATA 잠금
    // Object.freeze(APPDATA);

    // SITEDATA 에 할당
    Object.assign(SFEDATA, SFEData);

    // USERDATA 에 할당
    // USERDATA['APPID'] = SFEData.APPID;
    // USERDATA['APPMODE'] = SFEData.APPMODE;
    // USERDATA['BASEPATH'] = SFEData.PATHS.APPPATH;
    USERDATA['info'] = SFEData.info;
    USERDATA['paths'] = SFEData.paths;
    USERDATA['libs'] = SFEData.libs;
    // USERDATA['LANG'] = SFEData.LANG;
    USERDATA['langs'] = SFEData.langs;

    // VIEWMODEL 에 할당
    // Object.assign(VIEWMODEL, viewModel);
    VIEWMODEL.VueSite = VueSite;

    console.log ('SFEDATA:', SFEDATA);
    console.log ('USERDATA:', USERDATA);
    console.log ('VIEWMODEL:', VIEWMODEL);

    const Loader = new SFE.AppLoader(USERDATA);
    // 데이터 체크, 라이브러리 로드, 앱 스타트
    // await Loader.checkUserData();
    // await Loader.loadLibrary();
    Loader.startApp();
}

initialize();
