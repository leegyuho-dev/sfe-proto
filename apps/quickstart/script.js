// script.js v0.55

var $ratio_platform; // 플랫폼 분배율
var $ratio_author; // 작가 분배율
var $ratio_mg_sales; // 분배율 총 매출
var $ratio_mg_platform; // 분배율 플랫폼 수익
var $ratio_mg_author; // 분배율 작가 수익
var $coin_price; // 코인 가격
var $coin_share; // 코인 수익
var $coin_count; // 코인 개수
var $mg_target; // mg 금액
var $mg_sales; // 총 매출
var $mg_platform; // 플랫폼 수익
var $mg_author; // 작가 수익

// 변수 재지정
function initCheck() {
	$ratio_platform = jQuery('#ratio_platform').val();
	$ratio_author = jQuery('#ratio_author').val();
	$ratio_mg_sales = jQuery('#ratio_mg_sales').val();
	$ratio_mg_platform = jQuery('#ratio_mg_platform').val();
	$ratio_mg_author = jQuery('#ratio_mg_author').val();
	
	$coin_price = jQuery('#coin_price').val();
	$coin_share = jQuery('#coin_share').val();
	$coin_count = jQuery('#coin_count').val();
	$mg_target = jQuery('#mg_target').val();
	$mg_sales = jQuery('#mg_sales').val();
	$mg_platform = jQuery('#mg_platform').val();
	$mg_author = jQuery('#mg_author').val();
}

// 메시지
function msg(message,type) {
	if (!message) { message = $lang['nomessage']; }
	type = typeof type !== 'undefined' ? type : 'info';

	if (type='info') {
		message = '<div class="info"><i class="fa fa-info-circle text-info"></i> '+message+'</div>';
	}
	var msgbox = jQuery('#appmsg .msg');
	msgbox.html(message);
	msgbox.show(0).animate({
		'opacity' : 1,
		'top' : 38,
	},100);
	setTimeout(function(){
		msgbox.animate({ 'opacity' : 0 },100);
		setTimeout(function(){msgbox.animate({'top' : -10+'%'},0).hide(0)}, 100);
	}, 1200);
}

// 쿠키 프리셋 불러오기
function load_preset(presetID,defaultParams) {
	defaultParams = typeof defaultParams !== 'undefined' ? defaultParams : false;
	if (!presetID) {
		presetID = 'user';
	}
	if (defaultParams) {
		return jQuery.parseJSON(jQuery('#preset_'+presetID).attr('value'));
	}
	var presetParams = jQuery.parseJSON(jQuery.cookie('PRESET_'+presetID));
	if (presetParams) {
		return presetParams;
	} else {
		return get_preset(presetID);
	}
	return false;
}
// 쿠키 프리셋 저장
function save_preset(presetID, presetParams, defaultParams) {
	defaultParams = typeof defaultParams !== 'undefined' ? defaultParams : false;
	if (!presetID) {
		presetID = 'user';
	}
	if (!presetParams || defaultParams) {
		presetParams = jQuery('#preset_'+presetID).attr('value');
	} else {
		presetParams = JSON.stringify(presetParams);
	}
	if (presetParams != jQuery.cookie('PRESET_'+presetID)) {
		return jQuery.cookie('PRESET_'+presetID, presetParams, {expires: 365, path: '/'}); //쿠키 셋팅
	}
	return false;
}
// 쿠키 프리셋 삭제
function delete_preset(presetID) {
	if (!presetID) {
		presetID = 'user';
	}
	return jQuery.cookie('PRESET_'+presetID, '', {expires: -30, path: '/'});
	return false;
}

// 프리셋 불러오기
function get_preset(presetID) {
	// console.log (presetID);
	var moded = jQuery('#set_'+presetID).attr('moded');
	if (moded==true) {
		return jQuery.parseJSON(jQuery('#preset_'+presetID+'_moded').attr('value'));
	} else {
		return jQuery.parseJSON(jQuery('#preset_'+presetID).attr('value'));
	}
	return false;
}
// 프리셋 저장
function set_preset(presetID, presetParams) {
	presetParams = typeof presetParams !== 'undefined' ? presetParams : '';
	if (presetParams) {
		presetParams = JSON.stringify(presetParams);
	}
	if (presetParams!=jQuery('#preset_'+presetID+'_moded').attr('value')) {
		jQuery('#preset_'+presetID+'_moded').attr({ 'value' : presetParams });
		return true;
	}
	return false;
}

