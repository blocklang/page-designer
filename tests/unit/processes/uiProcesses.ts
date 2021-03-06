const { describe, it, beforeEach } = intern.getInterface("bdd");
const { assert } = intern.getPlugin("chai");
import Store from "@dojo/framework/stores/Store";
import { State, PageModel } from "@blocklang/designer-core/interfaces";
import { Widget, AttachedWidget } from "@blocklang/designer-core/interfaces";
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
	savePageModelProcess,
	undoProcess,
	redoProcess,
	changeActiveWidgetPropertiesProcess,
	unhighlightWidgetProcess,
	activeWidgetPropertyProcess,
} from "../../../src/processes/uiProcesses";
import { add } from "@dojo/framework/stores/state/operations";
import { afterEach } from "intern/lib/interfaces/tdd";
import { DimensionResults } from "@dojo/framework/core/meta/Dimensions";
import { uiHistoryManager } from "../../../src/processes/utils";

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
			pageId: 1,
			widgets: [
				{
					id: "1",
					parentId: "-1",
					widgetId: 1,
					widgetCode: "0001",
					widgetName: "Widget1",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
			],
			data: [],
			functions: [],
		};
		global.fetch = sinon.stub().returns(
			Promise.resolve({
				json: () => Promise.resolve(pageModel),
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
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 2,
					canHasChildren: true,
					properties: [],
				},
			]),
		]);

		assert.isUndefined(store.get(store.path("selectedWidgetIndex")));

		activeWidgetProcess(store)({ activeWidgetId: "1" });
		assert.equal(store.get(store.path("selectedWidgetIndex")), 0);
		assert.isNotNull(store.get(store.path("activeWidgetDimensions")));
		assert.isUndefined(store.get(store.path("selectedWidgetPropertyIndex")));

		// 选中一个属性，切换部件后自动将选中的属性设置为 undefined
		activeWidgetPropertyProcess(store)({ propertyIndex: 1 });
		assert.equal(store.get(store.path("selectedWidgetPropertyIndex")), 1);

		activeWidgetProcess(store)({ activeWidgetId: "2" });
		assert.equal(store.get(store.path("selectedWidgetIndex")), 1);
		assert.isNotNull(store.get(store.path("activeWidgetDimensions")));
		assert.isUndefined(store.get(store.path("selectedWidgetPropertyIndex")));
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
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 2,
					canHasChildren: true,
					properties: [],
				},
			]),
		]);

		assert.isUndefined(store.get(store.path("highlightWidgetIndex")));

		highlightWidgetProcess(store)({ highlightWidgetId: "1", highlightWidgetDimensions: {} as DimensionResults });
		assert.equal(store.get(store.path("highlightWidgetIndex")), 0);
		assert.isNotNull(store.get(store.path("highlightWidgetDimensions")));

		highlightWidgetProcess(store)({ highlightWidgetId: "2", highlightWidgetDimensions: {} as DimensionResults });
		assert.equal(store.get(store.path("highlightWidgetIndex")), 1);
		assert.isNotNull(store.get(store.path("highlightWidgetDimensions")));
	});

	it("unhighlightWidgetProcess - remove highlight", () => {
		store.apply([
			add(store.path("pageModel", "widgets"), [
				{
					id: "1",
					parentId: "-1",
					widgetId: 1,
					widgetCode: "0001",
					widgetName: "Widget1",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 2,
					canHasChildren: true,
					properties: [],
				},
			]),
		]);

		assert.isUndefined(store.get(store.path("highlightWidgetIndex")));

		highlightWidgetProcess(store)({ highlightWidgetId: "1", highlightWidgetDimensions: {} as DimensionResults });
		assert.equal(store.get(store.path("highlightWidgetIndex")), 0);
		assert.isNotNull(store.get(store.path("highlightWidgetDimensions")));

		unhighlightWidgetProcess(store)({});
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
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
			]),
			add(store.path("selectedWidgetIndex"), 0),
		]);

		insertWidgetsProcess(store)({
			widgets: [
				{
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					canHasChildren: true,
					apiRepoId: 1,
					properties: [],
				},
			],
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
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 1,
					canHasChildren: false,
					properties: [],
				},
				{
					id: "3",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 1,
					canHasChildren: false,
					properties: [],
				},
			]),
			add(store.path("selectedWidgetIndex"), 1),
		]);

		insertWidgetsProcess(store)({
			widgets: [
				{
					widgetId: 3,
					widgetCode: "0003",
					widgetName: "Widget3",
					canHasChildren: false,
					apiRepoId: 3,
					properties: [],
				},
			],
		});

		const widgets = store.get(store.path("pageModel", "widgets"));
		assert.equal(widgets.length, 4);
		const thirdWidget = widgets[2];

		assert.isNotNull(thirdWidget.id);
		assert.equal(thirdWidget.parentId, "1");
		assert.equal(thirdWidget.widgetCode, "0003");
		assert.equal(thirdWidget.apiRepoId, 3);

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
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
			]),
			add(store.path("selectedWidgetIndex"), 0),
		]);

		insertWidgetsProcess(store)({
			widgets: [
				{
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					canHasChildren: true,
					apiRepoId: 1,
					properties: [],
				},
				{
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					canHasChildren: true,
					apiRepoId: 1,
					properties: [],
				},
			],
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
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "3",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
			]),
			add(store.path("selectedWidgetIndex"), 1),
		]);

		insertWidgetsProcess(store)({
			widgets: [
				{
					widgetId: 3,
					widgetCode: "0003",
					widgetName: "Widget3",
					canHasChildren: true,
					apiRepoId: 1,
					properties: [],
				},
			],
		});

		const widgets = store.get(store.path("pageModel", "widgets"));
		assert.equal(4, widgets.length);

		const thirdWidget = widgets[2];
		assert.equal(thirdWidget.parentId, "2");
		assert.isNotNull(thirdWidget.id);
		assert.equal(thirdWidget.widgetId, 3);
		assert.equal(thirdWidget.widgetCode, "0003");

		assert.isTrue(store.get(store.path("dirty")));
	});

	// 在新增部件时，要默认包含部件的所有属性，并为每个属性的 id 生成一个 uuid
	it("insertWidgetsProcess - insert one widget and generate id for one property", () => {
		store.apply([
			add(store.path("pageModel", "widgets"), [
				{
					id: "1",
					parentId: "-1",
					widgetId: 1,
					widgetCode: "0001",
					widgetName: "Widget1",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
			]),
			add(store.path("selectedWidgetIndex"), 0),
		]);

		insertWidgetsProcess(store)({
			widgets: [
				{
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					canHasChildren: true,
					apiRepoId: 1,
					properties: [
						{
							code: "0001",
							name: "prop1",
							valueType: "string",
						},
					],
				},
			],
		});

		const widgets = store.get(store.path("pageModel", "widgets"));
		// 为属性的 id 设置一个 32 位的 uuid
		assert.isTrue(widgets[1].properties[0].id.length === 32);
		assert.isUndefined(widgets[1].properties[0].value);
		assert.isTrue(store.get(store.path("dirty")));
	});

	it("insertWidgetsProcess - insert two widgets and the same property of widget should be different", () => {
		store.apply([
			add(store.path("pageModel", "widgets"), [
				{
					id: "1",
					parentId: "-1",
					widgetId: 1,
					widgetCode: "0001",
					widgetName: "Widget1",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
			]),
			add(store.path("selectedWidgetIndex"), 0),
		]);

		// 同一类型部件，连续添加两次
		const widgetInfo: Widget = {
			widgetId: 2,
			widgetCode: "0002",
			widgetName: "Widget2",
			canHasChildren: true,
			apiRepoId: 1,
			properties: [
				{
					code: "0001",
					name: "prop1",
					valueType: "string",
				},
			],
		};

		// 添加第一个
		insertWidgetsProcess(store)({ widgets: [widgetInfo] });
		// 添加第二个
		insertWidgetsProcess(store)({ widgets: [widgetInfo] });

		const widgets = store.get(store.path("pageModel", "widgets"));
		// 为属性的 id 设置一个 32 位的 uuid
		assert.isTrue(widgets[1].properties[0].id.length === 32);
		assert.notEqual(widgets[1].properties[0].id, widgets[2].properties[0].id);

		assert.isTrue(store.get(store.path("dirty")));
	});

	// 为属性设置默认值
	it("insertWidgetsProcess - insert one widget and set default value for property", () => {
		store.apply([
			add(store.path("pageModel", "widgets"), [
				{
					id: "1",
					parentId: "-1",
					widgetId: 1,
					widgetCode: "0001",
					widgetName: "Widget1",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
			]),
			add(store.path("selectedWidgetIndex"), 0),
		]);

		insertWidgetsProcess(store)({
			widgets: [
				{
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					canHasChildren: true,
					apiRepoId: 1,
					properties: [
						{
							code: "0001",
							name: "prop1",
							valueType: "string",
							defaultValue: "default_value",
						},
					],
				},
			],
		});

		const widgets = store.get(store.path("pageModel", "widgets"));
		const prop1 = widgets[1].properties[0];
		assert.equal(prop1.code, "0001");
		assert.equal(prop1.name, "prop1");
		assert.equal(prop1.value, "default_value");
		assert.isTrue(store.get(store.path("dirty")));
	});

	it("changeActiveWidgetPropertiesProcess - pass zero changed property", () => {
		const widgets = [
			{
				id: "1",
				parentId: "-1",
				widgetId: 1,
				widgetCode: "0001",
				widgetName: "Widget1",
				apiRepoId: 1,
				canHasChildren: true,
				properties: [],
			},
			{
				id: "2",
				parentId: "1",
				widgetId: 2,
				widgetCode: "0002",
				widgetName: "Widget2",
				apiRepoId: 1,
				canHasChildren: true,
				properties: [
					{
						id: "1",
						name: "prop1",
					},
				],
			},
		];

		store.apply([add(store.path("pageModel", "widgets"), widgets), add(store.path("selectedWidgetIndex"), 1)]);

		changeActiveWidgetPropertiesProcess(store)({
			changedProperties: [],
		});

		const secondWidget = store.get(store.path("pageModel", "widgets"))[1];
		// 断言选中部件的属性值未发生变化
		assert.deepEqual(secondWidget.properties, widgets[1].properties);

		assert.isUndefined(store.get(store.path("dirty")));
	});

	it("changeActiveWidgetPropertiesProcess - change one property value", () => {
		store.apply([
			add(store.path("pageModel", "widgets"), [
				{
					id: "1",
					parentId: "-1",
					widgetId: 1,
					widgetCode: "0001",
					widgetName: "Widget1",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [
						{
							id: "1",
							code: "0001",
							name: "prop1",
							valueType: "string",
							isExpr: false,
						},
					],
				},
			]),
			add(store.path("selectedWidgetIndex"), 1),
		]);

		changeActiveWidgetPropertiesProcess(store)({
			changedProperties: [
				{
					index: 0,
					newValue: "1",
					isChanging: false,
					isExpr: false,
				},
			],
		});

		const widgets = store.get(store.path("pageModel", "widgets"));
		assert.equal(widgets[1].properties[0].value, "1");
		assert.isFalse(widgets[1].properties[0].isExpr);

		assert.isTrue(store.get(store.path("dirty")));
	});

	it("changeActiveWidgetPropertiesProcess - change one property's isExpr", () => {
		store.apply([
			add(store.path("pageModel", "widgets"), [
				{
					id: "1",
					parentId: "-1",
					widgetId: 1,
					widgetCode: "0001",
					widgetName: "Widget1",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [
						{
							id: "1",
							code: "0001",
							name: "prop1",
							valueType: "string",
							isExpr: false,
						},
					],
				},
			]),
			add(store.path("selectedWidgetIndex"), 1),
		]);

		changeActiveWidgetPropertiesProcess(store)({
			changedProperties: [
				{
					index: 0,
					newValue: "1",
					isChanging: false,
					isExpr: true,
				},
			],
		});

		const widgets = store.get(store.path("pageModel", "widgets"));
		assert.equal(widgets[1].properties[0].value, "1");
		assert.isTrue(widgets[1].properties[0].isExpr);

		assert.isTrue(store.get(store.path("dirty")));
	});

	it("changeActiveWidgetPropertiesProcess - change two property value", () => {
		const attachedWidgets: AttachedWidget[] = [
			{
				id: "1",
				parentId: "-1",
				widgetId: 1,
				widgetCode: "0001",
				widgetName: "Widget1",
				apiRepoId: 1,
				canHasChildren: true,
				properties: [],
			},
			{
				id: "2",
				parentId: "1",
				widgetId: 2,
				widgetCode: "0002",
				widgetName: "Widget2",
				apiRepoId: 1,
				canHasChildren: true,
				properties: [
					{
						id: "1",
						code: "0001",
						name: "prop1",
						valueType: "string",
						isExpr: false,
					},
					{
						id: "2",
						code: "0002",
						name: "prop2",
						valueType: "string",
						isExpr: false,
					},
				],
			},
		];

		store.apply([
			add(store.path("pageModel", "widgets"), attachedWidgets),
			add(store.path("selectedWidgetIndex"), 1),
		]);

		changeActiveWidgetPropertiesProcess(store)({
			changedProperties: [
				{
					index: 0,
					newValue: "1",
					isChanging: false,
					isExpr: false,
				},
				{
					index: 1,
					newValue: "2",
					isChanging: false,
					isExpr: false,
				},
			],
		});

		const widgets = store.get(store.path("pageModel", "widgets"));
		assert.equal(widgets[1].properties[0].value, "1");
		assert.equal(widgets[1].properties[1].value, "2");

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
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "3",
					parentId: "2",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
			]),
			add(store.path("selectedWidgetIndex"), 1),
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
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "3",
					parentId: "2",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
			]),
			add(store.path("selectedWidgetIndex"), 2),
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
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "3",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
			]),
			add(store.path("selectedWidgetIndex"), 2),
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
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "3",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
			]),
			add(store.path("selectedWidgetIndex"), 1),
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
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
			]),
			add(store.path("selectedWidgetIndex"), 0),
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
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
			]),
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
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0001",
					widgetName: "Widget1",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
			]),
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
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
			]),
			add(store.path("selectedWidgetIndex"), 1),
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
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "3",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
			]),
			add(store.path("selectedWidgetIndex"), 2),
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
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "3",
					parentId: "2",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "4",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "5",
					parentId: "4",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
			]),
			add(store.path("selectedWidgetIndex"), 3),
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
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "3",
					parentId: "2",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
			]),
			add(store.path("selectedWidgetIndex"), 1),
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
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "3",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
			]),
			add(store.path("selectedWidgetIndex"), 1),
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
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "3",
					parentId: "2",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "4",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "5",
					parentId: "4",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
			]),
			add(store.path("selectedWidgetIndex"), 1),
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
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "3",
					parentId: "2",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "4",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
			]),
			add(store.path("selectedWidgetIndex"), 1),
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
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
			]),
			add(store.path("selectedWidgetIndex"), 0),
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
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
			]),
			add(store.path("selectedWidgetIndex"), 1),
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
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "3",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
			]),
			add(store.path("selectedWidgetIndex"), 2),
		]);
		activeParentWidgetProcess(store)({});

		assert.equal(store.get(store.path("selectedWidgetIndex")), 0);
	});

	it("history manager - insertWidgetsProcess", () => {
		store.apply([
			add(store.path("pageModel", "widgets"), [
				{
					id: "1",
					parentId: "-1",
					widgetId: 1,
					widgetCode: "0001",
					widgetName: "Widget1",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
			]),
			add(store.path("selectedWidgetIndex"), 0),
		]);

		assert.isFalse(uiHistoryManager.canUndo(store));
		assert.isFalse(uiHistoryManager.canRedo(store));

		insertWidgetsProcess(store)({
			widgets: [
				{
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					canHasChildren: true,
					apiRepoId: 1,
					properties: [],
				},
			],
		});

		assert.isTrue(uiHistoryManager.canUndo(store));
		assert.isFalse(uiHistoryManager.canRedo(store));
	});

	it("history manager - moveActiveWidgetPreviousProcess", () => {
		store.apply([
			add(store.path("pageModel", "widgets"), [
				{
					id: "1",
					parentId: "-1",
					widgetId: 1,
					widgetCode: "0001",
					widgetName: "Widget1",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "3",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
			]),
			add(store.path("selectedWidgetIndex"), 2),
		]);

		assert.isFalse(uiHistoryManager.canUndo(store));
		assert.isFalse(uiHistoryManager.canRedo(store));

		moveActiveWidgetPreviousProcess(store)({});

		assert.isTrue(uiHistoryManager.canUndo(store));
		assert.isFalse(uiHistoryManager.canRedo(store));
	});

	it("history manager - moveActiveWidgetNextProcess", () => {
		store.apply([
			add(store.path("pageModel", "widgets"), [
				{
					id: "1",
					parentId: "-1",
					widgetId: 1,
					widgetCode: "0001",
					widgetName: "Widget1",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "3",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
			]),
			add(store.path("selectedWidgetIndex"), 1),
		]);

		assert.isFalse(uiHistoryManager.canUndo(store));
		assert.isFalse(uiHistoryManager.canRedo(store));

		moveActiveWidgetNextProcess(store)({});

		assert.isTrue(uiHistoryManager.canUndo(store));
		assert.isFalse(uiHistoryManager.canRedo(store));
	});

	it("history manager - removeActiveWidgetProcess", () => {
		store.apply([
			add(store.path("pageModel", "widgets"), [
				{
					id: "1",
					parentId: "-1",
					widgetId: 1,
					widgetCode: "0001",
					widgetName: "Widget1",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					apiRepoId: 1,
					canHasChildren: true,
					properties: [],
				},
			]),
			add(store.path("selectedWidgetIndex"), 1),
		]);

		assert.isFalse(uiHistoryManager.canUndo(store));
		assert.isFalse(uiHistoryManager.canRedo(store));

		removeActiveWidgetProcess(store)({});

		assert.isTrue(uiHistoryManager.canUndo(store));
		assert.isFalse(uiHistoryManager.canRedo(store));
	});

	it("undoProcess - historyManager#undo method was called", () => {
		const undoStub = sinon.stub();
		uiHistoryManager.undo = undoStub;
		assert.isTrue(undoStub.notCalled);
		undoProcess(store)({});
		assert.isTrue(undoStub.calledOnce);
	});

	it("redoProcess - historyManager#redo method was called", () => {
		const redoStub = sinon.stub();
		uiHistoryManager.redo = redoStub;
		assert.isTrue(redoStub.notCalled);
		redoProcess(store)({});
		assert.isTrue(redoStub.calledOnce);
	});
});
