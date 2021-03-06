import { createProcess, ProcessCallback } from "@dojo/framework/stores/process";
import { DimensionResults } from "@dojo/framework/core/meta/Dimensions";
import { add, replace, remove } from "@dojo/framework/stores/state/operations";
import { findIndex } from "@dojo/framework/shim/array";
import { uuid, deepMixin } from "@dojo/framework/core/util";
import { Widget, AttachedWidget } from "@blocklang/designer-core/interfaces";
import {
	getAllChildCount,
	getPreviousIndex,
	getNextIndex,
	getParentIndex,
	inferNextActiveNodeIndex,
} from "@blocklang/designer-core/utils/treeUtil";
import { ChangedPropertyValue } from "@blocklang/designer-core/interfaces";

import { config } from "../config";
import { commandFactory, uiHistoryManager } from "./utils";

const activeWidgetCommand = commandFactory<{ activeWidgetId: string }>(({ get, path, payload: { activeWidgetId } }) => {
	const pageWidgets = get(path("pageModel", "widgets"));
	let selectedWidgetIndex = findIndex(pageWidgets, (item) => item.id === activeWidgetId);
	// 如果值为 -1，说明根据 id 没有找到，则先设置为选中根部件
	if (selectedWidgetIndex < 0) {
		console.error("设置获取焦点的部件时，在页面的部件列表中没有找到该部件");
		selectedWidgetIndex = 0;
	}
	return [replace(path("selectedWidgetIndex"), selectedWidgetIndex), remove(path("selectedWidgetPropertyIndex"))];
});

const activeRootWidgetCommand = commandFactory(({ path }) => {
	return [replace(path("selectedWidgetIndex"), 0)];
});

const activeWidgetPropertyCommand = commandFactory<{ propertyIndex: number }>(
	({ path, payload: { propertyIndex } }) => {
		if (propertyIndex === -1) {
			// 删除
			return [remove(path("selectedWidgetPropertyIndex"))];
		}

		return [replace(path("selectedWidgetPropertyIndex"), propertyIndex)];
	}
);

const changeActiveWidgetDimensionsCommand = commandFactory<{ activeWidgetDimensions: DimensionResults }>(
	({ path, payload: { activeWidgetDimensions } }) => {
		return [replace(path("activeWidgetDimensions"), activeWidgetDimensions)];
	}
);

const highlightWidgetCommand = commandFactory<{
	highlightWidgetId: string;
	highlightWidgetDimensions: DimensionResults;
}>(({ get, path, payload: { highlightWidgetId, highlightWidgetDimensions } }) => {
	const pageWidgets = get(path("pageModel", "widgets"));
	let highlightWidgetIndex = findIndex(pageWidgets, (item) => item.id === highlightWidgetId);
	// 如果值为 -1，说明根据 id 没有找到，则先设置为高亮根部件
	if (highlightWidgetIndex < 0) {
		console.error("设置获取焦点的部件时，在页面的部件列表中没有找到该部件");
		highlightWidgetIndex = 0;
	}
	return [
		replace(path("highlightWidgetIndex"), highlightWidgetIndex),
		replace(path("highlightWidgetDimensions"), highlightWidgetDimensions),
	];
});

const unhighlightWidgetCommand = commandFactory(({ path }) => {
	return [remove(path("highlightWidgetIndex")), remove(path("highlightWidgetDimensions"))];
});

/**
 * 获取新节点的插入位置。
 *
 * 如果源数组中有三个元素，如['one', 'two', 'three'],
 * 若需要在第二个元素，即 'two' 后插入一个新元素，则返回的值是 2。
 * 因为 0 表示在 'one' 之前插入一个元素，1 表示在 'one' 之后插入一个元素，
 * 而 2 正表示在 'two' 后插入一个元素。
 *
 * @param widgets                页面中的所有部件
 * @param selectedWidgetIndex    当前选中的部件索引
 * @returns 插入新节点的位置
 */
