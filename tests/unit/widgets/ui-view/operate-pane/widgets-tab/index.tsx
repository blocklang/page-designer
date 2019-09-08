const { describe, it } = intern.getInterface("bdd");

import createMockStoreMiddleware from "@dojo/framework/testing/mocks/middleware/store";
import harness from "@dojo/framework/testing/harness";
import { tsx } from "@dojo/framework/core/vdom";
import { add } from "@dojo/framework/stores/state/operations";
import * as c from "bootstrap-classes";
import { stub } from "sinon";

import WidgetsTab from "../../../../../../src/widgets/ui-view/operate-pane/widgets-tab";
import { State } from "../../../../../../src/interfaces";
import { getWidgetsProcess } from "../../../../../../src/processes/widgetProcesses";
import store from "../../../../../../src/store";
describe("ui-view/operate-pane/widgets-tab", () => {
	it("default properties", () => {
		const processStub = stub();

		const mockStore = createMockStoreMiddleware<State>([[getWidgetsProcess, processStub]]);

		const h = harness(() => <WidgetsTab />, { middleware: [[store, mockStore]] });

		h.expect(() => (
			<div>
				<div classes={[c.m_1]}>
					<input classes={[c.form_control]} placeholder="搜索部件" />
				</div>
				<div>加载中</div>
			</div>
		));

		// 加载完成，返回空数组
		mockStore((path) => [add(path("widgetRepos"), [])]);
		h.expect(() => (
			<div>
				<div classes={[c.m_1]}>
					<input classes={[c.form_control]} placeholder="搜索部件" />
				</div>
				<div>
					<p classes={[c.text_muted, c.text_center]}>
						请在 <strong>DEPENDENCE.json</strong> 中添加部件仓库
					</p>
				</div>
			</div>
		));
	});
});
