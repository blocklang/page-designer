const { describe, it } = intern.getInterface("bdd");

import assertionTemplate from "@dojo/framework/testing/assertionTemplate";
import harness from "@dojo/framework/testing/harness";
import { tsx } from "@dojo/framework/core/vdom";
import Editor from "../../../../../../src/widgets/edit/behavior/func/Editor";

describe("widgets/edit/behavior/func/Editor", () => {
	const baseAssertion = assertionTemplate(() => <div>Widget Content</div>);

	it("renders", () => {
		const h = harness(() => <Editor />);

		h.expect(baseAssertion);
	});
});
