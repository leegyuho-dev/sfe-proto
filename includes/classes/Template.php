<?php
namespace SFE;
class Template
{
    public $html;

    // 클래스 생성
    public function __construct()
    {
        $this->preLoad = array();
    }

    // 템플릿 로드
    public function load()
    {
        global $SFEData;
        
        // 템플릿 경로 상수 선언
        $this->defineTemplate('prototype');

        // 템플릿 파일 메이크
        $this->makeTemplate('main.html');

        // 세션 데이터 생성
        // TODO: 세션데이터 클래스로 연결
        $_SESSION['SFEData'] = $SFEData;

        // 서버 푸시
        $this->pushPreLoad();

        // 템플릿 파일 프린트
        $this->printTemplate();
    }

    private function defineTemplate($default = 'prototype')
    {
        global $SFEData;
        $template = $SFEData['conf']['template'];
        $tplPath = $SFEData['paths']['tpl'];

        // 필수 파일 체크
        if (dirExists($tplPath.$template) &&
        fileExists($tplPath.$template.'/'.'main.php')
        ) {
            $SFEData['paths']['tplPath'] = $tplPath.$template.'/';
        } else {
            // 기본 템플릿
            $SFEData['paths']['tplPath'] = $tplPath.$default.'/';
        }
    }

    // 템플릿을 만든다
    private function makeTemplate($mainFile = 'main.html')
    {
        global $SFEData;
        $templateFile = $SFEData['paths']['tplPath'].$mainFile;
        $lang = $SFEData['info']['lang'];

        $this->html = getFileContents($templateFile);
        $this->html = pregReplace('/\{\{\s*LANG\s*\}\}/', $lang, $this->html);
        $this->html = pregReplace('/\{\{\s*METAHEADER\s*\}\}/', $this->metaHeader(), $this->html);
        // $this->html = pregReplace('/\{\{\s*APPMAIN\s*\}\}/', $this->getAppHtml(), $this->html);
        // $SFEData['app']['template'] = $this->getAppHtml();
    }

    // 메타헤더
    private function metaHeader()
    {
        global $SFEData;
        $conf = $SFEData['conf'];
        $info = $SFEData['info'];
        $langs = $SFEData['langs'];
        $paths = $SFEData['paths'];
        $appMode = $SFEData['info']['appMode'];
        $appPath = $SFEData['paths']['appPath'];
        $tplPath = $SFEData['paths']['tplPath'];

        // 라이브러리 컨피그                                 
        $libraries = getConfig($paths['conf'], 'libraries.json5');
        $tplLibraries = getConfig($tplPath, 'tpllibraries.json5');
        $appLibraries = getConfig($appPath.'configs/', 'applibraries.json5');

        $iconConfig = getConfig($paths['icons'].$conf['icon'].'/', 'iconconfig.json5');
        $fontConfig = $libraries['fonts'];      
        $styleConfig = array(
            'common' => $libraries['styles'],
            'template' => $tplLibraries['styles'],
            'application' => $appLibraries['styles'],
        );
        $scriptConfig = array(
            'engine' => $libraries['SFEScripts'],
            'common' => $libraries['scripts'],
            'template' => $tplLibraries['scripts'],
            'application' => $appLibraries['scripts'],
        );

        // 메타헤더
        $metaHeader = array();
        $metaHeader[] = implode("\n", [
            '<meta charset="UTF-8">',
            '<meta http-equiv="X-UA-Compatible" content="IE=edge">',
        ]);

        // 타이틀
        // VueSiteModeler.js 에서 처리
        $metaHeader[] = '<title>'.$info['appName'].'</title>';

        // 캐시 삭제
        if (!$info['useCache']) {
            $metaHeader[] = implode("\n", [
                '<meta http-equiv="Expires" content="Mon, 06 Jan 1970 00:00:01 GMT">',
                '<meta http-equiv="Expires" content="-1">',
                '<meta http-equiv="Pragma" content="no-cache">',
                '<meta http-equiv="Cache-Control" content="no-cache">',
            ]);
        }

        // 확대율 지정
        $metaHeader[] = '<meta name="viewport" content="width=device-width, '.
                        'initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />';

        // 메타아이콘
        // $iconConfig 재처리해서 리턴됨
        $metaHeader[] = $this->metaIcon($iconConfig);

        // 웹앱 매니페스트
        if (fileExists($paths['conf'].'manifest.json')) {
            $metaHeader[] = $this->metaManifest();
        }

        // 브라우저 컨픽
        if (fileExists($paths['conf'].'browserconfig.xml')) {
            $metaHeader[] = $this->metaBrowserconfig();
        }

        // 폰트로더
        // FIXME: 사용하지 않음. 프리로드로 처리.
        // $metaHeader[] = $this->metaFontLoader($fontConfig);

        // 폰트
        $metaHeader[] = $this->metaFonts($fontConfig);

        // 스타일
        $metaHeader[] = $this->metaStyles($styleConfig);
            
        // 스크립트
        $metaHeader[] = $this->metaScripts($scriptConfig);

        // 모듈
        // FIXME: 사용하지 않음. 로더를 통해 모듈로 임포트 처리.
        // $metaHeader[] = $this->metaModules($libraries['modules']);

        // 라이브러리 객체
        $SFEData['libs'] = $appLibraries;
        $SFEData['libs']['icons'] = $iconConfig;
        $SFEData['libs']['fonts'] = $fontConfig;

        $metaHeader[] = '<!-- APPSTART -->';
        return implode("\n", $metaHeader);
    }
    