// 플러스 마이너스 인풋
function inputStep(object) {
	var targetval = jQuery('#'+object.name).val();
	targetval = Math.floor(targetval/object.value)*object.value;
	targetval = (targetval-0)+(object.value-0);
	jQuery('#'+object.name).val(targetval);
	document.getElementById(object.name).oninput(document.getElementById(object.name));
}

// 인풋값 체크
function inputCheck(object) {
	// 소수점 버림
	/* if (object.id=='ratio_platform' || object.id=='ratio_author') {
		object.value = Math.floor(object.value*100)/100;
	} else {
		object.value = Math.floor(object.value);
	} */
	// maxlength 제한 (maxlength-5)
	if (object.value.length > object.maxLength-5){
		object.value = object.value.slice(0, object.maxLength-5);
	}
}

// 백분율 자동 조정
function ratioCheck(object) {
	// $ratio_result = 100-object.value;
	$ratio_result = (100-object.value).toFixed(2);
	if (object.id=='ratio_platform') {
		jQuery('#ratio_author').val($ratio_result);
	} else if (object.id=='ratio_author') {
		jQuery('#ratio_platform').val($ratio_result);
	}
}

// 프리셋 편집
function editPreset(object) {
	if (jQuery('#set_preset').val()=='user') {
		return false;
	}
	
	var alltarget = [
		'ratio_platform','ratio_author','ratio_mg_sales','ratio_mg_platform','ratio_mg_author',
		'coin_price','coin_share','coin_count','mg_target','mg_sales','mg_platform','mg_author','mg_penalty','mg_tax',
	];
	
	// 전부 풀기
	jQuery.each(alltarget, function(key, value) {
		jQuery('#'+value).removeClass('deactive').attr({ 'readonly' : false , 'disabled' : false });
		jQuery('#'+value+'_plus, #'+value+'_minus').attr({ 'disabled' : false });
	});
	
	// 프리셋 저장
	app_setpref('preset', 'user');
	// 다음 계산 처리
	jQuery('#set_preset').val('user');
	
	// 버튼 처리
	jQuery(object).addClass('deactive').attr({'disabled':'disabled'});
	jQuery('#revertpreset, #savepreset').removeClass('deactive').attr({'disabled':false});
	jQuery('#savepreset').addClass('active');
	
	// 메뉴 처리
	jQuery('#mainmenu_open .selected').text($lang['userpreset']);
	jQuery('#mainmenu_open .saved').removeClass('show').addClass('hide');
	jQuery('#mainmenu_open .moded').removeClass('hide').addClass('show');
	if (jQuery('#mainmenu .listitem.active').val()!='user') {
		jQuery('#mainmenu .listitem.active').removeClass('active');
		jQuery('#set_user').addClass('active');
	}
	
	// 모드체크 참
	jQuery('#moded_preset').val(true);	

	// 다음 계산시 저장
	jQuery('#set_preset_moded').val(true);	
	
	// 메시지
	msg($lang['preset_changed2user']);
	
}

// 프리셋 초기화
function revertPreset(object) {
	if (!jQuery('#moded_preset').val()) {
		return false;
	}
	
	var presetID = jQuery('#set_preset').attr('value');
	var name = jQuery('#set_'+presetID).find('.name').text();
	var params = jQuery.parseJSON(jQuery('#preset_'+presetID).attr('value'));
	var alltarget = [
		'ratio_platform','ratio_author','ratio_mg_sales','ratio_mg_platform','ratio_mg_author',
		'coin_price','coin_share','coin_count','mg_target','mg_sales','mg_platform','mg_author','mg_penalty','mg_tax',
	];
	
	jQuery.each(params, function(key, value) {
		if (alltarget.indexOf(key)==-1) {
			return true;
		}
		if (key=='mg_penalty') {
			jQuery('#mg_penalty, #set_penalty').val(value);
		} else if (key=='mg_tax') {
			jQuery('#mg_tax, #set_tax').val(value);
		} else {
			jQuery('#'+key).val(value);
		}
	});
	
	// 프리셋 삭제
	set_preset(presetID, '');
	// 쿠키 프리셋 삭제
	delete_preset(presetID);
	// 다음 계산 처리
	// jQuery('#set_preset').val(presetID);
	
	// 버튼 처리
	jQuery('#revertpreset, #savepreset').removeClass('active').addClass('deactive').attr({'disabled':'disabled'});
	
	// 메뉴 처리
	// jQuery('#mainmenu_open .selected').text(name);
	jQuery('#mainmenu_open .saved').removeClass('show').addClass('hide');
	jQuery('#mainmenu_open .moded').removeClass('show').addClass('hide');
	jQuery('#set_'+presetID).attr({'moded':''});
	jQuery('#set_'+presetID).find('.saved').removeClass('show').addClass('hide');
	
	// 모드체크 거짓
	jQuery('#moded_preset').val(false);
	
	// 다음 계산시 저장 안함
	jQuery('#set_preset_moded').val(false);	
	
	msg(name+$lang['preset_reverted']);	
}

