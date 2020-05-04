import { createProcess } from "@dojo/framework/stores/process";
import { commandFactory } from "./utils";
import {
	EventHandler,
	PageFunction,
	NodeConnection,
	VisualNode,
	DataPort,
	PropertyValueType,
	PageDataItem,
	MethodSignature,
	JsObject,
} from "@blocklang/designer-core/interfaces";
import { add, replace, remove } from "@dojo/framework/stores/state/operations";
import { findIndex } from "@dojo/framework/shim/array";
import { ConnectorPayload, PortPosition, ServicePayload } from "./interfaces";
import { uuid } from "@dojo/framework/core/util";

function isConnected(nodeId: string, connection: NodeConnection): boolean {
	return connection.fromNode === nodeId || connection.toNode === nodeId;
}

const newFunctionCommand = commandFactory<{ eventHandler: EventHandler }>(
	({ get, path, at, payload: { eventHandler } }) => {
		const functions = get(path("pageModel", "functions")) || [];
		const length = functions.length;

		// functionId 是否应设置为 uuid？
		const functionId = eventHandler.handlerId;
		const eventName = eventHandler.eventName;
		const args = eventHandler.eventInputArguments;

		const outputDataPorts = args.map((arg) => ({
			id: uuid().replace(/-/g, ""),
			name: arg.name,
			type: arg.valueType,
		}));

		const func: PageFunction = {
			id: functionId,
			nodes: [
				{
					id: uuid().replace(/-/g, ""),
					// 默认位置
					left: 20,
					top: 20,
					caption: "事件处理函数",
					text: eventName,
					layout: "flowControl",
					inputSequencePort: undefined,
					outputSequencePorts: [{ id: uuid().replace(/-/g, ""), text: "" }],
					inputDataPorts: [],
					outputDataPorts, // 由事件的输入参数确定
					category: "function",
				},
			],
			sequenceConnections: [],
			dataConnections: [],
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
			replace(path(currentFunctionNodePath, "left"), left),
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
					toInput: endPort.portId,
				}
			),
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
			),
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
					toInput: endPort.portId,
				}
			),
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
			),
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
				toInput: endPort.portId,
			}
		),
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
				toInput: endPort.portId,
			}
		),
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
			),
		];
	}
);

const addServiceNodeCommand = commandFactory<{ service: ServicePayload }>(({ get, path, at, payload: { service } }) => {
	const functions = get(path("pageModel", "functions"));
	const selectedFunctionId = get(path("selectedFunctionId"));
	const selectedFunctionIndex = findIndex(functions, (func) => func.id === selectedFunctionId);

	// 按照 path, query, head, cookie, requestBody 顺序排列
	// 按照 path, query, header, cookie 排序
	const inOrder = { path: 1, query: 2, header: 3, cookie: 4 };
	const inputDataPorts = service.parameters
		.sort((a, b) => inOrder[a.in] - inOrder[b.in])
		.map((param) => ({
			id: uuid().replace(/-/g, ""),
			name: `${param.name}(${param.in})`,
			// 如果没有设置 schema，则类型默认为 string
			type: param.schema ? (param.schema.type as PropertyValueType) : "string",
		}));

	if (service.requestBody) {
		inputDataPorts.push({
			id: uuid().replace(/-/g, ""),
			name: "body",
			type: service.requestBody.content[0].schema.type as PropertyValueType,
		});
	}

	const outputDataPorts: DataPort[] = [
		{
			id: uuid().replace(/-/g, ""),
			name: "result",
			type: "object",
		},
		{
			id: uuid().replace(/-/g, ""),
			name: "error",
			type: "object",
		},
	];

	const node: VisualNode = {
		id: uuid().replace(/-/g, ""),
		left: 30, // 跟第一个函数定义节点的位置错开
		top: 30,
		caption: `${service.httpMethod} ${service.path}`,
		text: "",
		layout: "async",
		category: "service",
		inputSequencePort: { id: uuid().replace(/-/g, "") },
		outputSequencePorts: [
			{ id: uuid().replace(/-/g, ""), text: "" },
			{ id: uuid().replace(/-/g, ""), text: "onSuccess" },
			{ id: uuid().replace(/-/g, ""), text: "onFail" },
		],
		inputDataPorts,
		outputDataPorts,
	};

	const selectedFunctionPath = at(path("pageModel", "functions"), selectedFunctionIndex);
	const nodesLength = functions[selectedFunctionIndex].nodes.length;

	return [add(at(path(selectedFunctionPath, "nodes"), nodesLength), node)];
});

const addVariableGetNodeCommand = commandFactory<{ dataItem: PageDataItem }>(
	({ get, path, at, payload: { dataItem } }) => {
		const functions = get(path("pageModel", "functions"));
		const selectedFunctionId = get(path("selectedFunctionId"));
		const selectedFunctionIndex = findIndex(functions, (func) => func.id === selectedFunctionId);

		const node: VisualNode = {
			id: uuid().replace(/-/g, ""),
			left: 30, // 跟第一个函数定义节点的位置错开
			top: 30,
			caption: `Get ${dataItem.name}`,
			text: "",
			layout: "data",
			category: "variableGet",
			dataItemId: dataItem.id,
			inputSequencePort: undefined,
			outputSequencePorts: [],
			inputDataPorts: [],
			outputDataPorts: [
				{ id: uuid().replace(/-/g, ""), name: "value", type: dataItem.type as PropertyValueType },
			],
		};

		const selectedFunctionPath = at(path("pageModel", "functions"), selectedFunctionIndex);
		const nodesLength = functions[selectedFunctionIndex].nodes.length;

		return [add(at(path(selectedFunctionPath, "nodes"), nodesLength), node)];
	}
);

