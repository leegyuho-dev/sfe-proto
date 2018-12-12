/**
 * @author mrdoob / http://mrdoob.com/
 */

// FIXED: 모듈 익스포트 처리
var THREE = {}
export { THREE }

THREE.Stats = function () {

	var beginTime = (performance || Date).now(),
		prevTime = beginTime,
		frames = 0;

	return {

		REVISION: 16,

		fps: 0,
		ftime: 0,
		memVal: 0,
		memMax: 0,

		// dom: container,

		// addPanel: addPanel,
		// showPanel: showPanel,

		begin: function () {

			beginTime = (performance || Date).now();

		},

		end: function () {

			frames++;

			var time = (performance || Date).now();

			// ftime 값 노출
			this.ftime = time - beginTime;
			// msPanel.update(this.ftime, 200);

			if (time > prevTime + 1000) {

				// fps 값 노출
				this.fps = (frames * 1000) / (time - prevTime);
				// fpsPanel.update(this.fps, 100);

				prevTime = time;
				frames = 0;

				// if (memPanel) {

					// memory 값 노출
					var memory = performance.memory;
					this.memVal = memory.usedJSHeapSize / 1048576;
					this.memMax = memory.jsHeapSizeLimit / 1048576;
					// memPanel.update(this.memVal, this.memMax);

				// }

			}

			return time;

		},

		update: function () {

			beginTime = this.end();

		},

		// Backwards Compatibility

		// domElement: container,
		// setMode: showPanel

	};

}