// 프리셋 저장
function savePreset(object) {
	if (!jQuery('#moded_preset').val()) {
		return false;
	}
	
	var presetID = jQuery('#set_preset').attr('value');
	var name = jQuery('#set_'+presetID).find('.name').text();
	var params = get_preset(presetID);
	var alltarget = [
		'ratio_platform','ratio_author','ratio_mg_sales','ratio_mg_platform','ratio_mg_author',
		'coin_price','coin_share','coin_count','mg_target','mg_sales','mg_platform','mg_author','mg_penalty','mg_tax',
	];
	
	jQuery.each(alltarget, function(key, value) {
		if (jQuery('#'+value).length) {
			params[value] = jQuery('#'+value).val();
		}
	});
	
	// 프리셋 저장
	set_preset(presetID, params);
	// 쿠키 프리셋 저장
	save_preset(presetID, params);
	// 다음 계산 처리
	// jQuery('#set_preset').val(presetID);
	
	// 버튼 처리
	jQuery(object).removeClass('active').addClass('deactive').attr({'disabled':'disabled'});
	// 메뉴 처리
	// jQuery('#mainmenu_open .selected').text(name);
	jQuery('#mainmenu_open .saved').removeClass('hide').addClass('show');
	jQuery('#mainmenu_open .moded').removeClass('show').addClass('hide');
	jQuery('#set_'+presetID).attr({'moded':1});
	jQuery('#set_'+presetID).find('.saved').removeClass('hide').addClass('show');
	
	// 모드체크 거짓
	jQuery('#moded_preset').val(false);
	
	// 다음 계산시 저장 안함
	jQuery('#set_preset_moded').val(false);	
	
	msg(name+$lang['preset_saved']);	

}

// 프리셋 실시간 변경
function changePreset(object) {
	if (!jQuery('#moded_preset').val() && jQuery('#set_preset').attr('value')==object.value) {
		jQuery('#mainmenu_open').click();
		return false;
	}
	
	var presetID = object.value;
	var name = jQuery(object).find('.name').text();
	var params = get_preset(presetID);
	var editable =  jQuery.parseJSON(jQuery('#preset_'+presetID+'_editable').attr('value'));
	var alltarget = [
		'ratio_platform','ratio_author','ratio_mg_sales','ratio_mg_platform','ratio_mg_author',
		'coin_price','coin_share','coin_count','mg_target','mg_sales','mg_platform','mg_author','mg_penalty','mg_tax',
	];
	
	jQuery.each(params, function(key, value) {
		if (alltarget.indexOf(key)==-1) {
			return true;
		}
		if (key=='mg_penalty') {
			jQuery('#mg_penalty, #set_penalty').val(value);
		} else if (key=='mg_tax') {
			jQuery('#mg_tax, #set_tax').val(value);
		} else {
			jQuery('#'+key).val(value);
		}
		// console.log (key+' '+value);
	});
	
	if (editable=='all') {
		// 전부 풀기
		jQuery.each(alltarget, function(key, value) {
			jQuery('#'+value).removeClass('deactive').attr({ 'readonly' : false , 'disabled' : false });
			jQuery('#'+value+'_plus, #'+value+'_minus').attr({ 'disabled' : false });
		});
	} else {
		// 풀기
		jQuery.each(editable, function(key, value) {
			jQuery('#'+value).removeClass('deactive').attr({ 'readonly' : false , 'disabled' : false });
			jQuery('#'+value+'_plus, #'+value+'_minus').attr({ 'disabled' : false });
			alltarget.splice(alltarget.indexOf(value),1);
		});
		// 잠금
		jQuery.each(alltarget, function(key, value) {
			if (value=='mg_penalty' || value=='mg_tax') {
				jQuery('#'+value).addClass('deactive').attr({ 'disabled' : 'disabled' });
			} else {
				jQuery('#'+value).addClass('deactive').attr({ 'readonly' : 'readonly' });
				jQuery('#'+value+'_plus, #'+value+'_minus').attr({ 'disabled' : 'disabled' });
			}
		});
	}
	
	// 버튼 처리
	if (presetID=='user') {
		jQuery('#editpreset').addClass('deactive').attr({'disabled':'disabled'});
	} else {
		jQuery('#editpreset').removeClass('deactive').attr({'disabled':false});
	}
	if (jQuery('#set_'+presetID).attr('moded')==true) {
		jQuery('#revertpreset').removeClass('deactive').attr({'disabled':false});
	} else {
		jQuery('#revertpreset').addClass('deactive').attr({'disabled':'disabled'});
	}
	jQuery('#savepreset').removeClass('active').addClass('deactive').attr({'disabled':'disabled'});
	
	// 프리셋 저장
	app_setpref('preset', presetID);
	// 다음 계산 처리
	jQuery('#set_preset').val(presetID);
	// 메뉴 처리
	jQuery('#mainmenu_open .selected').text(name);
	if (jQuery('#set_'+presetID).attr('moded')==true) {
		jQuery('#mainmenu_open .saved').removeClass('hide').addClass('show');
		jQuery('#mainmenu_open .moded').removeClass('show').addClass('hide');
	} else {
		jQuery('#mainmenu_open .saved').removeClass('show').addClass('hide');
		jQuery('#mainmenu_open .moded').removeClass('show').addClass('hide');
	}
	if (jQuery('#mainmenu .listitem.active').val()!=presetID) {
		jQuery('#mainmenu .listitem.active').removeClass('active');
		jQuery('#set_'+presetID).addClass('active');
	}
	
	// 메인메뉴 닫기
	jQuery('#mainmenu_open').click();
	
	if (presetID=='user') {
		name = $lang['user'];
	}
	msg(name+$lang['preset_changed']);
	
}

