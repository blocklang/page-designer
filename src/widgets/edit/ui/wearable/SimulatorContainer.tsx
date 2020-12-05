import { create, tsx } from "@dojo/framework/core/vdom";
import * as css from "./SimulatorContainer.m.css";
import icache from "@dojo/framework/core/middleware/icache";
import * as c from "@blocklang/bootstrap-classes";

const wearableImg = require("../../../../assets/wearable.png");

const factory = create({ icache }).properties();

export default factory(function WearableContainer({ children, middleware: { icache } }) {
	return (
		<div classes={[css.root]}>
			<div classes={[c.mx_auto, c.mt_4, c.bg_white]} styles={{ width: "530px" }}>
				<div classes={[c.text_center]}>Lite Wearable</div>
				<div styles={{ width: "530px", height: "626px" }} classes={[css.simulatorBox]}>
					<img src={wearableImg} classes={[c.position_absolute]} styles={{ pointerEvents: "none" }} />
					<div styles={{ width: "454px", height: "454px", borderRadius: "50%" }}>{children()}</div>
				</div>
			</div>
		</div>
	);
});
