const { describe, it, beforeEach } = intern.getInterface("bdd");
const { assert } = intern.getPlugin("chai");

import {
	insertDataItemProcess,
	activeDataItemProcess,
	changeActiveDataItemPropertyProcess,
	foldDataGroupProcess,
	removeActiveDataItemProcess,
	moveUpActiveDataItemProcess,
	moveDownActiveDataItemProcess,
} from "../../../src/processes/pageDataProcesses";
import Store from "@dojo/framework/stores/Store";
import { State } from "designer-core/interfaces";
import { add } from "@dojo/framework/stores/state/operations";

describe("processes/pageDataProcesses", () => {
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
					open: false,
				},
			]),
			add(store.path("selectedDataItemIndex"), 0),
		]);

		insertDataItemProcess(store)({});

		const data = store.get(store.path("pageModel", "data"));
		assert.equal(data.length, 2);

		const newData = data[1];
		assert.isNotNull(newData.id);
		assert.equal(newData.parentId, "1"), assert.isEmpty(newData.name);
		assert.isEmpty(newData.defaultValue);
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
					open: false,
				},
				{
					id: "2",
					parentId: "1",
					name: "a",
					type: "String",
					defaultValue: "v",
					open: false,
				},
			]),
			add(store.path("selectedDataItemIndex"), 0),
		]);

		insertDataItemProcess(store)({});

		const data = store.get(store.path("pageModel", "data"));
		assert.equal(data.length, 3);

		// 放在第一个子节点前，所以索引为 1
		const newData = data[1];

		assert.isNotNull(newData.id);
		assert.equal(newData.parentId, "1"), assert.isEmpty(newData.name);
		assert.isEmpty(newData.defaultValue);
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
					open: false,
				},
				{
					id: "2",
					parentId: "1",
					name: "child",
					type: "Object",
					open: false,
				},
			]),
			add(store.path("selectedDataItemIndex"), 1),
		]);

		insertDataItemProcess(store)({});

		const data = store.get(store.path("pageModel", "data"));
		assert.equal(data.length, 3);

		const newData = data[2];

		assert.isNotNull(newData.id);
		assert.equal(newData.parentId, "2"), assert.isEmpty(newData.name);
		assert.isEmpty(newData.defaultValue);
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
					open: false,
				},
				{
					id: "2",
					parentId: "1",
					name: "child",
					type: "Object",
					open: false,
				},
			]),
		]);

		activeDataItemProcess(store)({ id: "not exist id" });
		assert.equal(store.get(store.path("selectedDataItemIndex")), -1);

		activeDataItemProcess(store)({ id: "1" });
		assert.equal(store.get(store.path("selectedDataItemIndex")), 0);

		activeDataItemProcess(store)({ id: "2" });
		assert.equal(store.get(store.path("selectedDataItemIndex")), 1);
	});

	it("changeActiveDataPropertyProcess", () => {
		store.apply([
			add(store.path("pageModel", "data"), [
				{
					id: "1",
					parentId: "-1",
					name: "root",
					type: "Object",
					open: false,
				},
				{
					id: "2",
					parentId: "1",
					name: "child",
					type: "String",
					defaultValue: "",
					open: false,
				},
			]),
			add(store.path("selectedDataItemIndex"), 1),
		]);

		changeActiveDataItemPropertyProcess(store)({ name: "name", value: "name1" });

		const data = store.get(store.path("pageModel", "data"));

		const updatedData = data[1];

		assert.equal(updatedData.id, "2");
		assert.equal(updatedData.parentId, "1");
		assert.equal(updatedData.name, "name1");
		assert.isEmpty(updatedData.defaultValue);
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
					open: true,
				},
				{
					id: "2",
					parentId: "1",
					name: "child",
					type: "String",
					defaultValue: "",
					open: false,
				},
			]),
			add(store.path("selectedDataItemIndex"), 1),
		]);

		foldDataGroupProcess(store)({ id: "1" });

		const data1 = store.get(store.path("pageModel", "data"));
		const updatedData1 = data1[0];
		assert.isFalse(updatedData1.open);

		foldDataGroupProcess(store)({ id: "1" });

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
					open: true,
				},
			]),
			add(store.path("selectedDataItemIndex"), 0),
		]);
		// 不能删除根节点
		removeActiveDataItemProcess(store)({});

		const data = store.get(store.path("pageModel", "data"));
		assert.equal(data.length, 1);

		const selectedDataItemIndex = store.get(store.path("selectedDataItemIndex"));
		assert.equal(selectedDataItemIndex, 0);
	});

	it("removeActiveDataProcess：remove single node then active parent node", () => {
		store.apply([
			add(store.path("pageModel", "data"), [
				{
					id: "1",
					parentId: "-1",
					name: "root",
					type: "Object",
					open: true,
				},
				{
					id: "2",
					parentId: "1",
					name: "child",
					type: "String",
					defaultValue: "",
					open: false,
				},
			]),
			add(store.path("selectedDataItemIndex"), 1),
		]);

		removeActiveDataItemProcess(store)({});

		const data = store.get(store.path("pageModel", "data"));
		assert.equal(data.length, 1);

		const selectedDataItemIndex = store.get(store.path("selectedDataItemIndex"));
		assert.equal(selectedDataItemIndex, 0);
	});

	it("removeActiveDataProcess：remove single node then active previous sibling node", () => {
		store.apply([
			add(store.path("pageModel", "data"), [
				{
					id: "1",
					parentId: "-1",
					name: "root",
					type: "Object",
					open: true,
				},
				{
					id: "2",
					parentId: "1",
					name: "child1",
					type: "String",
					defaultValue: "",
					open: false,
				},
				{
					id: "3",
					parentId: "1",
					name: "child2",
					type: "String",
					defaultValue: "",
					open: false,
				},
			]),
			add(store.path("selectedDataItemIndex"), 2),
		]);

		removeActiveDataItemProcess(store)({});

		const data = store.get(store.path("pageModel", "data"));
		assert.equal(data.length, 2);

		const selectedDataItemIndex = store.get(store.path("selectedDataItemIndex"));
		assert.equal(selectedDataItemIndex, 1);
	});

	it("removeActiveDataProcess：remove single node then active next sibling node", () => {
		store.apply([
			add(store.path("pageModel", "data"), [
				{
					id: "1",
					parentId: "-1",
					name: "root",
					type: "Object",
					open: true,
				},
				{
					id: "2",
					parentId: "1",
					name: "child1",
					type: "String",
					defaultValue: "",
					open: false,
				},
				{
					id: "3",
					parentId: "1",
					name: "child2",
					type: "String",
					defaultValue: "",
					open: false,
				},
			]),
			add(store.path("selectedDataItemIndex"), 1),
		]);

		removeActiveDataItemProcess(store)({});

		const data = store.get(store.path("pageModel", "data"));
		assert.equal(data.length, 2);

		const selectedDataItemIndex = store.get(store.path("selectedDataItemIndex"));
		assert.equal(selectedDataItemIndex, 1);

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
					open: true,
				},
				{
					id: "2",
					parentId: "1",
					name: "child",
					type: "String",
					defaultValue: "",
					open: false,
				},
				{
					id: "3",
					parentId: "2",
					name: "child",
					type: "String",
					defaultValue: "",
					open: false,
				},
			]),
			add(store.path("selectedDataItemIndex"), 1),
		]);

		removeActiveDataItemProcess(store)({});

		const data = store.get(store.path("pageModel", "data"));
		assert.equal(data.length, 1);

		const selectedDataItemIndex = store.get(store.path("selectedDataItemIndex"));
		assert.equal(selectedDataItemIndex, 0);
	});

	it("moveUpActiveDataProcess: has no previous data", () => {
		store.apply([
			add(store.path("pageModel", "data"), [
				{
					id: "1",
					parentId: "-1",
					name: "root",
					type: "Object",
					open: true,
				},
				{
					id: "2",
					parentId: "1",
					name: "child",
					type: "String",
					defaultValue: "",
					open: false,
				},
			]),
			add(store.path("selectedDataItemIndex"), 1),
		]);

		moveUpActiveDataItemProcess(store)({});
		// 没有前一个兄弟节点，所以没有移动
		assert.equal(store.get(store.path("selectedDataItemIndex")), 1);
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
					open: true,
				},
				{
					id: "2",
					parentId: "1",
					name: "child1",
					type: "String",
					defaultValue: "",
					open: false,
				},
				{
					id: "3",
					parentId: "1",
					name: "child2",
					type: "String",
					defaultValue: "",
					open: false,
				},
			]),
			add(store.path("selectedDataItemIndex"), 2),
		]);

		moveUpActiveDataItemProcess(store)({});

		assert.equal(store.get(store.path("selectedDataItemIndex")), 1);
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
					open: true,
				},
				{
					id: "2",
					parentId: "1",
					name: "child1",
					type: "String",
					defaultValue: "",
					open: false,
				},
				{
					id: "3",
					parentId: "2",
					name: "child11",
					type: "String",
					defaultValue: "",
					open: false,
				},
				{
					id: "4",
					parentId: "1",
					name: "child2",
					type: "String",
					defaultValue: "",
					open: false,
				},
				{
					id: "5",
					parentId: "4",
					name: "child21",
					type: "String",
					defaultValue: "",
					open: false,
				},
			]),
			add(store.path("selectedDataItemIndex"), 3),
		]);

		moveUpActiveDataItemProcess(store)({});

		assert.equal(store.get(store.path("selectedDataItemIndex")), 1);
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
					open: true,
				},
				{
					id: "2",
					parentId: "1",
					name: "child1",
					type: "String",
					defaultValue: "",
					open: false,
				},
				{
					id: "3",
					parentId: "2",
					name: "child11",
					type: "String",
					defaultValue: "",
					open: false,
				},
			]),
			add(store.path("selectedDataItemIndex"), 1),
		]);

		moveDownActiveDataItemProcess(store)({});
		// 没有后一个兄弟节点，所以没有移动
		assert.equal(store.get(store.path("selectedDataItemIndex")), 1);
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
					open: true,
				},
				{
					id: "2",
					parentId: "1",
					name: "child1",
					type: "String",
					defaultValue: "",
					open: false,
				},
				{
					id: "3",
					parentId: "1",
					name: "child2",
					type: "String",
					defaultValue: "",
					open: false,
				},
			]),
			add(store.path("selectedDataItemIndex"), 1),
		]);

		moveDownActiveDataItemProcess(store)({});

		assert.equal(store.get(store.path("selectedDataItemIndex")), 2);
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
					open: true,
				},
				{
					id: "2",
					parentId: "1",
					name: "child1",
					type: "String",
					defaultValue: "",
					open: false,
				},
				{
					id: "3",
					parentId: "2",
					name: "child11",
					type: "String",
					defaultValue: "",
					open: false,
				},
				{
					id: "4",
					parentId: "1",
					name: "child2",
					type: "String",
					defaultValue: "",
					open: false,
				},
				{
					id: "5",
					parentId: "4",
					name: "child21",
					type: "String",
					defaultValue: "",
					open: false,
				},
			]),
			add(store.path("selectedDataItemIndex"), 1),
		]);

		moveDownActiveDataItemProcess(store)({});

		assert.equal(store.get(store.path("selectedDataItemIndex")), 3);
		// 判断位置已互换
		const pageData = store.get(store.path("pageModel", "data"));

		assert.equal(pageData[1].id, "4");
		assert.equal(pageData[2].id, "5");
		assert.equal(pageData[3].id, "2");
		assert.equal(pageData[4].id, "3");

		assert.equal(store.get(store.path("dirty")), true);
	});
});
