import { getConnectorOffset, getConnectorPath } from "../../../../../../src/widgets/edit/behavior/func/util";

const { describe, it } = intern.getInterface("bdd");
const { assert } = intern.getPlugin("chai");

describe("widgets/edit/behavior/func/util", () => {
	it("getConnectorOffset: start.x == end.x and start.y == end.y", () => {
		assert.deepEqual(getConnectorOffset({ x: 0, y: 0 }, { x: 0, y: 0 }), { width: 0, height: 0, left: 0, top: 0 });
		assert.deepEqual(getConnectorOffset({ x: 1, y: 1 }, { x: 1, y: 1 }), { width: 0, height: 0, left: 1, top: 1 });
	});

	it("getConnectorOffset: start.x < end.x", () => {
		assert.deepEqual(getConnectorOffset({ x: 0, y: 0 }, { x: 1, y: 0 }), { width: 1, height: 0, left: 0, top: 0 });
		assert.deepEqual(getConnectorOffset({ x: 1, y: 2 }, { x: 2, y: 3 }), { width: 1, height: 1, left: 1, top: 2 });
	});

	it("getConnectorOffset: start.x > end.x", () => {
		assert.deepEqual(getConnectorOffset({ x: 1, y: 0 }, { x: 0, y: 0 }), { width: 1, height: 0, left: 0, top: 0 });
		assert.deepEqual(getConnectorOffset({ x: 3, y: 1 }, { x: 2, y: 1 }), { width: 1, height: 0, left: 2, top: 1 });
	});

	it("getConnectorOffset: start.y < end.y", () => {
		assert.deepEqual(getConnectorOffset({ x: 0, y: 0 }, { x: 0, y: 1 }), { width: 0, height: 1, left: 0, top: 0 });
		assert.deepEqual(getConnectorOffset({ x: 1, y: 1 }, { x: 1, y: 2 }), { width: 0, height: 1, left: 1, top: 1 });
		assert.deepEqual(getConnectorOffset({ x: 1, y: 2 }, { x: 1, y: 3 }), { width: 0, height: 1, left: 1, top: 2 });
	});

	it("getConnectorOffset: start.y > end.y", () => {
		assert.deepEqual(getConnectorOffset({ x: 0, y: 1 }, { x: 0, y: 0 }), { width: 0, height: 1, left: 0, top: 0 });
	});

	it("getConnectorOffset:  start.y > end.y", () => {
		assert.deepEqual(getConnectorOffset({ x: 0, y: 1 }, { x: 0, y: 0 }), { width: 0, height: 1, left: 0, top: 0 });
	});

	// svg 的高度和宽度不能为 0，这样就无法显示其中的 path

	it("getConnectorPath: start.x == end.x and start.y == end.y", () => {
		assert.deepEqual(getConnectorPath({ x: 0, y: 0 }, { x: 0, y: 0 }), {
			start: { x: 0, y: 0 },
			end: { x: 0, y: 0 }
		});
		assert.deepEqual(getConnectorPath({ x: 1, y: 1 }, { x: 1, y: 1 }), {
			start: { x: 0, y: 0 },
			end: { x: 0, y: 0 }
		});
	});

	it("getConnectorPath: start.x < end.x", () => {
		assert.deepEqual(getConnectorPath({ x: 0, y: 0 }, { x: 1, y: 0 }), {
			start: { x: 0, y: 0 },
			end: { x: 1, y: 0 }
		});
		assert.deepEqual(getConnectorPath({ x: 1, y: 1 }, { x: 2, y: 1 }), {
			start: { x: 0, y: 0 },
			end: { x: 1, y: 0 }
		});
	});

	it("getConnectorPath: start.x > end.x", () => {
		assert.deepEqual(getConnectorPath({ x: 1, y: 0 }, { x: 0, y: 0 }), {
			start: { x: 1, y: 0 },
			end: { x: 0, y: 0 }
		});
		assert.deepEqual(getConnectorPath({ x: 2, y: 1 }, { x: 1, y: 1 }), {
			start: { x: 1, y: 0 },
			end: { x: 0, y: 0 }
		});
	});

	it("getConnectorPath: start.y < end.y", () => {
		assert.deepEqual(getConnectorPath({ x: 0, y: 0 }, { x: 0, y: 1 }), {
			start: { x: 0, y: 0 },
			end: { x: 0, y: 1 }
		});
		assert.deepEqual(getConnectorPath({ x: 1, y: 1 }, { x: 1, y: 2 }), {
			start: { x: 0, y: 0 },
			end: { x: 0, y: 1 }
		});
	});

	it("getConnectorPath: start.y > end.y", () => {
		assert.deepEqual(getConnectorPath({ x: 0, y: 1 }, { x: 0, y: 0 }), {
			start: { x: 0, y: 1 },
			end: { x: 0, y: 0 }
		});
		assert.deepEqual(getConnectorPath({ x: 1, y: 2 }, { x: 1, y: 1 }), {
			start: { x: 0, y: 1 },
			end: { x: 0, y: 0 }
		});
	});
});
