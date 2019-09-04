import { create, tsx } from "@dojo/framework/core/vdom";

export interface UIViewProperties {}

const factory = create().properties<UIViewProperties>();

export default factory(function UIView({ properties }) {
	const {} = properties();
	return <div>界面</div>;
});
