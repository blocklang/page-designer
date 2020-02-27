import { createProcess } from "@dojo/framework/stores/process";
import { commandFactory } from "./utils";
import { FunctionDeclaration, PageFunction } from "designer-core/interfaces";
import { add, replace } from "@dojo/framework/stores/state/operations";
import { findIndex } from "@dojo/framework/shim/array";
import { ConnectorPayload } from "./interfaces";
import { uuid } from "@dojo/framework/core/util";

const newFunctionCommand = commandFactory<{ functionDeclaration: FunctionDeclaration }>(
	({ get, path, at, payload: { functionDeclaration } }) => {
		const functions = get(path("pageModel", "functions")) || [];
		const length = functions.length;

		// functionId 是否应设置为 uuid？
		const functionId = functionDeclaration.id;

		const func: PageFunction = {
			id: functionId,
			nodes: [
				{
					id: functionDeclaration.id,
					top: 20, // 默认位置
					left: 20,
					caption: "函数",
					text: "",
					category: "flowControl",
					inputSequencePort: undefined,
					outputSequencePorts: [],
					inputDataPorts: [],
					outputDataPorts: []
				}
			],
			sequenceConnections: [],
			dataConnections: []
		};

		return [add(at(path("pageModel", "functions"), length), func), replace(path("selectedFunctionId"), functionId)];
	}
);

const activeFunctionCommand = commandFactory<{ functionId: string }>(({ path, payload: { functionId } }) => {
	return [replace(path("selectedFunctionId"), functionId)];
});

const activeFunctionNodeCommand = commandFactory<{ functionNodeId: string }>(
	({ path, payload: { functionNodeId } }) => {
		return [replace(path("selectedFunctionNodeId"), functionNodeId)];
	}
);

const moveActiveFunctionNodeCommand = commandFactory<{ left: number; top: number }>(
	({ get, path, at, payload: { left, top } }) => {
		// 1. 找到当前编辑的函数
		const functions = get(path("pageModel", "functions"));
		const currentFunctionId = get(path("selectedFunctionId"));
		const currentFunctionIndex = findIndex(functions, (func) => func.id === currentFunctionId);
		if (currentFunctionIndex === -1) {
			return;
		}
		const currentFunction = functions[currentFunctionIndex];
		// 2. 再从其中找到当前编辑的函数节点
		const selectedFunctionNodeId = get(path("selectedFunctionNodeId"));
		const selectedFunctionNodeIndex = findIndex(
			currentFunction.nodes,
			(item) => item.id === selectedFunctionNodeId
		);
		if (selectedFunctionNodeIndex === -1) {
			return;
		}

		const currentFunctionPath = at(path("pageModel", "functions"), currentFunctionIndex);
		const currentFunctionNodePath = at(path(currentFunctionPath, "nodes"), selectedFunctionNodeIndex);
		return [
			replace(path(currentFunctionNodePath, "top"), top),
			replace(path(currentFunctionNodePath, "left"), left)
		];
	}
);

const addSequenceConnectorCommand = commandFactory<ConnectorPayload>(
	({ get, path, at, payload: { startPort, endPort } }) => {
		const selectedFunctionId = get(path("selectedFunctionId"));
		const functions = get(path("pageModel", "functions"));
		const activeFunctionIndex = findIndex(functions, (func) => func.id === selectedFunctionId);
		if (activeFunctionIndex === -1) {
			return;
		}

		const sequenceConnections = functions[activeFunctionIndex].sequenceConnections || [];

		return [
			add(
				at(
					path(at(path("pageModel", "functions"), activeFunctionIndex), "sequenceConnections"),
					sequenceConnections.length
				),
				{
					id: uuid().replace("-", ""),
					fromNode: startPort.nodeId,
					fromOutput: startPort.portId,
					toNode: endPort.nodeId,
					toInput: endPort.portId
				}
			)
		];
	}
);

const addDataConnectorCommand = commandFactory<ConnectorPayload>(
	({ get, path, at, payload: { startPort, endPort } }) => {
		const selectedFunctionId = get(path("selectedFunctionId"));
		const functions = get(path("pageModel", "functions"));
		const activeFunctionIndex = findIndex(functions, (func) => func.id === selectedFunctionId);
		if (activeFunctionIndex === -1) {
			return;
		}

		const dataConnections = functions[activeFunctionIndex].dataConnections || [];
		return [
			add(
				at(
					path(at(path("pageModel", "functions"), activeFunctionIndex), "dataConnections"),
					dataConnections.length
				),
				{
					id: uuid().replace("-", ""),
					fromNode: startPort.nodeId,
					fromOutput: startPort.portId,
					toNode: endPort.nodeId,
					toInput: endPort.portId
				}
			)
		];
	}
);

export const newFunctionProcess = createProcess("new-function", [newFunctionCommand]);
export const activeFunctionProcess = createProcess("active-function", [activeFunctionCommand]);
export const activeFunctionNodeProcess = createProcess("active-function-node", [activeFunctionNodeCommand]);
export const moveActiveFunctionNodeProcess = createProcess("move-active-function-node", [
	moveActiveFunctionNodeCommand
]);
export const addSequenceConnectorProcess = createProcess("add-sequence-connector", [addSequenceConnectorCommand]);
export const addDataConnectorProcess = createProcess("add-data-connector", [addDataConnectorCommand]);
