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

export const switchEditModeProcess = createProcess("switch-edit-mode-process", [switchEditModeCommand]);
export const switchPageViewTypeProcess = createProcess("switch-page-view-type-process", [switchPageViewTypeCommand]);
