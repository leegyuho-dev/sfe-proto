// https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/webfont-optimization?hl=ko
// https://googlechrome.github.io/samples/font-face-set/

if (Fontset == undefined) {
	const Fontset = {}
}
Fontset.injectCSS = function (targetElement, src) {
	var cssTag = document.createElement('link');
	cssTag.type = 'text/css';
	cssTag.rel = 'stylesheet';
	cssTag.href = src;
	document.querySelector('head').insertBefore(cssTag, targetElement.nextSibling);
}

document.fonts.ready.then(function() {
	// console.log('FONT:', document.fonts);
	for (var fontFace of document.fonts.values()) {
		// console.log('FONT:', fontFace);
		fontFace.load();
	}
});

document.fonts.onloadingerror = (function() {
	// console.log('FONT:', 'LOAD ERROR');
});

document.fonts.onloadingdone = (function() {
	console.log('FONT:', 'LOADED DONE');
	if (Fontset.css && Fontset.css !== undefined) {
		Fontset.injectCSS(fontLoader, Fontset.css);
	}
	for (var fontFace of document.fonts.values()) {
		// console.log('FONT:', fontFace);
		if (fontFace.css != undefined) {
			Fontset.injectCSS(fontLoader, fontFace.css);
		}
	}
});