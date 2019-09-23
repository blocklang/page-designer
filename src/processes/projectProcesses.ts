import { createProcess } from "@dojo/framework/stores/process";
import { commandFactory } from "./utils";
import { Project } from "../interfaces";
import { add } from "@dojo/framework/stores/state/operations";
import { config } from "../config";
import * as format from "string-format";

const initProjectCommand = commandFactory<{ project: Project }>(({ path, payload: { project } }) => {
	console.log("run init project command(如果此文本多次出现，则要考虑去除多余的设置)");
	return [add(path("project"), project)];
});

const getProjectIdeDependencesCommand = commandFactory(async ({ get, path }) => {
	console.log("run get project ide dependences command(如果此文本多次出现，则要考虑去除多余的设置)");
	const project = get(path("project"));

	const url = format(config.fetchIdeDependenceInfosUrl, { projectId: project.id });
	const response = await fetch(url);
	const json = await response.json();
	return [add(path("ideRepos"), json)];
});

export const initProjectProcess = createProcess("init-project", [initProjectCommand]);
export const getProjectIdeDependencesProcess = createProcess("get-project-ide-dependences", [
	getProjectIdeDependencesCommand
]);
