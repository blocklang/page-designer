import { createProcess } from "@dojo/framework/stores/process";
import { commandFactory } from "./utils";
import { Project } from "../interfaces";
import { add } from "@dojo/framework/stores/state/operations";

const initProjectCommand = commandFactory<{ project: Project }>(({ path, payload: { project } }) => {
	return [add(path("project"), project)];
});

export const initProjectProcess = createProcess("init-project", [initProjectCommand]);
