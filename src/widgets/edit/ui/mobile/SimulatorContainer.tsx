import { create, tsx } from "@dojo/framework/core/vdom";
import * as css from "./SimulatorContainer.m.css";
import * as c from "@blocklang/bootstrap-classes";
import icache from "@dojo/framework/core/middleware/icache";
import SimulatorToolbar, { simulators } from "./SimulatorToolbar";

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
			{
				// 设置 key 值，是为了每次选择模拟器后，都要重新渲染
			}
			<div
				key={`${selectedSimulator.name}`}
				classes={[c.mx_auto, c.mt_4, c.bg_white]}
				styles={{ width: selectedSimulator.width + "px", height: selectedSimulator.height + "px" }}
			>
				{children()}
			</div>
		</div>
	);
});
