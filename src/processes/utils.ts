import { createCommandFactory } from "@dojo/framework/stores/process";
import { State } from "../interfaces";
import HistoryManager from "@dojo/framework/stores/middleware/HistoryManager";

export const commandFactory = createCommandFactory<State>();
export const uiHistoryManager = new HistoryManager();
