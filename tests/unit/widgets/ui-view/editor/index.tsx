const { describe, it } = intern.getInterface("bdd");

import harness from "@dojo/framework/testing/harness";
import { tsx } from "@dojo/framework/core/vdom";

import Editor from "../../../../../src/widgets/ui-view/editor";
import { stub } from "sinon";
import createMockStoreMiddleware from "@dojo/framework/testing/mocks/middleware/store";
import { State } from "../../../../../src/interfaces";
import store from "../../../../../src/store";
import { getPageModelProcess } from "../../../../../src/processes/uiProcesses";
import * as c from "bootstrap-classes";

describe("ui-view/editor", () => {
	it("show page when no root node", () => {
		const processStub = stub();
		const mockStore = createMockStoreMiddleware<State>([[getPageModelProcess, processStub]]);

		const h = harness(() => <Editor />, { middleware: [[store, mockStore]] });

		h.expect(() => (
			<div>
				<div classes={[c.alert, c.alert_danger]} role="alert">
					页面中缺少根节点！
				</div>
			</div>
		));
	});
});
