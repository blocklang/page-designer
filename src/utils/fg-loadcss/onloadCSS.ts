// 因为之前没有将 onloadCSS 导出，所以这里做了一点改造，直接改为 ts 文件

/*! onloadCSS. (onload callback for loadCSS) [c]2017 Filament Group, Inc. MIT License */
/* global navigator */
/* exported onloadCSS */
export default function onloadCSS(ss: any, callback: () => void): void {
	let called: boolean;
	function newcb(): void {
		if (!called && callback) {
			called = true;
			callback.call(ss);
		}
	}
	if (ss.addEventListener) {
		ss.addEventListener("load", newcb);
	}
	if (ss.attachEvent) {
		ss.attachEvent("onload", newcb);
	}

	// This code is for browsers that don’t support onload
	// No support for onload (it'll bind but never fire):
	//	* Android 4.3 (Samsung Galaxy S4, Browserstack)
	//	* Android 4.2 Browser (Samsung Galaxy SIII Mini GT-I8200L)
	//	* Android 2.3 (Pantech Burst P9070)

	// Weak inference targets Android < 4.4
	if ("isApplicationInstalled" in navigator && "onloadcssdefined" in ss) {
		ss.onloadcssdefined(newcb);
	}
}
