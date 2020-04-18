import { commandFactory } from "./utils";
import { createProcess } from "@dojo/framework/stores/process";
import { config } from "../config";
import { add, replace } from "@dojo/framework/stores/state/operations";

export const clearServicesCommand = commandFactory(({ path }) => {
	return [replace(path("repoServices"), undefined)];
});

const getServicesCommand = commandFactory<{}>(async ({ path }) => {
	console.log("get services command");
	const response = await fetch(config.fetchApiRepoServicesUrl, { headers: config.customFetchHeaders() });
	const json = await response.json();
	return [add(path("repoServices"), json)];
});

// 获取项目依赖的服务列表
export const getServicesProcess = createProcess("get-services", [getServicesCommand]);
