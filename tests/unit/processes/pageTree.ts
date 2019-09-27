const { describe, it } = intern.getInterface("bdd");
const { assert } = intern.getPlugin("chai");
import { getAllChildCount } from "../../../src/processes/pageTree";

describe("processes/pageTree", () => {
	it("getAllChildCount", () => {
		assert.equal(getAllChildCount([], -1), 0); // 空数组
		assert.throw(() => getAllChildCount([{ id: "1", parentId: "-1" }], 1)); // 超出索引
		assert.equal(getAllChildCount([{ id: "1", parentId: "-1" }], 0), 0);
		assert.equal(getAllChildCount([{ id: "1", parentId: "-1" }, { id: "2", parentId: "1" }], 0), 1);
		assert.equal(
			getAllChildCount([{ id: "1", parentId: "-1" }, { id: "2", parentId: "1" }, { id: "3", parentId: "2" }], 0),
			2
		);
		assert.equal(
			getAllChildCount(
				[
					{ id: "1", parentId: "-1" },
					{ id: "2", parentId: "1" },
					{ id: "3", parentId: "2" },
					{ id: "4", parentId: "2" },
					{ id: "5", parentId: "1" }
				],
				1
			),
			2
		);
	});
});
