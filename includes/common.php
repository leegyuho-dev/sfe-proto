<?php
// common.php v0.60

// APP 공통 함수
// 글로벌 변수 필수

// 컨피그 파일 겟
// .user 파일 검사후 병합
function getConfig($confPath, $file, $strict = false)
{
    $config = getJsonFile($confPath.$file);

    if (pregMatch('/(.+)\.(.+)/i', $file, $matches)) {
        $fileName = $matches[1];
        $fileExt = $matches[2];
    }

    $userFile = $confPath.$fileName.'.user.'.$fileExt;
    if (@fileExists($userFile)) {
        $userConfig = getJsonFile($userFile);
        foreach ($userConfig as $key => $value) {
            if ($strict) {
                if (array_key_exists($key, $config)) {
                    $config[$key] = $value;
                }
            } else {
                $config[$key] = $value;
            }
        }
    }

    return $config;
}

function returnToApp($targetApp, $request=false)
{
    $requestURL = '';
    if ($request && !empty($_GET)) {
        $i = 0;
        foreach ($_GET as $key => $value) {
            if ($key == 'id') { 
                continue; 
            } else {
                $requestURL .= ($i == 0) ? '?' : '&';
                $requestURL .= $key.'='.$value;
                $i++;
            }
        }
    }
    header('Location: '.$targetApp.$requestURL);
}

// app 설정값 불러오기
function getPref($key, $default)
{
    global $SFEData;
    $appId = $SFEData['info']['appId'];
    if (!empty($_COOKIE['PREFS_'.$appId])) {
        $prefs = decodeJson($_COOKIE['PREFS_'.$appId], true);
        if (array_key_exists($key, $prefs)) {
            return $prefs[$key];
        }
    }
    return $default;
}
// app 설정값 저장
function setPref($key, $value)
{
    global $SFEData;
    $appId = $SFEData['info']['appId'];
    $prefs = decodeJson($_COOKIE['PREFS_'.$appId], true);
    if (array_key_exists($key, $prefs) && $prefs[$key]==$value) {
        return true;
    } else {
        $prefs[$key] = $value;
        return setCookie('PREFS_'.$appId, encodeJson($prefs), time()+365*24*3600, '/');
    }
    return false;
}
// app 설정값 전체 배열 불러오기
function getAllPrefs($default=array())
{
    global $SFEData;
    $appId = $SFEData['info']['appId'];
    if (!empty($_COOKIE['PREFS_'.$appId])) {
        $allPrefs = decodeJson($_COOKIE['PREFS_'.$appId], true);
        if (!empty($default)) {
            $allPrefs = array_merge($default, $allPrefs);
        }
        return $allPrefs;
    }
    return $default;
}
// app 설정값 전체 배열 저장
function setAllPrefs($prefs, $rewrite=false)
{
    global $SFEData;
    $appId = $SFEData['info']['appId'];
    if (!$prefs or !isArray($prefs)) {
        return false;
    }
    if (!$rewrite) {
        $prefs = array_merge(getAllPrefs(), $prefs);
    }
    return setCookie('PREFS_'.$appId, encodeJson($prefs), time()+365*24*3600, '/');
    return false;
}
// app 설정값 전체 삭제
function delAllPrefs($appid, $old=false)
{
    if (!$old && !$appid) {
        global $SFEData;
        $appId = $SFEData['info']['appId'];
    }
    if ($old) {
        $name = 'APP_PREFS';
    } else {
        $name = 'PREFS_'.$ID;
    }
    return setCookie($name, '', time() - 3600);
    return false;
}

// 서브액션
function setAppmode($mode, $default, $write=false)
{
    global $SFEData;

    $value = $_REQUEST[$mode];
    if (!empty($value)) {
        if ($write) {
            setPref($mode, $value);
        }
        $SFEData['prefs'][$mode] = $value;
        return $value;
    } elseif (!$value) {
        $value = getPref($mode, false);
        if (!$value) {
            if ($write) {
                setPref($mode, $default);
            }
            $value = $default;
        }
        $SFEData['prefs'][$mode] = $value;
        return $value;
    }
    return false;
}
