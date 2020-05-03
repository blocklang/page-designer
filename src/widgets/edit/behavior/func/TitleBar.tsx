import { create, tsx } from "@dojo/framework/core/vdom";
import { AttachedWidget, AttachedWidgetProperty } from "@blocklang/designer-core/interfaces";
import * as c from "bootstrap-classes";
import { getNodePath } from "@blocklang/designer-core/utils/treeUtil";
export interface TitleBarProperties {
	selectedWidgetIndex: number;
	activeWidget?: AttachedWidget;
	widgets: AttachedWidget[];
	activeWidgetProperty?: AttachedWidgetProperty;
}

const factory = create().properties<TitleBarProperties>();

export default factory(function TitleBar({ properties }) {
	const { selectedWidgetIndex, activeWidget, widgets, activeWidgetProperty } = properties();
	if (!activeWidget || !activeWidgetProperty) {
		return (
			<div key="root">
				<span>页面行为</span>
				<small classes={[c.ml_2, c.text_info]}>请先选择事件</small>
			</div>
		);
	}

	// 获取所有父部件
	const nodePath = getNodePath(widgets, selectedWidgetIndex);
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
			<span>页面行为</span>
			<small classes={[c.ml_2, c.text_muted]}>
				{`${parentWidgetPathes} / `}
				<strong>{`${activeWidgetProperty.name}`}</strong>
			</small>
		</div>
	);
});
