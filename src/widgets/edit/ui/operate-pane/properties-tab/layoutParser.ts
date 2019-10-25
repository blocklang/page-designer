import { v, w } from "@dojo/framework/core/vdom";
import { PropertyLayout } from "designer-core/interfaces";

export function parse(propertiesLayout: PropertyLayout[]) {
	return propertiesLayout.map((item) => {
		return v("div", [v("div", [item.propertyLabel]), w(item.propertyWidget, {})]);
	});
}
