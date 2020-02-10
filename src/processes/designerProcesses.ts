import { createProcess } from "@dojo/framework/stores/process";
import { commandFactory } from "./utils";
import { replace } from "@dojo/framework/stores/state/operations";

const switchEditModeCommand = commandFactory(({ get, path }) => {
	let editMode = get(path("paneLayout", "editMode")) || "Preview";
	if (editMode === "Preview") {
		editMode = "Edit";
	} else {
		editMode = "Preview";
	}
	return [replace(path("paneLayout", "editMode"), editMode)];
});

const switchPageViewTypeCommand = commandFactory(({ get, path }) => {
	const result = [];
	const editMode = get(path("paneLayout", "editMode")) || "Preview";
	if (editMode === "Preview") {
		result.push(replace(path("paneLayout", "editMode"), "Edit"));
	}

	let activePageView = get(path("paneLayout", "pageViewType")) || "ui";
	if (activePageView === "ui") {
		activePageView = "behavior";
	} else {
		activePageView = "ui";
	}

	result.push(replace(path("paneLayout", "pageViewType"), activePageView));
	return result;
});

const switchToFuncEditViewCommand = commandFactory(({ get, path }) => {
	const result = [];
	const editMode = get(path("paneLayout", "editMode")) || "Preview";
	if (editMode === "Preview") {
		result.push(replace(path("paneLayout", "editMode"), "Edit"));
	}

	const activePageView = get(path("paneLayout", "pageViewType")) || "ui";
	if (activePageView === "ui") {
		result.push(replace(path("paneLayout", "pageViewType"), "behavior"));
	}

	const activeFuncView = get(path("paneLayout", "funcViewType")) || "funcList";
	if (activeFuncView === "funcList") {
		result.push(replace(path("paneLayout", "funcViewType"), "funcItem"));
	}

	return result;
});

export const switchEditModeProcess = createProcess("switch-edit-mode", [switchEditModeCommand]);
export const switchPageViewTypeProcess = createProcess("switch-page-view-type", [switchPageViewTypeCommand]);
export const switchToFuncEditViewProcess = createProcess("switch-to-func-edit-view", [switchToFuncEditViewCommand]);