// 값 변경시 편집됨으로 변경
function checkMod(object) {
	if (jQuery('#set_preset_moded').val()==true) {
		return false;
	}
	var presetID = jQuery('#set_preset').attr('value');
	
	// 버튼 처리
	if (presetID!='user') {
		jQuery('#editpreset').removeClass('deactive').attr({'disabled':false});
	}
	jQuery('#revertpreset, #savepreset').removeClass('deactive').attr({'disabled':false});
	jQuery('#savepreset').addClass('active');
	
	// 메뉴 처리
	jQuery('#mainmenu_open .saved').removeClass('show').addClass('hide');
	jQuery('#mainmenu_open .moded').removeClass('hide').addClass('show');
	
	// 모드체크 참
	jQuery('#moded_preset').val(true);	
	
	// 다음 계산시 저장
	jQuery('#set_preset_moded').val(true);	
	
}

// 간단계산
function simpleCalc(object) {
	// console.log (object.id);

	if (object.id=='ratio_platform') {
		$ratio_platform = object.value;
		$ratio_author = jQuery('#ratio_author').val();
		$ratio_mg_sales = jQuery('#ratio_mg_sales').val();
		
		$ratio_mg_platform = Math.round($ratio_mg_sales/100*$ratio_platform);
		$ratio_mg_author = $ratio_mg_sales-$ratio_mg_platform;
	} else if (object.id=='ratio_author') {
		$ratio_author = object.value;
		$ratio_platform = jQuery('#ratio_platform').val();
		$ratio_mg_sales = jQuery('#ratio_mg_sales').val();
		
		$ratio_mg_author = Math.round($ratio_mg_sales/100*$ratio_author);
		$ratio_mg_platform = $ratio_mg_sales-$ratio_mg_author;
	} else if (object.id=='ratio_mg_sales') {
		$ratio_mg_sales = object.value;
		$ratio_platform = jQuery('#ratio_platform').val();
		$ratio_author = jQuery('#ratio_author').val();
		
		$ratio_mg_platform = Math.round($ratio_mg_sales/100*$ratio_platform);
		$ratio_mg_author = $ratio_mg_sales-$ratio_mg_platform;
	} else if (object.id=='ratio_mg_platform') {
		$ratio_mg_platform = object.value;
		$ratio_platform = jQuery('#ratio_platform').val();
		$ratio_author = jQuery('#ratio_author').val();
		
		$ratio_mg_sales = Math.round($ratio_mg_platform/$ratio_platform*100);
		$ratio_mg_author = $ratio_mg_sales-$ratio_mg_platform;
	} else if (object.id=='ratio_mg_author') {
		$ratio_mg_author = object.value;
		$ratio_platform = jQuery('#ratio_platform').val();
		$ratio_author = jQuery('#ratio_author').val();
		
		$ratio_mg_sales = Math.round($ratio_mg_author/$ratio_author*100);
		$ratio_mg_platform = $ratio_mg_sales-$ratio_mg_author;
	} else {
		return false;
	}
	// 소수점 이하 반올림 적용
	jQuery('#ratio_mg_sales').val(Math.round($ratio_mg_sales));
	jQuery('#ratio_mg_platform').val(Math.round($ratio_mg_platform));
	jQuery('#ratio_mg_author').val(Math.round($ratio_mg_author));
	
}

