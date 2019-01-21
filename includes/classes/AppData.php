<?php
namespace SFE;
class AppData
{
    public $info;
    public $conf;
    public $prefs;
    public $engine;
    public $paths;
    public $langs;

    // 클래스 생성
    public function __construct()
    {
        global $SFEData;
        $this->info = $SFEData['info'];
        $this->conf = $SFEData['conf'];
        $this->prefs = $SFEData['prefs'];
        $this->paths = $SFEData['paths'];
        $this->langs = $SFEData['langs'];
    }

    // AppData 초기화
    public function init()
    {
        $appId = $this->info['appId'];
        $appMode = $this->info['appMode'];
        $lang = $this->info['lang'];

        $appConfig = array();
        if (($errorCode = $this->appCheck($appId, $appConfig)) == 0) {
            // 앱 설정파일 임포트
            $this->conf = $this->conf + $appConfig;
            // 앱 별도 언어
            $this->langs[$appId] = getJsonFile($this->paths['appPath'].'configs/lang/'.$lang.'.json5');

            // 글로벌 앱 변수
            $this->info = $this->info + $appConfig;
            $this->info['title'] = $this->info['appName'];
            $this->info['lang'] = $lang; // 상위 컨피그 우선

            // 앱 설정
            $defaultPrefs = array('appId' => $appId, 'appVersion' => $this->conf['appVersion'], 'appMode' => 'start');
            $this->prefs = getAllPrefs($defaultPrefs);
            $this->info['appMode'] = $this->prefs['appMode'];

            // 캐시 사용
            $this->info['useCache'] = true;
            // 업데이트이거나 개발모드일 경우 캐시 삭제
            if (
                isset($_COOKIE['PREFS_'.$appId]) && $this->conf['appVersion'] != $this->prefs['appVersion'] 
                // || $this->conf['develoment']
                // || $this->info['isDevMode']
            ) {
                $this->info['useCache'] = false;
            }

            $this->resistGlobal();
            return true;
        } else {
            $this->handleInitError($errorCode);
            return false;
        }
    }

    private function appCheck($appId = null, &$appConfig = array())
    {
        $paths = $this->paths;

        if (isset($_COOKIE['PREFS_'.$appId])) { // 쿠키가 존재할 경우 통과
            return false;
        } elseif (!$appId) { // 아이디 존재하지 않음
            return 100; // APP_NOT_EXISTS
        } elseif (!dirExists($paths['appPath'])) { // 디렉토리 존재하지 않음
            return 200; // APP_DIR_NOT_EXISTS
        }
        
        // 컨피그 파일 검사
        if (@fileExists($paths['appPath'].'configs/'.'appconfig.json5')) {
            $appConfig = getConfig($paths['appPath'].'configs/', 'appconfig.json5');

            if (empty($appConfig)) { // 기본 구성 비었음
                return 402; // APP_CONFIG_CONF_EMPTY
            } elseif ($appId != $appConfig['appId']) { // 아이디 매칭 실패
                return 101; // APP_ID_NOT_MATCH
            } elseif (!$appConfig['appHtml']) { // 실행파일 지정 안됨
                return 403; // APP_FILE_CONFIG_ERROR
            } elseif ($appConfig['appHtml']) {
                // 실행파일 검사
                if (@fileExists($paths['appPath'].$appConfig['appHtml'])) {
                    return false; // 에러 없음
                } else { // 앱파일 없음
                    return 301; // APP_FILE_NOT_EXISTS
                }
            }

            return true; // UNEXPECTED_ERROR
        } else { // 컨피그 파일 없음
            return 300; // APP_CONFIG_NOT_EXISTS
        }
        return true; // UNEXPECTED_ERROR
    }

    // 에러 핸들링
    // 초기화 과정에서 에러가 존재할 경우 에러메시지 표시하고 exit
    private function handleInitError($errorCode)
    {
        $info = $this->info;
        $paths = $this->paths;

        $configFile = $paths['appPath'].'configs/'.'appconfig.json5';
        if (@fileExists($configFile)) {
            $config = getConfig($paths['appPath'].'configs/', 'appconfig.json5');
            $appConfig = $config['appConfig'];
            if ($appConfig['appHtml']) {
                $mainFile = $paths['appPath'].$appConfig['appHtml'];
            }
        }
        
        if ($errorCode>1) {
            if ($errorCode>=100 && $errorCode<200) {
                if ($errorCode==100) { // 아이디 존재하지 않음
                    // exit('APP_NOT_EXISTS: '.APPPATH);
                    returnToTop(); // 기본앱으로 재시작
                } elseif ($errorCode==101) { // 아이디 매칭 실패
                    exit("APP_ID_NOT_MATCH: \$INFO['appId']=".'"'.$INFO['appId'].'"'.' != '."\$appConfig['appId']=".'"'.$appConfig['appId'].'"');
                }
            } elseif ($errorCode>=200 && $errorCode<300) {
                if ($errorCode==200) { // 디렉토리 존재하지 않음
                    // exit('APP_DIR_NOT_EXISTS: '.APPPATH);
                    returnToTop(); // 기본앱으로 재시작
                }
            } elseif ($errorCode>=300 && $errorCode<400) {
                if ($errorCode==300) { // 컨피그 파일 없음
                    exit('APP_CONFIG_NOT_EXISTS: '.$configFile);
                } elseif ($errorCode==301) { // 앱 실행파일 없음
                    exit('APP_HTMLFILE_NOT_EXISTS: '.$mainFile);
                }
            } elseif ($errorCode>=400 && $errorCode<500) {
                if ($errorCode==400) { // 컨피그 파일에 기본 변수 없음
                    exit('APP_CONFIG_VAL_ERROR: '.$configFile);
                } elseif ($errorCode==401) { // 기본 설정 비었음
                    exit('APP_CONFIG_PREF_EMPTY: '.$configFile);
                } elseif ($errorCode==402) { // 기본 구성 비었음
                    exit('APP_CONFIG_CONF_EMPTY: '.$configFile);
                } elseif ($errorCode==403) { // 실행파일 지정 안됨
                    exit("APP_HTMLFILE_CONFIG_ERROR: \$config['appHtml']=".'"'.$appConfig['appHtml'].'"');
                }
            }
        } else {
            // 원인을 알수 없는 에러
            exit('UNEXPECTED_ERROR: '.$configFile.', '.$mainFile);
        }
    }

    // 글로벌 변수 등록
    private function resistGlobal()
    {
        global $SFEData;
        $SFEData['info'] = $this->info;
        $SFEData['conf'] = $this->conf;
        $SFEData['prefs'] = $this->prefs;
        $SFEData['paths'] = $this->paths;
        $SFEData['langs'] = $this->langs;
    }

    // 클래스 소멸
    public function __destruct()
    {
        // echo 'destroyed';
    }
}
