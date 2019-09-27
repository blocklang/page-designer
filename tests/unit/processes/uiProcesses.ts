const { describe, it, beforeEach } = intern.getInterface("bdd");
const { assert } = intern.getPlugin("chai");
import Store from "@dojo/framework/stores/Store";
import { State } from "../../../src/interfaces";

import { activeWidgetProcess, insertWidgetsProcess } from "../../../src/processes/uiProcesses";
import { add } from "@dojo/framework/stores/state/operations";

describe("processes/uiProcesses", () => {
	let store: Store<State>;

	beforeEach(() => {
		store = new Store<State>();
	});

	it("select widget", () => {
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

		assert.isUndefined(store.get(store.path("activeWidgetId")));
		assert.isUndefined(store.get(store.path("selectedWidgetIndex")));

		activeWidgetProcess(store)({ activeWidgetId: "1" });

		assert.equal(store.get(store.path("selectedWidgetIndex")), 0);
		assert.equal(store.get(store.path("activeWidgetId")), "1");

		activeWidgetProcess(store)({ activeWidgetId: "2" });

		assert.equal(store.get(store.path("selectedWidgetIndex")), 1);
		assert.equal(store.get(store.path("activeWidgetId")), "2");
	});

	it("insert one widget below root node", () => {
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
			add(store.path("activeWidgetId"), "1"),
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
	});

	// -> 表示上下级
	// _ 表示同一级
	it("root->node1, node1 is not a container, so insert after node1", () => {
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
			add(store.path("activeWidgetId"), "2"),
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
	});

	it("insert two widget below root node", () => {
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
			add(store.path("activeWidgetId"), "1"),
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
	});

	it("root->node1_node2, insert node11 after node1", () => {
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
			add(store.path("activeWidgetId"), "2"),
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
	});
});
