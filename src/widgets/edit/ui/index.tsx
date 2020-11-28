import { create, tsx } from "@dojo/framework/core/vdom";
import dimensions from "@dojo/framework/core/middleware/dimensions";
import OperatePane from "./operate-pane";
import Editor from "./editor";
import { Page } from "../../../interfaces";
import MobileSimulatorContainer from "./mobile/SimulatorContainer";
import WearableSimulatorContainer from "./wearable/SimulatorContainer";

export interface UIViewProperties {
	page: Page;
}

const factory = create({ dimensions }).properties<UIViewProperties>();

export default factory(function UIView({ properties, middleware: { dimensions } }) {
	// 使用 dimensions 设置 OperatePane 的初始位置
	const dimensionResult = dimensions.get("editContainer");
	const top = dimensionResult.offset.top;
	const { page } = properties();
	const { appType, deviceType } = page;

	console.log("appType", appType, "deviceType", deviceType);

	if (appType === "web") {
		// 01
		return (
			<div key="editContainer">
				<OperatePane top={top} />
				<Editor />
			</div>
		);
	}

	if (appType === "mobile" || appType === "miniProgram") {
		// 02 或 03
		return (
			<MobileSimulatorContainer>
				<div key="editContainer" classes={["h-100"]}>
					<OperatePane top={top} />
					<Editor />
				</div>
			</MobileSimulatorContainer>
		);
	}

	if (appType === "harmonyOS") {
		// 04
		if (deviceType === "05") {
			// Lite Wearable
			return (
				<WearableSimulatorContainer>
					<div key="editContainer" classes={["h-100"]}>
						<OperatePane top={top} />
						<Editor />
					</div>
				</WearableSimulatorContainer>
			);
		}
	}
});
