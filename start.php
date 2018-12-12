<?php
// start.php
// SunFlowerEngine Application Start

// XHR 접속 블로킹
// TODO: 세션 쿠키 인증으로 XHR 접속 블로킹.
/* if (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') {
    echo json_encode('XHR_INVALID_ACCESS');
    // exit();
} */
// 초기화 스크립트 프리로드
header("Link: </init.js>; rel=preload; as=script", false);
// header("Link: </lib/modules/DataTransporter.js>; rel=preload; as=script", false);
// header("Link: </lib/modules/ViewModeler.js>; rel=preload; as=script", false);
// header("Link: </lib/modules/AppController.js>; rel=preload; as=script", false);
// header("Link: </lib/modules/AppLoader.js>; rel=preload; as=script", false);
echo '<script id="scriptInit" type="module" src="/init.js"></script>';


// 글로벌 변수 초기화
// global $APPID, $APPMODE, $INFO, $CONF, $PREFS, $ENGINE, $LANG, $LANGS;

global $SFEData;
$SFEData = array(
    'info' => array(),
    'conf' => array(),
    'prefs' => array(),
    'engine' => array(),
    'server' => array(),
    'paths' => array(),
    'libs' => array(),
    'langs' => array(),
);

// 현재 파일을 기준으로 루트 상수 선언
// define('ROOT', realpath(dirname(__FILE__)));
$SFEData['paths']['root'] = realpath(dirname(__FILE__));

// 공용 함수
require($SFEData['paths']['root'].'/includes/global.php');
require($SFEData['paths']['root'].'/includes/common.php');

// TODO: 세션데이터 클래스, 쿠키 인증 추가할것
// $SessionData = new SessionData;
// $SessionData->start();
// session_set_cookie_params(1800, '/', '', true, true);
session_start();

$GlobalData = new \SFE\GlobalData;
$GlobalData->init();

$AppData = new \SFE\AppData;
$AppData->init();

$Template = new \SFE\Template;
$Template->load();

// require('sse.php');
// serverSend();

// printDebugData();
// return false;

function printDebugData() {
    global $SFEData;
    echo '<div style="white-space: pre;">';

    foreach ($SFEData as $key => $data) {
        echo $key.': ';
        print_r ($data); 
        echo '</br>';
    }

    echo '</div>';
}
