import { createProcess } from "@dojo/framework/stores/process";
import { commandFactory } from "./utils";
import { FunctionDeclaration, PageFunction } from "designer-core/interfaces";
import { add, replace } from "@dojo/framework/stores/state/operations";
import { findIndex } from "@dojo/framework/shim/array";
import { ConnectorPayload } from "./interfaces";

const newFunctionCommand = commandFactory<{ functionDeclaration: FunctionDeclaration }>(
	({ get, path, at, payload: { functionDeclaration } }) => {
		const functions = get(path("pageModel", "functions")) || [];
		const length = functions.length;

		const func: PageFunction = {
			id: functionDeclaration.id,
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

		return [add(at(path("pageModel", "functions"), length), func)];
	}
);

const activeFunctionNodeCommand = commandFactory<{ functionNodeId: string }>(
	({ path, payload: { functionNodeId } }) => {
		return [replace(path("selectedFunctionNodeId"), functionNodeId)];
	}
);

const moveFunctionNodeCommand = commandFactory<{ functionId: string; left: number; top: number }>(
	({ get, path, at, payload: { functionId, left, top } }) => {
		// 1. 找到当前编辑的函数
		const functions = get(path("pageModel", "functions"));
		const currentFunctionIndex = findIndex(functions, (func) => func.id === functionId);
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

const addConnectorCommand = commandFactory<ConnectorPayload>(({ get, path, payload: { startPort, endPort } }) => {});

export const newFunctionProcess = createProcess("new-function", [newFunctionCommand]);
export const activeFunctionNodeProcess = createProcess("active-function-node", [activeFunctionNodeCommand]);
export const moveFunctionNodeProcess = createProcess("move-function-node", [moveFunctionNodeCommand]);
export const addConnectorProcess = createProcess("add-connector", [addConnectorCommand]);
