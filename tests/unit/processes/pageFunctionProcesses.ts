import Store from "@dojo/framework/stores/Store";
import { State, PageFunction } from "designer-core/interfaces";
import { add } from "@dojo/framework/stores/state/operations";
import {
	addSequenceConnectorProcess,
	addDataConnectorProcess,
	removeSequenceConnectorProcess,
	removeDataConnectorProcess,
	updateSequenceConnectorProcess,
	updateDataConnectorProcess,
	removeFunctionNodeProcess,
	updateInputDataPortValueProcess,
} from "../../../src/processes/pageFunctionProcesses";

const { describe, it, beforeEach } = intern.getInterface("bdd");
const { assert } = intern.getPlugin("chai");

describe("processes/pageFunctionProcesses", () => {
	let store: Store<State>;

	beforeEach(() => {
		store = new Store<State>();
	});

	it("removeFunctionNodeProcess - remove node", () => {
		const functions: PageFunction[] = [
			{
				id: "1",
				nodes: [
					{
						id: "11",
						left: 1,
						top: 2,
						caption: "Get a",
						text: "",
						layout: "data",
						category: "variableGet",
						outputSequencePorts: [],
						inputDataPorts: [],
						outputDataPorts: [],
					},
				],
				sequenceConnections: [],
				dataConnections: [],
			},
		];
		store.apply([add(store.path("pageModel", "functions"), functions), add(store.path("selectedFunctionId"), "1")]);

		removeFunctionNodeProcess(store)({ functionNodeId: "not exist id" });
		let actualFunctions = store.get(store.path("pageModel", "functions"));
		assert.equal(actualFunctions[0].nodes.length, 1);

		removeFunctionNodeProcess(store)({ functionNodeId: "11" });

		actualFunctions = store.get(store.path("pageModel", "functions"));
		assert.equal(actualFunctions[0].nodes.length, 0);
	});

	it("removeFunctionNodeProcess - remove node which is active", () => {
		const functions: PageFunction[] = [
			{
				id: "1",
				nodes: [
					{
						id: "11",
						left: 1,
						top: 2,
						caption: "Get a",
						text: "",
						layout: "data",
						category: "variableGet",
						outputSequencePorts: [],
						inputDataPorts: [],
						outputDataPorts: [],
					},
				],
				sequenceConnections: [],
				dataConnections: [],
			},
		];
		store.apply([
			add(store.path("pageModel", "functions"), functions),
			add(store.path("selectedFunctionId"), "1"),
			add(store.path("selectedFunctionNodeId"), "11"),
		]);

		removeFunctionNodeProcess(store)({ functionNodeId: "not exist id" });
		let actualFunctions = store.get(store.path("pageModel", "functions"));
		assert.equal(actualFunctions[0].nodes.length, 1);
		assert.equal(store.get(store.path("selectedFunctionNodeId")), "11");

		removeFunctionNodeProcess(store)({ functionNodeId: "11" });

		actualFunctions = store.get(store.path("pageModel", "functions"));
		assert.equal(actualFunctions[0].nodes.length, 0);
		assert.isUndefined(store.get(store.path("selectedFunctionNodeId")));
	});

	it("removeFunctionNodeProcess - remove node with connection", () => {
		const functions: PageFunction[] = [
			{
				id: "1",
				nodes: [
					{
						id: "11",
						left: 1,
						top: 2,
						caption: "Set a",
						text: "",
						layout: "data",
						category: "variableSet",
						outputSequencePorts: [
							{
								id: "osp1",
								text: "",
							},
						],
						inputDataPorts: [],
						outputDataPorts: [
							{
								id: "odp1",
								name: "value",
								type: "string",
							},
						],
					},
					{
						id: "21",
						left: 1,
						top: 2,
						caption: "Set b",
						text: "",
						layout: "data",
						category: "variableSet",
						inputSequencePort: { id: "isp2" },
						outputSequencePorts: [],
						inputDataPorts: [
							{
								id: "idp2",
								name: "value",
								type: "string",
							},
						],
						outputDataPorts: [],
					},
				],
				sequenceConnections: [
					{
						id: "sc1",
						fromNode: "11",
						fromOutput: "osp1",
						toNode: "21",
						toInput: "isp2",
					},
				],
				dataConnections: [
					{
						id: "dc1",
						fromNode: "11",
						fromOutput: "odp1",
						toNode: "21",
						toInput: "idp2",
					},
				],
			},
		];
		store.apply([add(store.path("pageModel", "functions"), functions), add(store.path("selectedFunctionId"), "1")]);

		removeFunctionNodeProcess(store)({ functionNodeId: "11" });

		const actualFunctions = store.get(store.path("pageModel", "functions"));
		assert.equal(actualFunctions[0].nodes.length, 1);
		assert.equal(actualFunctions[0].sequenceConnections.length, 0);
		assert.equal(actualFunctions[0].dataConnections.length, 0);
	});

	it("addSequenceConnectorProcess: new connector", () => {
		const functions: PageFunction[] = [
			{
				id: "1",
				nodes: [],
				sequenceConnections: [],
				dataConnections: [],
			},
		];
		store.apply([add(store.path("pageModel", "functions"), functions), add(store.path("selectedFunctionId"), "1")]);
		addSequenceConnectorProcess(store)({
			startPort: { nodeId: "1", portId: "2" },
			endPort: { nodeId: "3", portId: "4" },
		});
		const actualFunctions = store.get(store.path("pageModel", "functions"));
		assert.equal(actualFunctions[0].sequenceConnections.length, 1);
		assert.equal(actualFunctions[0].dataConnections.length, 0);
	});

	it("addDataConnectorProcess: new connector", () => {
		const functions: PageFunction[] = [
			{
				id: "1",
				nodes: [],
				sequenceConnections: [],
				dataConnections: [],
			},
		];
		store.apply([add(store.path("pageModel", "functions"), functions), add(store.path("selectedFunctionId"), "1")]);
		addDataConnectorProcess(store)({
			startPort: { nodeId: "1", portId: "2" },
			endPort: { nodeId: "3", portId: "4" },
		});
		const actualFunctions = store.get(store.path("pageModel", "functions"));
		assert.equal(actualFunctions[0].sequenceConnections.length, 0);
		assert.equal(actualFunctions[0].dataConnections.length, 1);
	});

	it("removeSequenceConnectorProcess", () => {
		const functions: PageFunction[] = [
			{
				id: "1",
				nodes: [],
				sequenceConnections: [
					{
						id: "sc1",
						fromNode: "1",
						fromOutput: "2",
						toNode: "3",
						toInput: "4",
					},
				],
				dataConnections: [],
			},
		];
		store.apply([add(store.path("pageModel", "functions"), functions), add(store.path("selectedFunctionId"), "1")]);
		removeSequenceConnectorProcess(store)({ sequenceConnectorId: "sc1" });

		const actualFunctions = store.get(store.path("pageModel", "functions"));
		assert.equal(actualFunctions[0].sequenceConnections.length, 0);
		assert.equal(actualFunctions[0].dataConnections.length, 0);
	});

	it("removeDataConnectorProcess", () => {
		const functions: PageFunction[] = [
			{
				id: "1",
				nodes: [],
				sequenceConnections: [],
				dataConnections: [
					{
						id: "dc1",
						fromNode: "1",
						fromOutput: "2",
						toNode: "3",
						toInput: "4",
					},
				],
			},
		];
		store.apply([add(store.path("pageModel", "functions"), functions), add(store.path("selectedFunctionId"), "1")]);
		removeDataConnectorProcess(store)({ dataConnectorId: "dc1" });

		const actualFunctions = store.get(store.path("pageModel", "functions"));
		assert.equal(actualFunctions[0].sequenceConnections.length, 0);
		assert.equal(actualFunctions[0].dataConnections.length, 0);
	});

	it("updateSequenceConnectorProcess", () => {
		const functions: PageFunction[] = [
			{
				id: "1",
				nodes: [],
				sequenceConnections: [
					{
						id: "sc1",
						fromNode: "1",
						fromOutput: "2",
						toNode: "3",
						toInput: "4",
					},
				],
				dataConnections: [],
			},
		];
		store.apply([add(store.path("pageModel", "functions"), functions), add(store.path("selectedFunctionId"), "1")]);
		updateSequenceConnectorProcess(store)({
			sequenceConnectorId: "sc1",
			startPort: { nodeId: "11", portId: "22" },
			endPort: { nodeId: "33", portId: "44" },
		});

		const actualFunctions = store.get(store.path("pageModel", "functions"));
		assert.equal(actualFunctions[0].sequenceConnections.length, 1);
		assert.equal(actualFunctions[0].dataConnections.length, 0);
		assert.equal(actualFunctions[0].sequenceConnections[0].id, "sc1");
		assert.equal(actualFunctions[0].sequenceConnections[0].fromNode, "11");
		assert.equal(actualFunctions[0].sequenceConnections[0].fromOutput, "22");
		assert.equal(actualFunctions[0].sequenceConnections[0].toNode, "33");
		assert.equal(actualFunctions[0].sequenceConnections[0].toInput, "44");
	});

	it("updateDataConnectorProcess", () => {
		const functions: PageFunction[] = [
			{
				id: "1",
				nodes: [],
				sequenceConnections: [],
				dataConnections: [
					{
						id: "dc1",
						fromNode: "1",
						fromOutput: "2",
						toNode: "3",
						toInput: "4",
					},
				],
			},
		];
		store.apply([add(store.path("pageModel", "functions"), functions), add(store.path("selectedFunctionId"), "1")]);
		updateDataConnectorProcess(store)({
			dataConnectorId: "dc1",
			startPort: { nodeId: "11", portId: "22" },
			endPort: { nodeId: "33", portId: "44" },
		});

		const actualFunctions = store.get(store.path("pageModel", "functions"));
		assert.equal(actualFunctions[0].dataConnections.length, 1);
		assert.equal(actualFunctions[0].sequenceConnections.length, 0);
		assert.equal(actualFunctions[0].dataConnections[0].id, "dc1");
		assert.equal(actualFunctions[0].dataConnections[0].fromNode, "11");
		assert.equal(actualFunctions[0].dataConnections[0].fromOutput, "22");
		assert.equal(actualFunctions[0].dataConnections[0].toNode, "33");
		assert.equal(actualFunctions[0].dataConnections[0].toInput, "44");
	});

	it("updateInputDataPortValueProcess", () => {
		const functions: PageFunction[] = [
			{
				id: "1",
				nodes: [
					{
						id: "11",
						left: 1,
						top: 2,
						caption: "Set a",
						text: "",
						layout: "data",
						category: "variableSet",
						outputSequencePorts: [],
						inputDataPorts: [
							{
								id: "idp1",
								name: "value",
								type: "string",
							},
						],
						outputDataPorts: [],
					},
				],
				sequenceConnections: [],
				dataConnections: [],
			},
		];
		store.apply([add(store.path("pageModel", "functions"), functions), add(store.path("selectedFunctionId"), "1")]);

		updateInputDataPortValueProcess(store)({ inputDataPort: { nodeId: "11", portId: "idp1" }, value: "a" });

		const actualFunctions = store.get(store.path("pageModel", "functions"));
		assert.equal(actualFunctions[0].nodes[0].inputDataPorts[0].value, "a");
	});
});
