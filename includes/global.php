<?php
// functions.php 0.0.1 
// 공용 함수.
// 각종 모듈 클래스를 불러들여서 함수로 선언한다. 
// 사용빈도가 잦은 소형 함수 선언 및 수정된 내장함수 선언.

// ROOT 상수가 존재하지 않을 경우 재선언
if (!defined('ROOT')) {
    define('ROOT', realpath(dirname(__FILE__).'/../'));
}

// 클래스 오토로드
function _autoLoad($className)
{
    $classPath = '/includes/classes/';
    // 네임스페이스가 있는 클래스 호출일 경우
    // if (strpos($className, '\\') !== false) {
    if (pregMatch('/\/?(.+)\/(.+)/i', str_replace('\\', '/', $className), $matches)) {
        $namespace = $matches[1];
        $className = $matches[2];
        if ($namespace == 'SFE') {
            $classPath = '/includes/classes/';
        } else {
            $classPath = '/includes/'.$namespace.'/';
        }
    }
    require ROOT.$classPath.$className.'.php';
}
spl_autoload_register('_autoLoad');

// 경로 검증 및 처리
function checkPath($path) {
    // 절대경로일 경우 ROOT 를 붙임.
    if (substr($path, 0, 1) == '/') {
        return ROOT.$path;
    }
}

// json5_decode
// https://github.com/colinodell/json5
// TODO: 차후 PHP 7.3 에 대한 폴리필 지원 추가.
function json5_decode($source, $associative = false, $depth = 512, $options = 0)
{   
    return \Json5\Json5Decoder::decode($source, $associative, $depth, $options);
}

// print
function debug($expression, $return = null)
{
    print_r($expression, $return = null);
    exit();
}
function printR($expression, $return = null)
{
    print_r($expression, $return = null);
}
function printArray($expression, $return = null)
{
    print_r($expression, $return = null);
}

// substr
/* function subStr($string, $start, $length = null) {
    return substr($string, $start, $length);
} */
// preg_match
function pregMatch($pattern, $subject, &$matches = null, $flags = 0, $offset = 0)
{
    return preg_match($pattern, $subject, $matches, $flags, $offset);
}
// preg_replace
function pregReplace($pattern, $replacement, $subject, $limit = -1, &$count = null)
{
    return preg_replace($pattern, $replacement, $subject, $limit, $count);
}

// 변수의 자료형을 검사한다
function valueType($value)
{
    if (isObject($value)) {
        return 'object';
    } elseif (isArray($value)) {
        return 'array';
    } elseif (isNumeric($value)) {
        if (isFloat($value)) {
            return 'float';
        } elseif (isInt($value)) {
            return 'int';
        }
    } elseif (isString($value)) {
        return 'string';
    } elseif (isBool($value)) {
        return 'bool';
    } else {
        return false;
    }
}
// is_bool
function isBool($value)
{
    return is_bool($value);
}
// is_float
function isFloat($value)
{
    return is_float($value);
}
// is_int
function isInt($value)
{
    return is_int($value);
}
// is_numeric
function isNumeric($value)
{
    return is_numeric($value);
}
// is_string
function isString($value)
{
    return is_string($value);
}
// is_object
function isObject($value)
{
    return is_object($value);
}
// is_array
function isArray($value)
{
    return is_array($value);
}

// 변수 존재 검사
function valueExists($key, $array = array())
{
    if (isset($array[$key]) && !empty($array[$key])) {
        return true;
    }
    return false;
}

// JSON 파일 가져오기
function getJsonFile($file)
{
    return json5_decode(getFileContents($file), true);
}
// json_decode
function decodeJson($source, $associative = false, $depth = 512, $options = 0)
{
    return json5_decode($source, $associative, $depth, $options);
}
// json_encode
function encodeJson($value, $options = 0, $depth = 512)
{
    return json_encode($value, $options, $depth);
}

// file_get_contents
function getFileContents($filename, $use_include_path = false, $context = null, $offset = 0, $maxlen = null)
{
    if ($maxlen) {
        return file_get_contents(checkPath($filename), $use_include_path, $context, $offset, $maxlen);
    } else {
        return file_get_contents(checkPath($filename), $use_include_path, $context, $offset);
    }
}

// XML 파일 가져오기
function getXmlFile($filename, $class_name = "SimpleXMLElement", $options = 0, $ns = "", $is_prefix = false) {
    return simplexml_load_file(checkPath($filename), $class_name, $options, $ns, $is_prefix);
}

