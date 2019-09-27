import { createProcess } from "@dojo/framework/stores/process";
import { commandFactory } from "./utils";
import { Widget, AttachedWidget } from "../interfaces";
import { config } from "../config";
import * as format from "string-format";
import { add, replace } from "@dojo/framework/stores/state/operations";
import { findIndex } from "@dojo/framework/shim/array";
import { uuid } from "@dojo/framework/core/util";
import { getAllChildCount } from "./pageTree";

const activeWidgetCommand = commandFactory<{ activeWidgetId: string }>(({ get, path, payload: { activeWidgetId } }) => {
	const pageWidgets = get(path("pageModel", "widgets"));
	let selectedWidgetIndex = findIndex(pageWidgets, (item) => item.id === activeWidgetId);
	// 如果值为 -1，说明根据 id 没有找到，则先设置为选中父部件
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
		// 2.1 从 selectedIndex 位置开始，寻找容器部件的所有子节点的个数
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

export const insertWidgetsProcess = createProcess("insert-widgets", [insertWidgetsCommand]);

export const getPageModelProcess = createProcess("get-page-model", [getPageModelCommand]);

export const activeWidgetProcess = createProcess("active-widget", [activeWidgetCommand]);
