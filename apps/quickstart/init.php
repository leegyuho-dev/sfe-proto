<?php
// init.php v0.55
// MG calculator 초기화

// 글로벌 변수
global $ID;
global $ACT;
global $INFO;
global $PREFS;
global $CONF;
global $DEV;
global $TEST;
global $PARAMS;

// 함수 임포트
require_once(file_match('functions.php'));
// 프리셋 임포트
require_once(file_match('preset.php'));

// 설정 검사
$version = $CONF['version'];
if (!isupdated($version)) {
	// 구버전 설정 삭제
	if ($_COOKIE['APP_PREFS']) {
		app_deleteallprefs('',true);
	}
	app_deleteallprefs($ID);
	$INFO['usecache'] = false; // 헤더에서 캐시 리프레시 처리
}

// 계산기 모드
$appmode = app_setmode('appmode','simpleMG');
// 구버전 모드 수정
if (!$appmode or $appmode=='basic' or $appmode=='advanced' or $_COOKIE['APP_PREFS']) {
	app_deleteallprefs('',true);
	$PREFS['appmode'] = $appmode = 'simpleMG';
}

// 프리셋
$presetID = app_setmode('preset','lezhin_2018');
// 구버전 프리셋 삭제
if (!$presetID or $_COOKIE['USER_PRESET']) {
	delete_preset('',true);
	$PREFS['preset'] = $presetID = 'lezhin_2018';
}

// 프리셋 에디트 가능 체크
global $EDITABLE;
$EDITABLE = true;
if ($appmode=='simpleMG') { // 에디트 불가 조건
	$EDITABLE = false;
}

// 프리셋 불러오기
/* if ($ACT=='reset') {
	// 기본값 불러옴
	$preset = get_preset($presetID,true);
	$preset_moded = false;
} else { */
	if (!$EDITABLE) {
		// 기본값 불러옴
		$preset = get_preset($presetID,true);
	} else {
		$preset = get_preset($presetID);
		// $preset_moded = $_REQUEST['preset_moded']; // 저장해야 할때
	}
// }

// 파라메터
if ($ACT=='reset') {
	// 파라메터 세팅
	$PARAMS = $preset['params'];
	
} else if (!$ACT or $ACT == 'calc') {
	foreach ($preset['params'] as $key=>$value) {
		if ($_REQUEST[$key] && $preset['params'][$key]!=$_REQUEST[$key]) {
			$preset['params'][$key] = $_REQUEST[$key];
			if ($appmode!='simpleMG') { $preset_moded = true; }
		}
	}
	
	// 파라메터 세팅
	$PARAMS = $preset['params'];
	// 올드 파라메터
	if ($_REQUEST['params']) {
		global $PARAMS_OLD;
		$PARAMS_OLD = $_REQUEST['params'];
	}
} else if ($ACT == 'diff') {
	// 파라메터 세팅
	$PARAMS = $_REQUEST['params'];
	// 올드 파라메터
	if ($_REQUEST['oldparams']) {
		global $PARAMS_OLD;
		$PARAMS_OLD = $_REQUEST['oldparams'];
	}
	// 파라메터 비교
	if (!empty(array_diff($PARAMS,$PARAMS_OLD))) {
		$preset_moded = true;
	}
}


// 현재 프리셋 편집 체크
if ($ACT=='reset') {
	// 저장 스킵 혹은 기본값 저장
	// set_preset($presetID, '', true);
} else {
	if ($EDITABLE) {
		// 저장해야 할때 ($_REQUEST['preset_moded'] 필요)
		/* if ($preset_moded) { 
			set_preset($presetID, $preset);
		} */
	}
}

// 설정 저장
app_setallprefs($PREFS);


// 파라메터 입력 및 변수 설정
	// print_r ($PARAMS);
	// print_r ($presetID);
	// print_r ($preset);
	
	// 파라메터
	$ratio_platform = $PARAMS['ratio_platform'];
	$ratio_author = $PARAMS['ratio_author'];
	$ratio_mg_sales = $PARAMS['ratio_mg_sales'];
	$ratio_mg_platform = $PARAMS['ratio_mg_platform'];
	$ratio_mg_author = $PARAMS['ratio_mg_author'];
	
	$coin_price = $PARAMS['coin_price'];
	$coin_share = $PARAMS['coin_share'];
	$coin_count = $PARAMS['coin_count'];
	$mg_target = $PARAMS['mg_target'];
	$mg_sales = $PARAMS['mg_sales'];
	$mg_platform = $PARAMS['mg_platform'];
	$mg_author = $PARAMS['mg_author'];
	$mg_penalty = $PARAMS['mg_penalty'];
	$mg_tax = $PARAMS['mg_tax'];
	
	// 에디트 가능
	$editable = $preset['editable'];
	
	// 계산에 따라 계산
	if ($appmode=='simpleMG') {
		
		if ($ACT == 'calc' or $ACT == 'diff') {
			if (
				$_REQUEST['ratio_platform'] && 
				$_REQUEST['ratio_author'] && 
				$_REQUEST['ratio_mg_sales'] && 
				$_REQUEST['ratio_mg_platform'] && 
				$_REQUEST['ratio_mg_author']
			) {
				$RESULT = mgcalc_basic($PARAMS);
			}
		}
		
	} else if ($appmode=='monthlyMG') {
		
		// 지각비
		$mg_penalty = $PARAMS['mg_penalty'] = $_REQUEST['mg_penalty'];
		
		// 세금
		if (!$_REQUEST['mg_author']) { // 첫 계산
			$tax = $mg_tax;
			if ($tax) {
				$tax_checked = 'checked';	
			}
		} else {
			$tax = $PARAMS['mg_tax'] = $_REQUEST['mg_tax'];
		}
		
		if ($ACT == 'calc' or $ACT == 'diff') {
			if (
				$_REQUEST['coin_price'] && 
				$_REQUEST['coin_share'] && 
				$_REQUEST['coin_count'] && 
				$_REQUEST['mg_target'] && 
				$_REQUEST['mg_sales'] && 
				$_REQUEST['mg_platform'] && 
				$_REQUEST['mg_author']
			) {
				$RESULT = mgcalc_advanced($PARAMS);
			}
		}
		
	}
	
?>