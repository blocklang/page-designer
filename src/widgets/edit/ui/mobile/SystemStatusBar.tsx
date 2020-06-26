import { create, tsx, invalidator, destroy } from "@dojo/framework/core/vdom";
import icache from "@dojo/framework/core/middleware/icache";
import FontAwesomeIcon from "@blocklang/dojo-fontawesome/FontAwesomeIcon";

import * as c from "@blocklang/bootstrap-classes";
import * as css from "./SystemStatusBar.m.css";

const factory = create({ invalidator, destroy, icache }).properties();

export default factory(function SystemStatusBar({ middleware: { invalidator, destroy, icache } }) {
	const intervalId = icache.getOrSet("intervalId", () => setInterval(() => invalidator(), 1000 * 60));
	destroy(() => clearInterval(intervalId));
	const now = new Date();
	return (
		<div classes={[c.row, c.px_2, c.py_1, css.root]}>
			<div classes={[c.col]}>
				<FontAwesomeIcon icon="signal" />
				<span classes={[c.mx_1]}>BlockLang</span>
				<FontAwesomeIcon icon="wifi" />
			</div>
			<div classes={[c.col, c.text_center]}>{`${now.getHours()}:${now.getMinutes()}`}</div>
			<div classes={[c.col, c.d_flex, c.justify_content_end, c.align_items_center]}>
				<span classes={[c.mr_1]}>100%</span>
				<FontAwesomeIcon icon="battery-full" />
			</div>
		</div>
	);
});
