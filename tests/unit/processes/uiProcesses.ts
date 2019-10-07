const { describe, it, beforeEach } = intern.getInterface("bdd");
const { assert } = intern.getPlugin("chai");
import Store from "@dojo/framework/stores/Store";
import { State, PageModel } from "../../../src/interfaces";
import global from "@dojo/framework/shim/global";
import * as sinon from "sinon";

import {
	activeWidgetProcess,
	insertWidgetsProcess,
	removeActiveWidgetProcess,
	moveActiveWidgetPreviousProcess,
	moveActiveWidgetNextProcess,
	activeParentWidgetProcess,
	getPageModelProcess,
	highlightWidgetProcess,
	removeUndefinedWidgetProcess,
	savePageModelProcess
} from "../../../src/processes/uiProcesses";
import { add } from "@dojo/framework/stores/state/operations";
import { afterEach } from "intern/lib/interfaces/tdd";
import { DimensionResults } from "@dojo/framework/core/meta/Dimensions";

describe("processes/uiProcesses", () => {
	let store: Store<State>;

	beforeEach(() => {
		store = new Store<State>();
	});

	afterEach(() => {
		sinon.restore();
	});

	it("getPageModelProcess - get page model, default focus root node", async () => {
		const pageModel: PageModel = {
			pageInfo: {
				id: 1,
				key: "page1",
				name: "Page 1",
				appType: "01"
			},
			widgets: [
				{
					id: "1",
					parentId: "-1",
					widgetId: 1,
					widgetCode: "0001",
					widgetName: "Widget1",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				}
			]
		};
		global.fetch = sinon.stub().returns(
			Promise.resolve({
				json: () => Promise.resolve(pageModel)
			})
		);

		await getPageModelProcess(store)({ pageId: 1 });
		assert.deepEqual(store.get(store.path("pageModel")), pageModel);
		assert.equal(store.get(store.path("selectedWidgetIndex")), 0);
	});

	it("savePageModelProcess - save failed", async () => {
		store.apply([add(store.path("dirty"), true)]);
		global.fetch = sinon.stub().returns(Promise.resolve({ ok: false }));
		await savePageModelProcess(store)({});
		assert.equal(store.get(store.path("dirty")), true);
	});

	it("savePageModelProcess - save success", async () => {
		store.apply([add(store.path("dirty"), true)]);
		global.fetch = sinon.stub().returns(Promise.resolve({ ok: true }));
		await savePageModelProcess(store)({});
		assert.equal(store.get(store.path("dirty")), false);
	});

	it("activeWidgetProcess - select widget", () => {
		store.apply([
			add(store.path("pageModel", "widgets"), [
				{
					id: "1",
					parentId: "-1",
					widgetId: 1,
					widgetCode: "0001",
					widgetName: "Widget1",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 2,
					iconClass: "",
					canHasChildren: true,
					properties: []
				}
			])
		]);

		assert.isUndefined(store.get(store.path("selectedWidgetIndex")));

		activeWidgetProcess(store)({ activeWidgetId: "1", activeWidgetDimensions: {} as DimensionResults });
		assert.equal(store.get(store.path("selectedWidgetIndex")), 0);
		assert.isNotNull(store.get(store.path("activeWidgetDimensions")));

		activeWidgetProcess(store)({ activeWidgetId: "2", activeWidgetDimensions: {} as DimensionResults });
		assert.equal(store.get(store.path("selectedWidgetIndex")), 1);
		assert.isNotNull(store.get(store.path("activeWidgetDimensions")));
	});

	it("highlightWidgetProcess - add highlight", () => {
		store.apply([
			add(store.path("pageModel", "widgets"), [
				{
					id: "1",
					parentId: "-1",
					widgetId: 1,
					widgetCode: "0001",
					widgetName: "Widget1",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 2,
					iconClass: "",
					canHasChildren: true,
					properties: []
				}
			])
		]);

		assert.isUndefined(store.get(store.path("highlightWidgetIndex")));

		highlightWidgetProcess(store)({ highlightWidgetId: "1", highlightWidgetDimensions: {} as DimensionResults });
		assert.equal(store.get(store.path("highlightWidgetIndex")), 0);
		assert.isNotNull(store.get(store.path("highlightWidgetDimensions")));

		highlightWidgetProcess(store)({ highlightWidgetId: "2", highlightWidgetDimensions: {} as DimensionResults });
		assert.equal(store.get(store.path("highlightWidgetIndex")), 1);
		assert.isNotNull(store.get(store.path("highlightWidgetDimensions")));
	});

	it("highlightWidgetProcess - remove highlight", () => {
		store.apply([
			add(store.path("pageModel", "widgets"), [
				{
					id: "1",
					parentId: "-1",
					widgetId: 1,
					widgetCode: "0001",
					widgetName: "Widget1",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 2,
					iconClass: "",
					canHasChildren: true,
					properties: []
				}
			])
		]);

		assert.isUndefined(store.get(store.path("highlightWidgetIndex")));

		highlightWidgetProcess(store)({ highlightWidgetId: "1", highlightWidgetDimensions: {} as DimensionResults });
		assert.equal(store.get(store.path("highlightWidgetIndex")), 0);
		assert.isNotNull(store.get(store.path("highlightWidgetDimensions")));

		highlightWidgetProcess(store)({});
		assert.isUndefined(store.get(store.path("highlightWidgetIndex")));
		assert.isUndefined(store.get(store.path("highlightWidgetDimensions")));
	});

	it("insertWidgetsProcess - insert one widget below root node", () => {
		store.apply([
			add(store.path("pageModel", "widgets"), [
				{
					id: "1",
					parentId: "-1",
					widgetId: 1,
					widgetCode: "0001",
					widgetName: "Widget1",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				}
			]),
			add(store.path("selectedWidgetIndex"), 0)
		]);

		insertWidgetsProcess(store)({
			widgets: [
				{
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					iconClass: "",
					canHasChildren: true
				}
			]
		});

		const widgets = store.get(store.path("pageModel", "widgets"));
		assert.equal(widgets.length, 2);
		assert.isNotNull(widgets[1].id);
		assert.equal(widgets[1].parentId, "1");

		assert.isTrue(store.get(store.path("dirty")));
	});

	// -> 表示上下级
	// _ 表示同一级
	it("insertWidgetsProcess - root->node1, node1 is not a container, so insert after node1", () => {
		store.apply([
			add(store.path("pageModel", "widgets"), [
				{
					id: "1",
					parentId: "-1",
					widgetId: 1,
					widgetCode: "0001",
					widgetName: "Widget1",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: false,
					properties: []
				},
				{
					id: "3",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: false,
					properties: []
				}
			]),
			add(store.path("selectedWidgetIndex"), 1)
		]);

		insertWidgetsProcess(store)({
			widgets: [
				{
					widgetId: 3,
					widgetCode: "0003",
					widgetName: "Widget3",
					iconClass: "",
					canHasChildren: false
				}
			]
		});

		const widgets = store.get(store.path("pageModel", "widgets"));
		assert.equal(widgets.length, 4);
		const thirdWidget = widgets[2];

		assert.isNotNull(thirdWidget.id);
		assert.equal(thirdWidget.parentId, "1");
		assert.equal(thirdWidget.widgetCode, "0003");

		assert.isTrue(store.get(store.path("dirty")));
	});

	it("insertWidgetsProcess - insert two widget below root node", () => {
		store.apply([
			add(store.path("pageModel", "widgets"), [
				{
					id: "1",
					parentId: "-1",
					widgetId: 1,
					widgetCode: "0001",
					widgetName: "Widget1",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				}
			]),
			add(store.path("selectedWidgetIndex"), 0)
		]);

		insertWidgetsProcess(store)({
			widgets: [
				{
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					iconClass: "",
					canHasChildren: true
				},
				{
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					iconClass: "",
					canHasChildren: true
				}
			]
		});

		const widgets = store.get(store.path("pageModel", "widgets"));
		assert.equal(widgets.length, 3);

		assert.isTrue(store.get(store.path("dirty")));
	});

	it("insertWidgetsProcess - root->node1_node2, insert node11 after node1", () => {
		store.apply([
			add(store.path("pageModel", "widgets"), [
				{
					id: "1",
					parentId: "-1",
					widgetId: 1,
					widgetCode: "0001",
					widgetName: "Widget1",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "3",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				}
			]),
			add(store.path("selectedWidgetIndex"), 1)
		]);

		insertWidgetsProcess(store)({
			widgets: [
				{
					widgetId: 3,
					widgetCode: "0003",
					widgetName: "Widget3",
					iconClass: "",
					canHasChildren: true
				}
			]
		});

		const widgets = store.get(store.path("pageModel", "widgets"));
		assert.equal(4, widgets.length);
		const thirdWidget = widgets[2];
		console.log("==================");
		console.log(thirdWidget);
		assert.equal(thirdWidget.parentId, "2");
		assert.isNotNull(thirdWidget.id);
		assert.equal(thirdWidget.widgetId, 3);
		assert.equal(thirdWidget.widgetCode, "0003");

		assert.isTrue(store.get(store.path("dirty")));
	});

	it("removeActiveWidgetProcess - root->node1->node11, remove node1 and node11", () => {
		store.apply([
			add(store.path("pageModel", "widgets"), [
				{
					id: "1",
					parentId: "-1",
					widgetId: 1,
					widgetCode: "0001",
					widgetName: "Widget1",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "3",
					parentId: "2",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				}
			]),
			add(store.path("selectedWidgetIndex"), 1)
		]);
		removeActiveWidgetProcess(store)({});
		const widgets = store.get(store.path("pageModel", "widgets"));
		assert.equal(widgets.length, 1);
		assert.equal(widgets[0].id, "1");

		assert.equal(store.get(store.path("selectedWidgetIndex")), 0);

		assert.isTrue(store.get(store.path("dirty")));
	});

	it("removeActiveWidgetProcess - root->node1->node11, remove node11 then node1 focused", () => {
		store.apply([
			add(store.path("pageModel", "widgets"), [
				{
					id: "1",
					parentId: "-1",
					widgetId: 1,
					widgetCode: "0001",
					widgetName: "Widget1",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "3",
					parentId: "2",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				}
			]),
			add(store.path("selectedWidgetIndex"), 2)
		]);
		removeActiveWidgetProcess(store)({});
		const widgets = store.get(store.path("pageModel", "widgets"));
		assert.equal(widgets.length, 2);

		// node1 是 node11 的父节点，所以删除 node11 后，让 node1 获取焦点
		assert.equal(store.get(store.path("selectedWidgetIndex")), 1);

		assert.isTrue(store.get(store.path("dirty")));
	});

	it("removeActiveWidgetProcess - root->node1_node2, remove node2 then node1 focused", () => {
		store.apply([
			add(store.path("pageModel", "widgets"), [
				{
					id: "1",
					parentId: "-1",
					widgetId: 1,
					widgetCode: "0001",
					widgetName: "Widget1",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "3",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				}
			]),
			add(store.path("selectedWidgetIndex"), 2)
		]);
		removeActiveWidgetProcess(store)({});
		const widgets = store.get(store.path("pageModel", "widgets"));
		assert.equal(widgets.length, 2);

		// node1 是 node2 的前一个兄弟节点，所以删除 node2 后，让 node1 获取焦点
		assert.equal(store.get(store.path("selectedWidgetIndex")), 1);

		assert.isTrue(store.get(store.path("dirty")));
	});

	it("removeActiveWidgetProcess - root->node1_node2, remove node1 then node2 focused", () => {
		store.apply([
			add(store.path("pageModel", "widgets"), [
				{
					id: "1",
					parentId: "-1",
					widgetId: 1,
					widgetCode: "0001",
					widgetName: "Widget1",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "3",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				}
			]),
			add(store.path("selectedWidgetIndex"), 1)
		]);
		removeActiveWidgetProcess(store)({});
		const widgets = store.get(store.path("pageModel", "widgets"));
		assert.equal(widgets.length, 2);

		// node2 是 node1 的后一个兄弟节点，所以删除 node1 后，让 node2 获取焦点
		// 要考虑在计算索引时还没有实际删除，所以索引的位置还需要再移动一次的
		assert.equal(store.get(store.path("selectedWidgetIndex")), 1);

		assert.isTrue(store.get(store.path("dirty")));
	});

	// 此处不允许移除根节点
	it("removeActiveWidgetProcess - can not remove root node", () => {
		store.apply([
			add(store.path("pageModel", "widgets"), [
				{
					id: "1",
					parentId: "-1",
					widgetId: 1,
					widgetCode: "0001",
					widgetName: "Widget1",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				}
			]),
			add(store.path("selectedWidgetIndex"), 0)
		]);
		removeActiveWidgetProcess(store)({});

		// 未删除根节点
		const widgets = store.get(store.path("pageModel", "widgets"));
		assert.equal(widgets.length, 1);

		assert.isUndefined(store.get(store.path("dirty")));
	});

	// TODO: 删除 removeUndefinedWidgetProcess 相关的测试用例
	it("removeUndefinedWidgetProcess - can not remove root node", () => {
		store.apply([
			add(store.path("pageModel", "widgets"), [
				{
					id: "1",
					parentId: "-1",
					widgetId: 1,
					widgetCode: "0001",
					widgetName: "Widget1",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				}
			])
		]);

		removeUndefinedWidgetProcess(store)({ widgetId: "1" });

		// 未删除根节点
		const widgets = store.get(store.path("pageModel", "widgets"));
		assert.equal(widgets.length, 1);
	});

	it("removeUndefinedWidgetProcess - remove success", () => {
		store.apply([
			add(store.path("pageModel", "widgets"), [
				{
					id: "1",
					parentId: "-1",
					widgetId: 1,
					widgetCode: "0001",
					widgetName: "Widget1",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0001",
					widgetName: "Widget1",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				}
			])
		]);

		removeUndefinedWidgetProcess(store)({ widgetId: "2" });

		const widgets = store.get(store.path("pageModel", "widgets"));
		assert.equal(widgets.length, 1);
	});

	it("moveActiveWidgetPreviousProcess - has no previous widget", () => {
		store.apply([
			add(store.path("pageModel", "widgets"), [
				{
					id: "1",
					parentId: "-1",
					widgetId: 1,
					widgetCode: "0001",
					widgetName: "Widget1",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				}
			]),
			add(store.path("selectedWidgetIndex"), 1)
		]);
		moveActiveWidgetPreviousProcess(store)({});

		// 没有前一个兄弟节点，所以没有移动
		assert.equal(store.get(store.path("selectedWidgetIndex")), 1);

		assert.isUndefined(store.get(store.path("dirty")));
	});

	it("moveActiveWidgetPreviousProcess - root->node1_node2, move node2 previous, then become root->node2_node1", () => {
		store.apply([
			add(store.path("pageModel", "widgets"), [
				{
					id: "1",
					parentId: "-1",
					widgetId: 1,
					widgetCode: "0001",
					widgetName: "Widget1",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "3",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				}
			]),
			add(store.path("selectedWidgetIndex"), 2)
		]);
		moveActiveWidgetPreviousProcess(store)({});

		assert.equal(store.get(store.path("selectedWidgetIndex")), 1);
		// 判断位置已互换
		const pageWidgets = store.get(store.path("pageModel", "widgets"));

		assert.equal(pageWidgets[1].id, "3");
		assert.equal(pageWidgets[2].id, "2");

		assert.equal(store.get(store.path("dirty")), true);
	});

	it("moveActiveWidgetPreviousProcess - root->node1->node11 root->node2->node21, move node2 previous, then become root->node2->node21 root->node1->node11", () => {
		store.apply([
			add(store.path("pageModel", "widgets"), [
				{
					id: "1",
					parentId: "-1",
					widgetId: 1,
					widgetCode: "0001",
					widgetName: "Widget1",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "3",
					parentId: "2",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "4",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "5",
					parentId: "4",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				}
			]),
			add(store.path("selectedWidgetIndex"), 3)
		]);
		moveActiveWidgetPreviousProcess(store)({});

		assert.equal(store.get(store.path("selectedWidgetIndex")), 1);
		// 判断位置已互换
		const pageWidgets = store.get(store.path("pageModel", "widgets"));

		assert.equal(pageWidgets[1].id, "4");
		assert.equal(pageWidgets[2].id, "5");
		assert.equal(pageWidgets[3].id, "2");
		assert.equal(pageWidgets[4].id, "3");

		assert.equal(store.get(store.path("dirty")), true);
	});

	it("moveActiveWidgetNextProcess - has no next widget", () => {
		store.apply([
			add(store.path("pageModel", "widgets"), [
				{
					id: "1",
					parentId: "-1",
					widgetId: 1,
					widgetCode: "0001",
					widgetName: "Widget1",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "3",
					parentId: "2",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				}
			]),
			add(store.path("selectedWidgetIndex"), 1)
		]);
		moveActiveWidgetNextProcess(store)({});

		// 没有前一个兄弟节点，所以没有移动
		assert.equal(store.get(store.path("selectedWidgetIndex")), 1);

		assert.isUndefined(store.get(store.path("dirty")));
	});

	it("moveActiveWidgetNextProcess - root->node1_node2, move node1 next, then become root->node2_node1", () => {
		store.apply([
			add(store.path("pageModel", "widgets"), [
				{
					id: "1",
					parentId: "-1",
					widgetId: 1,
					widgetCode: "0001",
					widgetName: "Widget1",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "3",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				}
			]),
			add(store.path("selectedWidgetIndex"), 1)
		]);
		moveActiveWidgetNextProcess(store)({});

		assert.equal(store.get(store.path("selectedWidgetIndex")), 2);
		// 判断位置已互换
		const pageWidgets = store.get(store.path("pageModel", "widgets"));

		assert.equal(pageWidgets[1].id, "3");
		assert.equal(pageWidgets[2].id, "2");

		assert.isTrue(store.get(store.path("dirty")));
	});

	it("moveActiveWidgetNextProcess - root->node1->node11 root->node2->node21, move node1 next, then become root->node2->node21 root->node1->node11", () => {
		store.apply([
			add(store.path("pageModel", "widgets"), [
				{
					id: "1",
					parentId: "-1",
					widgetId: 1,
					widgetCode: "0001",
					widgetName: "Widget1",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "3",
					parentId: "2",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "4",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "5",
					parentId: "4",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				}
			]),
			add(store.path("selectedWidgetIndex"), 1)
		]);
		moveActiveWidgetNextProcess(store)({});

		assert.equal(store.get(store.path("selectedWidgetIndex")), 3);
		// 判断位置已互换
		const pageWidgets = store.get(store.path("pageModel", "widgets"));

		assert.equal(pageWidgets[1].id, "4");
		assert.equal(pageWidgets[2].id, "5");
		assert.equal(pageWidgets[3].id, "2");
		assert.equal(pageWidgets[4].id, "3");

		assert.isTrue(store.get(store.path("dirty")));
	});

	it("moveActiveWidgetNextProcess - root->node1->node11 root->node2, move node1 next, then become root->node2 root->node1->node11", () => {
		store.apply([
			add(store.path("pageModel", "widgets"), [
				{
					id: "1",
					parentId: "-1",
					widgetId: 1,
					widgetCode: "0001",
					widgetName: "Widget1",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "3",
					parentId: "2",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "4",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				}
			]),
			add(store.path("selectedWidgetIndex"), 1)
		]);
		moveActiveWidgetNextProcess(store)({});

		assert.equal(store.get(store.path("selectedWidgetIndex")), 2);
		// 判断位置已互换
		const pageWidgets = store.get(store.path("pageModel", "widgets"));

		assert.equal(pageWidgets[1].id, "4");
		assert.equal(pageWidgets[2].id, "2");
		assert.equal(pageWidgets[3].id, "3");

		assert.isTrue(store.get(store.path("dirty")));
	});

	it("activeParentWidgetProcess - root, no parent node", () => {
		store.apply([
			add(store.path("pageModel", "widgets"), [
				{
					id: "1",
					parentId: "-1",
					widgetId: 1,
					widgetCode: "0001",
					widgetName: "Widget1",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				}
			]),
			add(store.path("selectedWidgetIndex"), 0)
		]);
		activeParentWidgetProcess(store)({});

		// 没有父节点节点，所以没有移动
		assert.equal(store.get(store.path("selectedWidgetIndex")), 0);
	});

	it("activeParentWidgetProcess - root->node1, node1 focus default, active parent then root focused", () => {
		store.apply([
			add(store.path("pageModel", "widgets"), [
				{
					id: "1",
					parentId: "-1",
					widgetId: 1,
					widgetCode: "0001",
					widgetName: "Widget1",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				}
			]),
			add(store.path("selectedWidgetIndex"), 1)
		]);
		activeParentWidgetProcess(store)({});

		assert.equal(store.get(store.path("selectedWidgetIndex")), 0);
	});

	it("activeParentWidgetProcess - root->node1 root->node2, node2 focus default, active parent then root focused", () => {
		store.apply([
			add(store.path("pageModel", "widgets"), [
				{
					id: "1",
					parentId: "-1",
					widgetId: 1,
					widgetCode: "0001",
					widgetName: "Widget1",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "3",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				}
			]),
			add(store.path("selectedWidgetIndex"), 2)
		]);
		activeParentWidgetProcess(store)({});

		assert.equal(store.get(store.path("selectedWidgetIndex")), 0);
	});
});
