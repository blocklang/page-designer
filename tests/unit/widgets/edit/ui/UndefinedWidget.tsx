const { describe, it } = intern.getInterface("bdd");
const { assert } = intern.getPlugin("chai");
import harness from "@dojo/framework/testing/harness";
import { tsx } from "@dojo/framework/core/vdom";

import UndefinedWidget from "../../../../../src/widgets/UndefinedWidget";
import { ComponentRepo, State } from "../../../../../src/interfaces";
import { AttachedWidget } from "designer-core/interfaces";
import * as c from "bootstrap-classes";
import store from "../../../../../src/store";
import createMockStoreMiddleware from "@dojo/framework/testing/mocks/middleware/store";
import { removeUndefinedWidgetProcess } from "../../../../../src/processes/uiProcesses";
import { stub } from "sinon";

describe("edit/ui/UndefinedWidget", () => {
	it("no component repo", () => {
		const widget: AttachedWidget = {
			id: "2",
			parentId: "1",
			widgetId: 1,
			widgetName: "A",
			widgetCode: "0001",
			canHasChildren: false,
			apiRepoId: 1,
			properties: []
		};
		const h = harness(() => <UndefinedWidget widget={widget} />);

		h.expect(() => (
			<div>
				<div classes={[c.alert, c.alert_danger, c.text_center]} role="alert">
					<strong>BlockLang: </strong>
					没有找到 A 部件所属的组件库信息!
					<button
						type="button"
						classes={[c.close]}
						data-dismiss="alert"
						aria-label="删除"
						title="删除"
						onclick={() => {}}
					>
						<span aria-hidden="true">&times;</span>
					</button>
				</div>
			</div>
		));
	});

	it("no component repo and in preview mode", () => {
		const widget: AttachedWidget = {
			id: "2",
			parentId: "1",
			widgetId: 1,
			widgetName: "A",
			widgetCode: "0001",
			canHasChildren: false,
			apiRepoId: 1,
			properties: []
		};
		const h = harness(() => <UndefinedWidget widget={widget} editMode="Preview" />);

		h.expect(() => (
			<div>
				<div classes={[c.alert, c.alert_danger, c.text_center]} role="alert">
					<strong>BlockLang: </strong>
					没有找到 A 部件所属的组件库信息!
				</div>
			</div>
		));
	});

	it("has component repo", () => {
		const widget: AttachedWidget = {
			id: "2",
			parentId: "1",
			widgetId: 1,
			widgetName: "WidgetA",
			widgetCode: "0001",
			canHasChildren: false,
			apiRepoId: 1,
			properties: []
		};
		const componentRepo: ComponentRepo = {
			id: 1,
			apiRepoId: 1,
			gitRepoWebsite: "A",
			gitRepoOwner: "B",
			gitRepoName: "C",
			name: "D",
			category: "E",
			version: "0.0.1",
			std: true
		};
		const h = harness(() => <UndefinedWidget widget={widget} componentRepo={componentRepo} />);

		h.expect(() => (
			<div>
				<div classes={[c.alert, c.alert_danger, c.text_center]} role="alert">
					<strong>BlockLang: </strong>
					A/B/C 的 0.0.1 中不存在 WidgetA 部件!
					<button
						type="button"
						classes={[c.close]}
						data-dismiss="alert"
						aria-label="删除"
						title="删除"
						onclick={() => {}}
					>
						<span aria-hidden="true">&times;</span>
					</button>
				</div>
			</div>
		));
	});

	it("remove self", () => {
		const widget: AttachedWidget = {
			id: "2",
			parentId: "1",
			widgetId: 1,
			widgetName: "WidgetA",
			widgetCode: "0001",
			canHasChildren: false,
			apiRepoId: 1,
			properties: []
		};
		const componentRepo: ComponentRepo = {
			id: 1,
			apiRepoId: 1,
			gitRepoWebsite: "A",
			gitRepoOwner: "B",
			gitRepoName: "C",
			name: "D",
			category: "E",
			version: "0.0.1",
			std: true
		};

		const removeUndefinedWidgetProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([
			[removeUndefinedWidgetProcess, removeUndefinedWidgetProcessStub]
		]);
		const h = harness(() => <UndefinedWidget widget={widget} componentRepo={componentRepo} />, {
			middleware: [[store, mockStore]]
		});

		h.trigger("button", "onclick");
		assert.isTrue(removeUndefinedWidgetProcessStub.calledOnce);
	});
});
