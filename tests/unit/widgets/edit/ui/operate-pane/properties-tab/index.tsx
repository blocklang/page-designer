const { describe, it, afterEach } = intern.getInterface("bdd");
const { assert } = intern.getPlugin("chai");

import harness from "@dojo/framework/testing/harness";
import { tsx } from "@dojo/framework/core/vdom";
import * as c from "bootstrap-classes";
import PropertiesTab from "../../../../../../../src/widgets/edit/ui/operate-pane/properties-tab";
import * as css from "../../../../../../../src/widgets/edit/ui/operate-pane/properties-tab/index.m.css";
import store from "../../../../../../../src/store";
import createMockStoreMiddleware from "@dojo/framework/testing/mocks/middleware/store";
import { State, AttachedWidget, ComponentRepo } from "../../../../../../../src/interfaces";
import { add } from "@dojo/framework/stores/state/operations";
import WidgetBase from "@dojo/framework/core/WidgetBase";
import { stub, SinonStub } from "sinon";
import * as blocklang from "designer-core/blocklang";
import { SingleProperty } from "designer-core/interfaces";
import { changeActiveWidgetPropertiesProcess } from "../../../../../../../src/processes/uiProcesses";

let findWidgetPropertiesLayoutStub: SinonStub;

describe("edit/ui/operate-pane/properties-tab", () => {
	afterEach(() => {
		if (findWidgetPropertiesLayoutStub) {
			findWidgetPropertiesLayoutStub.restore();
		}
	});

	it("can not found active widget", () => {
		const h = harness(() => <PropertiesTab />);

		h.expect(() => (
			<div classes={[css.root]}>
				<div classes={[c.text_center, c.text_muted, c.py_2]}>当前没有焦点获取部件</div>
			</div>
		));
	});

	it("not fond active widget's ide repo", () => {
		const mockStore = createMockStoreMiddleware<State>();
		const h = harness(() => <PropertiesTab />, { middleware: [[store, mockStore]] });

		const widgets: AttachedWidget[] = [
			{
				id: "1",
				parentId: "-1",
				apiRepoId: 1,
				widgetId: 1,
				widgetName: "Page",
				widgetCode: "0001",
				canHasChildren: true,
				iconClass: "",
				properties: []
			}
		];
		mockStore((path) => [add(path("pageModel", "widgets"), widgets), add(path("selectedWidgetIndex"), 0)]);

		h.expect(() => (
			<div classes={[css.root]}>
				<div classes={[c.text_center, c.text_muted, c.py_2]}>没有找到聚焦部件所属的 ide 组件仓库信息</div>
			</div>
		));
	});

	it("active widget has one property, but not define layout", () => {
		const mockStore = createMockStoreMiddleware<State>();
		const h = harness(() => <PropertiesTab />, { middleware: [[store, mockStore]] });

		const widgets: AttachedWidget[] = [
			{
				id: "1",
				parentId: "-1",
				apiRepoId: 1,
				widgetId: 1,
				widgetName: "Page",
				widgetCode: "0001",
				canHasChildren: true,
				iconClass: "",
				properties: [
					{
						id: "1",
						name: "Prop1",
						valueType: "string"
					}
				]
			}
		];

		const ideRepos: ComponentRepo[] = [
			{
				id: 1,
				apiRepoId: 1,
				gitRepoWebsite: "github.com",
				gitRepoOwner: "blocklang",
				gitRepoName: "std-ide-widget",
				name: "std-ide-widget",
				category: "widget",
				version: "0.0.1",
				std: true
			}
		];

		mockStore((path) => [
			add(path("pageModel", "widgets"), widgets),
			add(path("selectedWidgetIndex"), 0),
			add(path("ideRepos"), ideRepos)
		]);

		findWidgetPropertiesLayoutStub = stub(blocklang, "findWidgetPropertiesLayout").returns([]);

		h.expect(() => (
			<div classes={[css.root]}>
				<div classes={[c.text_center, c.text_muted, c.py_2]}>没有属性</div>
			</div>
		));
	});

	it("active widget has one property and show the property", () => {
		const changeActiveWidgetPropertiesProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([
			[changeActiveWidgetPropertiesProcess, changeActiveWidgetPropertiesProcessStub]
		]);
		const h = harness(() => <PropertiesTab />, { middleware: [[store, mockStore]] });

		const widgets: AttachedWidget[] = [
			{
				id: "1",
				parentId: "-1",
				apiRepoId: 1,
				widgetId: 1,
				widgetName: "Page",
				widgetCode: "0001",
				canHasChildren: true,
				iconClass: "",
				properties: [
					{
						id: "1",
						name: "Prop1",
						valueType: "string"
					},
					{
						id: "2",
						name: "Prop2",
						valueType: "string"
					}
				]
			}
		];

		const ideRepos: ComponentRepo[] = [
			{
				id: 1,
				apiRepoId: 1,
				gitRepoWebsite: "github.com",
				gitRepoOwner: "blocklang",
				gitRepoName: "std-ide-widget",
				name: "std-ide-widget",
				category: "widget",
				version: "0.0.1",
				std: true
			}
		];

		mockStore((path) => [
			add(path("pageModel", "widgets"), widgets),
			add(path("selectedWidgetIndex"), 0),
			add(path("ideRepos"), ideRepos)
		]);

		class Prop1 extends WidgetBase<SingleProperty> {}
		class Prop2 extends WidgetBase<SingleProperty> {}

		const propertiesLayout = [
			{
				propertyName: "Prop1",
				propertyLabel: "属性1",
				propertyWidget: Prop1
			},
			{
				propertyName: "Prop2",
				propertyLabel: "属性2",
				propertyWidget: Prop2
			}
		];
		findWidgetPropertiesLayoutStub = stub(blocklang, "findWidgetPropertiesLayout").returns(propertiesLayout);

		h.expect(() => (
			<div classes={[css.root, c.py_1, c.px_2]}>
				<div classes={[css.propertyItem]}>
					<div>属性1</div>
					<Prop1 key="Prop1" index={0} value={undefined} onPropertyChanged={() => {}} />
				</div>
				<div classes={[css.propertyItem]}>
					<div>属性2</div>
					<Prop2 key="Prop2" index={1} value={undefined} onPropertyChanged={() => {}} />
				</div>
			</div>
		));

		h.trigger("@Prop1", "onPropertyChanged");
		assert.isTrue(changeActiveWidgetPropertiesProcessStub.calledOnce);
	});
});
