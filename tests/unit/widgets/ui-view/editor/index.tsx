const { describe, it } = intern.getInterface("bdd");

import harness from "@dojo/framework/testing/harness";
import { tsx } from "@dojo/framework/core/vdom";

import Editor from "../../../../../src/widgets/ui-view/editor";
import { stub } from "sinon";
import createMockStoreMiddleware from "@dojo/framework/testing/mocks/middleware/store";
import { State } from "../../../../../src/interfaces";
import store from "../../../../../src/store";
import { getPageModelProcess } from "../../../../../src/processes/uiProcesses";

describe("ui-view/Editor", () => {
	it("show empty page", () => {
		const processStub = stub();
		const mockStore = createMockStoreMiddleware<State>([[getPageModelProcess, processStub]]);

		const h = harness(() => <Editor />, { middleware: [[store, mockStore]] });

		// 默认先显示加载中
		h.expect(() => <div></div>);
	});
});
