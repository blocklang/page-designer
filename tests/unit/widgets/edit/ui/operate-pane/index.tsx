const { describe, it } = intern.getInterface("bdd");

import harness from "@dojo/framework/testing/harness";
import { tsx } from "@dojo/framework/core/vdom";

import * as css from "../../../../../../src/widgets/edit/ui/operate-pane/index.m.css";

import UIOperatePane from "../../../../../../src/widgets/edit/ui/operate-pane";
import Header from "../../../../../../src/widgets/edit/ui/operate-pane/Header";
import Tab from "../../../../../../src/widgets/edit/ui/operate-pane/tabs";

describe("edit/ui/operate-pane", () => {
	it("default properties", () => {
		const h = harness(() => <UIOperatePane />);

		h.expect(() => (
			<div key="root" classes={[css.root]} styles={{ right: "0px", top: "0px" }}>
				<div key="header">
					<Header />
				</div>
				<Tab />
			</div>
		));
	});
});
