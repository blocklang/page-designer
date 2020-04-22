const { describe, it, beforeEach } = intern.getInterface("bdd");

const { assert } = intern.getPlugin("chai");
import global from "@dojo/framework/shim/global";
import { stub } from "sinon";

import { getWidgetsProcess } from "../../../src/processes/projectDependenciesProcesses";
import { initProjectProcess } from "../../../src/processes/projectProcesses";
import Store from "@dojo/framework/stores/Store";
import { State } from "designer-core/interfaces";
import { config } from "../../../src/config";

const fetchStub = stub();
global.fetch = fetchStub;

describe("processes/widgetProcesses", () => {
	beforeEach(() => {
		fetchStub.reset();
	});

	it("get widgets process", async () => {
		const store = new Store<State>();
		initProjectProcess(store)({ project: { id: 1, name: "project1", createUserName: "jack" } });

		const mockResponse = {
			json: stub().returns([]),
		};
		const url = "designer/projects/1/widgets";
		config.fetchApiRepoWidgetsUrl = url;

		fetchStub.withArgs(url).returns(mockResponse);
		const executor = getWidgetsProcess(store);
		await executor({});
		assert.deepEqual(store.get(store.path("repoWidgets")), []);
	});
});
