import { v, w } from "@dojo/framework/core/vdom";
import { PropertyLayout, ChangedPropertyValue } from "designer-core/interfaces";
import { AttachedWidgetProperty } from "../../../../../interfaces";
import { findIndex } from "@dojo/framework/shim/array";

export function parse(
	propertiesLayout: PropertyLayout[],
	attachedWidgetProperties: AttachedWidgetProperty[] = [],
	onPropertyChanged: (changedProperty: ChangedPropertyValue) => void
) {
	return propertiesLayout.map((item) => {
		// 注意，此处必须严格匹配属性名
		// TODO: 编写一个 CLI 工具，校验属性名
		const index = findIndex(
			attachedWidgetProperties,
			(attachedWidgetProperty) => attachedWidgetProperty.name === item.propertyName
		);
		const value = attachedWidgetProperties[index].value;
		const properties = { key: item.propertyName, index, value, onPropertyChanged };
		return v("div", [v("div", [item.propertyLabel]), w(item.propertyWidget, properties)]);
	});
}
