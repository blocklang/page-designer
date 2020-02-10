import { v, w } from "@dojo/framework/core/vdom";
import { PropertyLayout, ChangedPropertyValue, PaneLayout } from "designer-core/interfaces";
import { AttachedWidgetProperty } from "designer-core/interfaces";
import { findIndex } from "@dojo/framework/shim/array";
import * as css from "./index.m.css";

export function parse(
	propertiesLayout: PropertyLayout[],
	attachedWidgetProperties: AttachedWidgetProperty[] = [],
	onPropertyChanged: (changedProperty: ChangedPropertyValue) => void,
	onChangePaneLayout: (
		paneLayout: Partial<PaneLayout>,
		data: { propertyIndex: number; propertyValue: string }
	) => void
) {
	return propertiesLayout.map((item) => {
		// 注意，此处必须严格匹配属性名
		// TODO: 编写一个 CLI 工具，校验属性名
		const index = findIndex(
			attachedWidgetProperties,
			(attachedWidgetProperty) => attachedWidgetProperty.name === item.propertyName
		);
		if (index === -1) {
			console.warn(`在部件实例的属性列表中没有找到名为 ${item.propertyName} 的属性。`);
			return;
		}
		const value = attachedWidgetProperties[index].value;
		const properties = { key: item.propertyName, index, value, onPropertyChanged, onChangePaneLayout };
		return v("div", { classes: [css.propertyItem] }, [
			v("div", [item.propertyLabel]),
			w(item.propertyWidget, properties)
		]);
	});
}
