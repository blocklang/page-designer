import { createProcess } from "@dojo/framework/stores/process";
import { commandFactory } from "./utils";
import { FunctionDeclaration, PageFunction, NodeConnection } from "designer-core/interfaces";
import { add, replace, remove } from "@dojo/framework/stores/state/operations";
import { findIndex } from "@dojo/framework/shim/array";
import { ConnectorPayload, PortPosition } from "./interfaces";
import { uuid } from "@dojo/framework/core/util";

// FIXME: 待确认如何实现
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

const removeFunctionNodeCommand = commandFactory<{ functionNodeId: string }>(
	({ get, path, at, payload: { functionNodeId } }) => {
		// 1. 如果当前节点是选中的节点，则重置 selectedFunctionNodeId
		// 2. 如果节点上有连线，则删除所有连线
		const functions = get(path("pageModel", "functions"));
		const currentFunctionId = get(path("selectedFunctionId"));
		const currentFunctionIndex = findIndex(functions, (func) => func.id === currentFunctionId);
		if (currentFunctionIndex === -1) {
			return;
		}
		const currentFunction = functions[currentFunctionIndex];

		const functionNodeIndex = findIndex(currentFunction.nodes, (item) => item.id === functionNodeId);
		if (functionNodeIndex === -1) {
			return;
		}

		const result = [];
		result.push(
			remove(at(path(at(path("pageModel", "functions"), currentFunctionIndex), "nodes"), functionNodeIndex))
		);

		// 如果当前节点已选中，则删除选中信息
		if (get(path("selectedFunctionNodeId")) === functionNodeId) {
			result.push(remove(path("selectedFunctionNodeId")));
		}

		// 如果当前节点上有连线，则删除所有连线
		const sequenceConnections = currentFunction.sequenceConnections || [];
		if (findIndex(sequenceConnections, (connection) => isConnected(functionNodeId, connection)) > -1) {
			result.push(
				replace(
					path(at(path("pageModel", "functions"), currentFunctionIndex), "sequenceConnections"),
					sequenceConnections.filter((connection) => !isConnected(functionNodeId, connection))
				)
			);
		}

		const dataConnections = currentFunction.dataConnections || [];
		if (findIndex(dataConnections, (connection) => isConnected(functionNodeId, connection)) > -1) {
			result.push(
				replace(
					path(at(path("pageModel", "functions"), currentFunctionIndex), "dataConnections"),
					dataConnections.filter((connection) => !isConnected(functionNodeId, connection))
				)
			);
		}

		return result;
	}
);

function isConnected(nodeId: string, connection: NodeConnection) {
	return connection.fromNode === nodeId || connection.toNode === nodeId;
}

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
					id: uuid().replace(/-/g, ""),
					fromNode: startPort.nodeId,
					fromOutput: startPort.portId,
					toNode: endPort.nodeId,
					toInput: endPort.portId
				}
			)
		];
	}
);

const removeSequenceConnectorCommand = commandFactory<{ sequenceConnectorId: string }>(
	({ get, path, at, payload: { sequenceConnectorId } }) => {
		const functions = get(path("pageModel", "functions"));
		const currentFunctionId = get(path("selectedFunctionId"));
		const currentFunctionIndex = findIndex(functions, (func) => func.id === currentFunctionId);
		if (currentFunctionIndex === -1) {
			return;
		}

		const sequenceConnections = functions[currentFunctionIndex].sequenceConnections || [];
		const removedSequenceConnectorIndex = findIndex(
			sequenceConnections,
			(connection) => connection.id === sequenceConnectorId
		);
		if (removedSequenceConnectorIndex === -1) {
			return;
		}

		return [
			remove(
				at(
					path(at(path("pageModel", "functions"), currentFunctionIndex), "sequenceConnections"),
					removedSequenceConnectorIndex
				)
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
					id: uuid().replace(/-/g, ""),
					fromNode: startPort.nodeId,
					fromOutput: startPort.portId,
					toNode: endPort.nodeId,
					toInput: endPort.portId
				}
			)
		];
	}
);

const removeDataConnectorCommand = commandFactory<{ dataConnectorId: string }>(
	({ get, path, at, payload: { dataConnectorId } }) => {
		const functions = get(path("pageModel", "functions"));
		const currentFunctionId = get(path("selectedFunctionId"));
		const currentFunctionIndex = findIndex(functions, (func) => func.id === currentFunctionId);
		if (currentFunctionIndex === -1) {
			return;
		}

		const dataConnections = functions[currentFunctionIndex].dataConnections || [];
		const removedDataConnectorIndex = findIndex(dataConnections, (connection) => connection.id === dataConnectorId);
		if (removedDataConnectorIndex === -1) {
			return;
		}

		return [
			remove(
				at(
					path(at(path("pageModel", "functions"), currentFunctionIndex), "dataConnections"),
					removedDataConnectorIndex
				)
			)
		];
	}
);

