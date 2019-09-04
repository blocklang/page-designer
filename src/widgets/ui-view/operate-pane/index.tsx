import { create, tsx } from "@dojo/framework/core/vdom";

export interface UIOperatePaneProperties {}

const factory = create().properties<UIOperatePaneProperties>();

export default factory(function UIOperatePane({ properties }) {
	const {} = properties();
	return <div>UI 操作面板</div>;
});
