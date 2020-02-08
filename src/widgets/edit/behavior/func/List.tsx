import { create, tsx } from "@dojo/framework/core/vdom";

export interface ListProperties {}

const factory = create().properties<ListProperties>();

// 支持在此页面调整选中的部件

export default factory(function List({ properties }) {
	const {} = properties();
	return <div></div>;
});