function getInsertPosition(widgets: AttachedWidget[], selectedWidgetIndex: number): number {
	let insertedIndex = 0;
	// 1. 获取选中的部件
	const selectedWidget = widgets[selectedWidgetIndex];
	// 2. 如果是容器部件，则在容器的最后一个子节点的后面添加
	if (selectedWidget.canHasChildren) {
		// 2.1 从 selectedWidgetIndex 位置开始，寻找容器部件的所有子节点的个数
		const count = getAllChildCount(widgets, selectedWidgetIndex);
		insertedIndex = selectedWidgetIndex + count;
	} else {
		// 如果不是容器部件，则在选中的部件后面添加
		insertedIndex = selectedWidgetIndex;
	}
	return insertedIndex + 1;
}

const insertWidgetsCommand = commandFactory<{ widgets: Widget[] }>(({ get, at, path, payload: { widgets } }) => {
	const pageWidgets = get(path("pageModel", "widgets"));
	const selectedWidgetIndex = get(path("selectedWidgetIndex"));

	const activeWidget = pageWidgets[selectedWidgetIndex];
	// 获取父部件标识
	const parentId = activeWidget.canHasChildren ? activeWidget.id : activeWidget.parentId;
	let insertedIndex = getInsertPosition(pageWidgets, selectedWidgetIndex);

	const result = [];
	for (let i = 0; i < widgets.length; i++) {
		const widget = widgets[i];
		// 此处通过展开生成一个新对象，否则会导致在 store 中的数组里面存储的是同一个对象的引用。
		// TypeScript spread creates a shallow copy，此时拷贝的是 properties 的引用，所以不能使用
		const attachedWidget = deepMixin({}, widget) as AttachedWidget;
		console.log("attachedWidget", attachedWidget);
		// 为传入的 widgets 补充 id 和 parentId 信息，其中 id 的值为 uuid
		attachedWidget.id = uuid().replace(/-/g, "");
		attachedWidget.parentId = parentId;

		// 为每个属性设置值
		attachedWidget.properties.forEach((item) => {
			item.id = uuid().replace(/-/g, "");
			if (item.defaultValue) {
				item.value = item.defaultValue;
			}
		});

		result.push(add(at(path("pageModel", "widgets"), insertedIndex), attachedWidget));
		insertedIndex++;
	}

	result.push(replace(path("dirty"), true));

	return result;
});

/**
 * 修改当前选中部件的属性值，支持一次修改多个属性
 */
const changeActiveWidgetPropertiesCommand = commandFactory<{ changedProperties: ChangedPropertyValue[] }>(
	({ get, at, path, payload: { changedProperties } }) => {
		if (changedProperties.length === 0) {
			return;
		}

		// 获取当前选中部件
		const selectedWidgetIndex = get(path("selectedWidgetIndex"));

		const result = [];
		for (let i = 0; i < changedProperties.length; i++) {
			const changedProperty = changedProperties[i];
			const originProperty = get(
				at(path(at(path("pageModel", "widgets"), selectedWidgetIndex), "properties"), changedProperty.index)
			);
			const targetProperty = {
				...originProperty,
				value: changedProperty.newValue,
				isExpr: changedProperty.isExpr,
			};
			result.push(
				replace(
					at(
						path(at(path("pageModel", "widgets"), selectedWidgetIndex), "properties"),
						changedProperty.index
					),
					targetProperty
				)
			);
		}

		result.push(replace(path("dirty"), true));
		return result;
	}
);

/**
 * 移动部件
 *
 * 将选中的部件往前移动一步
 */
const moveActiveWidgetPreviousCommand = commandFactory(({ at, get, path }) => {
	const pageWidgets = get(path("pageModel", "widgets"));
	const selectedWidgetIndex = get(path("selectedWidgetIndex"));

	const previousNodeIndex = getPreviousIndex(pageWidgets, selectedWidgetIndex);
	if (previousNodeIndex === -1) {
		return [];
	}

	// 将选中部件及其所有子部件移到前一个兄弟节点之前
	// 获取当前选中部件的所有子节点个数
	const allChildCount = getAllChildCount(pageWidgets, selectedWidgetIndex);
	// 因为目前 dojo store 不支持 move operation，所以先 remove 再 add
	const result = [];
	for (let i = selectedWidgetIndex; i <= selectedWidgetIndex + allChildCount; i++) {
		result.push(remove(at(path("pageModel", "widgets"), i)));
	}
	for (let i = selectedWidgetIndex, j = previousNodeIndex; i <= selectedWidgetIndex + allChildCount; i++, j++) {
		result.push(add(at(path("pageModel", "widgets"), j), pageWidgets[i]));
	}
	// activeWidgetId 的值没有改变
	result.push(replace(path("selectedWidgetIndex"), previousNodeIndex));

	result.push(replace(path("dirty"), true));
	return result;
});

