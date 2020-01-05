import { create, v, w } from "@dojo/framework/core/vdom";
import { renderPage } from "./render";
import * as c from "bootstrap-classes";
import store from "../../../../store";
import FocusBox from "./FocusBox";
import HighlightBox from "./HighlightBox";
import {
	activeWidgetProcess,
	highlightWidgetProcess,
	changeActiveWidgetDimensionsProcess,
	unhighlightWidgetProcess,
	changeActiveWidgetPropertiesProcess
} from "../../../../processes/uiProcesses";
import { ChangedPropertyValue } from "designer-core/interfaces";

export interface EditorProperties {}

const factory = create({ store }).properties<EditorProperties>();

export default factory(function Editor({ properties, middleware: { store } }) {
	const { get, path, executor } = store;

	const {} = properties();

	const pageWidgets = get(path("pageModel", "widgets")) || [];
	if (pageWidgets.length === 0) {
		// 一个页面中至少会有一个 Page 部件。
		// 代码不应执行到此处。
		return v("div", {}, [v("div", { classes: [c.alert, c.alert_danger], role: "alert" }, ["页面中缺少根节点！"])]);
	}

	const selectedWidgetIndex = get(path("selectedWidgetIndex"));
	const activeWidget = pageWidgets[selectedWidgetIndex];

	const highlightWidgetIndex = get(path("highlightWidgetIndex"));
	const highlightWidget = pageWidgets[highlightWidgetIndex];

	// 如果聚焦的部件和高亮显示的部件是同一个，则只显示聚焦框
	const onlyShowFocusBox = highlightWidgetIndex != undefined && selectedWidgetIndex === highlightWidgetIndex;

	const ideRepos = get(path("ideRepos"));
	return v("div", {}, [
		renderPage(pageWidgets, ideRepos, {
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
			autoFocus: (widgetId) => widgetId === activeWidget.id,
			onPropertyChanged: (changedProperty: ChangedPropertyValue) => {
				const changedProperties: ChangedPropertyValue[] = [changedProperty];
				executor(changeActiveWidgetPropertiesProcess)({ changedProperties });
			}
		}),
		activeWidget && w(FocusBox, { widgets: pageWidgets, selectedWidgetIndex, widgetName: activeWidget.widgetName }),
		highlightWidget && !onlyShowFocusBox && w(HighlightBox, { widgetName: highlightWidget.widgetName })
	]);
});