// 임포트
// 값 임포트의 경우 $value 인자 필요
// NOTE: require 와 include 는 가변함수로 호출 불가능함.
// http://php.net/manual/kr/function.include.php
function import($file, &$value = null, $callFN = 'requireOnce')
{
    if (
        // $callFN != 'require' &&
        $callFN != 'requireOnce' &&
        // $callFN != 'include' &&
        $callFN != 'includeOnce') {
        return false;
    }

    return $value = $callFN(checkPath($file));
}
// require_once
function requireOnce($file)
{
    return require_once $file;
}
// include_once
function includeOnce($file)
{
    return include_once $file;
}

// 파일 매치 fileMatch($file)
// 개발모드에 따라 $fileName.$ext, $fileName.dev.$ext, $fileName.min.$ext 파일을 검색하여 문자열로 재반환.
// 우선순위: 
// isDevMode = true : $fileName.dev.$ext, $fileName.$ext, $fileName.min.$ext
// isDevMode = false : $fileName.min.$ext, $fileName.$ext, $fileName.dev.$ext
// TODO: 파일 버전 선택 추가
function fileMatch($file)
{
    global $SFEData;
    $info = $SFEData['info'];
    
    // 경로, 파일명, 확장자 식별
    if (pregMatch('/(.+\/)?(.+)\.(.+)/i', $file, $matches)) {
        $filePath = $matches[1];
        $fileName = $matches[2];
        $fileExt = $matches[3];
    }
    // 파일명에 이미 .min 이나 .dev 가 포함되어 있을 경우 그대로 리턴.
    if (pregMatch('/(.+)\.(.+)/i', $fileName, $matches)) {
        if ($matches[2] == 'min' || $matches[2] == 'dev') {
            return $file;
        }
    }

    $targetFile = $filePath.$fileName.'.'.$fileExt;
    $devFile = $filePath.$fileName.'.dev.'.$fileExt;
    $minFile = $filePath.$fileName.'.min.'.$fileExt;

    if ($info['isDevMode'] == true) {
        if (@fileExists($devFile)) {
            $file = $devFile;
        } else if (@fileExists($targetFile)) {
            $file = $targetFile;
        } else if (@fileExists($minFile)) {
            $file = $minFile;
        }
    } else {
        if (@fileExists($minFile)) {
            $file = $minFile;
        } else if (@fileExists($targetFile)) {
            $file = $targetFile;
        } else if (@fileExists($devFile)) {
            $file = $devFile;
        }
    }

    return $file;
}
// 파일 검색 fileSearch($path,$regex=null,$krSort=false)
// 패스는 되도록 경로 상수(APP_ROOT 등) 로 입력
    // 정규식 예제
    // $regex='/.+\..+/i'; // 모든 파일
    // $regex='/.+\.php$/i'; // php 파일
    // $regex='/.+\.(css|php|js)$/i'; // css, php, js 파일
    // $regex='/.+_v(0.54)\.(css|php|js)$/i'; // 특정 버전 파일
    // $regex='/.+_v([0-9].[0-9]{1,3})\.(css|php|js)$/i'; // 모든 버전 파일
    // $regex='/.+_v([0-9]).([0-9]{1,3})\.(css|php|js)$/i'; // 모든 버전 파일, 버전넘버 세분화
// 다음 형식으로 반환
/* array (
    $fileName[0] => array($match[0],$match[1],$match[3], ...),
    $fileName[1] => array($match[0],$match[1],$match[3], ...)
    ); */
function fileSearch($path, $regex='/.+\..+/i', $krSort=false)
{
    $handle  = @openDir($path);
    if (!$handle) {
        return false;
    } // 디렉토리 없을 경우 return false
    
    $files = array();
    while (false !== ($fileName = readDir($handle))) {
        if ($fileName == "." or $fileName == "..") {
            continue;
        }
        if (pregMatch($regex, $fileName, $matches)) {
            // print_r ($matches);
            foreach ($matches as $key=>$match) {
                if ($key==0) {
                    $files[$match] = array();
                } else {
                    $files[$matches[0]][] = $match;
                }
            }
        }
    }
    closeDir($handle);
    if (empty($files)) { // 파일 없을 경우 return false
        return false;
    }
    
    if ($krSort) {
        krSort($files);
    } else {
        kSort($files);
    }
    return $files;
}
// file_exists
function fileExists($fileName)
{
    return file_exists(checkPath($fileName));
}
// dir_exists
function dirExists($dirName)
{
    return is_dir(checkPath($dirName));
}
// is_dir
function isDir($dirName)
{
    return is_dir(checkPath($dirName));
}
// is_dir
function isFile($dirName)
{
    return is_file(checkPath($dirName));
}

// array_merge 
function arrayMerge($array1, $array2 = array())
{
    return array_merge($array1, $array2);
}
// array_merge_recursive
function arrayMergeRec($array1, $array2 = array())
{
    return array_merge_recursive($array1, $array2);
}
