import { create, tsx } from "@dojo/framework/core/vdom";
import { PageFunction, AttachedWidget, AttachedWidgetProperty } from "designer-core/interfaces";
import store from "designer-core/store";
import * as c from "bootstrap-classes";
import { getNodePath } from "designer-core/utils/treeUtil";
import * as css from "./index.m.css";

export interface EditorProperties {
	functions: PageFunction[];
	widgets: AttachedWidget[];
}

const factory = create({ store }).properties<EditorProperties>();

export default factory(function Editor({ properties, middleware: { store } }) {
	const { widgets = [] } = properties();

	const { get, path } = store;

	function getActiveWidget(): { node: AttachedWidget; index: number } | undefined {
		if (widgets.length === 0) {
			console.warn("页面中未添加部件。");
			return;
		}

		const selectedWidgetIndex = get(path("selectedWidgetIndex"));
		if (selectedWidgetIndex == undefined || selectedWidgetIndex === -1) {
			console.warn(`selectedWidgetIndex 的值为 ${selectedWidgetIndex}。`);
			return;
		}

		const activeWidget = widgets[selectedWidgetIndex];
		if (!activeWidget) {
			console.warn(`在页面的 widgets 列表中未找到索引为 ${selectedWidgetIndex} 的部件。`);
			return;
		}

		return { node: activeWidget, index: selectedWidgetIndex };
	}

	function getActiveProperty(activeWidget: AttachedWidget): AttachedWidgetProperty | undefined {
		const selectedWidgetPropertyIndex = get(path("selectedWidgetPropertyIndex"));
		if (selectedWidgetPropertyIndex == undefined || selectedWidgetPropertyIndex === -1) {
			console.warn(`selectedWidgetPropertyIndex 的值为 ${selectedWidgetPropertyIndex}。`);
			return;
		}

		const activeWidgetProperty = activeWidget.properties[selectedWidgetPropertyIndex];
		if (!activeWidgetProperty) {
			console.warn(`在当前选中的部件中未找到索引为 ${selectedWidgetPropertyIndex} 的属性。`);
			return;
		}

		if (activeWidgetProperty.valueType !== "function") {
			console.warn(
				`只能编辑值类型为 function 的属性，但当前选中的属性值类型为 ${activeWidgetProperty.valueType}。`
			);
			return;
		}

		return activeWidgetProperty;
	}

	const activeWidget = getActiveWidget();
	const activeWidgetProperty = activeWidget && getActiveProperty(activeWidget.node);

	if (!activeWidget || !activeWidgetProperty) {
		return (
			<div key="root">
				<div key="title-bar">
					<span key="title">页面行为</span>
					<small classes={[c.ml_2, c.text_info]}>请先选择事件</small>
				</div>
				<div key="empty" classes={[c.text_center, c.p_5, c.border, c.mb_4, css.canvas]}>
					<span classes={[c.text_muted]}>
						在“界面/操作面板/属性选项卡”中选择一个事件后，在此处定义事件处理函数。
					</span>
				</div>
			</div>
		);
	}

	// 获取所有父部件
	const nodePath = getNodePath(widgets, activeWidget.index);
	const parentWidgetPathes = nodePath
		.map(({ node, index }) => {
			if (index === -1) {
				return node.widgetName;
			}
			return `[${index}]${node.widgetName}`;
		})
		.join(" / ");

	return (
		<div key="root">
			<div key="title-bar">
				<span key="title">页面行为</span>
				<small classes={[c.ml_2, c.text_muted]}>
					{`${parentWidgetPathes} / `}
					<strong>{`${activeWidgetProperty.name}`}</strong>
				</small>
			</div>
			<div key="editor" classes={[c.border, css.canvas]}></div>
		</div>
	);
});