    // 아이콘 패스에서 이미지파일을 찾아서 메타헤더로 만든다
    private function metaIcon(&$iconConfig)
    {
        global $SFEData;
        $conf = $SFEData['conf'];
        $paths = $SFEData['paths'];

        $iconsPath = $paths['icons'].$conf['icon'].'/';
        $libIcons = array();
        $metaIcon = array();
        $metaIcon[] = '<!-- METAICON -->';
        foreach ($iconConfig as $id => $icon) {
            $metaIcon[] = '<link rel="'.$icon['rel'].'" '.
                (!empty($icon['type']) ? 'type="'.$icon['type'].'" ' : '').
                (!empty($icon['sizes']) ? 'sizes="'.$icon['sizes'].'x'.$icon['sizes'].'" ' : '').
                (!empty($icon['color']) ? 'color="'.$icon['color'].'" ' : '').
                'href="'.$iconsPath.$icon['href'].'">';
            
            $libIcons[$id] = $conf['icon'].'/'.$icon['href'];
            // $this->addPreLoad($iconsPath.$icon['href'], 'preload', 'image');
        }
        $iconConfig = $libIcons;

        return implode("\n", $metaIcon);
    }
    
    // 안드로이드 웹앱 매니페스트
    private function metaManifest()
    {
        global $SFEData;
        $paths = $SFEData['paths'];

        $manifest = getJsonFile($paths['conf'].'manifest.json');
        $metaManifest = array();
        $metaManifest[] = '<!-- METAMANIFEST -->';
        
        $metaManifest[] = '<link rel="manifest" href="'.$paths['conf'].'manifest.json">';
        if (!empty($manifest['theme_color'])) {
            $metaManifest[] = '<meta name="theme-color" content="'.$manifest['theme_color'].'">';
        }

        return implode("\n", $metaManifest);
    }

    // MS 브라우저 컨픽
    private function metaBrowserconfig()
    {
        global $SFEData;
        $paths = $SFEData['paths'];

        $browserconfig = getXmlFile($paths['conf'].'browserconfig.xml');
        $metaBrowserconfig = array();
        $metaBrowserconfig[] = '<link rel="manifest" href="'.$paths['conf'].'browserconfig.xml">';
        if (!empty($browserconfig->msapplication->tile->TileColor)) {
            $metaBrowserconfig[] = '<meta name="msapplication-TileColor" content="'.$browserconfig->msapplication->tile->TileColor.'">';
        }

        return implode("\n", $metaBrowserconfig);
    }

