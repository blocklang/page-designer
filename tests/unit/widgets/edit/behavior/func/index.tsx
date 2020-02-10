const { describe, it } = intern.getInterface("bdd");

import assertionTemplate from "@dojo/framework/testing/assertionTemplate";
import harness from "@dojo/framework/testing/harness";
import { tsx } from "@dojo/framework/core/vdom";
import Func from "../../../../../../src/widgets/edit/behavior/func";
import List from "../../../../../../src/widgets/edit/behavior/func/List";
import Editor from "../../../../../../src/widgets/edit/behavior/func/Editor";
import createMockStoreMiddleware from "@dojo/framework/testing/mocks/middleware/store";
import { State } from "designer-core/interfaces";
import store from "designer-core/store";
import { add } from "@dojo/framework/stores/state/operations";

describe("edit/behavior/func", () => {
	const baseAssertion = assertionTemplate(() => (
		<div key="root">
			<List widgets={[]} />
		</div>
	));

	// 默认显示页面中所有部件的事件列表
	it("default properties", () => {
		const h = harness(() => <Func widgets={[]} functions={[]} />);

		h.expect(baseAssertion);
	});

	it("show function editor", () => {
		const funcEditorAssertion = baseAssertion.replaceChildren("@root", () => [<Editor functions={[]} />]);
		const mockStore = createMockStoreMiddleware<State>();
		mockStore((path) => [add(path("paneLayout", "funcViewType"), "funcItem")]);
		const h = harness(() => <Func widgets={[]} functions={[]} />, { middleware: [[store, mockStore]] });

		h.expect(funcEditorAssertion);
	});
});
