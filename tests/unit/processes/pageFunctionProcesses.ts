import Store from "@dojo/framework/stores/Store";
import { State, PageFunction } from "designer-core/interfaces";
import { add } from "@dojo/framework/stores/state/operations";
import { addSequenceConnectorProcess, addDataConnectorProcess } from "../../../src/processes/pageFunctionProcesses";

const { describe, it, beforeEach } = intern.getInterface("bdd");
const { assert } = intern.getPlugin("chai");

describe("processes/pageFunctionProcesses", () => {
	let store: Store<State>;

	beforeEach(() => {
		store = new Store<State>();
	});

	it("addSequenceConnectorProcess", () => {
		const functions: PageFunction[] = [
			{
				id: "1",
				nodes: [],
				sequenceConnections: [],
				dataConnections: []
			}
		];
		store.apply([add(store.path("pageModel", "functions"), functions), add(store.path("selectedFunctionId"), "1")]);
		addSequenceConnectorProcess(store)({
			startPort: { nodeId: "1", portId: "2" },
			endPort: { nodeId: "3", portId: "4" }
		});
		const actualFunctions = store.get(store.path("pageModel", "functions"));
		assert.equal(actualFunctions[0].sequenceConnections.length, 1);
		assert.equal(actualFunctions[0].dataConnections.length, 0);
	});

	it("addDataConnectorProcess", () => {
		const functions: PageFunction[] = [
			{
				id: "1",
				nodes: [],
				sequenceConnections: [],
				dataConnections: []
			}
		];
		store.apply([add(store.path("pageModel", "functions"), functions), add(store.path("selectedFunctionId"), "1")]);
		addDataConnectorProcess(store)({
			startPort: { nodeId: "1", portId: "2" },
			endPort: { nodeId: "3", portId: "4" }
		});
		const actualFunctions = store.get(store.path("pageModel", "functions"));
		assert.equal(actualFunctions[0].sequenceConnections.length, 0);
		assert.equal(actualFunctions[0].dataConnections.length, 1);
	});
});
