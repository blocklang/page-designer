const { describe, it, beforeEach } = intern.getInterface("bdd");
const { assert } = intern.getPlugin("chai");
import Store from "@dojo/framework/stores/Store";
import { State } from "../../../src/interfaces";

import { activeWidgetProcess } from "../../../src/processes/uiProcesses";
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

		assert.equal(0, store.get(store.path("selectedWidgetIndex")));
		assert.equal("1", store.get(store.path("activeWidgetId")));

		activeWidgetProcess(store)({ activeWidgetId: "2" });

		assert.equal(1, store.get(store.path("selectedWidgetIndex")));
		assert.equal("2", store.get(store.path("activeWidgetId")));
	});
});
