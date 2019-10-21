const { describe, it } = intern.getInterface("bdd");
const { assert } = intern.getPlugin("chai");

import harness from "@dojo/framework/testing/harness";
import { tsx } from "@dojo/framework/core/vdom";
import * as c from "bootstrap-classes";
import * as css from "../../../../../src/widgets/ui-view/operate-pane/Header.m.css";

import Header from "../../../../../src/widgets/ui-view/operate-pane/Header";
import store from "../../../../../src/store";
import createMockStoreMiddleware from "@dojo/framework/testing/mocks/middleware/store";
import { add } from "@dojo/framework/stores/state/operations";
import { AttachedWidget } from "../../../../../src/interfaces";
import { activeWidgetProcess } from "../../../../../src/processes/uiProcesses";
import { stub } from "sinon";

describe("ui-view/operate-pane/Header", () => {
	it("default properties", () => {
		const h = harness(() => <Header />);
		h.expect(() => <div classes={[css.root]}></div>);
	});

	it("focus widget is root widget", () => {
		const mockStore = createMockStoreMiddleware();

		const widgets: AttachedWidget[] = [
			{
				id: "1",
				parentId: "-1",
				apiRepoId: 1,
				widgetId: 1,
				widgetName: "Page",
				widgetCode: "0001",
				iconClass: "",
				canHasChildren: true,
				properties: []
			}
		];
		mockStore((path) => [add(path("pageModel", "widgets"), widgets), add(path("selectedWidgetIndex"), 0)]);

		const h = harness(() => <Header />, { middleware: [[store, mockStore]] });
		h.expect(() => (
			<div classes={[css.root]}>
				<nav>
					<ol classes={[c.breadcrumb, css.focusWidgetPath]}>
						<li key="fwp-1" classes={[c.breadcrumb_item, css.breadcrumbItem, c.active]}>
							Page
						</li>
					</ol>
				</nav>
			</div>
		));
	});

	it("root -> node1, node1 focused", () => {
		const mockStore = createMockStoreMiddleware();

		const widgets: AttachedWidget[] = [
			{
				id: "1",
				parentId: "-1",
				apiRepoId: 1,
				widgetId: 1,
				widgetName: "Page",
				widgetCode: "0001",
				iconClass: "",
				canHasChildren: true,
				properties: []
			},
			{
				id: "2",
				parentId: "1",
				apiRepoId: 1,
				widgetId: 2,
				widgetName: "Widget1",
				widgetCode: "0002",
				iconClass: "",
				canHasChildren: true,
				properties: []
			}
		];
		mockStore((path) => [add(path("pageModel", "widgets"), widgets), add(path("selectedWidgetIndex"), 1)]);

		const h = harness(() => <Header />, { middleware: [[store, mockStore]] });
		h.expect(() => (
			<div classes={[css.root]}>
				<nav>
					<ol classes={[c.breadcrumb, css.focusWidgetPath]}>
						<li key="fwp-1" classes={[c.breadcrumb_item, css.breadcrumbItem]}>
							<a href="#" onclick={() => {}}>
								Page
							</a>
						</li>
						<li key="fwp-2" classes={[c.breadcrumb_item, css.breadcrumbItem, c.active]}>
							Widget1
						</li>
					</ol>
				</nav>
			</div>
		));
	});

	it("trigger item in the focus widget path", () => {
		const activeWidgetProcessStub = stub();
		const mockStore = createMockStoreMiddleware([[activeWidgetProcess, activeWidgetProcessStub]]);

		const widgets: AttachedWidget[] = [
			{
				id: "1",
				parentId: "-1",
				apiRepoId: 1,
				widgetId: 1,
				widgetName: "Page",
				widgetCode: "0001",
				iconClass: "",
				canHasChildren: true,
				properties: []
			},
			{
				id: "2",
				parentId: "1",
				apiRepoId: 1,
				widgetId: 2,
				widgetName: "Widget1",
				widgetCode: "0002",
				iconClass: "",
				canHasChildren: true,
				properties: []
			}
		];
		mockStore((path) => [add(path("pageModel", "widgets"), widgets), add(path("selectedWidgetIndex"), 1)]);

		const h = harness(() => <Header />, { middleware: [[store, mockStore]] });
		h.trigger("a", "onclick");
		assert.isTrue(activeWidgetProcessStub.calledOnce);
	});
});
