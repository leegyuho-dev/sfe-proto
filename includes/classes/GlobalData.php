<?php
// Data.php 0.10
// Global Data Class
namespace SFE;
class GlobalData
{
    public $info;
    public $conf;
    public $prefs;
    public $engine;
    public $server;
    public $paths;
    public $langs;

    // 클래스 생성
    public function __construct()
    {
        $this->info = array();
        $this->conf = array();
        $this->prefs = array();
        $this->engine = array();
        $this->server = array();
        $this->paths = array();
        $this->langs = array();
    }
    
    // GlobalData 초기화
    public function init()
    {        
        // 패키지 인포
        $packageInfo = $this->getPackageInfo();
        
        // 패스 상수 설정
        $this->definePaths();
        $confPath = $this->paths['conf'];

        // TODO: 사용자 설정 .user.json 처리를 추가
        $this->conf = getJsonFile($confPath.'config.json5');

        $this->info['appId'] = $this->defineApp($this->conf['startApp']);
        $this->info['appMode'] = (valueExists('appmode', $_REQUEST)) ? $_REQUEST['appmode'] : null;

        // 모바일 식별
        $this->info['isMobile'] = $this->isMobile();

        // 개발모드 식별
        $this->info['isDevMode'] = $this->isDevMode();

        // TODO: 쿠키 가져오는 기능을 추가.
        $this->prefs = array();

        // 엔진 정보
        $this->engine['fullName'] = $packageInfo['fullName'];
        $this->engine['name'] = $packageInfo['name'];
        $this->engine['description'] = $packageInfo['description'];
        $this->engine['version'] = $packageInfo['version'];
        $this->engine['license'] = $packageInfo['license'];
        $this->engine['author'] = $packageInfo['author'];
        
        // 서버 정보
        $this->server = array(
            'HTTPS' => (!empty($_SERVER['HTTPS'])) ? $_SERVER['HTTPS'] : '',
            'HTTP_HOST' => $_SERVER['HTTP_HOST'],
            'HTTP_USER_AGENT' => $_SERVER['HTTP_USER_AGENT'],
            'REQUEST_URI' => $_SERVER['REQUEST_URI'],
            // 'HTTP_ACCEPT_ENCODING' => $_SERVER['HTTP_ACCEPT_ENCODING'],
        );

        // TODO: 사용자 설정 .user.json 처리를 추가
        $this->info['lang'] = $this->conf['lang'];
        $this->langs = getJsonFile($confPath.'lang/'.$this->conf['lang'].'.json5');

        $this->resistGlobal();

        return true;
    }

    // 스타트 로그
    private function getPackageInfo()
    {
        $packageInfo = getJsonFile('/package.json');

        $startLog = '';
        $startLog .= strtoupper($packageInfo['fullName']).': ';
        $startLog .= $packageInfo['description'].'. ';
        $startLog .= 'v'.$packageInfo['version'].'. '.$packageInfo['codeName'].'. ';
        echo '<script id="startLog">console.log("'.$startLog.'");startLog.remove();</script>';

        return $packageInfo;
    }
       
    // 패스 상수 선언
    // 'conf/paths.json' 참고
    private function definePaths()
    {
        $paths = getJsonFile('/configs/paths.json5');

        foreach ($paths as $key => $value) {
            $this->paths[$key] = $value;
        }
    }

    // ID 체크
    // 통과하면 APP, APPPATH 상수 선언
    // 통과하지 못하면 기본앱으로 바꿔서 재시작
    private function defineApp($startApp)
    {
        $appsPath = $this->paths['apps'];
        if (valueExists('appid', $_REQUEST)) {
            $appId = $_REQUEST['appid'];
            if ($appId == 'viewer3d') {
                $appId = 'player'; 
            }
            // 필수 파일 체크
            if (dirExists($appsPath.$appId) &&
            fileExists($appsPath.$appId.'/configs/'.'appconfig.json5')
            ) {
                $this->paths['appPath'] = $appsPath.$appId.'/';
                return $appId;
            } else {
                // 기본앱으로 재시작
                // TODO: 리다이렉트 검증 요망
                // 온전한 url 로 리다이렉트 해야 함. 
                // 서버 url 식별해 인포에 넣을 필요 있음
                // header('Location: '.$startApp);
                return false;
            }
        }
        $this->paths['appPath'] = $appsPath.$startApp.'/';
        return $startApp;
    }
    
    // 모바일 검사
    private function isMobile()
    {
        if (isset($_SERVER['HTTP_X_WAP_PROFILE'])) {
            return true;
        }
        if (pregMatch('/wap\.|\.wap/i', $_SERVER['HTTP_ACCEPT'])) {
            return true;
        }
        if (!isset($_SERVER['HTTP_USER_AGENT'])) {
            return false;
        }
        $uamatches = 'midp|j2me|avantg|docomo|novarra|palmos|palmsource|240x320|opwv|chtml|pda|windows ce|mmp\/|blackberry|mib\/|symbian|wireless|nokia|hand|mobi|phone|cdm|up\.b|audio|SIE\-|SEC\-|samsung|HTC|mot\-|mitsu|sagem|sony|alcatel|lg|erics|vx|NEC|philips|mmm|xx|panasonic|sharp|wap|sch|rover|pocket|benq|java|pt|pg|vox|amoi|bird|compal|kg|voda|sany|kdd|dbt|sendo|sgh|gradi|jb|\d\d\di|moto';
        if (pregMatch("/$uamatches/i", $_SERVER['HTTP_USER_AGENT'])) {
            return true;
        }
        return false;
    }

    // 개발모드 검사
    private function isDevMode()
    {
        // localhost 일 경우
        if (strpos($_SERVER['HTTP_HOST'], 'localhost') !== false 
            && strpos($_SERVER['SERVER_NAME'], 'localhost') !== false 
            // && strpos($_SERVER['HTTP_REFERER'], 'localhost') !== false
        ) {
            return true;
        }
        return false;
    }


    // 글로벌 변수 등록
    private function resistGlobal()
    {
        global $SFEData;
        $SFEData['info'] = $this->info;
        $SFEData['conf'] = $this->conf;
        $SFEData['prefs'] = $this->prefs;
        $SFEData['engine'] = $this->engine;
        $SFEData['server'] = $this->server;
        $SFEData['paths'] = $this->paths;
        $SFEData['langs'] = $this->langs;
    }
    
    // 클래스 소멸
    public function __destruct()
    {
        // echo 'destroyed';
    }
}
