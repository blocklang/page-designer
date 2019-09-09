import { commandFactory } from "./utils";
import { createProcess } from "@dojo/framework/stores/process";
import { config } from "../config";
import * as format from "string-format";
import { add } from "@dojo/framework/stores/state/operations";

const getWidgetsCommand = commandFactory<{}>(async ({ get, path }) => {
	const project = get(path("project"));

	const url = format(config.fetchApiRepoWidgetsUrl, { owner: project.createUserName, projectName: project.name });
	console.log(url);
	const response = await fetch(url);
	const json = await response.json();
	return [add(path("widgetRepos"), json)];
});

// 获取项目依赖的部件列表
export const getWidgetsProcess = createProcess("get-widgets", [getWidgetsCommand]);
