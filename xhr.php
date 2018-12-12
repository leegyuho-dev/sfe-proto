<?php
// xhr.php v0.10
// XHR 핸들러

// 공용함수
// require('inc/global.php');

// session_set_cookie_params(1800, '/', '', true, true);
session_start();

// 함수 리퀘스트
if ($_GET['call']) {
    $call = $_GET['call'];
} else {
	echo 'XHR_INVALID_ACCESS';
    exit();
}
$callFN = 'xhr_'.$call;


// 리퀘스트 들어온 함수를 실행한다
if (function_exists($callFN)) {
    $callFN();
} else {
	echo json_encode('XHR_CALL_UNKNOWN_FUNCTION: '.$callFN);
	exit();
}

// TODO: 세션데이터 클래스로 연결
function xhr_getSessionData() { 
    header("Content-type: application/json");   
    echo json_encode($_SESSION['SFEData']);
}

function xhr_test() {
    echo json_encode($_GET);
}