/**
 * 移动部件
 *
 * 将选中的部件往后移动一步
 */
const moveActiveWidgetNextCommand = commandFactory(({ at, get, path }) => {
	const pageWidgets = get(path("pageModel", "widgets"));
	const selectedWidgetIndex = get(path("selectedWidgetIndex"));

	const nextNodeIndex = getNextIndex(pageWidgets, selectedWidgetIndex);
	if (nextNodeIndex === -1) {
		return [];
	}

	// 将选中部件及其所有子部件移到后一个兄弟节点的所有子节点之后
	// 因为这样处理起来需要查当前节点的所有子节点个数，也要查后一个节点的所有子节点个数
	// 为了减少一次查询，将逻辑调整为将后一个节点移到当前节点之前，这样效果是一样的。

	// 获取后一个节点的所有子节点个数
	const allNextNodeChildCount = getAllChildCount(pageWidgets, nextNodeIndex);
	// 因为目前 dojo store 不支持 move operation，所以先 remove 再 add
	const result = [];
	for (let i = nextNodeIndex; i <= nextNodeIndex + allNextNodeChildCount; i++) {
		result.push(remove(at(path("pageModel", "widgets"), i)));
	}
	for (let i = nextNodeIndex, j = selectedWidgetIndex; i <= nextNodeIndex + allNextNodeChildCount; i++, j++) {
		result.push(add(at(path("pageModel", "widgets"), j), pageWidgets[i]));
	}
	// activeWidgetId 的值没有改变
	result.push(
		replace(path("selectedWidgetIndex"), selectedWidgetIndex + 1 /*表示 next node*/ + allNextNodeChildCount)
	);

	result.push(replace(path("dirty"), true));
	return result;
});

/**
 * 相对于当前选中的部件，改为选中父部件
 */
const activeParentWidgetCommand = commandFactory(({ get, path }) => {
	const selectedWidgetIndex = get(path("selectedWidgetIndex"));
	if (selectedWidgetIndex === 0) {
		return [];
	}
	const pageWidgets = get(path("pageModel", "widgets"));
	const parentNodeIndex = getParentIndex(pageWidgets, selectedWidgetIndex);
	if (parentNodeIndex > -1) {
		return [replace(path("selectedWidgetIndex"), parentNodeIndex)];
	}
});

const getPageModelCommand = commandFactory(async ({ path }) => {
	console.log("get page model command");
	const response = await fetch(config.fetchPageModelUrl, { headers: config.customFetchHeaders() });
	const json = await response.json();
	return [add(path("pageModel"), json), add(path("selectedWidgetIndex"), 0)];
});

const savePageModelCommand = commandFactory(async ({ path, get }) => {
	const pageModel = get(path("pageModel"));
	let dirty = get(path("dirty"));
	const response = await fetch(config.savePageModelUrl, {
		method: "PUT",
		credentials: "same-origin",
		headers: { "Content-type": "application/json;charset=UTF-8", ...config.customFetchHeaders() },
		body: JSON.stringify(pageModel),
	});

	if (response.ok) {
		dirty = false;
	}

	return [replace(path("dirty"), dirty)];
});

/**
 * 删除选定的部件。
 *
 * 当删除成功后，要重新设置获取焦点的部件，推算逻辑为：
 * 1. 如果当前选定的部件有前一个兄弟节点，则让其聚焦；
 * 1. 否则，查找是否有后一个兄弟节点，如有则让其聚焦；
 * 1. 否则，则让父部件聚焦。
 */
