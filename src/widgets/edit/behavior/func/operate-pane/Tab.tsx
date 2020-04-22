import { create, tsx } from "@dojo/framework/core/vdom";
import store from "designer-core/store";
import * as c from "bootstrap-classes";
import * as css from "./tabs/index.m.css";
import { switchBehaviorFunctionOperateTabProcess } from "../../../../../processes/designerProcesses";
import Func from "./tabs/functions-tab";
import Api from "./tabs/services-tab";

export interface TabProperties {}

const factory = create({ store }).properties<TabProperties>();

export default factory(function Tab({ properties, middleware: { store } }) {
	const {} = properties();
	const { get, path, executor } = store;
	const activeNav = get(path("paneLayout", "behaviorFunctionOperateTab")) || "services";
	return (
		<virtual>
			<ul classes={[c.nav, c.nav_fill]}>
				<li classes={[c.nav_item]}>
					<a
						key="nav-services"
						classes={[
							c.nav_link,
							activeNav === "services" ? c.active : c.text_muted,
							activeNav === "services" ? css.tabBarActive : css.tabBar,
						]}
						href="#"
						onclick={(event: MouseEvent) => {
							event.preventDefault();
							executor(switchBehaviorFunctionOperateTabProcess)({ tab: "services" });
						}}
					>
						Services
					</a>
				</li>
				<li classes={[c.nav_item]}>
					<a
						key="nav-functions"
						classes={[
							c.nav_link,
							activeNav === "functions" ? c.active : c.text_muted,
							activeNav === "functions" ? css.tabBarActive : css.tabBar,
						]}
						href="#"
						onclick={(event: MouseEvent) => {
							event.preventDefault();
							executor(switchBehaviorFunctionOperateTabProcess)({ tab: "functions" });
						}}
					>
						函数
					</a>
				</li>
			</ul>
			{activeNav === "services" ? <Api /> : <Func />}
		</virtual>
	);
});
