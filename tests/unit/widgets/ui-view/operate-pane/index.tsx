const { describe, it } = intern.getInterface("bdd");

import harness from "@dojo/framework/testing/harness";
import { tsx } from "@dojo/framework/core/vdom";

import * as c from "bootstrap-classes";
import * as css from "../../../../../src/widgets/ui-view/operate-pane/index.m.css";

import UIOperatePane from "../../../../../src/widgets/ui-view/operate-pane";
import Header from "../../../../../src/widgets/ui-view/operate-pane/Header";

describe("ui-view/operate-pane", () => {
	it("default properties", () => {
		const h = harness(() => <UIOperatePane />);

		h.expect(() => (
			<div key="root" classes={[css.root]} styles={{ right: "0px", top: "0px" }}>
				<Header />
				<ul classes={[c.nav, "nav-fill"]}>
					<li classes={[c.nav_item]}>
						<a key="nav-widgets" classes={[c.nav_link, c.active]} href="#" onclick={undefined}>
							部件
						</a>
					</li>
					<li classes={[c.nav_item]}>
						<a key="nav-properties" classes={[c.nav_link, c.text_muted]} href="#" onclick={() => {}}>
							属性
						</a>
					</li>
				</ul>
				<div>部件</div>
			</div>
		));
	});

	it("active property tab", () => {
		const h = harness(() => <UIOperatePane />);

		h.expect(() => (
			<div key="root" classes={[css.root]} styles={{ right: "0px", top: "0px" }}>
				<Header />
				<ul classes={[c.nav, "nav-fill"]}>
					<li classes={[c.nav_item]}>
						<a key="nav-widgets" classes={[c.nav_link, c.active]} href="#" onclick={undefined}>
							部件
						</a>
					</li>
					<li classes={[c.nav_item]}>
						<a key="nav-properties" classes={[c.nav_link, c.text_muted]} href="#" onclick={() => {}}>
							属性
						</a>
					</li>
				</ul>
				<div>部件</div>
			</div>
		));

		h.trigger("@nav-properties", "onclick");

		h.expect(() => (
			<div key="root" classes={[css.root]} styles={{ right: "0px", top: "0px" }}>
				<Header />
				<ul classes={[c.nav, "nav-fill"]}>
					<li classes={[c.nav_item]}>
						<a key="nav-widgets" classes={[c.nav_link, c.text_muted]} href="#" onclick={() => {}}>
							部件
						</a>
					</li>
					<li classes={[c.nav_item]}>
						<a key="nav-properties" classes={[c.nav_link, c.active]} href="#" onclick={undefined}>
							属性
						</a>
					</li>
				</ul>
				<div>属性</div>
			</div>
		));
	});

	it("back to widgets tab", () => {
		const h = harness(() => <UIOperatePane />);

		h.expect(() => (
			<div key="root" classes={[css.root]} styles={{ right: "0px", top: "0px" }}>
				<Header />
				<ul classes={[c.nav, "nav-fill"]}>
					<li classes={[c.nav_item]}>
						<a key="nav-widgets" classes={[c.nav_link, c.active]} href="#" onclick={undefined}>
							部件
						</a>
					</li>
					<li classes={[c.nav_item]}>
						<a key="nav-properties" classes={[c.nav_link, c.text_muted]} href="#" onclick={() => {}}>
							属性
						</a>
					</li>
				</ul>
				<div>部件</div>
			</div>
		));

		h.trigger("@nav-properties", "onclick");
		h.trigger("@nav-widgets", "onclick");

		h.expect(() => (
			<div key="root" classes={[css.root]} styles={{ right: "0px", top: "0px" }}>
				<Header />
				<ul classes={[c.nav, "nav-fill"]}>
					<li classes={[c.nav_item]}>
						<a key="nav-widgets" classes={[c.nav_link, c.active]} href="#" onclick={undefined}>
							部件
						</a>
					</li>
					<li classes={[c.nav_item]}>
						<a key="nav-properties" classes={[c.nav_link, c.text_muted]} href="#" onclick={() => {}}>
							属性
						</a>
					</li>
				</ul>
				<div>部件</div>
			</div>
		));
	});
});
