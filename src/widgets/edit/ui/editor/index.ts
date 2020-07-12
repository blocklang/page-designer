import { create, v, w } from "@dojo/framework/core/vdom";
import { renderPage } from "./render";
import * as c from "@blocklang/bootstrap-classes";
import store from "@blocklang/designer-core/store";
import FocusBox from "./FocusBox";
import HighlightBox from "./HighlightBox";
import {
	activeWidgetProcess,
	highlightWidgetProcess,
	changeActiveWidgetDimensionsProcess,
	unhighlightWidgetProcess,
	changeActiveWidgetPropertiesProcess,
} from "../../../../processes/uiProcesses";
import { ChangedPropertyValue, ComponentRepo } from "@blocklang/designer-core/interfaces";

const factory = create({ store }).properties();

export default factory(function Editor({ middleware: { store } }) {
	const { get, path, executor } = store;

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

	const projectDependencies: ComponentRepo[] = get(path("projectDependencies")) || [];
	const widgetIdeRepos = projectDependencies.filter((repo) => repo.category === "Widget");
	return v("div", { classes: ["h-100"] }, [
		renderPage(pageWidgets, widgetIdeRepos, {
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
			onPropertyChanged: (changedProperty: ChangedPropertyValue) => {
				const changedProperties: ChangedPropertyValue[] = [changedProperty];
				executor(changeActiveWidgetPropertiesProcess)({ changedProperties });
			},
			autoFocus: (widgetId) => widgetId === activeWidget.id,
		}),
		activeWidget && w(FocusBox, { widgets: pageWidgets, selectedWidgetIndex, widgetName: activeWidget.widgetName }),
		highlightWidget && !onlyShowFocusBox && w(HighlightBox, { widgetName: highlightWidget.widgetName }),
	]);
});
