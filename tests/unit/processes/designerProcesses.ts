import Store from "@dojo/framework/stores/Store";
import { State } from "@blocklang/designer-core/interfaces";
import { switchEditModeProcess, switchPageViewTypeProcess } from "../../../src/processes/designerProcesses";
import { add } from "@dojo/framework/stores/state/operations";

const { describe, it, beforeEach } = intern.getInterface("bdd");
const { assert } = intern.getPlugin("chai");

describe("processes/designerProcesses", () => {
	let store: Store<State>;

	beforeEach(() => {
		store = new Store<State>();
	});

	it("switchEditModeProcess: switch between Preview and Edit", () => {
		switchEditModeProcess(store)({});
		let editMode = store.get(store.path("paneLayout", "editMode"));
		assert.equal(editMode, "Edit");

		switchEditModeProcess(store)({});
		editMode = store.get(store.path("paneLayout", "editMode"));
		assert.equal(editMode, "Preview");
	});

	it("switchPageViewTypeProcess: when editMode is Preview", () => {
		switchPageViewTypeProcess(store)({});

		let editMode = store.get(store.path("paneLayout", "editMode"));
		assert.equal(editMode, "Edit");

		// default is ui
		let pageViewType = store.get(store.path("paneLayout", "pageViewType"));
		assert.equal(pageViewType, "behavior");

		switchPageViewTypeProcess(store)({});
		pageViewType = store.get(store.path("paneLayout", "pageViewType"));
		assert.equal(pageViewType, "ui");
	});

	it("switchPageViewTypeProcess: when editMode is Edit", () => {
		store.apply([add(store.path("paneLayout", "editMode"), "Edit")]);

		switchPageViewTypeProcess(store)({});

		let editMode = store.get(store.path("paneLayout", "editMode"));
		assert.equal(editMode, "Edit");

		// default is ui
		let pageViewType = store.get(store.path("paneLayout", "pageViewType"));
		assert.equal(pageViewType, "behavior");

		switchPageViewTypeProcess(store)({});
		pageViewType = store.get(store.path("paneLayout", "pageViewType"));
		assert.equal(pageViewType, "ui");
	});
});
