import { createProcess } from "@dojo/framework/stores/process";
import { commandFactory } from "./utils";
import { Widget } from "../interfaces";
import { config } from "../config";
import * as format from "string-format";
import { add, replace } from "@dojo/framework/stores/state/operations";
import { findIndex } from "@dojo/framework/shim/array";

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

const insertWidgetsCommand = commandFactory<{ widgets: Widget[] }>(({ state, payload: { widgets } }) => {
	console.log(widgets);
});

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
