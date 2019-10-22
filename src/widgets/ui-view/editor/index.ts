import { create, v, w } from "@dojo/framework/core/vdom";
import { renderPage } from "./render";
import * as c from "bootstrap-classes";
import store from "../../../store";
import FocusBox from "./FocusBox";
import HighlightBox from "./HighlightBox";
import {
	activeWidgetProcess,
	highlightWidgetProcess,
	changeActiveWidgetDimensionsProcess,
	unhighlightWidgetProcess
} from "../../../processes/uiProcesses";

export interface EditorProperties {}

const factory = create({ store }).properties<EditorProperties>();

export default factory(function Editor({ properties, middleware: { store } }) {
	const { get, path, executor } = store;

	const {} = properties();

	const widgets = get(path("pageModel", "widgets"));
	if (!widgets || widgets.length === 0) {
		// 一个页面中至少会有一个 Page 部件。
		// 代码不应执行到此处。
		return v("div", {}, [v("div", { classes: [c.alert, c.alert_danger], role: "alert" }, ["页面中缺少根节点！"])]);
	}

	const selectedWidgetIndex = get(path("selectedWidgetIndex"));
	const activeWidget = widgets[selectedWidgetIndex];

	const highlightWidgetIndex = get(path("highlightWidgetIndex"));
	const highlightWidget = widgets[highlightWidgetIndex];

	// 如果聚焦的部件和高亮显示的部件是同一个，则只显示聚焦框
	const onlyShowFocusBox = highlightWidgetIndex != undefined && selectedWidgetIndex === highlightWidgetIndex;

	if (widgets && widgets.length > 0) {
		const ideRepos = get(path("ideRepos"));
		return v("div", {}, [
			renderPage(widgets, ideRepos, {
				onFocusing: (activeWidgetId) => {
					executor(activeWidgetProcess)({ activeWidgetId });
				},
				onFocused: (activeWidgetDimensions) => {
					executor(changeActiveWidgetDimensionsProcess)({ activeWidgetDimensions });
				},
				onHighlight: ({ highlightWidgetId, highlightWidgetDimensions }) => {
					executor(highlightWidgetProcess)({ highlightWidgetId, highlightWidgetDimensions });
				},
				onUnhighlight: () => {
					executor(unhighlightWidgetProcess)({});
				},
				autoFocus: (widgetId) => widgetId === activeWidget.id
			}),
			activeWidget && w(FocusBox, { widgets, selectedWidgetIndex, widgetName: activeWidget.widgetName }),
			highlightWidget && !onlyShowFocusBox && w(HighlightBox, { widgetName: highlightWidget.widgetName })
		]);
	}
});