// 자동계산
function autoCalc(object) {
	if (object.id=='coin_count') {
		$coin_count = object.value;
		$coin_price = jQuery('#coin_price').val();
		$coin_share = jQuery('#coin_share').val();
		
		$mg_sales = $coin_price*$coin_count;
		$mg_author = $coin_share*$coin_count;
		$mg_platform = $mg_sales-$mg_author;
	} else if (object.id=='mg_sales') {
		$mg_sales = object.value;
		$coin_price = jQuery('#coin_price').val();
		$coin_share = jQuery('#coin_share').val();
		
		$coin_count = $mg_sales/$coin_price;
		$mg_author = $coin_share*$coin_count;
		$mg_platform = $mg_sales-$mg_author;
	} else if (object.id=='mg_platform') {
		$mg_platform = object.value;
		$coin_price = jQuery('#coin_price').val();
		$coin_share = jQuery('#coin_share').val();
		
		$coin_count = $mg_platform/($coin_price-$coin_share);
		$mg_sales = $coin_price*$coin_count;
		$mg_author = $mg_sales-$mg_platform;
	} else if (object.id=='mg_author') {
		$mg_author = object.value;
		$coin_price = jQuery('#coin_price').val();
		$coin_share = jQuery('#coin_share').val();
		
		$coin_count = $mg_author/$coin_share;
		$mg_sales = $coin_price*$coin_count;
		$mg_platform = $mg_sales-$mg_author;
	} else if (object.id=='coin_price' && jQuery('#coin_count').val().length) {
		$coin_price = object.value;
		$coin_share = jQuery('#coin_share').val();
		$coin_count = jQuery('#coin_count').val();
		
		$mg_sales = $coin_price*$coin_count;
		$mg_author = $coin_share*$coin_count;
		$mg_platform = $mg_sales-$mg_author;
	} else if (object.id=='coin_share' && jQuery('#coin_count').val().length) {
		$coin_share = object.value;
		$coin_price = jQuery('#coin_price').val();
		$coin_count = jQuery('#coin_count').val();
		
		$mg_sales = $coin_price*$coin_count;
		$mg_author = $coin_share*$coin_count;
		$mg_platform = $mg_sales-$mg_author;
	} else {
		return false;
	}
	// 소수점 이하 반올림 적용
	jQuery('#coin_count').val(Math.round($coin_count));
	jQuery('#mg_sales').val(Math.round($mg_sales));
	jQuery('#mg_platform').val(Math.round($mg_platform));
	jQuery('#mg_author').val(Math.round($mg_author));
	// 소수점 이하 버리고 적용
	/* jQuery('#coin_count').val(Math.floor($coin_count*100)/100);
	jQuery('#mg_sales').val(Math.floor($mg_sales));
	jQuery('#mg_platform').val(Math.floor($mg_platform));
	jQuery('#mg_author').val(Math.floor($mg_author)); */
}

// 인풋박스 선택
function selectInput(object) {
	var hideTarget = jQuery('#'+jQuery(object).attr('target')).find('.show');
	var showTarget = jQuery('#input_'+object.value);
	
	hideTarget.animate({
		// 'width' : 0,
		'right' : -100+'%'
	},200);
	showTarget.animate({
		// 'width' : 100+'%',
		'left' : 0,
	},200);
	setTimeout(function(){
		// hideTarget.removeAttr('style');
		hideTarget.css({
			'left': '',
			'right': '',
		});
		showTarget.css({
			'left': 'auto',
			'right': 0,
		});
	}, 230);
	hideTarget.removeClass('show');
	showTarget.addClass('show');
	
}

// 필수입력 패스
function skipRequired() {
	jQuery('input[required="required"]').attr('required', false);
}

jQuery(function () {
	
	var repeat_editval;
	var timeout_editval;
	// 플러스 마이너스 인풋 자동입력
	function startAutoEditval(id) {
		repeat_editval = setInterval(function() {
			inputStep(document.getElementById(id));
		}, 75);
	}
	function stopAutoEditval() {
		clearInterval(repeat_editval);
	}
	
	// 플러스 마이너스 인풋 마우스 유지
	jQuery('button.editval').on('mousedown', function() {
		var thisid = jQuery(this).attr('id');
		timeout_editval = setTimeout(function() { 
			startAutoEditval(thisid);
		}, 500);
	}).on('mouseup mouseleave', function() {
		stopAutoEditval();
		clearTimeout(timeout_editval);
	});
		
});
