import { createProcess } from "@dojo/framework/stores/process";
import { commandFactory } from "./utils";
import { Project } from "@blocklang/designer-core/interfaces";
import { add } from "@dojo/framework/stores/state/operations";
import { config } from "../config";
import { clearWidgetsCommand } from "./projectDependenciesProcesses";

const initProjectCommand = commandFactory<{ project: Project }>(({ path, payload: { project } }) => {
	console.log("run init project command(如果此文本多次出现，则要考虑去除多余的设置)");
	return [add(path("project"), project)];
});

/**
 * 这里是获取设计器专用的依赖，包括 widget 的 ide 版和 service 仓库
 */
const getProjectDependenciesCommand = commandFactory(async ({ path }) => {
	console.log("run get project dependences command(如果此文本多次出现，则要考虑去除多余的设置)");
	const response = await fetch(config.fetchIdeDependenceInfosUrl, { headers: config.customFetchHeaders() });
	const json = await response.json();
	return [add(path("projectDependencies"), json)];
});

export const initProjectProcess = createProcess("init-project", [initProjectCommand]);
export const getProjectDependenciesProcess = createProcess("get-project-dependencies", [
	clearWidgetsCommand,
	getProjectDependenciesCommand,
]);
