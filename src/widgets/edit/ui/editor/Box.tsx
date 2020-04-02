import { create, tsx } from "@dojo/framework/core/vdom";
import * as css from "./Box.m.css";

export interface BoxProperties {
	left: number;
	top: number;
	width: number;
	height: number;
	borderWidth?: number;
	borderColor?: string;
}

const factory = create().properties<BoxProperties>();

export default factory(function Box({ properties, children }) {
	const { left, top, width, height, borderWidth = 1, borderColor = "#0080ff" } = properties();
	return (
		<div
			classes={[css.root]}
			styles={{
				left: `${left}px`,
				top: `${top}px`,
				height: `${height}px`,
				width: `${width}px`,
				borderWidth: `${borderWidth}px`,
				borderColor,
			}}
		>
			{children()}
		</div>
	);
});
