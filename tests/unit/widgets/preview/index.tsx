const { describe, it, beforeEach } = intern.getInterface("bdd");
const { assert } = intern.getPlugin("chai");

import harness from "@dojo/framework/testing/harness/harness";
import { tsx, create } from "@dojo/framework/core/vdom";
import * as c from "@blocklang/bootstrap-classes";
import Preview from "../../../../src/widgets/preview";
import * as css from "../../../../src/widgets/preview/index.m.css";
import createMockStoreMiddleware from "@dojo/framework/testing/mocks/middleware/store";
import { State, PageModel, ComponentRepo } from "@blocklang/designer-core/interfaces";
import store from "@blocklang/designer-core/store";
import { replace } from "@dojo/framework/stores/state/operations";
import { Permission } from "../../../../src/interfaces";
import FontAwesomeIcon from "@blocklang/dojo-fontawesome/FontAwesomeIcon";
import { stub } from "sinon";
import WidgetBase from "@dojo/framework/core/WidgetBase";
import * as blocklang from "@blocklang/designer-core/blocklang";
import Page from "@blocklang/std-widget-web/page";
import { changeDataItemValueProcess } from "../../../../src/processes/pageDataProcesses";

describe("widgets/preview", () => {
	beforeEach(() => {
		blocklang.clearExtensionComponents();
	});

	it("loading page", () => {
		const permission: Permission = {
			canRead: true,
			canWrite: false,
		};

		const h = harness(() => <Preview permission={permission} onSwitchEditMode={() => {}} />);

		h.expect(() => (
			<div>
				<div classes={[c.d_flex, c.justify_content_center, css.loadingPage]}>
					<div classes={[c.spinner_border, c.text_muted]} role="status" title="加载中……">
						<span classes={[c.visually_hidden]}>Loading...</span>
					</div>
				</div>
			</div>
		));
	});

	it("show page when no root node", () => {
		const mockStore = createMockStoreMiddleware<State>();

		const permission: Permission = {
			canRead: true,
			canWrite: false,
		};

		const h = harness(() => <Preview permission={permission} onSwitchEditMode={() => {}} />, {
			middleware: [[store, mockStore]],
		});
		mockStore((path) => [replace(path("pageModel", "widgets"), [])]);
		h.expect(() => (
			<div>
				<div classes={[c.alert, c.alert_danger, c.mx_auto, c.text_center, c.py_5, css.emptyPage]} role="alert">
					页面中缺少根节点！
				</div>
			</div>
		));
	});

	it("show empty page that only contains a root node, only has read permission", () => {
		const mockStore = createMockStoreMiddleware<State>();

		const permission: Permission = {
			canRead: true,
			canWrite: false,
		};

		const h = harness(() => <Preview permission={permission} onSwitchEditMode={() => {}} />, {
			middleware: [[store, mockStore]],
		});

		// 设置两个值：
		// 1. pageModel
		// 2. ideRepos
		const pageModel: PageModel = {
			pageId: 1,
			widgets: [
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
			],
			data: [],
			functions: [],
		};

		mockStore((path) => [replace(path("pageModel"), pageModel)]);

		h.expect(() => (
			<div>
				<div classes={[c.alert, c.alert_info, c.mx_auto, c.text_center, c.py_5, css.emptyPage]} role="alert">
					<p classes={[c.mb_0]}>我是一张空页面，您看看需加点什么。</p>
				</div>
			</div>
		));
	});

	it("show empty page that only contains a root node, has write permission", () => {
		const mockStore = createMockStoreMiddleware<State>();

		const permission: Permission = {
			canRead: true,
			canWrite: true,
		};

		const onSwitchEditModeStub = stub();
		const h = harness(() => <Preview permission={permission} onSwitchEditMode={onSwitchEditModeStub} />, {
			middleware: [[store, mockStore]],
		});

		// 设置两个值：
		// 1. pageModel
		// 2. ideRepos
		const pageModel: PageModel = {
			pageId: 1,
			widgets: [
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
			],
			data: [],
			functions: [],
		};

		mockStore((path) => [replace(path("pageModel"), pageModel)]);

		h.expect(() => (
			<div>
				<div classes={[c.alert, c.alert_info, c.mx_auto, c.text_center, c.py_5, css.emptyPage]} role="alert">
					<p classes={[c.mb_0]}>我是一张空页面，您看看需加点什么。</p>
					<button classes={[c.btn, c.btn_outline_primary, c.mt_3]} onclick={() => {}}>
						<FontAwesomeIcon icon={["far", "edit"]} classes={[c.me_1]} />
						开始编辑
					</button>
				</div>
			</div>
		));

		h.trigger("button", "onclick");
		assert.isTrue(onSwitchEditModeStub.calledOnce);
	});

	it("show a page, root->node1->node11 root->node2", () => {
		class Container extends WidgetBase {}
		class IdeContainer extends WidgetBase {}

		const mockStore = createMockStoreMiddleware<State>();

		const permission: Permission = {
			canRead: true,
			canWrite: false,
		};
		const h = harness(() => <Preview permission={permission} onSwitchEditMode={() => {}} />, {
			middleware: [[store, mockStore]],
		});

		// 设置两个值：
		// 1. pageModel
		// 2. ideRepos
		const pageModel: PageModel = {
			pageId: 1,
			widgets: [
				{
					id: "1",
					parentId: "-1",
					apiRepoId: 1,
					widgetId: 1,
					widgetName: "Page",
					widgetCode: "0001",
					canHasChildren: true,
					properties: [
						{
							id: "1",
							code: "0001",
							name: "onLoad",
							value: undefined, // TODO: 需进一步细化
							valueType: "function",
							isExpr: false, // TODO: 函数名算不算表达式？
						},
					],
				},
				{
					id: "2",
					parentId: "1",
					apiRepoId: 2,
					widgetId: 2,
					widgetName: "Container",
					widgetCode: "0002",
					canHasChildren: true,
					properties: [],
				},
				{
					id: "21",
					parentId: "2",
					apiRepoId: 2,
					widgetId: 2,
					widgetName: "Container",
					widgetCode: "0002",
					canHasChildren: true,
					properties: [],
				},
				{
					id: "3",
					parentId: "1",
					apiRepoId: 2,
					widgetId: 2,
					widgetName: "Container",
					widgetCode: "0002",
					canHasChildren: true,
					properties: [],
				},
			],
			data: [],
			functions: [],
		};

		// 默认包含标准库
		const ideRepos: ComponentRepo[] = [
			{
				id: 1,
				apiRepoId: 1,
				gitRepoWebsite: "github.com",
				gitRepoOwner: "blocklang",
				gitRepoName: "std-ide-widget",
				name: "std-ide-widget",
				category: "Widget",
				version: "0.0.1",
				std: true,
			},
			{
				id: 2,
				apiRepoId: 2,
				gitRepoWebsite: "github.com",
				gitRepoOwner: "blocklang",
				gitRepoName: "ide-widget",
				name: "ide-widget",
				category: "Widget",
				version: "0.0.1",
				std: false,
			},
		];

		blocklang.registerWidgets(
			{ website: "github.com", owner: "blocklang", repoName: "ide-widget" },
			{ Container: { widget: Container, ideWidget: IdeContainer, propertiesLayout: [] } }
		);

		mockStore((path) => [replace(path("pageModel"), pageModel), replace(path("projectDependencies"), ideRepos)]);

		h.expect(() => (
			<div>
				<Page key="0_1" onLoad={undefined}>
					<Container
						// 注意，key 是以 0 开头，不是以 1 开头，因为 index 是基于子部件的，不是基于全局列表的
						key="0_2"
					>
						<Container key="0_21"></Container>
					</Container>
					<Container key="1_3" />
				</Page>
			</div>
		));
	});

	it("show a page, root->node1, node1 has a property", () => {
		class TextInput extends WidgetBase<{ prop1: string }> {}
		class IdeTextInput extends WidgetBase {}

		const mockStore = createMockStoreMiddleware<State>();

		const permission: Permission = {
			canRead: true,
			canWrite: false,
		};
		const h = harness(() => <Preview permission={permission} onSwitchEditMode={() => {}} />, {
			middleware: [[store, mockStore]],
		});

		// 设置两个值：
		// 1. pageModel
		// 2. ideRepos
		const pageModel: PageModel = {
			pageId: 1,
			widgets: [
				{
					id: "1",
					parentId: "-1",
					apiRepoId: 1,
					widgetId: 1,
					widgetName: "Page",
					widgetCode: "0001",
					canHasChildren: true,
					properties: [
						{
							id: "1",
							code: "0001",
							name: "onLoad",
							value: undefined, // TODO: 需进一步细化
							valueType: "function",
							isExpr: false, // TODO: 函数名算不算表达式？
						},
					],
				},
				{
					id: "2",
					parentId: "1",
					apiRepoId: 2,
					widgetId: 2,
					widgetName: "TextInput",
					widgetCode: "0002",
					canHasChildren: true,
					properties: [
						{
							id: "1",
							code: "0001",
							name: "prop1",
							value: undefined, // TODO: 需进一步细化
							valueType: "string",
							isExpr: false, // TODO: 函数名算不算表达式？
						},
					],
				},
			],
			data: [],
			functions: [],
		};

		// 默认包含标准库
		const ideRepos: ComponentRepo[] = [
			{
				id: 1,
				apiRepoId: 1,
				gitRepoWebsite: "github.com",
				gitRepoOwner: "blocklang",
				gitRepoName: "std-ide-widget",
				name: "std-ide-widget",
				category: "Widget",
				version: "0.0.1",
				std: true,
			},
			{
				id: 2,
				apiRepoId: 2,
				gitRepoWebsite: "github.com",
				gitRepoOwner: "blocklang",
				gitRepoName: "ide-widget",
				name: "ide-widget",
				category: "Widget",
				version: "0.0.1",
				std: false,
			},
		];

		blocklang.registerWidgets(
			{ website: "github.com", owner: "blocklang", repoName: "ide-widget" },
			{ TextInput: { widget: TextInput, ideWidget: IdeTextInput, propertiesLayout: [] } }
		);

		mockStore((path) => [replace(path("pageModel"), pageModel), replace(path("projectDependencies"), ideRepos)]);

		h.expect(() => (
			<div>
				<Page key="0_1" onLoad={undefined}>
					<TextInput key="0_2" prop1=""></TextInput>
				</Page>
			</div>
		));
	});

	// 执行函数
	it("trigger event - call one set data", () => {
		const factory = create({}).properties<{ onValue: (value: string) => void }>();
		const TextInput = factory(function TextInput() {
			return <virtual></virtual>;
		});
		class IdeTextInput extends WidgetBase {}

		const changeDataItemValueProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([
			[changeDataItemValueProcess, changeDataItemValueProcessStub],
		]);

		const permission: Permission = {
			canRead: true,
			canWrite: true,
		};
		const h = harness(() => <Preview permission={permission} onSwitchEditMode={() => {}} />, {
			middleware: [[store, mockStore]],
		});

		// 设置两个值：
		// 1. pageModel
		// 2. ideRepos
		const pageModel: PageModel = {
			pageId: 1,
			widgets: [
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
					apiRepoId: 2,
					widgetId: 2,
					widgetName: "TextInput",
					widgetCode: "0002",
					canHasChildren: true,
					properties: [
						{
							id: "1",
							code: "0001",
							name: "onValue",
							value: "func_id_0",
							valueType: "function",
							isExpr: false,
							arguments: [
								{
									id: "func_arg_01",
									name: "value",
									valueType: "string",
								},
							],
						},
					],
				},
			],
			data: [
				{
					id: "data1",
					parentId: "-1",
					name: "root",
					type: "Object",
					open: true,
				},
				{
					id: "data2",
					parentId: "data1",
					name: "foo",
					type: "String",
					open: false,
					defaultValue: "bar",
				},
			],
			functions: [
				{
					id: "func_id_0",
					nodes: [
						{
							id: "node_id_0",
							left: 20,
							top: 20,
							caption: "事件处理函数",
							text: "onValue",
							layout: "flowControl",
							category: "function",
							inputSequencePort: undefined,
							outputSequencePorts: [{ id: "osp1", text: "" }],
							inputDataPorts: [],
							outputDataPorts: [{ id: "odp1", name: "value", type: "string" }],
						},
						{
							id: "node_id_1",
							left: 50,
							top: 50,
							caption: "Set foo",
							text: "",
							layout: "data",
							category: "variableSet",
							inputSequencePort: { id: "isp2" },
							outputSequencePorts: [{ id: "osp2", text: "" }],
							inputDataPorts: [{ id: "idp2", name: "value", type: "string" }],
							outputDataPorts: [],
						},
					],
					sequenceConnections: [
						{ id: "sc1", fromNode: "node_id_0", fromOutput: "osp1", toNode: "node_id_1", toInput: "isp2" },
					],
					dataConnections: [
						{ id: "dc1", fromNode: "node_id_0", fromOutput: "odp1", toNode: "node_id_1", toInput: "idp2" },
					],
				},
			],
		};

		// 默认包含标准库
		const ideRepos: ComponentRepo[] = [
			{
				id: 1,
				apiRepoId: 1,
				gitRepoWebsite: "github.com",
				gitRepoOwner: "blocklang",
				gitRepoName: "std-ide-widget",
				name: "std-ide-widget",
				category: "Widget",
				version: "0.0.1",
				std: true,
			},
			{
				id: 2,
				apiRepoId: 2,
				gitRepoWebsite: "github.com",
				gitRepoOwner: "blocklang",
				gitRepoName: "ide-widget",
				name: "ide-widget",
				category: "Widget",
				version: "0.0.1",
				std: false,
			},
		];

		blocklang.registerWidgets(
			{ website: "github.com", owner: "blocklang", repoName: "ide-widget" },
			{ TextInput: { widget: TextInput, ideWidget: IdeTextInput, propertiesLayout: [] } }
		);

		mockStore((path) => [replace(path("pageModel"), pageModel), replace(path("projectDependencies"), ideRepos)]);

		h.expect(() => (
			<div>
				<Page key="0_1">
					<TextInput key="0_2" onValue={() => {}}></TextInput>
				</Page>
			</div>
		));

		h.trigger("@0_2", "onValue", "another bar");
		assert.isTrue(changeDataItemValueProcessStub.calledOnce);
	});

	it("trigger event - call two set data", () => {
		const factory = create({}).properties<{ onValue: (value: string) => void }>();
		const TextInput = factory(function TextInput() {
			return <virtual></virtual>;
		});
		class IdeTextInput extends WidgetBase {}

		const changeDataItemValueProcessStub = stub();
		const mockStore = createMockStoreMiddleware<State>([
			[changeDataItemValueProcess, changeDataItemValueProcessStub],
		]);

		const permission: Permission = {
			canRead: true,
			canWrite: true,
		};
		const h = harness(() => <Preview permission={permission} onSwitchEditMode={() => {}} />, {
			middleware: [[store, mockStore]],
		});

		// 设置两个值：
		// 1. pageModel
		// 2. ideRepos
		const pageModel: PageModel = {
			pageId: 1,
			widgets: [
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
					apiRepoId: 2,
					widgetId: 2,
					widgetName: "TextInput",
					widgetCode: "0002",
					canHasChildren: true,
					properties: [
						{
							id: "1",
							code: "0001",
							name: "onValue",
							value: "func_id_0",
							valueType: "function",
							isExpr: false,
							arguments: [
								{
									id: "func_arg_01",
									name: "value",
									valueType: "string",
								},
							],
						},
					],
				},
			],
			data: [
				{
					id: "data1",
					parentId: "-1",
					name: "root",
					type: "Object",
					open: true,
				},
				{
					id: "data2",
					parentId: "data1",
					name: "foo",
					type: "String",
					open: false,
					defaultValue: "bar",
				},
				{
					id: "data3",
					parentId: "data1",
					name: "foo1",
					type: "String",
					open: false,
					defaultValue: "bar1",
				},
			],
			functions: [
				{
					id: "func_id_0",
					nodes: [
						{
							id: "node_id_0",
							left: 20,
							top: 20,
							caption: "事件处理函数",
							text: "onValue",
							layout: "flowControl",
							category: "function",
							inputSequencePort: undefined,
							outputSequencePorts: [{ id: "osp1", text: "" }],
							inputDataPorts: [],
							outputDataPorts: [{ id: "odp1", name: "value", type: "string" }],
						},
						{
							id: "node_id_1",
							left: 50,
							top: 50,
							caption: "Set foo",
							text: "",
							layout: "data",
							category: "variableSet",
							inputSequencePort: { id: "isp2" },
							outputSequencePorts: [{ id: "osp2", text: "" }],
							inputDataPorts: [{ id: "idp2", name: "value", type: "string" }],
							outputDataPorts: [],
						},
						{
							id: "node_id_2",
							left: 100,
							top: 100,
							caption: "Set foo1",
							text: "",
							layout: "data",
							category: "variableSet",
							inputSequencePort: { id: "isp3" },
							outputSequencePorts: [{ id: "osp3", text: "" }],
							inputDataPorts: [{ id: "idp3", name: "value", type: "string" }],
							outputDataPorts: [],
						},
					],
					sequenceConnections: [
						{ id: "sc1", fromNode: "node_id_0", fromOutput: "osp1", toNode: "node_id_1", toInput: "isp2" },
						{ id: "sc2", fromNode: "node_id_1", fromOutput: "osp2", toNode: "node_id_2", toInput: "isp3" },
					],
					dataConnections: [
						{ id: "dc1", fromNode: "node_id_0", fromOutput: "odp1", toNode: "node_id_1", toInput: "idp2" },
						{ id: "dc2", fromNode: "node_id_0", fromOutput: "odp1", toNode: "node_id_2", toInput: "idp3" },
					],
				},
			],
		};

		// 默认包含标准库
		const ideRepos: ComponentRepo[] = [
			{
				id: 1,
				apiRepoId: 1,
				gitRepoWebsite: "github.com",
				gitRepoOwner: "blocklang",
				gitRepoName: "std-ide-widget",
				name: "std-ide-widget",
				category: "Widget",
				version: "0.0.1",
				std: true,
			},
			{
				id: 2,
				apiRepoId: 2,
				gitRepoWebsite: "github.com",
				gitRepoOwner: "blocklang",
				gitRepoName: "ide-widget",
				name: "ide-widget",
				category: "Widget",
				version: "0.0.1",
				std: false,
			},
		];

		blocklang.registerWidgets(
			{ website: "github.com", owner: "blocklang", repoName: "ide-widget" },
			{ TextInput: { widget: TextInput, ideWidget: IdeTextInput, propertiesLayout: [] } }
		);

		mockStore((path) => [replace(path("pageModel"), pageModel), replace(path("projectDependencies"), ideRepos)]);

		h.expect(() => (
			<div>
				<Page key="0_1">
					<TextInput key="0_2" onValue={() => {}}></TextInput>
				</Page>
			</div>
		));

		h.trigger("@0_2", "onValue", "another bar");
		assert.isTrue(changeDataItemValueProcessStub.calledTwice);
	});
});
