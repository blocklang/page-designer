import { create, tsx } from "@dojo/framework/core/vdom";
import dimensions from "@dojo/framework/core/middleware/dimensions";
import OperatePane from "./operate-pane";
import Editor from "./editor";
import { Page } from "../../../interfaces";
import SimulatorContainer from "./mobile/SimulatorContainer";

export interface UIViewProperties {
	page: Page;
}

const factory = create({ dimensions }).properties<UIViewProperties>();

export default factory(function UIView({ properties, middleware: { dimensions } }) {
	// 使用 dimensions 设置 OperatePane 的初始位置
	const dimensionResult = dimensions.get("editContainer");
	const top = dimensionResult.offset.top;
	const { page } = properties();
	const { appType } = page;

	const useMobileLayout = appType !== "web";

	return (
		<virtual>
			{!useMobileLayout && (
				<div key="editContainer">
					<OperatePane top={top} />
					<Editor />
				</div>
			)}
			{useMobileLayout && (
				<SimulatorContainer>
					<div key="editContainer" classes={["h-100"]}>
						<OperatePane top={top} />
						<Editor />
					</div>
				</SimulatorContainer>
			)}
		</virtual>
	);
});