    // 폰트로더
    // FIXME: 사용하지 않음
    private function metaFontLoader($fontConfig)
    {
        global $SFEData;
        $paths = $SFEData['paths'];

        // FIXME: fontConfig.json5 의 프로퍼티명을 카멜케이스로 바꾼 관계로 수정 필요함.
        $fontLoader = array();
        $fontLoader[] = '<!-- FONTLOADER -->';
        $fontLoader[] = '<script id="scriptAddFontset">/*<![CDATA[*/';        
        foreach ($fontConfig as $type => $fontset) {
            if ($type == 'contents') {
                continue;
            } elseif ($type == 'icons') {
                $fontLoader[] = 'const Fontset = {';
                $fontLoader[] = 'logLoaded: function (fontFace) {'."\n".
                                    'console.log("FONT:", fontFace.family, "loaded successfully.");'."\n".
                                '}'."\n".'}';
                foreach ($fontset as $id => $font) {

                    if ($id == 'Fontset') {
                        $fontLoader[] = 'Fontset.css = "'.$paths['fonts'].$font['css'].'"';
                        continue;
                    }
                    $fontLoader[] = 'Fontset.'.$id.' = new FontFace("'.$font['font-family'].'", "url('.$paths['fonts'].$font['src'].')");';
                    $fontLoader[] = 'Fontset.'.$id.'.type = "'.$type.'"';
                    if (!empty($font['css'])) {
                        $fontLoader[] = 'Fontset.'.$id.'.css = "'.$paths['fonts'].$font['css'].'"';
                    }
                    $fontLoader[] = 'document.fonts.add(Fontset.'.$id.');';
                    $fontLoader[] = 'Fontset.'.$id.'.loaded.then(Fontset.logLoaded);';

                    $this->addPreLoad($paths['fonts'].$font['src'], 'preload', 'font');
                }
            }
        }
        $fontLoader[] = '// scriptAddFontset.remove();';
        $fontLoader[] = '/*!]]>*/</script>';
        $fontLoader[] = '<script id="fontLoader" src="'.$paths['fonts'].'fontloader.js"></script>';

        return implode("\n", $fontLoader);
    }

    // 폰트 메타헤더
    // CSS 가 지정되어 있을때만 처리. 이외 기본 폰트는 fonts.css 에서 처리함.
    private function metaFonts($fontConfig)
    {
        global $SFEData;
        $paths = $SFEData['paths'];

        $metaFonts = array();
        $metaFonts[] = '<!-- METAFONTS -->';
        foreach ($fontConfig as $id => $font) {
            if (!empty($font['css'])) {
                $fontCSS = fileMatch($paths['fonts'].$font['css']);
                $metaFonts[] = '<link type="text/css" rel="stylesheet" href="'.$fontCSS.'" />';
                // $this->addPreLoad('/'.$paths['fonts'].$font['src'], 'preload', 'font');
                $this->addPreLoad($fontCSS, 'preload', 'style');
            }
        }
        return implode("\n", $metaFonts);
    }

    // 스타일 메타헤더
    // common, template, application 순으로 로드.
    // common: STYLES, template: TPLPATH, application: APPPATH 로 경로 생성. 
    public function metaStyles($styleConfig)
    {
        global $SFEData;
        $paths = $SFEData['paths'];

        $metaStyles = array();
        $metaStyles[] = '<!-- METASTYLES -->';
        
        // 기본 스타일
        if (!empty($styleConfig['common'])) {
            foreach ($styleConfig['common'] as $file) {
                $styleFile = fileMatch($paths['styles'].$file);
                $metaStyles[] = '<link type="text/css" rel="stylesheet" href="'.$styleFile.'" />';
                $this->addPreLoad($styleFile, 'preload', 'style');
            }
        }
        // 템플릿 스타일
        if (!empty($styleConfig['template'])) {
            foreach ($styleConfig['template'] as $file) {
                $styleFile = fileMatch($paths['tplPath'].$file);
                $metaStyles[] = '<link type="text/css" rel="stylesheet" href="'.$styleFile.'" />';
                $this->addPreLoad($styleFile, 'preload', 'style');
            }
        }
        // 앱 스타일
        if (!empty($styleConfig['application'])) {
            foreach ($styleConfig['application'] as $file) {
                $styleFile = fileMatch($paths['appPath'].$file);
                $metaStyles[] = '<link type="text/css" rel="stylesheet" href="'.$styleFile.'" />';
                $this->addPreLoad($styleFile, 'preload', 'style');
            }
        }
        
        return implode("\n", $metaStyles);
    }

