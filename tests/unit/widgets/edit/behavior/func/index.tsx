const { describe, it } = intern.getInterface("bdd");

import assertionTemplate from "@dojo/framework/testing/assertionTemplate";
import harness from "@dojo/framework/testing/harness";
import { tsx } from "@dojo/framework/core/vdom";
import * as c from "bootstrap-classes";
import Func from "../../../../../../src/widgets/edit/behavior/func";
import { AttachedWidget, State } from "designer-core/interfaces";
import store from "designer-core/store";
import createMockStoreMiddleware from "@dojo/framework/testing/mocks/middleware/store";
import { add } from "@dojo/framework/stores/state/operations";
import FontAwesomeIcon from "dojo-fontawesome/FontAwesomeIcon";

describe("Func", () => {
	const baseAssertion = assertionTemplate(() => (
		<div key="root">
			<div key="title-bar">
				<span key="title">页面行为</span>
			</div>
			<div key="empty" classes={[c.text_muted, c.text_center, c.my_5]}>
				在“ui/操作面板/属性选项卡”中选择一个事件后，在此处定义事件处理函数。
			</div>
		</div>
	));

	it("no widgets", () => {
		const h = harness(() => <Func widgets={[]} functions={[]} />);
		h.expect(baseAssertion);
	});

	it("selectedWidgetIndex is undefined", () => {
		const noActiveWidgetAssertion = baseAssertion.replaceChildren("@root", () => [
			<div key="no-active-widget" classes={[c.text_muted]}>
				selectedWidgetIndex 的值为 undefined。
			</div>
		]);
		const widgets: AttachedWidget[] = [
			{
				id: "1",
				parentId: "-1",
				widgetId: 1,
				widgetCode: "0001",
				widgetName: "Widget1",
				canHasChildren: false,
				apiRepoId: 1,
				properties: []
			}
		];

		const h = harness(() => <Func widgets={widgets} />);
		h.expect(noActiveWidgetAssertion);
	});

	it("selectedWidgetIndex is -1", () => {
		const noActiveWidgetAssertion = baseAssertion.replaceChildren("@root", () => [
			<div key="no-active-widget" classes={[c.text_muted]}>
				selectedWidgetIndex 的值为 -1。
			</div>
		]);
		const widgets: AttachedWidget[] = [
			{
				id: "1",
				parentId: "-1",
				widgetId: 1,
				widgetCode: "0001",
				widgetName: "Widget1",
				canHasChildren: false,
				apiRepoId: 1,
				properties: []
			}
		];

		const mockStore = createMockStoreMiddleware<State>();
		mockStore((path) => [add(path("selectedWidgetIndex"), -1)]);
		const h = harness(() => <Func widgets={widgets} />, { middleware: [[store, mockStore]] });
		h.expect(noActiveWidgetAssertion);
	});

	it("active widget set but not exists in widgets", () => {
		const canNotFoundWidgetAssertion = baseAssertion.replaceChildren("@root", () => [
			<div key="can-not-found-widget" classes={[c.text_muted]}>
				在页面的 widgets 列表中未找到索引为 1 的部件。
			</div>
		]);
		const widgets: AttachedWidget[] = [
			{
				id: "1",
				parentId: "-1",
				widgetId: 1,
				widgetCode: "0001",
				widgetName: "Widget1",
				canHasChildren: false,
				apiRepoId: 1,
				properties: []
			}
		];

		const mockStore = createMockStoreMiddleware<State>();
		mockStore((path) => [add(path("selectedWidgetIndex"), 1)]);
		const h = harness(() => <Func widgets={widgets} />, { middleware: [[store, mockStore]] });
		h.expect(canNotFoundWidgetAssertion);
	});

	it("selectedWidgetPropertyIndex is undefined", () => {
		const noActiveWidgetPropertyAssertion = baseAssertion.replaceChildren("@root", () => [
			<div key="no-active-widget-property" classes={[c.text_muted]}>
				selectedWidgetPropertyIndex 的值为 undefined。
			</div>
		]);
		const widgets: AttachedWidget[] = [
			{
				id: "1",
				parentId: "-1",
				widgetId: 1,
				widgetCode: "0001",
				widgetName: "Widget1",
				canHasChildren: false,
				apiRepoId: 1,
				properties: []
			}
		];

		const mockStore = createMockStoreMiddleware<State>();
		mockStore((path) => [add(path("selectedWidgetIndex"), 0)]);
		const h = harness(() => <Func widgets={widgets} />, { middleware: [[store, mockStore]] });
		h.expect(noActiveWidgetPropertyAssertion);
	});

	it("selectedWidgetPropertyIndex is -1", () => {
		const noActiveWidgetPropertyAssertion = baseAssertion.replaceChildren("@root", () => [
			<div key="no-active-widget-property" classes={[c.text_muted]}>
				selectedWidgetPropertyIndex 的值为 -1。
			</div>
		]);
		const widgets: AttachedWidget[] = [
			{
				id: "1",
				parentId: "-1",
				widgetId: 1,
				widgetCode: "0001",
				widgetName: "Widget1",
				canHasChildren: false,
				apiRepoId: 1,
				properties: []
			}
		];

		const mockStore = createMockStoreMiddleware<State>();
		mockStore((path) => [add(path("selectedWidgetIndex"), 0), add(path("selectedWidgetPropertyIndex"), -1)]);
		const h = harness(() => <Func widgets={widgets} />, { middleware: [[store, mockStore]] });
		h.expect(noActiveWidgetPropertyAssertion);
	});

	it("selected widget property not found", () => {
		const notFoundWidgetPropertyAssertion = baseAssertion.replaceChildren("@root", () => [
			<div key="can-not-found-active-widget-property" classes={[c.text_muted]}>
				在当前选中的部件中未找到索引为 1 的属性。
			</div>
		]);
		const widgets: AttachedWidget[] = [
			{
				id: "1",
				parentId: "-1",
				widgetId: 1,
				widgetCode: "0001",
				widgetName: "Widget1",
				canHasChildren: false,
				apiRepoId: 1,
				properties: [
					{
						id: "1",
						code: "0001",
						name: "prop1",
						isExpr: false,
						valueType: "string"
					}
				]
			}
		];

		const mockStore = createMockStoreMiddleware<State>();
		mockStore((path) => [add(path("selectedWidgetIndex"), 0), add(path("selectedWidgetPropertyIndex"), 1)]);
		const h = harness(() => <Func widgets={widgets} />, { middleware: [[store, mockStore]] });
		h.expect(notFoundWidgetPropertyAssertion);
	});

	// 选中的属性不是事件
	it("selected widget property is not event", () => {
		const notEventAssertion = baseAssertion.replaceChildren("@root", () => [
			<div key="active-widget-property-is-not-function" classes={[c.text_muted]}>
				只能编辑值类型为 function 的属性，但当前选中的属性值类型为 string。
			</div>
		]);
		const widgets: AttachedWidget[] = [
			{
				id: "1",
				parentId: "-1",
				widgetId: 1,
				widgetCode: "0001",
				widgetName: "Widget1",
				canHasChildren: false,
				apiRepoId: 1,
				properties: [
					{
						id: "1",
						code: "0001",
						name: "prop1",
						isExpr: false,
						valueType: "string"
					}
				]
			}
		];

		const mockStore = createMockStoreMiddleware<State>();
		mockStore((path) => [add(path("selectedWidgetIndex"), 0), add(path("selectedWidgetPropertyIndex"), 0)]);
		const h = harness(() => <Func widgets={widgets} />, { middleware: [[store, mockStore]] });
		h.expect(notEventAssertion);
	});

	// 显示返回按钮（返回到属性列表）和属性信息
	it("show property info bar", () => {
		const showToolbarAssertion = baseAssertion.replaceChildren("@root", () => [
			<div>
				<h2>事件</h2>
				<div key="toolbar">
					<span classes={[c.text_muted, c.mr_1]} title="返回事件列表" onclick={() => {}}>
						<FontAwesomeIcon icon="arrow-left" />
					</span>
					<span>Widget1 / onValue</span>
				</div>
			</div>
		]);
		const widgets: AttachedWidget[] = [
			{
				id: "1",
				parentId: "-1",
				widgetId: 1,
				widgetCode: "0001",
				widgetName: "Widget1",
				canHasChildren: false,
				apiRepoId: 1,
				properties: [
					{
						id: "1",
						code: "0001",
						name: "onValue",
						isExpr: false,
						valueType: "function"
					}
				]
			}
		];

		const mockStore = createMockStoreMiddleware<State>();
		mockStore((path) => [add(path("selectedWidgetIndex"), 0), add(path("selectedWidgetPropertyIndex"), 0)]);
		const h = harness(() => <Func widgets={widgets} />, { middleware: [[store, mockStore]] });
		h.expect(showToolbarAssertion);
	});
});
