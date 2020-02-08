import { create, tsx } from "@dojo/framework/core/vdom";

export interface CanvasProperties {}

const factory = create().properties<CanvasProperties>();

export default factory(function Canvas({ properties }) {
	const {} = properties();
	return <div></div>;
});