    // 스크립트 메타헤더
    // external, common, template, application 순으로 로드.
    // 스크립트의 경우.
    // external: SCRIPTS, common: SCRIPTS, template: TPLPATH, application: APPPATH 로 경로 생성.
    // 모듈의 경우.
    // external: MODULES, common: MODULES, template: TPLPATH, application: APPPATH 로 경로 생성.
    public function metaScripts($scriptConfig)
    {
        global $SFEData;
        $paths = $SFEData['paths'];

        $type = 'text/javascript';
        $metaScripts = array();
        $metaScripts[] = '<!-- METASCRIPTS -->';

        // 엔진 스크립트
        if (!empty($scriptConfig['engine'])) {
            foreach ($scriptConfig['engine'] as $file) {
                $scriptFile = fileMatch($paths['SFE'].$file);
                $metaScripts[] = '<script type="'.$type.'" src="'.$scriptFile.'"></script>';
                $this->addPreLoad($scriptFile, 'preload', 'script');
            }
        }

        // 공용 스크립트
        if (!empty($scriptConfig['common'])) {
            foreach ($scriptConfig['common'] as $file) {
                $scriptFile = fileMatch($paths['scripts'].$file);
                $metaScripts[] = '<script type="'.$type.'" src="'.$scriptFile.'"></script>';
                $this->addPreLoad($scriptFile, 'preload', 'script');
            }
        }
        
        // 템플릿 스크립트
        if (!empty($scriptConfig['template'])) {
            foreach ($scriptConfig['template'] as $file) {
                $scriptFile = fileMatch($paths['tplPath'].$file);
                $metaScripts[] = '<script type="'.$type.'" src="'.$scriptFile.'"></script>';
                $this->addPreLoad($scriptFile, 'preload', 'script');
            }
        }
        // 앱 스크립트
        if (!empty($scriptConfig['application'])) {
            foreach ($scriptConfig['application'] as $file) {
                $scriptFile = fileMatch($paths['appPath'].$file);
                $metaScripts[] = '<script type="'.$type.'" src="'.$scriptFile.'"></script>';
                $this->addPreLoad($scriptFile, 'preload', 'script');
            }
        }
        
        return implode("\n", $metaScripts);
    }

    private function addPreLoad($src = '', $rel = 'preload', $as = 'image', $type = null) 
    {
        if (empty($src)) {
            return false;
        }
        $preLoad = array(
            'src'=> $src,
            'rel' => $rel,
            'as' => $as,
        );
        if (!empty($type)) {
            $preLoad['type'] = $type;
        }

        $this->preLoad[] = $preLoad;
    }
    private function pushPreLoad($src = '', $rel = 'preload', $as = 'image') 
    {
        $pushLink = 'Link: ';
        $i = 0;
        $length = count($this->preLoad);
        foreach ($this->preLoad as $key => $value) {
            $pushLink .= '<'.$value['src'].'>; rel='.$value['rel'].'; as='.$value['as'];
            if ($i < $length-1) {
                $pushLink .= ', ';
            }
            $i++;
        }
        header($pushLink, false);
    }

    private function getAppHtml()
    {
        global $SFEData;
        $conf = $SFEData['conf'];
        $paths = $SFEData['paths'];

        $appHtml = getFileContents($paths['appPath'].$conf['appHtml']);

        return $appHtml;
    }

    private function printTemplate()
    {
        echo $this->html;
    }

    // 클래스 소멸
    public function __destruct()
    {
        // echo 'destroyed';
    }
}
