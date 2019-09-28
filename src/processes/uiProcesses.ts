import { createProcess } from "@dojo/framework/stores/process";
import { commandFactory } from "./utils";
import { Widget, AttachedWidget } from "../interfaces";
import { config } from "../config";
import * as format from "string-format";
import { add, replace, remove } from "@dojo/framework/stores/state/operations";
import { findIndex } from "@dojo/framework/shim/array";
import { uuid } from "@dojo/framework/core/util";
import { getAllChildCount, getPreviousIndex, getNextIndex, getParentIndex } from "./pageTree";

const activeWidgetCommand = commandFactory<{ activeWidgetId: string }>(({ get, path, payload: { activeWidgetId } }) => {
	const pageWidgets = get(path("pageModel", "widgets"));
	let selectedWidgetIndex = findIndex(pageWidgets, (item) => item.id === activeWidgetId);
	// 如果值为 -1，说明根据 id 没有找到，则先设置为选中根部件
	if (selectedWidgetIndex < 0) {
		console.error("设置获取焦点的部件时，在页面的部件列表中没有找到该部件");
		selectedWidgetIndex = 0;
	}
	return [replace(path("activeWidgetId"), activeWidgetId), replace(path("selectedWidgetIndex"), selectedWidgetIndex)];
});

const insertWidgetsCommand = commandFactory<{ widgets: Widget[] }>(({ get, at, path, state, payload: { widgets } }) => {
	const pageWidgets = get(path("pageModel", "widgets"));
	const selectedWidgetIndex = get(path("selectedWidgetIndex"));

	const activeWidget = pageWidgets[selectedWidgetIndex];
	// 获取父部件标识
	const parentId = activeWidget.canHasChildren ? activeWidget.id : activeWidget.parentId;
	let insertedIndex = getInsertPosition(pageWidgets, selectedWidgetIndex);

	const result = [];
	for (let i = 0; i < widgets.length; i++) {
		const widget = widgets[i];
		// 为传入的 widgets 补充 id 和 parentId 信息，其中 id 的值为 uuid
		const attachedWidget = widget as AttachedWidget;
		attachedWidget.id = uuid().replace(/-/g, "");
		attachedWidget.parentId = parentId;

		result.push(add(at(path("pageModel", "widgets"), insertedIndex), attachedWidget));
		insertedIndex++;
	}

	return result;
});

/**
 * 移动部件
 *
 * 将选中的部件往前移动一步
 */
const moveActiveWidgetPreviousCommand = commandFactory<{}>(({ at, get, path }) => {
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
	return result;
});

/**
 * 移动部件
 *
 * 将选中的部件往后移动一步
 */
const moveActiveWidgetNextCommand = commandFactory<{}>(({ at, get, path }) => {
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
	return result;
});

/**
 * 相对于当前选中的部件，改为选中父部件
 */
