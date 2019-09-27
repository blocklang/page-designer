import { create, v } from "@dojo/framework/core/vdom";
import { renderPage } from "./render";
import * as c from "bootstrap-classes";
import store from "../../../store";

export interface EditorProperties {}

const factory = create({ store }).properties<EditorProperties>();

export default factory(function Editor({ properties, middleware: { store } }) {
	const { get, path } = store;

	const {} = properties();

	const widgets = get(path("pageModel", "widgets"));

	console.log("---------pageModel =", get(path("pageModel")));
	console.log("----------- pageModel.widgets =", widgets);
	if (widgets && widgets.length > 0) {
		const ideRepos = get(path("ideRepos"));
		console.log("----------- ideRepos =", ideRepos);
		return v("div", {}, [renderPage(widgets, ideRepos)]);
	}

	// 一个页面中至少会有一个 Page 部件。
	// 代码不应执行到此处。
	return v("div", {}, [v("div", { classes: [c.alert, c.alert_danger], role: "alert" }, ["页面中缺少根节点！"])]);
});