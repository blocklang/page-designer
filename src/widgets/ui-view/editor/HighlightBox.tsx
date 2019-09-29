import { create, tsx } from "@dojo/framework/core/vdom";
import * as css from "./HighlightBox.m.css";
import Box from "./Box";

export interface HighlightBoxProperties {
	left: number;
	top: number;
	width: number;
	height: number;
	widgetName: string;
}

const factory = create().properties<HighlightBoxProperties>();

export default factory(function HighlightBox({ properties }) {
	const { left, top, width, height, widgetName } = properties();
	return (
		<Box left={left} top={top} width={width} height={height}>
			<div classes={[css.nameBar]}>{widgetName}</div>
		</Box>
	);
});
