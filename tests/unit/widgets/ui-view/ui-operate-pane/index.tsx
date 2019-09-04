const { describe, it } = intern.getInterface("bdd");

import assertionTemplate from "@dojo/framework/testing/assertionTemplate";
import harness from "@dojo/framework/testing/harness";
import { tsx } from "@dojo/framework/core/vdom";

import UIOperatePane from "../../../../../src/widgets/ui-view/operate-pane";

describe("UIOperatePane", () => {
	const baseAssertion = assertionTemplate(() => <div>UI 操作面板</div>);

	it("renders", () => {
		const h = harness(() => <UIOperatePane />);

		h.expect(baseAssertion);
	});
});
