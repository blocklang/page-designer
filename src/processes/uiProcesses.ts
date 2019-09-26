import { createProcess } from "@dojo/framework/stores/process";
import { commandFactory } from "./utils";
import { Widget } from "../interfaces";
import { config } from "../config";
import * as format from "string-format";
import { add } from "@dojo/framework/stores/state/operations";

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
