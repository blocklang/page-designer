const { describe, it } = intern.getInterface("bdd");
const { assert } = intern.getPlugin("chai");
import { getAllChildCount, getPreviousIndex, getNextIndex, getParentIndex } from "../../../src/utils/pageTree";
import { getChildrenIndex } from "../../../src/utils/pageTree";

describe("utils/pageTree", () => {
	it("getAllChildCount", () => {
		assert.throw(() => getAllChildCount([{ id: "1", parentId: "-1" }], 1)); // 超出索引
		assert.throw(() => getAllChildCount([{ id: "1", parentId: "-1" }], -1)); // 超出索引
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

	it("getChildrenIndex", () => {
		assert.deepEqual(getChildrenIndex([{ id: "1", parentId: "-1" }], "1", 1), []);
		assert.deepEqual(getChildrenIndex([{ id: "1", parentId: "-1" }, { id: "2", parentId: "1" }], "1", 1), [1]);
		assert.deepEqual(
			getChildrenIndex(
				[{ id: "1", parentId: "-1" }, { id: "2", parentId: "1" }, { id: "3", parentId: "2" }],
				"1",
				1
			),
			[1]
		);
		assert.deepEqual(
			getChildrenIndex(
				[
					{ id: "1", parentId: "-1" },
					{ id: "2", parentId: "1" },
					{ id: "3", parentId: "2" },
					{ id: "4", parentId: "2" },
					{ id: "5", parentId: "1" }
				],
				"2",
				2
			),
			[2, 3]
		);
	});

	it("getPreviousIndex - out of index", () => {
		assert.throw(() => getPreviousIndex([{ id: "1", parentId: "-1" }], 1));
		assert.throw(() => getPreviousIndex([{ id: "1", parentId: "-1" }], -1));
	});

	it("getPreviousIndex - no previous node", () => {
		assert.equal(getPreviousIndex([{ id: "1", parentId: "-1" }], 0), -1);
	});

	it("getPreviousIndex - root->node1_node2, node2 one previous node", () => {
		assert.equal(
			getPreviousIndex([{ id: "1", parentId: "-1" }, { id: "2", parentId: "1" }, { id: "3", parentId: "1" }], 2),
			1
		);
	});

	it("getPreviousIndex - root->node1->node11, root->node2, node2 previous node is node1", () => {
		assert.equal(
			getPreviousIndex(
				[
					{ id: "1", parentId: "-1" },
					{ id: "2", parentId: "1" },
					{ id: "21", parentId: "2" },
					{ id: "3", parentId: "1" }
				],
				3
			),
			1
		);
	});

	it("getNextIndex - out of index", () => {
		assert.throw(() => getNextIndex([{ id: "1", parentId: "-1" }], 1));
		assert.throw(() => getNextIndex([{ id: "1", parentId: "-1" }], -1));
	});

	it("getNextIndex - no next node", () => {
		assert.equal(getNextIndex([{ id: "1", parentId: "-1" }], 0), -1);
	});

	it("getNextIndex - root->node1_node2, node1's next node is node2", () => {
		assert.equal(
			getNextIndex([{ id: "1", parentId: "-1" }, { id: "2", parentId: "1" }, { id: "3", parentId: "1" }], 1),
			2
		);
	});

	it("getNextIndex - root->node1->node11, root->node2, node1's next node is node2", () => {
		assert.equal(
			getNextIndex(
				[
					{ id: "1", parentId: "-1" },
					{ id: "2", parentId: "1" },
					{ id: "21", parentId: "2" },
					{ id: "3", parentId: "1" }
				],
				1
			),
			3
		);
	});

	it("getParentIndex - out of index", () => {
		assert.throw(() => getParentIndex([{ id: "1", parentId: "-1" }], 1));
		assert.throw(() => getParentIndex([{ id: "1", parentId: "-1" }], -1));
	});

	it("getParentIndex - no parent", () => {
		assert.equal(getParentIndex([{ id: "1", parentId: "-1" }], 0), -1);
	});

	it("getParentIndex - has parent", () => {
		assert.equal(getParentIndex([{ id: "1", parentId: "-1" }, { id: "2", parentId: "1" }], 1), 0);
	});
});
