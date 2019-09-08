import { commandFactory } from "./utils";
import { createProcess } from "@dojo/framework/stores/process";

const processNameCommand = commandFactory<{}>(async ({ state, payload }) => {});

// 获取项目依赖的部件列表
export const getWidgetsProcess = createProcess("get-widgets", [processNameCommand]);
