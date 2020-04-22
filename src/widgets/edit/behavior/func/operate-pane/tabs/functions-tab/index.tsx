import { create, tsx } from "@dojo/framework/core/vdom";

export interface FuncProperties {}

const factory = create().properties<FuncProperties>();

export default factory(function Func({ properties }) {
	const {} = properties();
	return <div>函数列表</div>;
});
