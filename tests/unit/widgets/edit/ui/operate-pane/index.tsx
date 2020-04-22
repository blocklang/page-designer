const { describe, it } = intern.getInterface("bdd");
const { assert } = intern.getPlugin("chai");

import harness from "@dojo/framework/testing/harness";
import { tsx } from "@dojo/framework/core/vdom";
import { stub } from "sinon";

import * as c from "bootstrap-classes";
import * as css from "../../../../../../src/widgets/edit/ui/operate-pane/index.m.css";

import UIOperatePane from "../../../../../../src/widgets/edit/ui/operate-pane";
import Header from "../../../../../../src/widgets/edit/ui/operate-pane/Header";
import WidgetsTab from "../../../../../../src/widgets/edit/ui/operate-pane/tabs/widgets-tab";
import PropertiesTab from "../../../../../../src/widgets/edit/ui/operate-pane/tabs/properties-tab";
import createMockStoreMiddleware from "@dojo/framework/testing/mocks/middleware/store";
import { State } from "designer-core/interfaces";
import store from "designer-core/store";
import { switchUIOperateTabProcess } from "../../../../../../src/processes/designerProcesses";
import { add } from "@dojo/framework/stores/state/operations";

describe("edit/ui/operate-pane", () => {
	it("default properties", () => {
		const h = harness(() => <UIOperatePane />);

		h.expect(() => (
			<div key="root" classes={[css.root]} styles={{ right: "0px", top: "0px" }}>
				<div key="header">
					<Header />
				</div>
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
			</div>
		));
	});

	it("active property tab", () => {
		const switchUIOperateTabProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([
			[switchUIOperateTabProcess, switchUIOperateTabProcessStub],
		]);
		const h = harness(() => <UIOperatePane />, { middleware: [[store, mockStore]] });

		h.expect(() => (
			<div key="root" classes={[css.root]} styles={{ right: "0px", top: "0px" }}>
				<div key="header">
					<Header />
				</div>
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
			</div>
		));

		h.trigger("@nav-properties", "onclick", { preventDefault: () => {} });
		assert.isTrue(switchUIOperateTabProcessStub.calledOnce);

		mockStore((path) => [add(path("paneLayout", "uiOperateTab"), "properties")]);

		h.expect(() => (
			<div key="root" classes={[css.root]} styles={{ right: "0px", top: "0px" }}>
				<div key="header">
					<Header />
				</div>
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
			</div>
		));
	});

	it("back to widgets tab", () => {
		const switchUIOperateTabProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([
			[switchUIOperateTabProcess, switchUIOperateTabProcessStub],
		]);
		const h = harness(() => <UIOperatePane />, { middleware: [[store, mockStore]] });

		h.expect(() => (
			<div key="root" classes={[css.root]} styles={{ right: "0px", top: "0px" }}>
				<div key="header">
					<Header />
				</div>
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
			</div>
		));

		h.trigger("@nav-properties", "onclick", { preventDefault: () => {} });
		assert.isTrue(switchUIOperateTabProcessStub.calledOnce);
		mockStore((path) => [add(path("paneLayout", "uiOperateTab"), "properties")]);

		h.trigger("@nav-widgets", "onclick", { preventDefault: () => {} });
		assert.isTrue(switchUIOperateTabProcessStub.calledTwice);
		mockStore((path) => [add(path("paneLayout", "uiOperateTab"), "widgets")]);

		h.expect(() => (
			<div key="root" classes={[css.root]} styles={{ right: "0px", top: "0px" }}>
				<div key="header">
					<Header />
				</div>
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
			</div>
		));
	});
});
