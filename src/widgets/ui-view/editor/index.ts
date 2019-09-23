import { create, v } from "@dojo/framework/core/vdom";
import createStoreMiddleware from "@dojo/framework/core/middleware/store";
import { renderWidgets } from "./render";
import * as c from "bootstrap-classes";

export interface EditorProperties {}
const store = createStoreMiddleware();
const factory = create({ store }).properties<EditorProperties>();

export default factory(function Editor({ properties, middleware: { store } }) {
	const { get, path } = store;

	const {} = properties();

	const widgets = get(path("pageModel", "widgets"));
	if (widgets && widgets.length > 0) {
		const ideRepos = get(path("ideRepos"));
		return renderWidgets(widgets, ideRepos);
	}

	// 一个页面中至少会有一个 Page 部件。
	// 代码不应执行到此处。
	return v("div", {}, [v("div", { classes: [c.alert, c.alert_danger], role: "alert" }, ["页面中缺少根节点！"])]);
});
