const { describe, it } = intern.getInterface("bdd");
const { assert } = intern.getPlugin("chai");

import harness from "@dojo/framework/testing/harness";
import { tsx } from "@dojo/framework/core/vdom";

import FocusBox, { FocusBoxProperties } from "../../../../../src/widgets/ui-view/editor/FocusBox";
import * as css from "../../../../../src/widgets/ui-view/editor/FocusBox.m.css";
import Box from "../../../../../src/widgets/ui-view/editor/Box";
import FontAwesomeIcon from "dojo-fontawesome/FontAwesomeIcon";
import * as c from "bootstrap-classes";
import createMockStoreMiddleware from "@dojo/framework/testing/mocks/middleware/store";
import { State } from "../../../../../src/interfaces";
import store from "../../../../../src/store";
import { add } from "@dojo/framework/stores/state/operations";
import { DimensionResults } from "@dojo/framework/core/meta/Dimensions";
import { stub } from "sinon";
import {
	activeParentWidgetProcess,
	moveActiveWidgetPreviousProcess,
	moveActiveWidgetNextProcess,
	removeActiveWidgetProcess
} from "../../../../../src/processes/uiProcesses";

describe("ui-view/editor/FocusBox", () => {
	it("default properties", () => {
		const properties: FocusBoxProperties = {
			widgetName: "A"
		};
		const h = harness(() => <FocusBox {...properties} />);

		h.expect(() => (
			<Box left={0} top={0} width={0} height={0}>
				<div key="name-bar" classes={[css.nameBar]}>
					A
				</div>
				<div key="operate-bar" classes={[css.operateBar]}>
					<div classes={[c.btn_group, c.btn_group_sm]} role="group">
						<button
							key="active-parent"
							type="button"
							title="选择父部件"
							classes={[c.btn, c.btn_primary]}
							onclick={() => {}}
						>
							<FontAwesomeIcon icon="level-up-alt" />
						</button>
						<button
							key="move-previous"
							type="button"
							title="前移"
							classes={[c.btn, c.btn_primary]}
							disabled
							onclick={undefined}
						>
							<FontAwesomeIcon icon="step-forward" />
						</button>
						<button
							key="move-next"
							type="button"
							title="后移"
							classes={[c.btn, c.btn_primary]}
							disabled
							onclick={undefined}
						>
							<FontAwesomeIcon icon="step-backward" />
						</button>
						<button
							key="remove"
							type="button"
							title="删除"
							classes={[c.btn, c.btn_primary]}
							onclick={() => {}}
						>
							<FontAwesomeIcon icon="trash-alt" />
						</button>
					</div>
				</div>
			</Box>
		));
	});

	it("set active widget dimensions", () => {
		const properties: FocusBoxProperties = {
			widgetName: "A"
		};
		const mockStore = createMockStoreMiddleware<State>();
		const h = harness(() => <FocusBox {...properties} />, { middleware: [[store, mockStore]] });

		const documentScrollTop = document.documentElement.scrollTop;
		const documentScrollLeft = document.documentElement.scrollLeft;

		const activeWidgetDimensions: DimensionResults = {
			position: {
				left: 1, // 使用此值计算 left
				top: 2, // 使用此值计算 top
				bottom: 3,
				right: 4
			},
			offset: {
				left: 5,
				top: 6,
				height: 7,
				width: 8
			},
			size: {
				height: 9, // 使用此值计算 height
				width: 10 // 使用此值计算 width
			},
			scroll: {
				left: 11,
				top: 12,
				height: 13,
				width: 14
			},
			client: {
				left: 15,
				top: 16,
				height: 17,
				width: 18
			}
		};

		mockStore((path) => [add(path("activeWidgetDimensions"), activeWidgetDimensions)]);

		h.expect(() => (
			<Box left={documentScrollLeft + 1} top={documentScrollTop + 2} height={9} width={10}>
				<div key="name-bar" classes={[css.nameBar]}>
					A
				</div>
				<div key="operate-bar" classes={[css.operateBar]}>
					<div classes={[c.btn_group, c.btn_group_sm]} role="group">
						<button
							key="active-parent"
							type="button"
							title="选择父部件"
							classes={[c.btn, c.btn_primary]}
							onclick={() => {}}
						>
							<FontAwesomeIcon icon="level-up-alt" />
						</button>
						<button
							key="move-previous"
							type="button"
							title="前移"
							classes={[c.btn, c.btn_primary]}
							disabled
							onclick={undefined}
						>
							<FontAwesomeIcon icon="step-forward" />
						</button>
						<button
							key="move-next"
							type="button"
							title="后移"
							classes={[c.btn, c.btn_primary]}
							disabled
							onclick={undefined}
						>
							<FontAwesomeIcon icon="step-backward" />
						</button>
						<button
							key="remove"
							type="button"
							title="删除"
							classes={[c.btn, c.btn_primary]}
							onclick={() => {}}
						>
							<FontAwesomeIcon icon="trash-alt" />
						</button>
					</div>
				</div>
			</Box>
		));
	});

	it("custom properties - enable move previous and move next buttons", () => {
		const properties: FocusBoxProperties = {
			widgetName: "A"
		};
		const mockStore = createMockStoreMiddleware<State>();
		const h = harness(() => <FocusBox {...properties} />, { middleware: [[store, mockStore]] });

		mockStore((path) => [
			add(path("pageModel", "widgets"), [
				{
					id: "1",
					parentId: "-1",
					widgetId: 1,
					widgetCode: "0001",
					widgetName: "Widget1",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "3",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "4",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				}
			]),
			add(path("activeWidgetId"), "3"),
			add(path("selectedWidgetIndex"), 2)
		]);

		h.expect(() => (
			<Box left={0} top={0} width={0} height={0}>
				<div key="name-bar" classes={[css.nameBar]}>
					A
				</div>
				<div key="operate-bar" classes={[css.operateBar]}>
					<div classes={[c.btn_group, c.btn_group_sm]} role="group">
						<button
							key="active-parent"
							type="button"
							title="选择父部件"
							classes={[c.btn, c.btn_primary]}
							onclick={() => {}}
						>
							<FontAwesomeIcon icon="level-up-alt" />
						</button>
						<button
							key="move-previous"
							type="button"
							title="前移"
							classes={[c.btn, c.btn_primary]}
							disabled={false}
							onclick={() => {}}
						>
							<FontAwesomeIcon icon="step-forward" />
						</button>
						<button
							key="move-next"
							type="button"
							title="后移"
							classes={[c.btn, c.btn_primary]}
							disabled={false}
							onclick={() => {}}
						>
							<FontAwesomeIcon icon="step-backward" />
						</button>
						<button
							key="remove"
							type="button"
							title="删除"
							classes={[c.btn, c.btn_primary]}
							onclick={() => {}}
						>
							<FontAwesomeIcon icon="trash-alt" />
						</button>
					</div>
				</div>
			</Box>
		));
	});

	it("custom properties - disable move previous and move next buttons", () => {
		const properties: FocusBoxProperties = {
			widgetName: "A"
		};
		const mockStore = createMockStoreMiddleware<State>();
		const h = harness(() => <FocusBox {...properties} />, { middleware: [[store, mockStore]] });

		mockStore((path) => [
			add(path("pageModel", "widgets"), [
				{
					id: "1",
					parentId: "-1",
					widgetId: 1,
					widgetCode: "0001",
					widgetName: "Widget1",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				}
			]),
			add(path("activeWidgetId"), "2"),
			add(path("selectedWidgetIndex"), 1)
		]);

		h.expect(() => (
			<Box left={0} top={0} width={0} height={0}>
				<div key="name-bar" classes={[css.nameBar]}>
					A
				</div>
				<div key="operate-bar" classes={[css.operateBar]}>
					<div classes={[c.btn_group, c.btn_group_sm]} role="group">
						<button
							key="active-parent"
							type="button"
							title="选择父部件"
							classes={[c.btn, c.btn_primary]}
							onclick={() => {}}
						>
							<FontAwesomeIcon icon="level-up-alt" />
						</button>
						<button
							key="move-previous"
							type="button"
							title="前移"
							classes={[c.btn, c.btn_primary]}
							disabled
							onclick={undefined}
						>
							<FontAwesomeIcon icon="step-forward" />
						</button>
						<button
							key="move-next"
							type="button"
							title="后移"
							classes={[c.btn, c.btn_primary]}
							disabled
							onclick={undefined}
						>
							<FontAwesomeIcon icon="step-backward" />
						</button>
						<button
							key="remove"
							type="button"
							title="删除"
							classes={[c.btn, c.btn_primary]}
							onclick={() => {}}
						>
							<FontAwesomeIcon icon="trash-alt" />
						</button>
					</div>
				</div>
			</Box>
		));
	});

	it("active parent widget", () => {
		const properties: FocusBoxProperties = {
			widgetName: "A"
		};

		const activeParentProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([[activeParentWidgetProcess, activeParentProcessStub]]);
		const h = harness(() => <FocusBox {...properties} />, { middleware: [[store, mockStore]] });

		h.trigger("@active-parent", "onclick");
		assert.isTrue(activeParentProcessStub.calledOnce);
	});

	it("move active widget to previous", () => {
		const properties: FocusBoxProperties = {
			widgetName: "A"
		};

		const moveActiveWidgetPreviousProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([
			[moveActiveWidgetPreviousProcess, moveActiveWidgetPreviousProcessStub]
		]);
		const h = harness(() => <FocusBox {...properties} />, { middleware: [[store, mockStore]] });

		// 触发之前必须要先激活按钮
		mockStore((path) => [
			add(path("pageModel", "widgets"), [
				{
					id: "1",
					parentId: "-1",
					widgetId: 1,
					widgetCode: "0001",
					widgetName: "Widget1",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "3",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				}
			]),
			add(path("activeWidgetId"), "3"),
			add(path("selectedWidgetIndex"), 2)
		]);

		h.trigger("@move-previous", "onclick");
		assert.isTrue(moveActiveWidgetPreviousProcessStub.calledOnce);
	});

	it("move active widget to next", () => {
		const properties: FocusBoxProperties = {
			widgetName: "A"
		};

		const moveActiveWidgetNextProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([
			[moveActiveWidgetNextProcess, moveActiveWidgetNextProcessStub]
		]);
		const h = harness(() => <FocusBox {...properties} />, { middleware: [[store, mockStore]] });

		// 触发之前必须要先激活按钮
		mockStore((path) => [
			add(path("pageModel", "widgets"), [
				{
					id: "1",
					parentId: "-1",
					widgetId: 1,
					widgetCode: "0001",
					widgetName: "Widget1",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "2",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "3",
					parentId: "1",
					widgetId: 2,
					widgetCode: "0002",
					widgetName: "Widget2",
					componentRepoId: 1,
					iconClass: "",
					canHasChildren: true,
					properties: []
				}
			]),
			add(path("activeWidgetId"), "2"),
			add(path("selectedWidgetIndex"), 1)
		]);

		h.trigger("@move-next", "onclick");
		assert.isTrue(moveActiveWidgetNextProcessStub.calledOnce);
	});

	it("remove active widget", () => {
		const properties: FocusBoxProperties = {
			widgetName: "A"
		};

		const removeActiveWidgetProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([
			[removeActiveWidgetProcess, removeActiveWidgetProcessStub]
		]);
		const h = harness(() => <FocusBox {...properties} />, { middleware: [[store, mockStore]] });

		h.trigger("@remove", "onclick");
		assert.isTrue(removeActiveWidgetProcessStub.calledOnce);
	});
});
