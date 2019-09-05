const { describe, it } = intern.getInterface("bdd");

import assertionTemplate from "@dojo/framework/testing/assertionTemplate";
import harness from "@dojo/framework/testing/harness";
import { tsx } from "@dojo/framework/core/vdom";
import FontAwesomeIcon from "dojo-fontawesome/FontAwesomeIcon";
import * as c from "bootstrap-classes";
import * as css from "../../../../../src/widgets/ui-view/operate-pane/Header.m.css";

import Header from "../../../../../src/widgets/ui-view/operate-pane/Header";

describe("ui-view/operate-pane/Header", () => {
	const baseAssertion = assertionTemplate(() => (
		<div classes={[c.d_flex, c.justify_content_between, c.align_items_center, css.root]}>
			<div>
				<FontAwesomeIcon icon="arrows-alt" classes={[c.text_muted]} />
				<div classes={[c.d_inline_block]}>
					<nav classes={[c.d_inline_flex]}>
						<ol classes={[c.breadcrumb, css.focusWidgetPath]}>
							<li classes={[c.breadcrumb_item, c.active]}>Page</li>
						</ol>
					</nav>
				</div>
			</div>
			<div>
				<button type="button" title="最小化" onclick={() => {}}>
					<FontAwesomeIcon icon="minus" />
				</button>
			</div>
		</div>
	));

	it("default properties", () => {
		const h = harness(() => <Header />);
		h.expect(baseAssertion);
	});
});
