const { describe, it } = intern.getInterface("bdd");

import assertionTemplate from "@dojo/framework/testing/harness/assertionTemplate";
import harness from "@dojo/framework/testing/harness/harness";
import { tsx } from "@dojo/framework/core/vdom";
import Func from "../../../../../../src/widgets/edit/behavior/func";
import { AttachedWidget, State, PageFunction } from "@blocklang/designer-core/interfaces";
import store from "@blocklang/designer-core/store";
import createMockStoreMiddleware from "@dojo/framework/testing/mocks/middleware/store";
import { add } from "@dojo/framework/stores/state/operations";
import TitleBar from "../../../../../../src/widgets/edit/behavior/func/TitleBar";
import Editor from "../../../../../../src/widgets/edit/behavior/func/editor";
import OperatePane from "../../../../../../src/widgets/edit/behavior/func/operate-pane";

describe("widgets/edit/behavior/func", () => {
	const baseAssertion = assertionTemplate(() => (
		<div key="root">
			<TitleBar
				assertion-key="titleBar"
				selectedWidgetIndex={-1}
				activeWidget={undefined}
				widgets={[]}
				activeWidgetProperty={undefined}
			/>
			<div key="editor" assertion-key="container">
				<Editor assertion-key="editor" pageFunction={undefined} />
			</div>
		</div>
	));

	it("no widgets", () => {
		const h = harness(() => <Func widgets={[]} functions={[]} />);
		h.expect(baseAssertion);
	});

	it("selectedWidgetIndex is undefined", () => {
		const widgets: AttachedWidget[] = [
			{
				id: "1",
				parentId: "-1",
				widgetId: 1,
				widgetCode: "0001",
				widgetName: "Widget1",
				canHasChildren: false,
				apiRepoId: 1,
				properties: [],
			},
		];

		const mockStore = createMockStoreMiddleware<State>();
		const h = harness(() => <Func widgets={widgets} functions={[]} />, { middleware: [[store, mockStore]] });
		h.expect(baseAssertion);
	});

	it("selectedWidgetIndex is -1", () => {
		const widgets: AttachedWidget[] = [
			{
				id: "1",
				parentId: "-1",
				widgetId: 1,
				widgetCode: "0001",
				widgetName: "Widget1",
				canHasChildren: false,
				apiRepoId: 1,
				properties: [],
			},
		];

		const mockStore = createMockStoreMiddleware<State>();
		mockStore((path) => [add(path("selectedWidgetIndex"), -1)]);
		const h = harness(() => <Func widgets={widgets} functions={[]} />, { middleware: [[store, mockStore]] });
		h.expect(baseAssertion);
	});

	it("active widget set but not exists in widgets", () => {
		const widgets: AttachedWidget[] = [
			{
				id: "1",
				parentId: "-1",
				widgetId: 1,
				widgetCode: "0001",
				widgetName: "Widget1",
				canHasChildren: false,
				apiRepoId: 1,
				properties: [],
			},
		];

		const mockStore = createMockStoreMiddleware<State>();
		mockStore((path) => [add(path("selectedWidgetIndex"), 1)]);
		const h = harness(() => <Func widgets={widgets} functions={[]} />, { middleware: [[store, mockStore]] });
		h.expect(baseAssertion);
	});

	it("selectedWidgetPropertyIndex is undefined", () => {
		const widgets: AttachedWidget[] = [
			{
				id: "1",
				parentId: "-1",
				widgetId: 1,
				widgetCode: "0001",
				widgetName: "Widget1",
				canHasChildren: false,
				apiRepoId: 1,
				properties: [],
			},
		];

		const propertyIndexAssertion = baseAssertion.setProperties("~titleBar", {
			selectedWidgetIndex: 0,
			activeWidget: widgets[0],
			widgets,
			activeWidgetProperty: undefined,
		});

		const mockStore = createMockStoreMiddleware<State>();
		mockStore((path) => [add(path("selectedWidgetIndex"), 0)]);
		const h = harness(() => <Func widgets={widgets} functions={[]} />, { middleware: [[store, mockStore]] });
		h.expect(propertyIndexAssertion);
	});

	it("selectedWidgetPropertyIndex is -1", () => {
		const widgets: AttachedWidget[] = [
			{
				id: "1",
				parentId: "-1",
				widgetId: 1,
				widgetCode: "0001",
				widgetName: "Widget1",
				canHasChildren: false,
				apiRepoId: 1,
				properties: [],
			},
		];

		const propertyIndexAssertion = baseAssertion.setProperties("~titleBar", {
			selectedWidgetIndex: 0,
			activeWidget: widgets[0],
			widgets,
			activeWidgetProperty: undefined,
		});

		const mockStore = createMockStoreMiddleware<State>();
		mockStore((path) => [add(path("selectedWidgetIndex"), 0), add(path("selectedWidgetPropertyIndex"), -1)]);
		const h = harness(() => <Func widgets={widgets} functions={[]} />, { middleware: [[store, mockStore]] });
		h.expect(propertyIndexAssertion);
	});

	it("selected widget property not found", () => {
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
						valueType: "string",
					},
				],
			},
		];

		const propertyIndexAssertion = baseAssertion.setProperties("~titleBar", {
			selectedWidgetIndex: 0,
			activeWidget: widgets[0],
			widgets,
			activeWidgetProperty: undefined,
		});

		const mockStore = createMockStoreMiddleware<State>();
		mockStore((path) => [add(path("selectedWidgetIndex"), 0), add(path("selectedWidgetPropertyIndex"), 1)]);
		const h = harness(() => <Func widgets={widgets} functions={[]} />, { middleware: [[store, mockStore]] });
		h.expect(propertyIndexAssertion);
	});

	// 选中的属性不是事件
	it("selected widget property is not event", () => {
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
						valueType: "string",
					},
				],
			},
		];

		const propertyIndexAssertion = baseAssertion.setProperties("~titleBar", {
			selectedWidgetIndex: 0,
			activeWidget: widgets[0],
			widgets,
			activeWidgetProperty: undefined,
		});

		const mockStore = createMockStoreMiddleware<State>();
		mockStore((path) => [add(path("selectedWidgetIndex"), 0), add(path("selectedWidgetPropertyIndex"), 0)]);
		const h = harness(() => <Func widgets={widgets} functions={[]} />, { middleware: [[store, mockStore]] });
		h.expect(propertyIndexAssertion);
	});

	// 显示返回按钮（返回到属性列表）和属性信息
	it("show property info bar", () => {
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
						valueType: "function",
					},
				],
			},
		];

		const showToolbarAssertion = baseAssertion.setProperties("~titleBar", {
			selectedWidgetIndex: 0,
			activeWidget: widgets[0],
			widgets,
			activeWidgetProperty: widgets[0].properties[0],
		});

		const mockStore = createMockStoreMiddleware<State>();
		mockStore((path) => [add(path("selectedWidgetIndex"), 0), add(path("selectedWidgetPropertyIndex"), 0)]);
		const h = harness(() => <Func widgets={widgets} functions={[]} />, { middleware: [[store, mockStore]] });
		h.expect(showToolbarAssertion);
	});

	it("has pageFunction", () => {
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
						value: "func1",
						isExpr: false,
						valueType: "function",
					},
				],
			},
		];

		const functions: PageFunction[] = [
			{
				id: "func1",
				nodes: [],
				sequenceConnections: [],
				dataConnections: [],
			},
		];

		const showToolbarAssertion = baseAssertion
			.setProperties("~titleBar", {
				selectedWidgetIndex: 0,
				activeWidget: widgets[0],
				widgets,
				activeWidgetProperty: widgets[0].properties[0],
			})
			.setProperties("~editor", { pageFunction: functions[0] })
			.setChildren("~container", () => [
				<OperatePane key="0" top={0} />,
				<Editor key="1" pageFunction={functions[0]} />,
			]);

		const mockStore = createMockStoreMiddleware<State>();
		mockStore((path) => [add(path("selectedWidgetIndex"), 0), add(path("selectedWidgetPropertyIndex"), 0)]);
		const h = harness(() => <Func widgets={widgets} functions={functions} />, { middleware: [[store, mockStore]] });
		h.expect(showToolbarAssertion);
	});
});
