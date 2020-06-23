const { describe, it } = intern.getInterface("bdd");

import assertionTemplate from "@dojo/framework/testing/harness/assertionTemplate";
import harness from "@dojo/framework/testing/harness/harness";
import { tsx } from "@dojo/framework/core/vdom";
import TitleBar from "../../../../../../src/widgets/edit/behavior/func/TitleBar";
import * as c from "@blocklang/bootstrap-classes";

describe("widgets/edit/behavior/func/TitleBar", () => {
	const baseAssertion = assertionTemplate(() => (
		<div key="root">
			<span>页面行为</span>
			<small classes={[c.ml_2, c.text_info]}>请先选择事件</small>
		</div>
	));

	it("renders", () => {
		const h = harness(() => <TitleBar selectedWidgetIndex={-1} widgets={[]} />);

		h.expect(baseAssertion);
	});
});
