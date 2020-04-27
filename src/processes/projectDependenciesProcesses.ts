import { commandFactory } from "./utils";
import { createProcess } from "@dojo/framework/stores/process";
import { config } from "../config";
import { add, replace } from "@dojo/framework/stores/state/operations";

export const clearWidgetsCommand = commandFactory(({ path }) => {
	return [replace(path("repoWidgets"), undefined)];
});

const getWidgetsCommand = commandFactory(async ({ path }) => {
	console.log("get widgets command");
	const response = await fetch(config.fetchApiRepoWidgetsUrl, { headers: config.customFetchHeaders() });
	const json = await response.json();
	return [add(path("repoWidgets"), json)];
});

export const clearServicesCommand = commandFactory(({ path }) => {
	return [replace(path("repoServices"), undefined)];
});

const getServicesCommand = commandFactory(async ({ path }) => {
	console.log("get services command");
	const response = await fetch(config.fetchApiRepoServicesUrl, { headers: config.customFetchHeaders() });
	const json = await response.json();
	return [add(path("repoServices"), json)];
});

const getFunctionsCommand = commandFactory(async ({ path }) => {
	console.log("get functions command");
	const response = await fetch(config.fetchApiRepoFunctionsUrl, { headers: config.customFetchHeaders() });
	const json = await response.json();
	return [add(path("repoFunctions"), json)];
});

// 获取项目依赖的部件列表
export const getWidgetsProcess = createProcess("get-widgets", [getWidgetsCommand]);
// 获取项目依赖的服务列表
export const getServicesProcess = createProcess("get-services", [getServicesCommand]);
// 获取项目依赖的函数列表
export const getFunctionsProcess = createProcess("get-functions", [getFunctionsCommand]);
