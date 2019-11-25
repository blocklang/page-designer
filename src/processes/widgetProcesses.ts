import { commandFactory } from "./utils";
import { createProcess } from "@dojo/framework/stores/process";
import { config } from "../config";
import { add, replace } from "@dojo/framework/stores/state/operations";

export const clearWidgetsCommand = commandFactory(({ path }) => {
	return [replace(path("widgetRepos"), undefined)];
});

const getWidgetsCommand = commandFactory<{}>(async ({ path }) => {
	console.log("get widgets command");
	const response = await fetch(config.fetchApiRepoWidgetsUrl, { headers: config.customFetchHeaders() });
	const json = await response.json();
	return [add(path("widgetRepos"), json)];
});

// 获取项目依赖的部件列表
export const getWidgetsProcess = createProcess("get-widgets", [getWidgetsCommand]);
