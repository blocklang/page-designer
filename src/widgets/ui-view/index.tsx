import { create, tsx } from "@dojo/framework/core/vdom";
import dimensions from "@dojo/framework/core/middleware/dimensions";
import OperatePane from "./operate-pane";

export interface UIViewProperties {}

const factory = create({ dimensions }).properties<UIViewProperties>();

export default factory(function UIView({ properties, middleware: { dimensions } }) {
	// 使用 dimensions 设置 OperatePane 的初始位置
	const dimensionResult = dimensions.get("root");
	const top = dimensionResult.offset.top;

	const {} = properties();
	return (
		<div key="root">
			<h1>界面</h1>
			<OperatePane top={top} />
		</div>
	);
});
