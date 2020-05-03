import { createProcess } from "@dojo/framework/stores/process";
import { commandFactory } from "./utils";
import { replace } from "@dojo/framework/stores/state/operations";
import { UIOperateTab, BehaviorFunctionOperateTab } from "@blocklang/designer-core/interfaces";

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
	debugger;
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

const switchUIOperateTabCommand = commandFactory<{ tab: UIOperateTab }>(({ get, path, payload: { tab } }) => {
	const result = [];
	const editMode = get(path("paneLayout", "editMode")) || "Preview";
	if (editMode === "Preview") {
		result.push(replace(path("paneLayout", "editMode"), "Edit"));
	}

	let activePageView = get(path("paneLayout", "pageViewType")) || "ui";
	if (activePageView === "behavior") {
		result.push(replace(path("paneLayout", "pageViewType"), "ui"));
	}

	let uiOperateTab = get(path("paneLayout", "uiOperateTab")) || "widgets";
	// 如果当前处于所选状态，则什么也不做
	if (uiOperateTab !== tab) {
		if (uiOperateTab === "widgets") {
			uiOperateTab = "properties";
		} else {
			uiOperateTab = "widgets";
		}

		result.push(replace(path("paneLayout", "uiOperateTab"), uiOperateTab));
	}

	return result;
});

const switchBehaviorFunctionOperateTabCommand = commandFactory<{ tab: BehaviorFunctionOperateTab }>(
	({ get, path, payload: { tab } }) => {
		const result = [];
		const editMode = get(path("paneLayout", "editMode")) || "Preview";
		if (editMode === "Preview") {
			result.push(replace(path("paneLayout", "editMode"), "Edit"));
		}

		let activePageView = get(path("paneLayout", "pageViewType")) || "behavior";
		if (activePageView === "ui") {
			result.push(replace(path("paneLayout", "pageViewType"), "behavior"));
		}

		let operateTab = get(path("paneLayout", "behaviorFunctionOperateTab")) || "services";
		// 如果当前处于所选状态，则什么也不做
		if (tab !== operateTab) {
			if (operateTab === "services") {
				operateTab = "functions";
			} else {
				operateTab = "services";
			}

			result.push(replace(path("paneLayout", "behaviorFunctionOperateTab"), operateTab));
		}

		return result;
	}
);

export const switchEditModeProcess = createProcess("switch-edit-mode", [switchEditModeCommand]);
export const switchPageViewTypeProcess = createProcess("switch-page-view-type", [switchPageViewTypeCommand]);
export const switchUIOperateTabProcess = createProcess("switch-ui-operate-tab", [switchUIOperateTabCommand]);
export const switchBehaviorFunctionOperateTabProcess = createProcess("switch-behavior-function-operate-tab", [
	switchBehaviorFunctionOperateTabCommand,
]);
