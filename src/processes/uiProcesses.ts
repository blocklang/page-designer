import { createProcess } from "@dojo/framework/stores/process";
import { commandFactory } from "./utils";
import { Widget } from "../interfaces";

const insertWidgetsCommand = commandFactory<{ widgets: Widget[] }>(({ state, payload: { widgets } }) => {
	console.log(widgets);
});

export const insertWidgetsProcess = createProcess("insert-widgets", [insertWidgetsCommand]);

export const getPageModelProcess = createProcess("get-page-model", []);
