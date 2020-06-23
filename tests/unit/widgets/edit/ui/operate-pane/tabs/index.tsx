const { describe, it } = intern.getInterface("bdd");
const { assert } = intern.getPlugin("chai");

import harness from "@dojo/framework/testing/harness/harness";
import { tsx } from "@dojo/framework/core/vdom";
import { stub } from "sinon";

import * as c from "@blocklang/bootstrap-classes";
import * as css from "../../../../../../../src/widgets/edit/ui/operate-pane/tabs/index.m.css";

import Tab from "../../../../../../../src/widgets/edit/ui/operate-pane/tabs";
import WidgetsTab from "../../../../../../../src/widgets/edit/ui/operate-pane/tabs/widgets-tab";
import PropertiesTab from "../../../../../../../src/widgets/edit/ui/operate-pane/tabs/properties-tab";
import createMockStoreMiddleware from "@dojo/framework/testing/mocks/middleware/store";
import { State } from "@blocklang/designer-core/interfaces";
import store from "@blocklang/designer-core/store";
import { switchUIOperateTabProcess } from "../../../../../../../src/processes/designerProcesses";
import { add } from "@dojo/framework/stores/state/operations";

describe("edit/ui/operate-pane/tabs", () => {
	it("default properties", () => {
		const h = harness(() => <Tab />);

		h.expect(() => (
			<virtual>
				<ul classes={[c.nav, "nav-fill"]}>
					<li classes={[c.nav_item]}>
						<a
							key="nav-widgets"
							classes={[c.nav_link, c.active, css.tabBarActive]}
							href="#"
							onclick={() => {}}
						>
							部件
						</a>
					</li>
					<li classes={[c.nav_item]}>
						<a
							key="nav-properties"
							classes={[c.nav_link, c.text_muted, css.tabBar]}
							href="#"
							onclick={() => {}}
						>
							属性
						</a>
					</li>
				</ul>
				<WidgetsTab />
			</virtual>
		));
	});

	it("active property tab", () => {
		const switchUIOperateTabProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([
			[switchUIOperateTabProcess, switchUIOperateTabProcessStub],
		]);
		const h = harness(() => <Tab />, { middleware: [[store, mockStore]] });

		h.expect(() => (
			<virtual>
				<ul classes={[c.nav, "nav-fill"]}>
					<li classes={[c.nav_item]}>
						<a
							key="nav-widgets"
							classes={[c.nav_link, c.active, css.tabBarActive]}
							href="#"
							onclick={() => {}}
						>
							部件
						</a>
					</li>
					<li classes={[c.nav_item]}>
						<a
							key="nav-properties"
							classes={[c.nav_link, c.text_muted, css.tabBar]}
							href="#"
							onclick={() => {}}
						>
							属性
						</a>
					</li>
				</ul>
				<WidgetsTab />
			</virtual>
		));

		h.trigger("@nav-properties", "onclick", { preventDefault: () => {} });
		assert.isTrue(switchUIOperateTabProcessStub.calledOnce);

		mockStore((path) => [add(path("paneLayout", "uiOperateTab"), "properties")]);

		h.expect(() => (
			<virtual>
				<ul classes={[c.nav, "nav-fill"]}>
					<li classes={[c.nav_item]}>
						<a
							key="nav-widgets"
							classes={[c.nav_link, c.text_muted, css.tabBar]}
							href="#"
							onclick={() => {}}
						>
							部件
						</a>
					</li>
					<li classes={[c.nav_item]}>
						<a
							key="nav-properties"
							classes={[c.nav_link, c.active, css.tabBarActive]}
							href="#"
							onclick={() => {}}
						>
							属性
						</a>
					</li>
				</ul>
				<PropertiesTab />
			</virtual>
		));
	});

	it("back to widgets tab", () => {
		const switchUIOperateTabProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([
			[switchUIOperateTabProcess, switchUIOperateTabProcessStub],
		]);
		const h = harness(() => <Tab />, { middleware: [[store, mockStore]] });

		h.expect(() => (
			<virtual>
				<ul classes={[c.nav, "nav-fill"]}>
					<li classes={[c.nav_item]}>
						<a
							key="nav-widgets"
							classes={[c.nav_link, c.active, css.tabBarActive]}
							href="#"
							onclick={() => {}}
						>
							部件
						</a>
					</li>
					<li classes={[c.nav_item]}>
						<a
							key="nav-properties"
							classes={[c.nav_link, c.text_muted, css.tabBar]}
							href="#"
							onclick={() => {}}
						>
							属性
						</a>
					</li>
				</ul>
				<WidgetsTab />
			</virtual>
		));

		h.trigger("@nav-properties", "onclick", { preventDefault: () => {} });
		assert.isTrue(switchUIOperateTabProcessStub.calledOnce);
		mockStore((path) => [add(path("paneLayout", "uiOperateTab"), "properties")]);

		h.trigger("@nav-widgets", "onclick", { preventDefault: () => {} });
		assert.isTrue(switchUIOperateTabProcessStub.calledTwice);
		mockStore((path) => [add(path("paneLayout", "uiOperateTab"), "widgets")]);

		h.expect(() => (
			<virtual>
				<ul classes={[c.nav, "nav-fill"]}>
					<li classes={[c.nav_item]}>
						<a
							key="nav-widgets"
							classes={[c.nav_link, c.active, css.tabBarActive]}
							href="#"
							onclick={() => {}}
						>
							部件
						</a>
					</li>
					<li classes={[c.nav_item]}>
						<a
							key="nav-properties"
							classes={[c.nav_link, c.text_muted, css.tabBar]}
							href="#"
							onclick={() => {}}
						>
							属性
						</a>
					</li>
				</ul>
				<WidgetsTab />
			</virtual>
		));
	});
});
