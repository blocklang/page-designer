import { commandFactory } from "./utils";
import { createProcess } from "@dojo/framework/stores/process";
import { config } from "../config";
import { add, replace } from "@dojo/framework/stores/state/operations";
import { findIndex } from "@dojo/framework/shim/array";
import { VisualNode, PropertyValueType, DataPort } from "designer-core/interfaces";
import { uuid } from "@dojo/framework/core/util";
import { ServicePayload } from "./interfaces";

export const clearServicesCommand = commandFactory(({ path }) => {
	return [replace(path("repoServices"), undefined)];
});

const getServicesCommand = commandFactory<{}>(async ({ path }) => {
	console.log("get services command");
	const response = await fetch(config.fetchApiRepoServicesUrl, { headers: config.customFetchHeaders() });
	const json = await response.json();
	return [add(path("repoServices"), json)];
});

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
			type: param.schema!.type as PropertyValueType,
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

// 获取项目依赖的服务列表
export const getServicesProcess = createProcess("get-services", [getServicesCommand]);
export const addServiceNodeProcess = createProcess("add-service-node", [addServiceNodeCommand]);