const updateSequenceConnectorCommand = commandFactory<{
	sequenceConnectorId: string;
	startPort: PortPosition;
	endPort: PortPosition;
}>(({ get, path, at, payload: { sequenceConnectorId, startPort, endPort } }) => {
	const functions = get(path("pageModel", "functions"));
	const currentFunctionId = get(path("selectedFunctionId"));
	const currentFunctionIndex = findIndex(functions, (func) => func.id === currentFunctionId);
	if (currentFunctionIndex === -1) {
		return;
	}

	const sequenceConnections = functions[currentFunctionIndex].sequenceConnections || [];
	const updatedSequenceConnectorIndex = findIndex(
		sequenceConnections,
		(connection) => connection.id === sequenceConnectorId
	);
	if (updatedSequenceConnectorIndex === -1) {
		return;
	}

	return [
		replace(
			at(
				path(at(path("pageModel", "functions"), currentFunctionIndex), "sequenceConnections"),
				updatedSequenceConnectorIndex
			),
			{
				id: sequenceConnectorId,
				fromNode: startPort.nodeId,
				fromOutput: startPort.portId,
				toNode: endPort.nodeId,
				toInput: endPort.portId
			}
		)
	];
});

const updateDataConnectorCommand = commandFactory<{
	dataConnectorId: string;
	startPort: PortPosition;
	endPort: PortPosition;
}>(({ get, path, at, payload: { dataConnectorId, startPort, endPort } }) => {
	const functions = get(path("pageModel", "functions"));
	const currentFunctionId = get(path("selectedFunctionId"));
	const currentFunctionIndex = findIndex(functions, (func) => func.id === currentFunctionId);
	if (currentFunctionIndex === -1) {
		return;
	}

	const dataConnections = functions[currentFunctionIndex].dataConnections || [];
	const updatedDataConnectorIndex = findIndex(dataConnections, (connection) => connection.id === dataConnectorId);
	if (updatedDataConnectorIndex === -1) {
		return;
	}

	return [
		replace(
			at(
				path(at(path("pageModel", "functions"), currentFunctionIndex), "dataConnections"),
				updatedDataConnectorIndex
			),
			{
				id: dataConnectorId,
				fromNode: startPort.nodeId,
				fromOutput: startPort.portId,
				toNode: endPort.nodeId,
				toInput: endPort.portId
			}
		)
	];
});

const updateInputDataPortValueCommand = commandFactory<{ inputDataPort: PortPosition; value: string }>(
	({ get, path, at, payload: { inputDataPort, value } }) => {
		const functions = get(path("pageModel", "functions"));
		const currentFunctionId = get(path("selectedFunctionId"));
		const currentFunctionIndex = findIndex(functions, (func) => func.id === currentFunctionId);
		if (currentFunctionIndex === -1) {
			return;
		}

		const nodes = functions[currentFunctionIndex].nodes;
		const functionNodeIndex = findIndex(nodes, (node) => node.id === inputDataPort.nodeId);
		if (functionNodeIndex === -1) {
			return;
		}
		const functionNode = nodes[functionNodeIndex];
		const inputDataPortIndex = findIndex(functionNode.inputDataPorts, (port) => port.id === inputDataPort.portId);
		if (inputDataPortIndex === -1) {
			return;
		}

		return [
			replace(
				path(
					at(
						path(
							at(
								path(at(path("pageModel", "functions"), currentFunctionIndex), "nodes"),
								functionNodeIndex
							),
							"inputDataPorts"
						),
						inputDataPortIndex
					),
					"value"
				),
				value
			)
		];
	}
);

export const newFunctionProcess = createProcess("new-function", [newFunctionCommand]);
export const activeFunctionProcess = createProcess("active-function", [activeFunctionCommand]);
export const activeFunctionNodeProcess = createProcess("active-function-node", [activeFunctionNodeCommand]);
export const removeFunctionNodeProcess = createProcess("remove-function-node", [removeFunctionNodeCommand]);
export const moveActiveFunctionNodeProcess = createProcess("move-active-function-node", [
	moveActiveFunctionNodeCommand
]);
export const addSequenceConnectorProcess = createProcess("add-sequence-connector", [addSequenceConnectorCommand]);
export const addDataConnectorProcess = createProcess("add-data-connector", [addDataConnectorCommand]);
export const removeSequenceConnectorProcess = createProcess("remove-sequence-connector", [
	removeSequenceConnectorCommand
]);
export const removeDataConnectorProcess = createProcess("remove-data-connector", [removeDataConnectorCommand]);
export const updateSequenceConnectorProcess = createProcess("update-sequence-connector", [
	updateSequenceConnectorCommand
]);
export const updateDataConnectorProcess = createProcess("update-data-connector", [updateDataConnectorCommand]);
export const updateInputDataPortValueProcess = createProcess("update-input-data-port-value", [
	updateInputDataPortValueCommand
]);
