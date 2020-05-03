const { describe, it } = intern.getInterface("bdd");
const { assert } = intern.getPlugin("chai");

import harness from "@dojo/framework/testing/harness";
import { tsx } from "@dojo/framework/core/vdom";
import Header from "../../../../../../src/widgets/edit/ui/operate-pane/Header";
import store from "@blocklang/designer-core/store";
import createMockStoreMiddleware from "@dojo/framework/testing/mocks/middleware/store";
import { add } from "@dojo/framework/stores/state/operations";
import { AttachedWidget } from "@blocklang/designer-core/interfaces";
import { activeWidgetProcess } from "../../../../../../src/processes/uiProcesses";
import { stub } from "sinon";
import FontAwesomeIcon from "dojo-fontawesome/FontAwesomeIcon";

import * as c from "bootstrap-classes";
import * as css from "../../../../../../src/widgets/edit/ui/operate-pane/Header.m.css";

describe("edit/ui/operate-pane/Header", () => {
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
				canHasChildren: true,
				properties: [],
			},
		];
		mockStore((path) => [add(path("pageModel", "widgets"), widgets), add(path("selectedWidgetIndex"), 0)]);

		const h = harness(() => <Header />, { middleware: [[store, mockStore]] });
		h.expect(() => (
			<div classes={[css.root]}>
				<FontAwesomeIcon icon="arrows-alt" classes={[c.text_muted, c.ml_1]} />
				<nav classes={[c.d_inline_block]}>
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
				canHasChildren: true,
				properties: [],
			},
			{
				id: "2",
				parentId: "1",
				apiRepoId: 1,
				widgetId: 2,
				widgetName: "Widget1",
				widgetCode: "0002",
				canHasChildren: true,
				properties: [],
			},
		];
		mockStore((path) => [add(path("pageModel", "widgets"), widgets), add(path("selectedWidgetIndex"), 1)]);

		const h = harness(() => <Header />, { middleware: [[store, mockStore]] });
		h.expect(() => (
			<div classes={[css.root]}>
				<FontAwesomeIcon icon="arrows-alt" classes={[c.text_muted, c.ml_1]} />
				<nav classes={[c.d_inline_block]}>
					<ol classes={[c.breadcrumb, css.focusWidgetPath]}>
						<li key="fwp-1" classes={[c.breadcrumb_item, css.breadcrumbItem]}>
							<a href="#" onclick={() => {}}>
								Page
							</a>
						</li>
						<li key="fwp-2" classes={[c.breadcrumb_item, css.breadcrumbItem, c.active]}>
							[0]Widget1
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
				canHasChildren: true,
				properties: [],
			},
			{
				id: "2",
				parentId: "1",
				apiRepoId: 1,
				widgetId: 2,
				widgetName: "Widget1",
				widgetCode: "0002",
				canHasChildren: true,
				properties: [],
			},
		];
		mockStore((path) => [add(path("pageModel", "widgets"), widgets), add(path("selectedWidgetIndex"), 1)]);

		const h = harness(() => <Header />, { middleware: [[store, mockStore]] });
		h.trigger("a", "onclick");
		assert.isTrue(activeWidgetProcessStub.calledOnce);
	});
});
