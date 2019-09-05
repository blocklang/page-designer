import { create, tsx } from "@dojo/framework/core/vdom";

import * as c from "bootstrap-classes";
import * as css from "./index.m.css";
import Header from "./Header";
import icache from "@dojo/framework/core/middleware/icache";
import WidgetsTab from "./widgets-tab";
import PropertiesTab from "./properties-tab";

export interface UIOperatePaneProperties {
	top?: number;
}

type NavKey = "widgets" | "properties";

const factory = create({ icache }).properties<UIOperatePaneProperties>();

export default factory(function UIOperatePane({ properties, middleware: { icache } }) {
	const { top = 0 } = properties();

	const styles = {
		right: "0px",
		top: `${top}px`
	};

	const activeNav = icache.getOrSet<NavKey>("activeNav", "widgets");

	return (
		<div key="root" classes={[css.root]} styles={styles}>
			<Header />
			<ul classes={[c.nav, "nav-fill"]}>
				<li classes={[c.nav_item]}>
					<a
						key="nav-widgets"
						classes={[c.nav_link, activeNav === "widgets" ? c.active : c.text_muted]}
						href="#"
						onclick={
							activeNav === "widgets"
								? undefined
								: () => {
										icache.set("activeNav", "widgets");
								  }
						}
					>
						部件
					</a>
				</li>
				<li classes={[c.nav_item]}>
					<a
						key="nav-properties"
						classes={[c.nav_link, activeNav === "properties" ? c.active : c.text_muted]}
						href="#"
						onclick={
							activeNav === "properties"
								? undefined
								: () => {
										icache.set("activeNav", "properties");
								  }
						}
					>
						属性
					</a>
				</li>
			</ul>
			{activeNav === "widgets" ? <WidgetsTab /> : <PropertiesTab />}
		</div>
	);
});
