import { create, tsx } from "@dojo/framework/core/vdom";
import store from "@blocklang/designer-core/store";
import * as c from "@blocklang/bootstrap-classes";
import * as css from "./index.m.css";

import { switchUIOperateTabProcess } from "../../../../../processes/designerProcesses";
import WidgetsTab from "./widgets-tab";
import PropertiesTab from "./properties-tab";

const factory = create({ store }).properties();

export default factory(function Tab({ middleware: { store } }) {
	const { get, path, executor } = store;
	const activeNav = get(path("paneLayout", "uiOperateTab")) || "widgets";

	return (
		<virtual>
			<ul classes={[c.nav, c.nav_fill]}>
				<li classes={[c.nav_item]}>
					<a
						key="nav-widgets"
						classes={[
							c.nav_link,
							activeNav === "widgets" ? c.active : c.text_muted,
							activeNav === "widgets" ? css.tabBarActive : css.tabBar,
						]}
						href="#"
						onclick={(event: MouseEvent): void => {
							event.preventDefault();
							executor(switchUIOperateTabProcess)({ tab: "widgets" });
						}}
					>
						部件
					</a>
				</li>
				<li classes={[c.nav_item]}>
					<a
						key="nav-properties"
						classes={[
							c.nav_link,
							activeNav === "properties" ? c.active : c.text_muted,
							activeNav === "properties" ? css.tabBarActive : css.tabBar,
						]}
						href="#"
						onclick={(event: MouseEvent): void => {
							event.preventDefault();
							executor(switchUIOperateTabProcess)({ tab: "properties" });
						}}
					>
						属性
					</a>
				</li>
			</ul>
			{activeNav === "widgets" ? <WidgetsTab /> : <PropertiesTab />}
		</virtual>
	);
});
