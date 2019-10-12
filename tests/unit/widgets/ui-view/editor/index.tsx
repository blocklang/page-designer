const { describe, it } = intern.getInterface("bdd");

import harness from "@dojo/framework/testing/harness";
import { create, tsx } from "@dojo/framework/core/vdom";
import Editor from "../../../../../src/widgets/ui-view/editor";
import createMockStoreMiddleware from "@dojo/framework/testing/mocks/middleware/store";
import { State, ComponentRepo, PageModel, AttachedWidget } from "../../../../../src/interfaces";
import store from "../../../../../src/store";
import * as c from "bootstrap-classes";
import { replace } from "@dojo/framework/stores/state/operations";
import Page from "std-ide-widget/page";
import { InstWidget, EditableWidgetProperties } from "designer-core/interfaces";
import global from "@dojo/framework/shim/global";
import FocusBox from "../../../../../src/widgets/ui-view/editor/FocusBox";
import HighlightBox from "../../../../../src/widgets/ui-view/editor/HighlightBox";

describe("ui-view/editor", () => {
	// 创建一个在测试用例中使用的部件

	interface ContainerProperties extends EditableWidgetProperties {}
	const factory = create().properties<ContainerProperties>();
	const Container = factory(function Container({ properties }) {
		const {} = properties();
		return <div></div>;
	});

	it("show page when no root node", () => {
		const h = harness(() => <Editor />);

		h.expect(() => (
			<div>
				<div classes={[c.alert, c.alert_danger]} role="alert">
					页面中缺少根节点！
				</div>
			</div>
		));
	});

	it("show empty page that only contains a root node", () => {
		const mockStore = createMockStoreMiddleware<State>();
		const h = harness(() => <Editor />, { middleware: [[store, mockStore]] });

		// 设置两个值：
		// 1. pageModel
		// 2. ideRepos
		const pageModel: PageModel = {
			pageInfo: {
				id: 1,
				key: "page1",
				name: "页面1",
				appType: "01"
			},
			widgets: [
				{
					id: "1",
					parentId: "-1",
					componentRepoId: 1,
					widgetId: 1,
					widgetName: "Page",
					widgetCode: "0001",
					iconClass: "",
					canHasChildren: true,
					properties: [
						{
							id: "1",
							name: "onLoad",
							value: undefined // TODO: 需进一步细化
						}
					]
				}
			]
		};
		// 默认包含标准库
		const ideRepos: ComponentRepo[] = [
			{
				id: 1,
				gitRepoWebsite: "github.com",
				gitRepoOwner: "blocklang",
				gitRepoName: "std-ide-widget",
				name: "std-ide-widget",
				category: "widget",
				version: "0.0.1",
				std: true
			}
		];

		mockStore((path) => [replace(path("pageModel"), pageModel), replace(path("ideRepos"), ideRepos)]);

		const widget: InstWidget = {
			id: "1",
			parentId: "-1",
			widgetCode: "0001",
			widgetName: "Page",
			canHasChildren: true
		};
		// activeWidgetId 的作用是什么？可否用 focused 属性代替
		// widget 属性是否可以替换或者精简？
		h.expect(() => (
			<div>
				<Page
					key="0_1"
					widget={widget}
					originalProperties={{ onLoad: () => {} }} // 原始属性值
					extendProperties={{
						onFocus: () => {},
						onHighlight: () => {},
						autoFocus: () => true
					}}
					// 原始属性的值，是必须要展开的
					onLoad={() => {}}
				/>
			</div>
		));
	});

	it("show a page, root->node1->node11 root->node2", () => {
		const mockStore = createMockStoreMiddleware<State>();
		const h = harness(() => <Editor />, { middleware: [[store, mockStore]] });

		// 设置两个值：
		// 1. pageModel
		// 2. ideRepos
		const pageModel: PageModel = {
			pageInfo: {
				id: 1,
				key: "page1",
				name: "页面1",
				appType: "01"
			},
			widgets: [
				{
					id: "1",
					parentId: "-1",
					componentRepoId: 1,
					widgetId: 1,
					widgetName: "Page",
					widgetCode: "0001",
					iconClass: "",
					canHasChildren: true,
					properties: [
						{
							id: "1",
							name: "onLoad",
							value: undefined // TODO: 需进一步细化
						}
					]
				},
				{
					id: "2",
					parentId: "1",
					componentRepoId: 2,
					widgetId: 2,
					widgetName: "Container",
					widgetCode: "0002",
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "21",
					parentId: "2",
					componentRepoId: 2,
					widgetId: 2,
					widgetName: "Container",
					widgetCode: "0002",
					iconClass: "",
					canHasChildren: true,
					properties: []
				},
				{
					id: "3",
					parentId: "1",
					componentRepoId: 2,
					widgetId: 2,
					widgetName: "Container",
					widgetCode: "0002",
					iconClass: "",
					canHasChildren: true,
					properties: []
				}
			]
		};

		// 默认包含标准库
		const ideRepos: ComponentRepo[] = [
			{
				id: 1,
				gitRepoWebsite: "github.com",
				gitRepoOwner: "blocklang",
				gitRepoName: "std-ide-widget",
				name: "std-ide-widget",
				category: "widget",
				version: "0.0.1",
				std: true
			},
			{
				id: 2,
				gitRepoWebsite: "github.com",
				gitRepoOwner: "blocklang",
				gitRepoName: "ide-widget",
				name: "ide-widget",
				category: "widget",
				version: "0.0.1",
				std: false
			}
		];

		global._block_lang_widgets_ = { "github.com/blocklang/ide-widget": { Container: Container } };

		mockStore((path) => [replace(path("pageModel"), pageModel), replace(path("ideRepos"), ideRepos)]);

		const pageWidget: InstWidget = {
			id: "1",
			parentId: "-1",
			widgetCode: "0001",
			widgetName: "Page",
			canHasChildren: true
		};
		const containerWidget1: InstWidget = {
			id: "2",
			parentId: "1",
			widgetCode: "0002",
			widgetName: "Container",
			canHasChildren: true
		};
		const containerWidget11: InstWidget = {
			id: "21",
			parentId: "2",
			widgetCode: "0002",
			widgetName: "Container",
			canHasChildren: true
		};
		const containerWidget2: InstWidget = {
			id: "3",
			parentId: "1",
			widgetCode: "0002",
			widgetName: "Container",
			canHasChildren: true
		};

		// activeWidgetId 的作用是什么？可否用 focused 属性代替
		// widget 属性是否可以替换或者精简？
		h.expect(() => (
			<div>
				<Page
					key={`0_${pageWidget.id}`}
					widget={pageWidget}
					originalProperties={{ onLoad: () => {} }} // 原始属性值
					extendProperties={{
						onFocus: () => {},
						onHighlight: () => {},
						autoFocus: () => false
					}}
					// 原始属性的值，是必须要展开的
					onLoad={() => {}}
				>
					<Container
						// 注意，key 是以 0 开头，不是以 1 开头，因为 index 是基于子部件的，不是基于全局列表的
						key={`0_${containerWidget1.id}`}
						widget={containerWidget1}
						originalProperties={{}}
						extendProperties={{
							onFocus: () => {},
							onHighlight: () => {},
							autoFocus: () => false
						}}
					>
						<Container
							key={`0_${containerWidget11.id}`}
							widget={containerWidget11}
							originalProperties={{}}
							extendProperties={{
								onFocus: () => {},
								onHighlight: () => {},
								autoFocus: () => false
							}}
						></Container>
					</Container>
					<Container
						// 注意，key 是以 0 开头，不是以 1 开头，因为 index 是基于子部件的，不是基于全局列表的
						key={`1_${containerWidget2.id}`}
						widget={containerWidget2}
						originalProperties={{}}
						extendProperties={{
							onFocus: () => {},
							onHighlight: () => {},
							autoFocus: () => false
						}}
					/>
				</Page>
			</div>
		));
	});

	// 当只有一个根节点时，则默认选中根节点。
	it("active widget - show a page contains a single root node, and focus it", () => {
		const mockStore = createMockStoreMiddleware<State>();
		const h = harness(() => <Editor />, { middleware: [[store, mockStore]] });

		// 设置两个值：
		// 1. pageModel
		// 2. ideRepos
		const pageModel: PageModel = {
			pageInfo: {
				id: 1,
				key: "page1",
				name: "页面1",
				appType: "01"
			},
			widgets: [
				{
					id: "1",
					parentId: "-1",
					componentRepoId: 1,
					widgetId: 1,
					widgetName: "Page",
					widgetCode: "0001",
					iconClass: "",
					canHasChildren: true,
					properties: [
						{
							id: "1",
							name: "onLoad",
							value: undefined // TODO: 需进一步细化
						}
					]
				}
			]
		};
		// 默认包含标准库
		const ideRepos: ComponentRepo[] = [
			{
				id: 1,
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
			replace(path("pageModel"), pageModel),
			replace(path("ideRepos"), ideRepos),
			replace(path("selectedWidgetIndex"), 0)
		]);

		const pageWidgets: AttachedWidget[] = [
			{
				id: "1",
				parentId: "-1",
				componentRepoId: 1,
				widgetId: 1,
				widgetName: "Page",
				widgetCode: "0001",
				iconClass: "",
				canHasChildren: true,
				properties: [
					{
						id: "1",
						name: "onLoad",
						value: undefined
					}
				]
			}
		];

		const widget: InstWidget = {
			id: "1",
			parentId: "-1",
			widgetCode: "0001",
			widgetName: "Page",
			canHasChildren: true
		};
		// activeWidgetId 的作用是什么？可否用 focused 属性代替
		// widget 属性是否可以替换或者精简？
		h.expect(() => (
			<div>
				<Page
					key="0_1"
					widget={widget}
					originalProperties={{ onLoad: () => {} }} // 原始属性值
					extendProperties={{
						onFocus: () => {},
						onHighlight: () => {},
						autoFocus: () => false
					}}
					// 原始属性的值，是必须要展开的
					onLoad={() => {}}
				/>
				<FocusBox widgetName="Page" selectedWidgetIndex={0} widgets={pageWidgets} />
			</div>
		));
	});

	it("highlight widget - show a page contains a single root node, and highlight it", () => {
		const mockStore = createMockStoreMiddleware<State>();
		const h = harness(() => <Editor />, { middleware: [[store, mockStore]] });

		// 设置两个值：
		// 1. pageModel
		// 2. ideRepos
		const pageModel: PageModel = {
			pageInfo: {
				id: 1,
				key: "page1",
				name: "页面1",
				appType: "01"
			},
			widgets: [
				{
					id: "1",
					parentId: "-1",
					componentRepoId: 1,
					widgetId: 1,
					widgetName: "Page",
					widgetCode: "0001",
					iconClass: "",
					canHasChildren: true,
					properties: [
						{
							id: "1",
							name: "onLoad",
							value: undefined // TODO: 需进一步细化
						}
					]
				}
			]
		};
		// 默认包含标准库
		const ideRepos: ComponentRepo[] = [
			{
				id: 1,
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
			replace(path("pageModel"), pageModel),
			replace(path("ideRepos"), ideRepos),
			replace(path("highlightWidgetIndex"), 0)
		]);

		const widget: InstWidget = {
			id: "1",
			parentId: "-1",
			widgetCode: "0001",
			widgetName: "Page",
			canHasChildren: true
		};
		// activeWidgetId 的作用是什么？可否用 focused 属性代替
		// widget 属性是否可以替换或者精简？
		h.expect(() => (
			<div>
				<Page
					key="0_1"
					widget={widget}
					originalProperties={{ onLoad: () => {} }} // 原始属性值
					extendProperties={{
						onFocus: () => {},
						onHighlight: () => {},
						autoFocus: () => false
					}}
					// 原始属性的值，是必须要展开的
					onLoad={() => {}}
				/>
				<HighlightBox widgetName="Page" />
			</div>
		));
	});
});
