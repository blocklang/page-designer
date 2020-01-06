const { describe, it, beforeEach } = intern.getInterface("bdd");
const { assert } = intern.getPlugin("chai");

import {
	insertDataProcess,
	activeDataProcess,
	changeActiveDataPropertyProcess,
	foldDataProcess,
	removeActiveDataProcess,
	moveUpActiveDataProcess,
	moveDownActiveDataProcess
} from "../../../src/processes/dataProcesses";
import Store from "@dojo/framework/stores/Store";
import { State } from "designer-core/interfaces";
import { add } from "@dojo/framework/stores/state/operations";

describe("dataProcesses", () => {
	let store: Store<State>;

	beforeEach(() => {
		store = new Store<State>();
	});

	it("insertDataProcess: insert one variable below root node", () => {
		store.apply([
			add(store.path("pageModel", "data"), [
				{
					id: "1",
					parentId: "-1",
					name: "root",
					type: "Object",
					open: false
				}
			]),
			add(store.path("selectedBehaviorIndex"), 0)
		]);

		insertDataProcess(store)({});

		const data = store.get(store.path("pageModel", "data"));
		assert.equal(data.length, 2);

		const newData = data[1];
		assert.isNotNull(newData.id);
		assert.equal(newData.parentId, "1"), assert.isEmpty(newData.name);
		assert.isEmpty(newData.value);
		assert.equal(newData.type, "String");
		assert.isFalse(newData.open);
	});

	it("insertDataProcess: insert one variable before first child", () => {
		store.apply([
			add(store.path("pageModel", "data"), [
				{
					id: "1",
					parentId: "-1",
					name: "root",
					type: "Object",
					open: false
				},
				{
					id: "2",
					parentId: "1",
					name: "a",
					type: "String",
					value: "v",
					open: false
				}
			]),
			add(store.path("selectedBehaviorIndex"), 0)
		]);

		insertDataProcess(store)({});

		const data = store.get(store.path("pageModel", "data"));
		assert.equal(data.length, 3);

		// 放在第一个子节点前，所以索引为 1
		const newData = data[1];

		assert.isNotNull(newData.id);
		assert.equal(newData.parentId, "1"), assert.isEmpty(newData.name);
		assert.isEmpty(newData.value);
		assert.equal(newData.type, "String");
		assert.isFalse(newData.open);
	});

	it("insertDataProcess: insert one variable below a child", () => {
		store.apply([
			add(store.path("pageModel", "data"), [
				{
					id: "1",
					parentId: "-1",
					name: "root",
					type: "Object",
					open: false
				},
				{
					id: "2",
					parentId: "1",
					name: "child",
					type: "Object",
					open: false
				}
			]),
			add(store.path("selectedBehaviorIndex"), 1)
		]);

		insertDataProcess(store)({});

		const data = store.get(store.path("pageModel", "data"));
		assert.equal(data.length, 3);

		const newData = data[2];

		assert.isNotNull(newData.id);
		assert.equal(newData.parentId, "2"), assert.isEmpty(newData.name);
		assert.isEmpty(newData.value);
		assert.equal(newData.type, "String");
		assert.isFalse(newData.open);
	});

	it("activeDataProcess", () => {
		store.apply([
			add(store.path("pageModel", "data"), [
				{
					id: "1",
					parentId: "-1",
					name: "root",
					type: "Object",
					open: false
				},
				{
					id: "2",
					parentId: "1",
					name: "child",
					type: "Object",
					open: false
				}
			])
		]);

		activeDataProcess(store)({ id: "not exist id" });
		assert.equal(store.get(store.path("selectedBehaviorIndex")), -1);

		activeDataProcess(store)({ id: "1" });
		assert.equal(store.get(store.path("selectedBehaviorIndex")), 0);

		activeDataProcess(store)({ id: "2" });
		assert.equal(store.get(store.path("selectedBehaviorIndex")), 1);
	});

	it("changeActiveDataPropertyProcess", () => {
		store.apply([
			add(store.path("pageModel", "data"), [
				{
					id: "1",
					parentId: "-1",
					name: "root",
					type: "Object",
					open: false
				},
				{
					id: "2",
					parentId: "1",
					name: "child",
					type: "String",
					value: "",
					open: false
				}
			]),
			add(store.path("selectedBehaviorIndex"), 1)
		]);

		changeActiveDataPropertyProcess(store)({ name: "name", value: "name1" });

		const data = store.get(store.path("pageModel", "data"));

		const updatedData = data[1];

		assert.equal(updatedData.id, "2");
		assert.equal(updatedData.parentId, "1"), assert.equal(updatedData.name, "name1");
		assert.isEmpty(updatedData.value);
		assert.equal(updatedData.type, "String");
		assert.isFalse(updatedData.open);
	});

	it("foldDataProcess", () => {
		store.apply([
			add(store.path("pageModel", "data"), [
				{
					id: "1",
					parentId: "-1",
					name: "root",
					type: "Object",
					open: true
				},
				{
					id: "2",
					parentId: "1",
					name: "child",
					type: "String",
					value: "",
					open: false
				}
			]),
			add(store.path("selectedBehaviorIndex"), 1)
		]);

		foldDataProcess(store)({ id: "1" });

		const data1 = store.get(store.path("pageModel", "data"));
		const updatedData1 = data1[0];
		assert.isFalse(updatedData1.open);

		foldDataProcess(store)({ id: "1" });

		const data2 = store.get(store.path("pageModel", "data"));
		const updatedData2 = data2[0];
		assert.isTrue(updatedData2.open);
	});

	it("removeActiveDataProcess：can not remove root node", () => {
		store.apply([
			add(store.path("pageModel", "data"), [
				{
					id: "1",
					parentId: "-1",
					name: "root",
					type: "Object",
					open: true
				}
			]),
			add(store.path("selectedBehaviorIndex"), 0)
		]);
		// 不能删除根节点
		removeActiveDataProcess(store)({});

		const data = store.get(store.path("pageModel", "data"));
		assert.equal(data.length, 1);

		const selectedBehaviorIndex = store.get(store.path("selectedBehaviorIndex"));
		assert.equal(selectedBehaviorIndex, 0);
	});

	it("removeActiveDataProcess：remove single node then active parent node", () => {
		store.apply([
			add(store.path("pageModel", "data"), [
				{
					id: "1",
					parentId: "-1",
					name: "root",
					type: "Object",
					open: true
				},
				{
					id: "2",
					parentId: "1",
					name: "child",
					type: "String",
					value: "",
					open: false
				}
			]),
			add(store.path("selectedBehaviorIndex"), 1)
		]);

		removeActiveDataProcess(store)({});

		const data = store.get(store.path("pageModel", "data"));
		assert.equal(data.length, 1);

		const selectedBehaviorIndex = store.get(store.path("selectedBehaviorIndex"));
		assert.equal(selectedBehaviorIndex, 0);
	});

	it("removeActiveDataProcess：remove single node then active previous sibling node", () => {
		store.apply([
			add(store.path("pageModel", "data"), [
				{
					id: "1",
					parentId: "-1",
					name: "root",
					type: "Object",
					open: true
				},
				{
					id: "2",
					parentId: "1",
					name: "child1",
					type: "String",
					value: "",
					open: false
				},
				{
					id: "3",
					parentId: "1",
					name: "child2",
					type: "String",
					value: "",
					open: false
				}
			]),
			add(store.path("selectedBehaviorIndex"), 2)
		]);

		removeActiveDataProcess(store)({});

		const data = store.get(store.path("pageModel", "data"));
		assert.equal(data.length, 2);

		const selectedBehaviorIndex = store.get(store.path("selectedBehaviorIndex"));
		assert.equal(selectedBehaviorIndex, 1);
	});

	it("removeActiveDataProcess：remove single node then active next sibling node", () => {
		store.apply([
			add(store.path("pageModel", "data"), [
				{
					id: "1",
					parentId: "-1",
					name: "root",
					type: "Object",
					open: true
				},
				{
					id: "2",
					parentId: "1",
					name: "child1",
					type: "String",
					value: "",
					open: false
				},
				{
					id: "3",
					parentId: "1",
					name: "child2",
					type: "String",
					value: "",
					open: false
				}
			]),
			add(store.path("selectedBehaviorIndex"), 1)
		]);

		removeActiveDataProcess(store)({});

		const data = store.get(store.path("pageModel", "data"));
		assert.equal(data.length, 2);

		const selectedBehaviorIndex = store.get(store.path("selectedBehaviorIndex"));
		assert.equal(selectedBehaviorIndex, 1);

		assert.equal(data[1].id, "3");
	});

	it("removeActiveDataProcess：remove node and its children", () => {
		store.apply([
			add(store.path("pageModel", "data"), [
				{
					id: "1",
					parentId: "-1",
					name: "root",
					type: "Object",
					open: true
				},
				{
					id: "2",
					parentId: "1",
					name: "child",
					type: "String",
					value: "",
					open: false
				},
				{
					id: "3",
					parentId: "2",
					name: "child",
					type: "String",
					value: "",
					open: false
				}
			]),
			add(store.path("selectedBehaviorIndex"), 1)
		]);

		removeActiveDataProcess(store)({});

		const data = store.get(store.path("pageModel", "data"));
		assert.equal(data.length, 1);

		const selectedBehaviorIndex = store.get(store.path("selectedBehaviorIndex"));
		assert.equal(selectedBehaviorIndex, 0);
	});

	it("moveUpActiveDataProcess: has no previous data", () => {
		store.apply([
			add(store.path("pageModel", "data"), [
				{
					id: "1",
					parentId: "-1",
					name: "root",
					type: "Object",
					open: true
				},
				{
					id: "2",
					parentId: "1",
					name: "child",
					type: "String",
					value: "",
					open: false
				}
			]),
			add(store.path("selectedBehaviorIndex"), 1)
		]);

		moveUpActiveDataProcess(store)({});
		// 没有前一个兄弟节点，所以没有移动
		assert.equal(store.get(store.path("selectedBehaviorIndex")), 1);
		assert.isUndefined(store.get(store.path("dirty")));
	});

	it("moveUpActiveDataProcess: root->node1_node2, move node2 previous, then become root->node2_node1", () => {
		store.apply([
			add(store.path("pageModel", "data"), [
				{
					id: "1",
					parentId: "-1",
					name: "root",
					type: "Object",
					open: true
				},
				{
					id: "2",
					parentId: "1",
					name: "child1",
					type: "String",
					value: "",
					open: false
				},
				{
					id: "3",
					parentId: "1",
					name: "child2",
					type: "String",
					value: "",
					open: false
				}
			]),
			add(store.path("selectedBehaviorIndex"), 2)
		]);

		moveUpActiveDataProcess(store)({});

		assert.equal(store.get(store.path("selectedBehaviorIndex")), 1);
		// 判断位置已互换
		const pageData = store.get(store.path("pageModel", "data"));

		assert.equal(pageData[1].id, "3");
		assert.equal(pageData[2].id, "2");

		assert.equal(store.get(store.path("dirty")), true);
	});

	it("moveUpActiveDataProcess: root->node1->node11 root->node2->node21, move node2 previous, then become root->node2->node21 root->node1->node11", () => {
		store.apply([
			add(store.path("pageModel", "data"), [
				{
					id: "1",
					parentId: "-1",
					name: "root",
					type: "Object",
					open: true
				},
				{
					id: "2",
					parentId: "1",
					name: "child1",
					type: "String",
					value: "",
					open: false
				},
				{
					id: "3",
					parentId: "2",
					name: "child11",
					type: "String",
					value: "",
					open: false
				},
				{
					id: "4",
					parentId: "1",
					name: "child2",
					type: "String",
					value: "",
					open: false
				},
				{
					id: "5",
					parentId: "4",
					name: "child21",
					type: "String",
					value: "",
					open: false
				}
			]),
			add(store.path("selectedBehaviorIndex"), 3)
		]);

		moveUpActiveDataProcess(store)({});

		assert.equal(store.get(store.path("selectedBehaviorIndex")), 1);
		// 判断位置已互换
		const pageData = store.get(store.path("pageModel", "data"));

		assert.equal(pageData[1].id, "4");
		assert.equal(pageData[2].id, "5");
		assert.equal(pageData[3].id, "2");
		assert.equal(pageData[4].id, "3");

		assert.equal(store.get(store.path("dirty")), true);
	});

	it("moveDownActiveDataProcess: has no next data", () => {
		store.apply([
			add(store.path("pageModel", "data"), [
				{
					id: "1",
					parentId: "-1",
					name: "root",
					type: "Object",
					open: true
				},
				{
					id: "2",
					parentId: "1",
					name: "child1",
					type: "String",
					value: "",
					open: false
				},
				{
					id: "3",
					parentId: "2",
					name: "child11",
					type: "String",
					value: "",
					open: false
				}
			]),
			add(store.path("selectedBehaviorIndex"), 1)
		]);

		moveDownActiveDataProcess(store)({});
		// 没有后一个兄弟节点，所以没有移动
		assert.equal(store.get(store.path("selectedBehaviorIndex")), 1);
		assert.isUndefined(store.get(store.path("dirty")));
	});

	it("moveDownActiveDataProcess: root->node1_node2, move node1 next, then become root->node2_node1", () => {
		store.apply([
			add(store.path("pageModel", "data"), [
				{
					id: "1",
					parentId: "-1",
					name: "root",
					type: "Object",
					open: true
				},
				{
					id: "2",
					parentId: "1",
					name: "child1",
					type: "String",
					value: "",
					open: false
				},
				{
					id: "3",
					parentId: "1",
					name: "child2",
					type: "String",
					value: "",
					open: false
				}
			]),
			add(store.path("selectedBehaviorIndex"), 1)
		]);

		moveDownActiveDataProcess(store)({});

		assert.equal(store.get(store.path("selectedBehaviorIndex")), 2);
		// 判断位置已互换
		const pageData = store.get(store.path("pageModel", "data"));

		assert.equal(pageData[1].id, "3");
		assert.equal(pageData[2].id, "2");

		assert.equal(store.get(store.path("dirty")), true);
	});

	it("moveDownActiveDataProcess: root->node1->node11 root->node2->node21, move node1 next, then become root->node2->node21 root->node1->node11", () => {
		store.apply([
			add(store.path("pageModel", "data"), [
				{
					id: "1",
					parentId: "-1",
					name: "root",
					type: "Object",
					open: true
				},
				{
					id: "2",
					parentId: "1",
					name: "child1",
					type: "String",
					value: "",
					open: false
				},
				{
					id: "3",
					parentId: "2",
					name: "child11",
					type: "String",
					value: "",
					open: false
				},
				{
					id: "4",
					parentId: "1",
					name: "child2",
					type: "String",
					value: "",
					open: false
				},
				{
					id: "5",
					parentId: "4",
					name: "child21",
					type: "String",
					value: "",
					open: false
				}
			]),
			add(store.path("selectedBehaviorIndex"), 1)
		]);

		moveDownActiveDataProcess(store)({});

		assert.equal(store.get(store.path("selectedBehaviorIndex")), 3);
		// 判断位置已互换
		const pageData = store.get(store.path("pageModel", "data"));

		assert.equal(pageData[1].id, "4");
		assert.equal(pageData[2].id, "5");
		assert.equal(pageData[3].id, "2");
		assert.equal(pageData[4].id, "3");

		assert.equal(store.get(store.path("dirty")), true);
	});
});
