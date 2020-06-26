import { create, tsx } from "@dojo/framework/core/vdom";
import * as css from "./SimulatorContainer.m.css";
import * as c from "@blocklang/bootstrap-classes";
import icache from "@dojo/framework/core/middleware/icache";
import SimulatorToolbar, { simulators } from "./SimulatorToolbar";
import SystemStatusBar from "./SystemStatusBar";
import MiniProgramNavigator from "./MiniProgramNavigator";

const factory = create({ icache }).properties();

export default factory(function SimulatorContainer({ children, middleware: { icache } }) {
	const selectedSimulatorIndex = icache.getOrSet("selectedSimulatorIndex", 0);
	const selectedSimulator = simulators[selectedSimulatorIndex];

	return (
		<div classes={[css.simulatorWrapper]}>
			<SimulatorToolbar
				selectedIndex={selectedSimulatorIndex}
				changeSimulator={(newIndex) => icache.set("selectedSimulatorIndex", newIndex)}
			/>
			<div
				classes={[c.mx_auto, c.mt_4, c.bg_white]}
				styles={{ width: selectedSimulator.width + "px", height: selectedSimulator.height + "px" }}
			>
				<SystemStatusBar />
				<MiniProgramNavigator />
				{children()}
			</div>
		</div>
	);
});