const addVariableSetNodeCommand = commandFactory<{ dataItem: PageDataItem }>(
	({ get, path, at, payload: { dataItem } }) => {
		const functions = get(path("pageModel", "functions"));
		const selectedFunctionId = get(path("selectedFunctionId"));
		const selectedFunctionIndex = findIndex(functions, (func) => func.id === selectedFunctionId);

		const node: VisualNode = {
			id: uuid().replace(/-/g, ""),
			left: 30, // 跟第一个函数定义节点的位置错开
			top: 30,
			caption: `Set ${dataItem.name}`,
			text: "",
			layout: "data",
			category: "variableSet",
			dataItemId: dataItem.id,
			inputSequencePort: { id: uuid().replace(/-/g, "") },
			outputSequencePorts: [{ id: uuid().replace(/-/g, ""), text: "" }],
			inputDataPorts: [{ id: uuid().replace(/-/g, ""), name: "set", type: dataItem.type as PropertyValueType }],
			outputDataPorts: [],
		};

		const selectedFunctionPath = at(path("pageModel", "functions"), selectedFunctionIndex);
		const nodesLength = functions[selectedFunctionIndex].nodes.length;

		return [add(at(path(selectedFunctionPath, "nodes"), nodesLength), node)];
	}
);

const addFunctionNodeCommand = commandFactory<{
	apiRepoId: number;
	jsObject: JsObject;
	methodSignature: MethodSignature;
}>(({ get, path, at, payload: { apiRepoId, jsObject, methodSignature } }) => {
	const functions = get(path("pageModel", "functions"));
	const selectedFunctionId = get(path("selectedFunctionId"));
	const selectedFunctionIndex = findIndex(functions, (item) => item.id === selectedFunctionId);

	const { code: funcCode, name: funcName, parameters, returnType } = methodSignature;
	// TODO: 要支持可变参数，可变参数必须是最后一个参数。
	const inputDataPorts = parameters.map((param) => ({
		id: uuid().replace(/-/g, ""),
		name: param.name,
		type: param.type as PropertyValueType,
	}));
	// 一个函数只能由一个返回结果
	const outputDataPorts = [];
	if (returnType && returnType !== "void") {
		outputDataPorts.push({
			id: uuid().replace(/-/g, ""),
			name: "", // 返回结果可不显示文本，因为只有一个返回结果，可以不用文本区分
			type: returnType as PropertyValueType, //TODO: 支持自定义接口
		});
	}

	const node: VisualNode = {
		id: uuid().replace(/-/g, ""),
		left: 30, // 跟第一个函数定义节点的位置错开
		top: 30,
		caption: `${jsObject.name}.${methodSignature.name}`,
		text: "",
		layout: "data", // TODO: 如果只有一套布局，则不再需要此属性
		category: "functionCall",
		inputSequencePort: { id: uuid().replace(/-/g, "") },
		outputSequencePorts: [{ id: uuid().replace(/-/g, ""), text: "" }],
		inputDataPorts,
		outputDataPorts,

		bindSource: "webApi",
		apiRepoId,
		funcInfo: { objectCode: jsObject.code, objectName: jsObject.name, funcCode, funcName },
	};

	const selectedFunctionPath = at(path("pageModel", "functions"), selectedFunctionIndex);
	const nodesLength = functions[selectedFunctionIndex].nodes.length;

	return [add(at(path(selectedFunctionPath, "nodes"), nodesLength), node)];
});

export const newFunctionProcess = createProcess("new-function", [newFunctionCommand]);
export const activeFunctionProcess = createProcess("active-function", [activeFunctionCommand]);
export const activeFunctionNodeProcess = createProcess("active-function-node", [activeFunctionNodeCommand]);
export const removeFunctionNodeProcess = createProcess("remove-function-node", [removeFunctionNodeCommand]);
export const moveActiveFunctionNodeProcess = createProcess("move-active-function-node", [
	moveActiveFunctionNodeCommand,
]);
export const addSequenceConnectorProcess = createProcess("add-sequence-connector", [addSequenceConnectorCommand]);
export const addDataConnectorProcess = createProcess("add-data-connector", [addDataConnectorCommand]);
export const removeSequenceConnectorProcess = createProcess("remove-sequence-connector", [
	removeSequenceConnectorCommand,
]);
export const removeDataConnectorProcess = createProcess("remove-data-connector", [removeDataConnectorCommand]);
export const updateSequenceConnectorProcess = createProcess("update-sequence-connector", [
	updateSequenceConnectorCommand,
]);
export const updateDataConnectorProcess = createProcess("update-data-connector", [updateDataConnectorCommand]);
export const updateInputDataPortValueProcess = createProcess("update-input-data-port-value", [
	updateInputDataPortValueCommand,
]);

export const addServiceNodeProcess = createProcess("add-service-node", [addServiceNodeCommand]);
export const addVariableGetNodeProcess = createProcess("add-variable-get-node", [addVariableGetNodeCommand]);
export const addVariableSetNodeProcess = createProcess("add-variable-set-node", [addVariableSetNodeCommand]);
// 往设计器中添加一个调用客户端函数的节点
export const addFunctionNodeProcess = createProcess("add-function-node", [addFunctionNodeCommand]);
