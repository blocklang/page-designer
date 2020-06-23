const { describe, it } = intern.getInterface("bdd");

import harness from "@dojo/framework/testing/harness/harness";
import { tsx } from "@dojo/framework/core/vdom";
import * as c from "@blocklang/bootstrap-classes";

import Behavior from "../../../../../src/widgets/edit/behavior";
import createMockStoreMiddleware from "@dojo/framework/testing/mocks/middleware/store";
import { State } from "@blocklang/designer-core/interfaces";
import store from "@blocklang/designer-core/store";
import { add } from "@dojo/framework/stores/state/operations";
import Data from "../../../../../src/widgets/edit/behavior/Data";
import Func from "../../../../../src/widgets/edit/behavior/func";

describe("edit/behavior", () => {
	it("loading", () => {
		const mockStore = createMockStoreMiddleware<State>();
		const h = harness(() => <Behavior />, { middleware: [[store, mockStore]] });

		h.expect(() => (
			<div key="root">
				<div key="loading" classes={[c.spinner_border, c.text_secondary, c.text_center, c.mt_5]} role="status">
					<span classes={[c.sr_only]}>Loading...</span>
				</div>
			</div>
		));
	});

	it("load complete", () => {
		const mockStore = createMockStoreMiddleware<State>();
		const h = harness(() => <Behavior />, { middleware: [[store, mockStore]] });

		mockStore((path) => [add(path("pageModel"), { pageId: 1, widgets: [], data: [], functions: [] })]);

		h.expect(() => (
			<div classes={[c.mx_2]}>
				<Data data={[]} />
				<hr />
				<Func widgets={[]} functions={[]} />
			</div>
		));
	});
});
