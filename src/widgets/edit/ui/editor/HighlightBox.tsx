import { create, tsx } from "@dojo/framework/core/vdom";
import * as css from "./HighlightBox.m.css";
import Box from "./Box";
import store from "designer-core/store";
import { calculateOffset } from "../../../util";

export interface HighlightBoxProperties {
	widgetName: string;
}

const factory = create({ store }).properties<HighlightBoxProperties>();

export default factory(function HighlightBox({ properties, middleware: { store } }) {
	const { widgetName } = properties();

	const { get, path } = store;
	const highlightWidgetDimensions = get(path("highlightWidgetDimensions"));
	const { left, top, width, height } = calculateOffset(highlightWidgetDimensions);

	return (
		<Box left={left} top={top} width={width} height={height}>
			<div classes={[css.nameBar, css.nameBarPosition]}>{widgetName}</div>
		</Box>
	);
});
