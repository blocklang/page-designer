import { create, tsx } from "@dojo/framework/core/vdom";
import dimensions from "@dojo/framework/core/middleware/dimensions";
import OperatePane from "./operate-pane";
import Editor from "./editor";

const factory = create({ dimensions }).properties();

export default factory(function UIView({ middleware: { dimensions } }) {
	// 使用 dimensions 设置 OperatePane 的初始位置
	const dimensionResult = dimensions.get("root");
	const top = dimensionResult.offset.top;

	return (
		<div key="root">
			<OperatePane top={top} />
			<Editor />
		</div>
	);
});