const removeActiveWidgetCommand = commandFactory(({ at, get, path }) => {
	const selectedWidgetIndex = get(path("selectedWidgetIndex"));
	if (selectedWidgetIndex === 0) {
		// 根节点是系统默认添加的，不允许删除。
		return [];
	}

	const pageWidgets = get(path("pageModel", "widgets"));

	const allChildCount = getAllChildCount(pageWidgets, selectedWidgetIndex);
	const result = [];
	for (let i = 0; i <= allChildCount; i++) {
		result.push(remove(at(path("pageModel", "widgets"), selectedWidgetIndex)));
	}

	// 重新设置聚焦的部件
	const newSelectedWidgetIndex = inferNextActiveNodeIndex(pageWidgets, selectedWidgetIndex);
	if (newSelectedWidgetIndex > -1) {
		result.push(replace(path("selectedWidgetIndex"), newSelectedWidgetIndex));
	}

	result.push(replace(path("dirty"), true));

	return result;
});

/**
 *
 * @deprecated 通过 toast 给出提示，不再添加到页面中，所以就不需要该方法。
 *
 * 根据指定的 widgetId 来删除对应的 Widget。这里要删除的只是 UndefinedWidget。
 *
 * UndefinedWidget 部件不会获取焦点，且没有子部件。
 *
 * 注意，这里只是删除某个部件，且这个部件不能是聚焦部件，因为这里没有重设聚焦部件。
 */
const removeUndefinedWidgetCommand = commandFactory<{ widgetId: string }>(
	({ at, get, path, payload: { widgetId } }) => {
		const pageWidgets = get(path("pageModel", "widgets"));
		const undefinedWidgetIndex = findIndex(pageWidgets, (item) => item.id === widgetId);

		if (undefinedWidgetIndex <= 0) {
			// 根节点是系统默认添加的，不允许删除。
			return;
		}

		return [remove(at(path("pageModel", "widgets"), undefinedWidgetIndex))];
	}
);

const undoCallback: ProcessCallback = () => ({
	after(error, result): void {
		uiHistoryManager.undo(result.store);
		result.store.invalidate();
	},
});

const redoCallback: ProcessCallback = () => ({
	after(error, result): void {
		uiHistoryManager.redo(result.store);
		result.store.invalidate();
	},
});

export const getPageModelProcess = createProcess("get-page-model", [getPageModelCommand]);
export const savePageModelProcess = createProcess("save-page-model", [savePageModelCommand]);
export const activeWidgetProcess = createProcess("active-widget", [activeWidgetCommand]);
export const activeWidgetPropertyProcess = createProcess("active-widget-property", [activeWidgetPropertyCommand]);
export const changeActiveWidgetDimensionsProcess = createProcess("change-active-widget-dimensions", [
	changeActiveWidgetDimensionsCommand,
]);
export const highlightWidgetProcess = createProcess("highlight-widget", [highlightWidgetCommand]);
export const unhighlightWidgetProcess = createProcess("unhighlight-widget", [unhighlightWidgetCommand]);
export const insertWidgetsProcess = createProcess("insert-widgets", [insertWidgetsCommand], uiHistoryManager.callback);
export const changeActiveWidgetPropertiesProcess = createProcess("change-active-widget-properties", [
	changeActiveWidgetPropertiesCommand,
]);
export const moveActiveWidgetPreviousProcess = createProcess(
	"move-active-widget-previous",
	[moveActiveWidgetPreviousCommand],
	uiHistoryManager.callback
);
export const moveActiveWidgetNextProcess = createProcess(
	"move-active-widget-next",
	[moveActiveWidgetNextCommand],
	uiHistoryManager.callback
);
export const activeParentWidgetProcess = createProcess("active-parent-widget", [activeParentWidgetCommand]);
// 不能直接调用 dirtyCommand，因为当当前选中的是根节点时，不会做删除，如果使用 dirtyCommand，就错误的修改了 dirty 的值
export const removeActiveWidgetProcess = createProcess(
	"remove-active-widget",
	[removeActiveWidgetCommand],
	uiHistoryManager.callback
);
export const removeUndefinedWidgetProcess = createProcess("remove-undefined-widget", [removeUndefinedWidgetCommand]);

// 在 undo 之前，先将焦点设置到根部件上
export const undoProcess = createProcess("undo", [activeRootWidgetCommand], undoCallback);
// 当 redo 时，不重新设置焦点，逻辑上还没有遇到不通的地方
export const redoProcess = createProcess("redo", [], redoCallback);