const activeParentWidgetCommand = commandFactory<{}>(({ get, path }) => {
	const selectedWidgetIndex = get(path("selectedWidgetIndex"));
	if (selectedWidgetIndex === 0) {
		return [];
	}
	const pageWidgets = get(path("pageModel", "widgets"));
	const parentNodeIndex = getParentIndex(pageWidgets, selectedWidgetIndex);
	if (parentNodeIndex > -1) {
		return [
			replace(path("activeWidgetId"), pageWidgets[parentNodeIndex].id),
			replace(path("selectedWidgetIndex"), parentNodeIndex)
		];
	}
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
function getInsertPosition(widgets: AttachedWidget[], selectedWidgetIndex: number) {
	let insertedIndex = 0;
	// 1. 获取选中的部件
	const selectedWidget = widgets[selectedWidgetIndex];
	// 2. 如果是容器部件，则在容器的最后一个子节点的后面添加
	if (selectedWidget.canHasChildren) {
		// 2.1 从 selectedWidgetIndex 位置开始，寻找容器部件的所有子节点的个数
		let count = getAllChildCount(widgets, selectedWidgetIndex);
		insertedIndex = selectedWidgetIndex + count;
	} else {
		// 如果不是容器部件，则在选中的部件后面添加
		insertedIndex = selectedWidgetIndex;
	}
	return insertedIndex + 1;
}

const getPageModelCommand = commandFactory(async ({ path, payload: { pageId } }) => {
	console.log("get page model command");
	const url = format(config.fetchPageModelUrl, { pageId });
	const response = await fetch(url);
	const json = await response.json();
	return [add(path("pageModel"), json)];
});

/**
 * 删除选定的部件。
 *
 * 当删除成功后，要重新设置获取焦点的部件，推算逻辑为：
 * 1. 如果当前选定的部件有前一个兄弟节点，则让其聚焦；
 * 1. 否则，查找是否有后一个兄弟节点，如有则让其聚焦；
 * 1. 否则，则让父部件聚焦。
 */
const removeActiveWidgetCommand = commandFactory<{}>(({ at, get, path }) => {
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
	const {
		selectedWidgetIndex: newSelectedWidgetIndex,
		activeWidgetId: newActiveWidgetId
	} = inferNextSelectedWidgetInfo(pageWidgets, selectedWidgetIndex);

	if (newSelectedWidgetIndex > -1) {
		result.push(replace(path("activeWidgetId"), newActiveWidgetId));
		result.push(replace(path("selectedWidgetIndex"), newSelectedWidgetIndex));
	}

	return result;
});

/**
 * 当选中的节点被删除后，推断出下一个获取焦点的部件信息
 *
 * @param pageWidgets          页面所有部件
 * @param selectedWidgetIndex  当前选中的部件索引
 *
 * @returns                     新获取焦点的部件信息
 */
function inferNextSelectedWidgetInfo(
	pageWidgets: AttachedWidget[],
	selectedWidgetIndex: number
): { selectedWidgetIndex: number; activeWidgetId: string } {
	// 寻找前一个兄弟节点
	const previousNodeIndex = getPreviousIndex(pageWidgets, selectedWidgetIndex);
	if (previousNodeIndex > -1) {
		return {
			selectedWidgetIndex: previousNodeIndex,
			activeWidgetId: pageWidgets[previousNodeIndex].id
		};
	}

	// 寻找后一个兄弟节点
	const nextNodeIndex = getNextIndex(pageWidgets, selectedWidgetIndex);
	if (nextNodeIndex > 0 /* 不需要与 -1 比较，因为前面已有一个兄弟节点 */) {
		// 要考虑在计算索引时还没有实际删除，所以索引的位置还需要再移动一次的
		// 因为会删除前一个兄弟节点，所以需要再减去 1，但是获取部件时还不能减 1，因为还没有真正删除。
		return {
			selectedWidgetIndex: nextNodeIndex - 1,
			activeWidgetId: pageWidgets[nextNodeIndex].id
		};
	}

	// 寻找父节点
	const parentNodeIndex = getParentIndex(pageWidgets, selectedWidgetIndex);
	if (parentNodeIndex > -1) {
		return {
			selectedWidgetIndex: parentNodeIndex,
			activeWidgetId: pageWidgets[parentNodeIndex].id
		};
	}

	// 如果依然没有找到，则抛出异常
	throw "没有找到下一个获取焦点的节点";
}

export const getPageModelProcess = createProcess("get-page-model", [getPageModelCommand]);
export const activeWidgetProcess = createProcess("active-widget", [activeWidgetCommand]);
export const insertWidgetsProcess = createProcess("insert-widgets", [insertWidgetsCommand]);
export const moveActiveWidgetPreviousProcess = createProcess("move-active-widget-previous", [
	moveActiveWidgetPreviousCommand
]);
export const moveActiveWidgetNextProcess = createProcess("move-active-widget-next", [moveActiveWidgetNextCommand]);
export const activeParentWidgetProcess = createProcess("active-parent-widget", [activeParentWidgetCommand]);
export const removeActiveWidgetProcess = createProcess("remove-active-widget", [removeActiveWidgetCommand]);
